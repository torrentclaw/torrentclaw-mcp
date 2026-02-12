import { describe, it, expect, vi } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerScanRequest } from "../../src/tools/scan-request.js";
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

describe("submit_scan_request tool", () => {
  it("submits scan request successfully", async () => {
    const submitMock = vi.fn().mockResolvedValue({
      status: "pending",
      createdAt: "2026-01-01T00:00:00Z",
    });
    const client = createMockClient({ submitScanRequest: submitMock });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("submit_scan_request");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      email: "test@example.com",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Scan request submitted");
    expect(result.content[0].text).toContain("pending");
    expect(submitMock).toHaveBeenCalledWith(
      "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      "test@example.com",
    );
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      submitScanRequest: vi
        .fn()
        .mockRejectedValue(new ApiError(429, "Rate limited")),
    });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("submit_scan_request");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      email: "test@example.com",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (429)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      submitScanRequest: vi.fn().mockRejectedValue(new Error("Timeout")),
    });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("submit_scan_request");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      email: "test@example.com",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Request failed: Timeout");
  });

  it("returns isError on non-Error throw", async () => {
    const client = createMockClient({
      submitScanRequest: vi.fn().mockRejectedValue("string error"),
    });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("submit_scan_request");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
      email: "test@example.com",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});

describe("get_scan_status tool", () => {
  it("returns scan status", async () => {
    const statusMock = vi.fn().mockResolvedValue({
      status: "completed",
      source: "scan_request",
      createdAt: "2026-01-01T00:00:00Z",
      completedAt: "2026-01-01T00:05:00Z",
    });
    const client = createMockClient({ getScanStatus: statusMock });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("get_scan_status");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("completed");
    expect(result.content[0].text).toContain("scan_request");
  });

  it("returns minimal status when fields are missing", async () => {
    const statusMock = vi.fn().mockResolvedValue({
      status: "not_scanned",
    });
    const client = createMockClient({ getScanStatus: statusMock });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("get_scan_status");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    });

    expect(result.content[0].text).toContain("not_scanned");
    expect(result.content[0].text).not.toContain("Source:");
  });

  it("returns isError on ApiError", async () => {
    const client = createMockClient({
      getScanStatus: vi
        .fn()
        .mockRejectedValue(new ApiError(404, "Not found")),
    });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("get_scan_status");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("TorrentClaw API error (404)");
  });

  it("returns isError on generic error", async () => {
    const client = createMockClient({
      getScanStatus: vi.fn().mockRejectedValue(new Error("DNS failure")),
    });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("get_scan_status");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("DNS failure");
  });

  it("returns isError on non-Error throw", async () => {
    const client = createMockClient({
      getScanStatus: vi.fn().mockRejectedValue(42),
    });
    const { server, getToolHandler } = createMockServer();
    registerScanRequest(server, client);

    const handler = getToolHandler("get_scan_status");
    const result = await handler({
      info_hash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });
});
