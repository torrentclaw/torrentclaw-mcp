import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ResponseCache, TorrentClawClient } from "../src/api-client.js";

describe("ResponseCache", () => {
  it("returns undefined for missing keys", () => {
    const cache = new ResponseCache();
    expect(cache.get("missing")).toBeUndefined();
  });

  it("stores and retrieves values", () => {
    const cache = new ResponseCache();
    cache.set("key1", { data: "hello" });
    expect(cache.get("key1")).toEqual({ data: "hello" });
  });

  it("expires entries after TTL", () => {
    const cache = new ResponseCache(100); // 100ms TTL
    cache.set("key1", "value");

    // Advance time past TTL
    vi.useFakeTimers();
    vi.advanceTimersByTime(150);

    expect(cache.get("key1")).toBeUndefined();
    // Expired entry should be removed from store
    expect(cache.size).toBe(0);

    vi.useRealTimers();
  });

  it("returns value before TTL expires", () => {
    vi.useFakeTimers();
    const cache = new ResponseCache(1000); // 1s TTL
    cache.set("key1", "value");

    vi.advanceTimersByTime(500);
    expect(cache.get("key1")).toBe("value");

    vi.useRealTimers();
  });

  it("clears all entries", () => {
    const cache = new ResponseCache();
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });

  it("overwrites existing keys", () => {
    const cache = new ResponseCache();
    cache.set("key1", "old");
    cache.set("key1", "new");
    expect(cache.get("key1")).toBe("new");
    expect(cache.size).toBe(1);
  });
});

describe("TorrentClawClient cache integration", () => {
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

  it("caches search results on second call", async () => {
    const responseData = { total: 1, page: 1, pageSize: 10, results: [] };
    mockFetch(responseData);

    const client = new TorrentClawClient();
    const result1 = await client.search({ query: "inception" });
    const result2 = await client.search({ query: "inception" });

    // Only one fetch call — second was served from cache
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(responseData);
    expect(result2).toEqual(responseData);
  });

  it("does not cache different queries", async () => {
    const data1 = { total: 1, page: 1, pageSize: 10, results: [] };
    const data2 = { total: 2, page: 1, pageSize: 10, results: [] };
    mockFetch(data1);
    mockFetch(data2);

    const client = new TorrentClawClient();
    await client.search({ query: "inception" });
    await client.search({ query: "matrix" });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("does not cache error responses", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(new Response("Server error", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ total: 0, page: 1, pageSize: 10, results: [] }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    const client = new TorrentClawClient();

    // First call fails
    await expect(client.search({ query: "test" })).rejects.toThrow();

    // Second call should hit the API again (not cached)
    const result = await client.search({ query: "test" });
    expect(result.total).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("cache can be cleared manually", async () => {
    const data = { total: 1, page: 1, pageSize: 10, results: [] };
    mockFetch(data);
    mockFetch(data);

    const client = new TorrentClawClient();
    await client.search({ query: "test" });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    client.cache.clear();
    await client.search({ query: "test" });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
