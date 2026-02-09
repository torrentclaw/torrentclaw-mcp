import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";
import { formatRecentResults } from "../formatters/content.js";

export function registerGetRecent(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "get_recent",
    "Get the most recently added movies and TV shows, sorted by addition date. Use when the user asks 'what's new', 'latest additions', or 'recently added'. Returns a paginated list with title, year, type, ratings, date added, and content_id. Note: results do NOT include torrents — to get torrents for a title, call search_content with its name.",
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(24)
        .optional()
        .describe("Number of items (default: 10)"),
      page: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Page number (default: 1)"),
    },
    async (params) => {
      try {
        const data = await client.getRecent(
          params.limit ?? 10,
          params.page,
        );
        return {
          content: [{ type: "text", text: formatRecentResults(data) }],
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
