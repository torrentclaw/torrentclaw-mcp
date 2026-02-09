import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerGetPopular } from "../../src/tools/get-popular.js";
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

describe("get_popular tool", () => {
  it("returns formatted popular results", async () => {
    const client = createMockClient({
      getPopular: vi.fn().mockResolvedValue({
        items: [
          {
            id: 1,
            title: "Popular Movie",
            year: 2024,
            contentType: "movie",
            posterUrl: null,
            ratingImdb: "8.0",
            ratingTmdb: "7.5",
            clickCount: 200,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      }),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetPopular(server, client);

    const handler = getToolHandler("get_popular");
    const result = await handler({ limit: 5 });

    expect(result.content[0].text).toContain("Popular Movie");
    expect(result.content[0].text).toContain("200 clicks");
  });

  it("defaults limit to 10", async () => {
    const getPopularMock = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
    const client = createMockClient({ getPopular: getPopularMock });
    const { server, getToolHandler } = createMockServer();
    registerGetPopular(server, client);

    const handler = getToolHandler("get_popular");
    await handler({});

    expect(getPopularMock).toHaveBeenCalledWith(10, undefined);
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      getPopular: vi.fn().mockRejectedValue(new ApiError(500, "Server error")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetPopular(server, client);

    const handler = getToolHandler("get_popular");
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (500)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      getPopular: vi.fn().mockRejectedValue(new Error("Timeout")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetPopular(server, client);

    const handler = getToolHandler("get_popular");
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Request failed: Timeout");
  });

  it("handles non-Error throw", async () => {
    const client = createMockClient({
      getPopular: vi.fn().mockRejectedValue("string error"),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetPopular(server, client);

    const handler = getToolHandler("get_popular");
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
