import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerTrackInteraction } from "../../src/tools/track-interaction.js";
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

describe("track_interaction tool", () => {
  it("tracks magnet interaction successfully", async () => {
    const trackMock = vi.fn().mockResolvedValue({ ok: true });
    const client = createMockClient({ track: trackMock });
    const { server, getToolHandler } = createMockServer();
    registerTrackInteraction(server, client);

    const handler = getToolHandler("track_interaction");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      action: "magnet",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Tracked magnet");
    expect(trackMock).toHaveBeenCalledWith(
      "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      "magnet",
    );
  });

  it("lowercases info_hash", async () => {
    const trackMock = vi.fn().mockResolvedValue({ ok: true });
    const client = createMockClient({ track: trackMock });
    const { server, getToolHandler } = createMockServer();
    registerTrackInteraction(server, client);

    const handler = getToolHandler("track_interaction");
    await handler({
      info_hash: "AAF1E71C0A0E3B1C0F1A2B3C4D5E6F7A8B9C0D1E",
      action: "copy",
    });

    expect(trackMock).toHaveBeenCalledWith(
      "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      "copy",
    );
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      track: vi.fn().mockRejectedValue(new ApiError(500, "Server error")),
    });
    const { server, getToolHandler } = createMockServer();
    registerTrackInteraction(server, client);

    const handler = getToolHandler("track_interaction");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      action: "torrent_download",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (500)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      track: vi.fn().mockRejectedValue(new Error("Network failure")),
    });
    const { server, getToolHandler } = createMockServer();
    registerTrackInteraction(server, client);

    const handler = getToolHandler("track_interaction");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      action: "magnet",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Request failed: Network failure");
  });

  it("returns isError on non-Error throw", async () => {
    const client = createMockClient({
      track: vi.fn().mockRejectedValue("string error"),
    });
    const { server, getToolHandler } = createMockServer();
    registerTrackInteraction(server, client);

    const handler = getToolHandler("track_interaction");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      action: "magnet",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
