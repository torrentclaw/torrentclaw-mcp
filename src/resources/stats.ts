import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TorrentClawClient } from "../api-client.js";

export function registerStatsResource(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.resource(
    "stats",
    "torrentclaw://stats",
    {
      description:
        "TorrentClaw catalog statistics. Returns JSON with: content counts (movies, shows, TMDB-enriched), torrent counts (total, with seeders, by source), and recent ingestion job history. Useful for understanding catalog coverage and data freshness.",
      mimeType: "application/json",
    },
    async (uri) => {
      const stats = await client.getStats();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    },
  );
}
