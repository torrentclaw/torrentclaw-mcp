#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TorrentClawClient } from "./api-client.js";
import { config } from "./config.js";
import { registerSearchContent } from "./tools/search-content.js";
import { registerGetPopular } from "./tools/get-popular.js";
import { registerGetRecent } from "./tools/get-recent.js";
import { registerGetWatchProviders } from "./tools/get-watch-providers.js";
import { registerGetCredits } from "./tools/get-credits.js";
import { registerGetTorrentUrl } from "./tools/get-torrent-url.js";
import { registerStatsResource } from "./resources/stats.js";
import { registerPrompts } from "./prompts.js";

const client = new TorrentClawClient();

const server = new McpServer({
  name: "torrentclaw",
  version: config.version,
  description:
    "Search and discover movies and TV shows with torrent downloads, streaming availability, and cast/crew metadata. Start with search_content to find content, then use get_watch_providers or get_credits with the content_id. Use get_popular/get_recent to browse (no torrents — search for a title to get torrents).",
});

// Register tools
registerSearchContent(server, client);
registerGetPopular(server, client);
registerGetRecent(server, client);
registerGetWatchProviders(server, client);
registerGetCredits(server, client);
registerGetTorrentUrl(server, client);

// Register resources
registerStatsResource(server, client);

// Register prompts
registerPrompts(server);

// Graceful shutdown
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

// Connect via STDIO
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("TorrentClaw MCP server running on stdio");
