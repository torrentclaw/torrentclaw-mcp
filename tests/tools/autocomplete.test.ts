import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerAutocomplete } from "../../src/tools/autocomplete.js";
import { TorrentClawClient, ApiError } from "../../src/api-client.js";

function createMockClient(overrides: Partial<TorrentClawClient> = {}) {
  return {
    search: vi.fn(),
    autocomplete: vi.fn(),
    getPopular: vi.fn(),
    getRecent: vi.fn(),
    getWatchProviders: vi.fn(),
    getCredits: vi.fn(),
    getStats: vi.fn(),
    getTorrentDownloadUrl: vi.fn(),
    track: vi.fn(),
    submitScanRequest: vi.fn(),
    getScanStatus: vi.fn(),
    ...overrides,
  } as unknown as TorrentClawClient;
}

describe("autocomplete tool", () => {
  it("returns formatted suggestions", async () => {
    const client = createMockClient({
      autocomplete: vi.fn().mockResolvedValue({
        suggestions: [
          {
            id: 1,
            title: "Breaking Bad",
            year: 2008,
            contentType: "show",
            posterUrl: null,
          },
          {
            id: 2,
            title: "The Break-Up",
            year: 2006,
            contentType: "movie",
            posterUrl: null,
          },
        ],
      }),
    });
    const { server, getToolHandler } = createMockServer();
    registerAutocomplete(server, client);

    const handler = getToolHandler("autocomplete");
    const result = await handler({ query: "break" });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Breaking Bad");
    expect(result.content[0].text).toContain("The Break-Up");
    expect(result.content[0].text).toContain("[show]");
    expect(result.content[0].text).toContain("[movie]");
  });

  it("returns message when no suggestions found", async () => {
    const client = createMockClient({
      autocomplete: vi.fn().mockResolvedValue({ suggestions: [] }),
    });
    const { server, getToolHandler } = createMockServer();
    registerAutocomplete(server, client);

    const handler = getToolHandler("autocomplete");
    const result = await handler({ query: "zzzzz" });

    expect(result.content[0].text).toContain("No suggestions");
    expect(result.content[0].text).toContain("search_content");
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      autocomplete: vi
        .fn()
        .mockRejectedValue(new ApiError(429, "Rate limited")),
    });
    const { server, getToolHandler } = createMockServer();
    registerAutocomplete(server, client);

    const handler = getToolHandler("autocomplete");
    const result = await handler({ query: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (429)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      autocomplete: vi.fn().mockRejectedValue(new Error("Network timeout")),
    });
    const { server, getToolHandler } = createMockServer();
    registerAutocomplete(server, client);

    const handler = getToolHandler("autocomplete");
    const result = await handler({ query: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Request failed: Network timeout");
  });

  it("handles non-Error throw", async () => {
    const client = createMockClient({
      autocomplete: vi.fn().mockRejectedValue("string error"),
    });
    const { server, getToolHandler } = createMockServer();
    registerAutocomplete(server, client);

    const handler = getToolHandler("autocomplete");
    const result = await handler({ query: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
