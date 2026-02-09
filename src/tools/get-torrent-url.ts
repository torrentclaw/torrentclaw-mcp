import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";

export function registerGetTorrentUrl(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "get_torrent_url",
    "Get a direct .torrent file download URL from an info_hash. Use when the user specifically wants a .torrent file rather than a magnet link (magnet links are already in search_content results). Returns a single URL the user can open in their browser or torrent client.",
    {
      info_hash: z
        .string()
        .regex(/^[a-fA-F0-9]{40}$/)
        .describe(
          "40-character hex torrent info_hash from search_content results (e.g. 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2')",
        ),
    },
    async (params) => {
      const url = client.getTorrentDownloadUrl(params.info_hash.toLowerCase());
      return {
        content: [
          {
            type: "text",
            text: `Download .torrent file: ${url}`,
          },
        ],
      };
    },
  );
}
