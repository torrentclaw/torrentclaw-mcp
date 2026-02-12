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

  it("throws ApiError with rate limit message on 429 after retries", async () => {
    // With retry logic (MAX_RETRIES=2), need 3 consecutive 429 responses
    mockFetchError("Too many requests", 429);
    mockFetchError("Too many requests", 429);
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
    const url = client.getTorrentDownloadUrl(
      "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    );
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

  it("includes locale param for popular", async () => {
    mockFetch({ items: [], total: 0, page: 1, pageSize: 10 });

    const client = new TorrentClawClient();
    await client.getPopular(10, 1, "es");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("locale=es");
  });

  it("includes locale param for recent", async () => {
    mockFetch({ items: [], total: 0, page: 1, pageSize: 10 });

    const client = new TorrentClawClient();
    await client.getRecent(10, 1, "fr");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("locale=fr");
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

  it("calls correct endpoint for autocomplete", async () => {
    mockFetch({ suggestions: [{ id: 1, title: "Test", year: 2024, contentType: "movie", posterUrl: null }] });

    const client = new TorrentClawClient();
    const result = await client.autocomplete("test");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/autocomplete");
    expect(calledUrl).toContain("q=test");
    expect(result.suggestions).toHaveLength(1);
  });

  it("calls correct endpoint for track (POST)", async () => {
    mockFetch({ ok: true });

    const client = new TorrentClawClient();
    const result = await client.track("abc123def456abc123def456abc123def456abc1", "magnet");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledUrl).toContain("/api/v1/track");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({
      infoHash: "abc123def456abc123def456abc123def456abc1",
      action: "magnet",
    });
    expect(result.ok).toBe(true);
  });

  it("calls correct endpoint for submitScanRequest (POST)", async () => {
    mockFetch({ status: "pending" });

    const client = new TorrentClawClient();
    const result = await client.submitScanRequest("abc123def456abc123def456abc123def456abc1", "test@example.com");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledUrl).toContain("/api/v1/scan-request");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({
      infoHash: "abc123def456abc123def456abc123def456abc1",
      email: "test@example.com",
      website: "",
    });
    expect(result.status).toBe("pending");
  });

  it("calls correct endpoint for getScanStatus", async () => {
    mockFetch({ status: "completed", source: "scan_request" });

    const client = new TorrentClawClient();
    const result = await client.getScanStatus("abc123def456abc123def456abc123def456abc1");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/v1/scan-request/abc123def456abc123def456abc123def456abc1");
    expect(result.status).toBe("completed");
  });

  it("retries on 429 and succeeds", async () => {
    mockFetchError("Too many requests", 429);
    mockFetch({ total: 1, page: 1, pageSize: 10, results: [] });

    const client = new TorrentClawClient();
    const result = await client.search({ query: "test" });

    expect(result.total).toBe(1);
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("includes Authorization header when apiKey is set", async () => {
    mockFetch({ total: 0, page: 1, pageSize: 10, results: [] });

    const client = new TorrentClawClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).apiKey = "test-api-key-123";
    await client.search({ query: "test" });

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-api-key-123");
  });

  it("throws ApiError on POST 400 response", async () => {
    mockFetchError("Invalid body", 400);

    const client = new TorrentClawClient();
    await expect(
      client.track("abc123def456abc123def456abc123def456abc1", "magnet"),
    ).rejects.toThrow(ApiError);
  });
});
