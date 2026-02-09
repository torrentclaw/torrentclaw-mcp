import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerSearchContent } from "../../src/tools/search-content.js";
import { TorrentClawClient, ApiError } from "../../src/api-client.js";
import type { SearchResponse } from "../../src/types.js";

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

describe("search_content tool", () => {
  it("returns formatted search results on success", async () => {
    const mockResponse: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: "tt1375666",
          tmdbId: "27205",
          contentType: "movie",
          title: "Inception",
          titleOriginal: null,
          year: 2010,
          overview: "A mind-bending thriller",
          posterUrl: null,
          backdropUrl: null,
          genres: ["Action"],
          ratingImdb: "8.8",
          ratingTmdb: "8.4",
          hasTorrents: true,
          torrents: [],
        },
      ],
    };

    const client = createMockClient({
      search: vi.fn().mockResolvedValue(mockResponse),
    });
    const { server, getToolHandler } = createMockServer();
    registerSearchContent(server, client);

    const handler = getToolHandler("search_content");
    const result = await handler({ query: "inception", type: "movie" });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Inception");
    expect(result.content[0].text).toContain("Found 1 results");
  });

  it("passes all parameters to client.search", async () => {
    const searchMock = vi.fn().mockResolvedValue({
      total: 0,
      page: 1,
      pageSize: 10,
      results: [],
    });
    const client = createMockClient({ search: searchMock });
    const { server, getToolHandler } = createMockServer();
    registerSearchContent(server, client);

    const handler = getToolHandler("search_content");
    await handler({
      query: "test",
      type: "show",
      genre: "Drama",
      year_min: 2020,
      year_max: 2025,
      min_rating: 7,
      quality: "1080p",
      language: "es",
      sort: "seeders",
      page: 2,
      limit: 15,
      country: "ES",
    });

    expect(searchMock).toHaveBeenCalledWith({
      query: "test",
      type: "show",
      genre: "Drama",
      year_min: 2020,
      year_max: 2025,
      min_rating: 7,
      quality: "1080p",
      language: "es",
      sort: "seeders",
      page: 2,
      limit: 15,
      country: "ES",
    });
  });

  it("defaults limit to 10", async () => {
    const searchMock = vi.fn().mockResolvedValue({
      total: 0,
      page: 1,
      pageSize: 10,
      results: [],
    });
    const client = createMockClient({ search: searchMock });
    const { server, getToolHandler } = createMockServer();
    registerSearchContent(server, client);

    const handler = getToolHandler("search_content");
    await handler({ query: "test" });

    expect(searchMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 }),
    );
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      search: vi.fn().mockRejectedValue(new ApiError(429, "Rate limited")),
    });
    const { server, getToolHandler } = createMockServer();
    registerSearchContent(server, client);

    const handler = getToolHandler("search_content");
    const result = await handler({ query: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (429)");
    expect(result.content[0].text).toContain("Rate limit exceeded");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      search: vi.fn().mockRejectedValue(new Error("Network timeout")),
    });
    const { server, getToolHandler } = createMockServer();
    registerSearchContent(server, client);

    const handler = getToolHandler("search_content");
    const result = await handler({ query: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Request failed: Network timeout");
  });

  it("handles non-Error throw", async () => {
    const client = createMockClient({
      search: vi.fn().mockRejectedValue("string error"),
    });
    const { server, getToolHandler } = createMockServer();
    registerSearchContent(server, client);

    const handler = getToolHandler("search_content");
    const result = await handler({ query: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
