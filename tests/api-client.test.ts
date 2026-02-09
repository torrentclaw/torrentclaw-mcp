import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TorrentClawClient, ApiError } from "../src/api-client.js";

describe("TorrentClawClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(body: unknown, status = 200) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  function mockFetchError(body: string, status: number) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(body, { status }),
    );
  }

  it("builds correct search URL with all parameters", async () => {
    mockFetch({ total: 0, page: 1, pageSize: 10, results: [] });

    const client = new TorrentClawClient();
    await client.search({
      query: "inception",
      type: "movie",
      sort: "seeders",
      quality: "1080p",
      min_rating: 7,
    });

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("q=inception");
    expect(calledUrl).toContain("type=movie");
    expect(calledUrl).toContain("sort=seeders");
    expect(calledUrl).toContain("quality=1080p");
    expect(calledUrl).toContain("min_rating=7");
  });

  it("omits undefined parameters from URL", async () => {
    mockFetch({ total: 0, page: 1, pageSize: 10, results: [] });

    const client = new TorrentClawClient();
    await client.search({ query: "test" });

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("q=test");
    expect(calledUrl).not.toContain("type=");
    expect(calledUrl).not.toContain("genre=");
  });

  it("includes correct headers", async () => {
    mockFetch({ total: 0, page: 1, pageSize: 10, results: [] });

    const client = new TorrentClawClient();
    await client.search({ query: "test" });

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers["Accept"]).toBe("application/json");
    expect(headers["X-Search-Source"]).toBe("mcp");
    expect(headers["User-Agent"]).toMatch(/^torrentclaw-mcp\//);
  });

  it("throws ApiError on 400 response", async () => {
    mockFetchError("Bad request", 400);

    const client = new TorrentClawClient();
    await expect(client.search({ query: "test" })).rejects.toThrow(ApiError);
  });

  it("throws ApiError with rate limit message on 429", async () => {
    mockFetchError("Too many requests", 429);

    const client = new TorrentClawClient();
    try {
      await client.search({ query: "test" });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toContain("Rate limit exceeded");
      expect((e as ApiError).status).toBe(429);
    }
  });

  it("constructs torrent download URL", () => {
    const client = new TorrentClawClient();
    const url = client.getTorrentDownloadUrl("aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e");
    expect(url).toBe(
      "https://torrentclaw.com/api/v1/torrent/aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    );
  });

  it("calls correct endpoint for popular", async () => {
    mockFetch({ items: [], total: 0, page: 1, pageSize: 10 });

    const client = new TorrentClawClient();
    await client.getPopular(5, 2);

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/popular");
    expect(calledUrl).toContain("limit=5");
    expect(calledUrl).toContain("page=2");
  });

  it("calls correct endpoint for watch providers", async () => {
    mockFetch({
      contentId: 42,
      country: "ES",
      providers: { flatrate: [], rent: [], buy: [], free: [] },
      attribution: "JustWatch",
    });

    const client = new TorrentClawClient();
    await client.getWatchProviders(42, "ES");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/content/42/watch-providers");
    expect(calledUrl).toContain("country=ES");
  });

  it("calls correct endpoint for recent", async () => {
    mockFetch({ items: [], total: 0, page: 1, pageSize: 10 });

    const client = new TorrentClawClient();
    await client.getRecent(10, 3);

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/recent");
    expect(calledUrl).toContain("limit=10");
    expect(calledUrl).toContain("page=3");
  });

  it("calls correct endpoint for credits", async () => {
    mockFetch({ contentId: 7, director: "Nolan", cast: [] });

    const client = new TorrentClawClient();
    await client.getCredits(7);

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/content/7/credits");
  });

  it("calls correct endpoint for stats", async () => {
    mockFetch({
      content: { movies: 100, shows: 50, tmdbEnriched: 80 },
      torrents: { total: 1000, withSeeders: 500, bySource: {} },
      recentIngestions: [],
    });

    const client = new TorrentClawClient();
    const result = await client.getStats();

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/stats");
    expect(result.content.movies).toBe(100);
  });

  it("includes 4xx body truncated to 200 chars", async () => {
    const longBody = "x".repeat(300);
    mockFetchError(longBody, 422);

    const client = new TorrentClawClient();
    try {
      await client.search({ query: "test" });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).body.length).toBeLessThanOrEqual(200);
    }
  });

  it("omits body for 5xx responses", async () => {
    mockFetchError("Internal server error with stack trace", 500);

    const client = new TorrentClawClient();
    try {
      await client.search({ query: "test" });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).body).toBe("");
      expect((e as ApiError).status).toBe(500);
    }
  });

  it("omits body for 502 responses", async () => {
    mockFetchError("Bad gateway details", 502);

    const client = new TorrentClawClient();
    try {
      await client.search({ query: "test" });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).body).toBe("");
    }
  });
});
