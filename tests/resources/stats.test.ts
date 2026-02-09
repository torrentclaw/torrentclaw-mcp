import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerStatsResource } from "../../src/resources/stats.js";
import { TorrentClawClient } from "../../src/api-client.js";
import type { StatsResponse } from "../../src/types.js";

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

describe("torrentclaw://stats resource", () => {
  it("returns stats as JSON", async () => {
    const statsData: StatsResponse = {
      content: { movies: 5000, shows: 1000, tmdbEnriched: 4500 },
      torrents: {
        total: 50000,
        withSeeders: 30000,
        bySource: { yts: 20000, eztv: 15000, "knaben:1337x": 15000 },
      },
      recentIngestions: [
        {
          source: "yts",
          status: "completed",
          startedAt: "2026-02-09T01:00:00Z",
          completedAt: "2026-02-09T01:35:00Z",
          fetched: 100,
          new: 10,
          updated: 90,
        },
      ],
    };

    const client = createMockClient({
      getStats: vi.fn().mockResolvedValue(statsData),
    });
    const { server, getResourceHandler } = createMockServer();
    registerStatsResource(server, client);

    const handler = getResourceHandler("torrentclaw://stats");
    const result = await handler(new URL("torrentclaw://stats"));

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].mimeType).toBe("application/json");
    expect(result.contents[0].uri).toBe("torrentclaw://stats");

    const parsed = JSON.parse(result.contents[0].text);
    expect(parsed.content.movies).toBe(5000);
    expect(parsed.torrents.total).toBe(50000);
    expect(parsed.recentIngestions).toHaveLength(1);
  });
});
