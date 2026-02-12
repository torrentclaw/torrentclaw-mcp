import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "presentation_guide",
    "Guide for presenting torrent search results in a user-friendly format",
    {},
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `When presenting torrent search results to users, follow these best practices:

1. **Magnet Links**: Always make magnet links clickable using markdown format:
   - Format: [📥 Download](magnet:?xt=urn:btih:HASH...)
   - Or: [🧲 Magnet Link](magnet:?xt=urn:btih:HASH...)
   - Never show raw magnet URIs without making them clickable

2. **Content URL**: Include the TorrentClaw content URL for browsing all seasons/episodes:
   - Format: [🔗 View all seasons on TorrentClaw](https://torrentclaw.com/shows/...)
   - This allows users to explore other seasons/episodes

3. **Presentation Format**: Use clear, readable formatting:
   - Group by episode/season for TV shows
   - Show quality, size, and seeder count prominently
   - Highlight torrents with active seeders
   - Warn if torrents have 0 seeders

4. **Example Format for TV Shows**:
   **Entrevías - Temporada 4**

   **Episodio 1** (S04E01)
   - 720p HDTV • 879 MB • 6 seeders [📥 Download](magnet:?xt=...)

   **Episodio 2** (S04E02)
   - 1080p WEB-DL • 2.5 GB • 0 seeders ⚠️ [📥 Download](magnet:?xt=...)
   - 720p HDTV • 976 MB • 1 seeder [📥 Download](magnet:?xt=...)

   [🔗 View all seasons on TorrentClaw](URL)

5. **Helpful Information**:
   - Recommend torrents with more seeders
   - Suggest alternatives if requested season/episode has no seeders
   - Offer to search for different quality if user wants

Apply these practices to make results actionable and user-friendly.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "search_movie",
    "Search for a movie by title and get torrent download options",
    { title: z.string().describe("Movie title to search for") },
    ({ title }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search for the movie "${title}" using search_content with type="movie". Present the results with clickable magnet links using markdown format [📥 Download](magnet:...), include the content URL for more details, and show quality/size/seeders clearly. If results are found, also call get_watch_providers with the content_id to check streaming availability.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "search_show",
    "Search for a TV show by title and get torrent download options",
    {
      title: z.string().describe("TV show title to search for"),
      season: z.number().optional().describe("Specific season number"),
    },
    ({ title, season }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search for the TV show "${title}" using search_content with type="show"${season ? ` and season=${season}` : ""}. Present results grouped by episode with:
- Episode identifier (e.g., S04E01)
- Quality, size, and seeder count
- Clickable magnet links using markdown: [📥 Download](magnet:...)
- Content URL for browsing all seasons: [🔗 View all seasons](URL)
- Recommendations for torrents with most seeders
- Warnings if torrents have 0 seeders`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "whats_new",
    "Discover recently added movies and TV shows",
    {},
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Use get_recent to show the most recently added movies and TV shows. Present each with its title, year, type (movie/show), and ratings.",
          },
        },
      ],
    }),
  );

  server.prompt(
    "where_to_watch",
    "Find where to watch a movie or TV show via streaming services",
    {
      title: z.string().describe("Movie or TV show title"),
      country: z
        .string()
        .optional()
        .describe("2-letter country code (e.g. US, ES)"),
    },
    ({ title, country }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search for "${title}" using search_content${country ? ` with country="${country}"` : ' with country="US"'}. Show the streaming availability (which services offer it for subscription, rent, or purchase) and the best torrent download options.`,
          },
        },
      ],
    }),
  );
}
