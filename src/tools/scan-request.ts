import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";

export function registerScanRequest(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "submit_scan_request",
    "Submit a torrent for audio/video quality analysis (codec, tracks, resolution, HDR). Use when the user wants to know the exact media specs of a torrent before downloading. Results are not instant — use get_scan_status to check progress. Rate limited to 5 requests per hour.",
    {
      info_hash: z
        .string()
        .regex(/^[a-fA-F0-9]{40}$/)
        .describe("40-character hex torrent info_hash to scan"),
      email: z
        .string()
        .email()
        .max(200)
        .describe("Email address for scan completion notification"),
    },
    async (params) => {
      try {
        const data = await client.submitScanRequest(
          params.info_hash.toLowerCase(),
          params.email,
        );
        return {
          content: [
            {
              type: "text",
              text: `Scan request submitted for ${params.info_hash.toLowerCase()}.\nStatus: ${data.status}\nUse get_scan_status(info_hash="${params.info_hash.toLowerCase()}") to check progress.`,
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof ApiError
            ? `TorrentClaw API error (${error.status}): ${error.message}`
            : `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        return { content: [{ type: "text", text: message }], isError: true };
      }
    },
  );

  server.tool(
    "get_scan_status",
    "Check the status of a torrent audio/video scan request. Returns the current scan status (pending, scanning, completed, failed). Use after submit_scan_request.",
    {
      info_hash: z
        .string()
        .regex(/^[a-fA-F0-9]{40}$/)
        .describe("40-character hex torrent info_hash to check"),
    },
    async (params) => {
      try {
        const data = await client.getScanStatus(params.info_hash.toLowerCase());
        const lines = [`Scan status for ${params.info_hash.toLowerCase()}:`];
        lines.push(`  Status: ${data.status}`);
        if (data.source) lines.push(`  Source: ${data.source}`);
        if (data.createdAt) lines.push(`  Submitted: ${data.createdAt}`);
        if (data.completedAt) lines.push(`  Completed: ${data.completedAt}`);
        return {
          content: [{ type: "text", text: lines.join("\n") }],
        };
      } catch (error) {
        const message =
          error instanceof ApiError
            ? `TorrentClaw API error (${error.status}): ${error.message}`
            : `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        return { content: [{ type: "text", text: message }], isError: true };
      }
    },
  );
}
