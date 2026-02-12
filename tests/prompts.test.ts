import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "../src/prompts.js";

type PromptHandler = (params: Record<string, string>) => {
  messages: { role: string; content: { type: string; text: string } }[];
};

describe("registerPrompts", () => {
  function createMockServer() {
    const prompts = new Map<string, PromptHandler>();

    const server = {
      prompt: vi.fn(
        (
          name: string,
          _description: string,
          _schema: unknown,
          handler: PromptHandler,
        ) => {
          prompts.set(name, handler);
        },
      ),
    } as unknown as McpServer;

    return { server, prompts };
  }

  it("registers 5 prompts", () => {
    const { server, prompts } = createMockServer();
    registerPrompts(server);
    expect(prompts.size).toBe(5);
    expect(prompts.has("presentation_guide")).toBe(true);
    expect(prompts.has("search_movie")).toBe(true);
    expect(prompts.has("search_show")).toBe(true);
    expect(prompts.has("whats_new")).toBe(true);
    expect(prompts.has("where_to_watch")).toBe(true);
  });

  it("search_movie includes title in prompt", () => {
    const { server, prompts } = createMockServer();
    registerPrompts(server);
    const handler = prompts.get("search_movie")!;
    const result = handler({ title: "Inception" });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe("user");
    expect(result.messages[0].content.text).toContain("Inception");
    expect(result.messages[0].content.text).toContain("search_content");
  });

  it("search_show includes title in prompt", () => {
    const { server, prompts } = createMockServer();
    registerPrompts(server);
    const handler = prompts.get("search_show")!;
    const result = handler({ title: "Breaking Bad" });
    expect(result.messages[0].content.text).toContain("Breaking Bad");
  });

  it("whats_new returns discovery prompt", () => {
    const { server, prompts } = createMockServer();
    registerPrompts(server);
    const handler = prompts.get("whats_new")!;
    const result = handler({});
    expect(result.messages[0].content.text).toContain("recently added");
  });

  it("where_to_watch includes country when provided", () => {
    const { server, prompts } = createMockServer();
    registerPrompts(server);
    const handler = prompts.get("where_to_watch")!;
    const result = handler({ title: "Dune", country: "ES" });
    expect(result.messages[0].content.text).toContain("Dune");
    expect(result.messages[0].content.text).toContain("ES");
  });

  it("where_to_watch works without country", () => {
    const { server, prompts } = createMockServer();
    registerPrompts(server);
    const handler = prompts.get("where_to_watch")!;
    const result = handler({ title: "Dune" });
    expect(result.messages[0].content.text).toContain("Dune");
    expect(result.messages[0].content.text).not.toContain("undefined");
  });
});
