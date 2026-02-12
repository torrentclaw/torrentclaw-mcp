import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";

export function registerAutocomplete(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "autocomplete",
    "Get type-ahead search suggestions for movies and TV shows. Use this to validate or disambiguate a title before calling search_content. Returns up to 8 suggestions with id, title, year, and content type. Much faster than a full search.",
    {
      query: z
        .string()
        .min(2)
        .max(200)
        .refine(
          (q) => !/[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(q),
          "Query contains invalid control characters",
        )
        .describe(
          "Partial title to get suggestions for (min 2 chars). E.g. 'break' → 'Breaking Bad', 'The Break-Up'.",
        ),
    },
    async (params) => {
      try {
        const data = await client.autocomplete(params.query);
        if (data.suggestions.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No suggestions for "${params.query}". Try search_content for a full search.`,
              },
            ],
          };
        }
        const lines = data.suggestions.map((s, i) => {
          const yearStr = s.year ? ` (${s.year})` : "";
          return `${i + 1}. ${s.title}${yearStr} [${s.contentType}] — ID: ${s.id}`;
        });
        return {
          content: [
            {
              type: "text",
              text: `Suggestions for "${params.query}":\n${lines.join("\n")}`,
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
