import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerGetWatchProviders } from "../../src/tools/get-watch-providers.js";
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

describe("get_watch_providers tool", () => {
  it("returns formatted watch providers", async () => {
    const client = createMockClient({
      getWatchProviders: vi.fn().mockResolvedValue({
        contentId: 42,
        country: "ES",
        providers: {
          flatrate: [
            { providerId: 8, name: "Netflix", logo: null, link: null, displayPriority: 1 },
          ],
          rent: [],
          buy: [],
          free: [],
        },
        attribution: "JustWatch",
      }),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetWatchProviders(server, client);

    const handler = getToolHandler("get_watch_providers");
    const result = await handler({ content_id: 42, country: "ES" });

    expect(result.content[0].text).toContain("Netflix");
    expect(result.content[0].text).toContain("content #42");
  });

  it("passes content_id and country to client", async () => {
    const getWatchProvidersMock = vi.fn().mockResolvedValue({
      contentId: 10,
      country: "US",
      providers: { flatrate: [], rent: [], buy: [], free: [] },
      attribution: "JustWatch",
    });
    const client = createMockClient({
      getWatchProviders: getWatchProvidersMock,
    });
    const { server, getToolHandler } = createMockServer();
    registerGetWatchProviders(server, client);

    const handler = getToolHandler("get_watch_providers");
    await handler({ content_id: 10, country: "US" });

    expect(getWatchProvidersMock).toHaveBeenCalledWith(10, "US");
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      getWatchProviders: vi.fn().mockRejectedValue(new ApiError(404, "Not found")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetWatchProviders(server, client);

    const handler = getToolHandler("get_watch_providers");
    const result = await handler({ content_id: 999, country: "US" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (404)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      getWatchProviders: vi.fn().mockRejectedValue(new Error("Connection refused")),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetWatchProviders(server, client);

    const handler = getToolHandler("get_watch_providers");
    const result = await handler({ content_id: 1, country: "US" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Connection refused");
  });

  it("handles non-Error throw", async () => {
    const client = createMockClient({
      getWatchProviders: vi.fn().mockRejectedValue(null),
    });
    const { server, getToolHandler } = createMockServer();
    registerGetWatchProviders(server, client);

    const handler = getToolHandler("get_watch_providers");
    const result = await handler({ content_id: 1, country: "US" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
