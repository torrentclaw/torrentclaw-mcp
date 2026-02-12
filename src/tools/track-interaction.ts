import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";

export function registerTrackInteraction(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "track_interaction",
    "Track a user interaction with a torrent (magnet link click, .torrent download, or hash copy). Use this after presenting a magnet link or torrent URL to the user, to keep popularity stats accurate. Fire-and-forget — does not block.",
    {
      info_hash: z
        .string()
        .regex(/^[a-fA-F0-9]{40}$/)
        .describe("40-character hex torrent info_hash"),
      action: z
        .enum(["magnet", "torrent_download", "copy"])
        .describe(
          "Type of interaction: 'magnet' (clicked magnet link), 'torrent_download' (downloaded .torrent file), 'copy' (copied info hash or magnet)",
        ),
    },
    async (params) => {
      try {
        await client.track(params.info_hash.toLowerCase(), params.action);
        return {
          content: [
            {
              type: "text",
              text: `Tracked ${params.action} for ${params.info_hash.toLowerCase()}.`,
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
}
