import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerGetRecent } from "../../src/tools/get-recent.js";
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

describe("get_recent tool", () => {
  it("returns formatted recent results", async () => {
    const client = createMockClient({
      getRecent: vi.fn().mockResolvedValue({
        items: [
          {
            id: 3,
            title: "New Show",
            year: 2025,
            contentType: "show",
            posterUrl: null,
            ratingImdb: null,
            ratingTmdb: "7.0",
            createdAt: "2025-12-01T00:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      }),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetRecent(server, client);

    const handler = getToolHandler("get_recent");
    const result = await handler({});

    expect(result.content[0].text).toContain("New Show");
    expect(result.content[0].text).toContain("[show]");
  });

  it("defaults limit to 12", async () => {
    const getRecentMock = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
    });
    const client = createMockClient({ getRecent: getRecentMock });
    const { server, getToolHandler } = createMockServer();
    registerGetRecent(server, client);

    const handler = getToolHandler("get_recent");
    await handler({});

    expect(getRecentMock).toHaveBeenCalledWith(12, undefined, undefined);
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      getRecent: vi.fn().mockRejectedValue(new ApiError(503, "Unavailable")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetRecent(server, client);

    const handler = getToolHandler("get_recent");
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (503)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      getRecent: vi.fn().mockRejectedValue(new Error("DNS failure")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetRecent(server, client);

    const handler = getToolHandler("get_recent");
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("DNS failure");
  });

  it("handles non-Error throw", async () => {
    const client = createMockClient({
      getRecent: vi.fn().mockRejectedValue(42),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetRecent(server, client);

    const handler = getToolHandler("get_recent");
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
