import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";
import { formatCredits } from "../formatters/credits.js";

export function registerGetCredits(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "get_credits",
    "Get the director and top 10 cast members (with character names) for a movie or TV show. Use when the user asks about actors, cast, director, or 'who is in' a title. Requires content_id from search_content results.",
    {
      content_id: z
        .number()
        .int()
        .positive()
        .max(999_999_999, "Content ID out of valid range")
        .describe(
          "Numeric content ID from search_content results (the 'Content ID' field). Example: 42",
        ),
    },
    async (params) => {
      try {
        const data = await client.getCredits(params.content_id);
        return { content: [{ type: "text", text: formatCredits(data) }] };
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
