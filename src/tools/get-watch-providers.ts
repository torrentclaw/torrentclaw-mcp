import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";
import { formatWatchProviders } from "../formatters/providers.js";

export function registerGetWatchProviders(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "get_watch_providers",
    "Check where a movie or TV show is available to stream, rent, or buy (Netflix, Disney+, Amazon Prime, etc.) in a specific country. Requires content_id from search_content results. Note: if you passed country to search_content, streaming info is already in those results — use this tool only for a different country or to get more detail. Returns grouped providers: Stream (subscription), Free, Rent, Buy.",
    {
      content_id: z
        .number()
        .int()
        .positive()
        .max(999_999_999, "Content ID out of valid range")
        .describe(
          "Numeric content ID from search_content results (the 'Content ID' field). Example: 42",
        ),
      country: z
        .string()
        .regex(
          /^[A-Z]{2}$/,
          "Must be uppercase 2-letter ISO 3166-1 country code",
        )
        .default("US")
        .describe("ISO 3166-1 country code (e.g. US, ES, GB, DE). Default: US"),
    },
    async (params) => {
      try {
        const data = await client.getWatchProviders(
          params.content_id,
          params.country,
        );
        return {
          content: [{ type: "text", text: formatWatchProviders(data) }],
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
