import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
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
            text: `Search for the movie "${title}" using search_content with type="movie". Present the results showing: title, year, ratings, and the top torrents sorted by quality score with their magnet links. If results are found, also call get_watch_providers with the content_id to check streaming availability.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "search_show",
    "Search for a TV show by title and get torrent download options",
    { title: z.string().describe("TV show title to search for") },
    ({ title }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search for the TV show "${title}" using search_content with type="show". Present the results showing: title, year, ratings, and the top torrents sorted by quality score with their magnet links.`,
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
