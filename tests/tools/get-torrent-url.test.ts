import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerGetTorrentUrl } from "../../src/tools/get-torrent-url.js";
import { TorrentClawClient } from "../../src/api-client.js";

function createMockClient(overrides: Partial<TorrentClawClient> = {}) {
  return {
    search: vi.fn(),
    getPopular: vi.fn(),
    getRecent: vi.fn(),
    getWatchProviders: vi.fn(),
    getCredits: vi.fn(),
    getStats: vi.fn(),
    getTorrentDownloadUrl: vi
      .fn()
      .mockImplementation(
        (hash: string) =>
          `https://torrentclaw.com/api/v1/torrent/${hash}`,
      ),
    ...overrides,
  } as unknown as TorrentClawClient;
}

describe("get_torrent_url tool", () => {
  it("returns download URL for valid info hash", async () => {
    const client = createMockClient();
    const { server, getToolHandler } = createMockServer();
    registerGetTorrentUrl(server, client);

    const handler = getToolHandler("get_torrent_url");
    const hash = "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e";
    const result = await handler({ info_hash: hash });

    expect(result.content[0].text).toContain("Download .torrent file:");
    expect(result.content[0].text).toContain(hash);
    expect(result.isError).toBeUndefined();
  });

  it("lowercases the info hash", async () => {
    const getTorrentDownloadUrlMock = vi
      .fn()
      .mockReturnValue("https://torrentclaw.com/api/v1/torrent/abc");
    const client = createMockClient({
      getTorrentDownloadUrl: getTorrentDownloadUrlMock,
    });
    const { server, getToolHandler } = createMockServer();
    registerGetTorrentUrl(server, client);

    const handler = getToolHandler("get_torrent_url");
    await handler({
      info_hash: "AAF1E71C0A0E3B1C0F1A2B3C4D5E6F7A8B9C0D1E",
    });

    expect(getTorrentDownloadUrlMock).toHaveBeenCalledWith(
      "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    );
  });
});
