import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TorrentClawClient } from "../api-client.js";
import { ApiError } from "../api-client.js";
import { formatSearchResults } from "../formatters/content.js";

export function registerSearchContent(
  server: McpServer,
  client: TorrentClawClient,
): void {
  server.tool(
    "search_content",
    "Search for movies and TV shows by title, genre, year, rating, or quality. Returns matching content with metadata (title, year, genres, IMDb/TMDB ratings) and torrent download options (magnet links, quality, seeders, file size). This is the primary tool — use it first when a user asks to find, download, or learn about a movie or TV show. Results include a content_id needed by get_watch_providers and get_credits.",
    {
      query: z
        .string()
        .min(1)
        .max(200)
        .refine(
          (q) => !/[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(q),
          "Query contains invalid control characters",
        )
        .describe(
          "Search query — typically a movie or TV show title (e.g. 'The Matrix', 'Breaking Bad'). Supports partial matches.",
        ),
      type: z
        .enum(["movie", "show"])
        .optional()
        .describe("Filter by content type: 'movie' or 'show'"),
      genre: z
        .string()
        .max(50)
        .regex(
          /^[a-zA-Z\s&-]+$/,
          "Genre must contain only letters, spaces, ampersands, and hyphens",
        )
        .optional()
        .describe(
          "Filter by genre name. Common values: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western",
        ),
      year_min: z
        .number()
        .int()
        .optional()
        .describe("Minimum release year (e.g. 2020)"),
      year_max: z
        .number()
        .int()
        .optional()
        .describe("Maximum release year (e.g. 2025)"),
      min_rating: z
        .number()
        .min(0)
        .max(10)
        .optional()
        .describe(
          "Minimum IMDb rating (0-10). Example: 7 for well-rated content",
        ),
      quality: z
        .enum(["480p", "720p", "1080p", "2160p"])
        .optional()
        .describe("Filter torrents by resolution"),
      language: z
        .string()
        .optional()
        .describe(
          "ISO 639-1 language code to filter torrents (e.g. 'en' for English, 'es' for Spanish, 'fr' for French). Lowercase 2-letter code.",
        ),
      sort: z
        .enum(["relevance", "seeders", "year", "rating", "added"])
        .default("relevance")
        .describe("Sort order for results"),
      page: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Page number (default: 1)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe("Results per page (default: 10, max: 20)"),
      country: z
        .string()
        .regex(
          /^[A-Z]{2}$/,
          "Must be uppercase 2-letter ISO 3166-1 country code",
        )
        .optional()
        .describe(
          "ISO 3166-1 country code for streaming availability (e.g. US, ES, GB, DE). If provided, results include which streaming services offer each title. If omitted, no streaming data is returned.",
        ),
      compact: z
        .boolean()
        .default(false)
        .describe(
          "When true, returns shorter magnet links (hash only, no trackers) to reduce output size. Magnets are still clickable. Recommended for large result sets or when context window is limited.",
        ),
    },
    async (params) => {
      try {
        const data = await client.search({
          query: params.query,
          type: params.type,
          genre: params.genre,
          year_min: params.year_min,
          year_max: params.year_max,
          min_rating: params.min_rating,
          quality: params.quality,
          language: params.language,
          sort: params.sort,
          page: params.page,
          limit: params.limit ?? 10,
          country: params.country,
        });
        return {
          content: [
            {
              type: "text",
              text: formatSearchResults(data, { compact: params.compact }),
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
