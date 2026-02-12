import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerGetCredits } from "../../src/tools/get-credits.js";
import { TorrentClawClient, ApiError } from "../../src/api-client.js";

function createMockClient(overrides: Partial<TorrentClawClient> = {}) {
  return {
    search: vi.fn(),
    getPopular: vi.fn(),
    getRecent: vi.fn(),
    getWatchProviders: vi.fn(),
    getCredits: vi.fn(),
    getStats: vi.fn(),
    getTorrentDownloadUrl: vi.fn(),
    ...overrides,
  } as unknown as TorrentClawClient;
}

describe("get_credits tool", () => {
  it("returns formatted credits", async () => {
    const client = createMockClient({
      getCredits: vi.fn().mockResolvedValue({
        contentId: 42,
        director: "Christopher Nolan",
        cast: [
          { name: "Leonardo DiCaprio", character: "Cobb", profileUrl: null },
        ],
      }),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetCredits(server, client);

    const handler = getToolHandler("get_credits");
    const result = await handler({ content_id: 42 });

    expect(result.content[0].text).toContain("Christopher Nolan");
    expect(result.content[0].text).toContain("Leonardo DiCaprio");
  });

  it("passes content_id to client", async () => {
    const getCreditsMock = vi.fn().mockResolvedValue({
      contentId: 99,
      director: null,
      cast: [],
    });
    const client = createMockClient({ getCredits: getCreditsMock });
    const { server, getToolHandler } = createMockServer();
    registerGetCredits(server, client);

    const handler = getToolHandler("get_credits");
    await handler({ content_id: 99 });

    expect(getCreditsMock).toHaveBeenCalledWith(99);
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      getCredits: vi
        .fn()
        .mockRejectedValue(new ApiError(503, "TMDB unavailable")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetCredits(server, client);

    const handler = getToolHandler("get_credits");
    const result = await handler({ content_id: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (503)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      getCredits: vi.fn().mockRejectedValue(new Error("Boom")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetCredits(server, client);

    const handler = getToolHandler("get_credits");
    const result = await handler({ content_id: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Request failed: Boom");
  });

  it("handles non-Error throw", async () => {
    const client = createMockClient({
      getCredits: vi.fn().mockRejectedValue(undefined),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetCredits(server, client);

    const handler = getToolHandler("get_credits");
    const result = await handler({ content_id: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
