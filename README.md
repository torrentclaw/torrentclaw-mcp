# torrentclaw-mcp

MCP server for [TorrentClaw](https://torrentclaw.com) — search movies and TV shows with torrent download options, streaming availability, and metadata.

## Quick Start

```bash
npx torrentclaw-mcp
```

No API key required.

## Available Tools

| Tool                  | Description                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_content`      | Search movies/shows with filters (query, type, genre, year, rating, quality, language, sort). Returns content with torrents and magnet links. |
| `get_popular`         | Get popular content ranked by user clicks                                                                                                     |
| `get_recent`          | Get recently added content                                                                                                                    |
| `get_watch_providers` | Streaming availability by country (Netflix, Disney+, etc.)                                                                                    |
| `get_credits`         | Cast and director for a title                                                                                                                 |
| `get_torrent_url`     | Get .torrent file download URL from info hash                                                                                                 |

## Resources

| URI                   | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `torrentclaw://stats` | Catalog statistics (content/torrent counts by source) |

## Prompts

| Prompt           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `search_movie`   | Search for a movie by title and get torrents + streaming |
| `search_show`    | Search for a TV show by title and get torrents           |
| `whats_new`      | Discover recently added movies and TV shows              |
| `where_to_watch` | Find where to stream, rent, or buy a title               |

## Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "torrentclaw": {
      "command": "npx",
      "args": ["-y", "torrentclaw-mcp"]
    }
  }
}
```

### Claude Code

Add to `.mcp.json` or `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "torrentclaw": {
      "command": "npx",
      "args": ["-y", "torrentclaw-mcp"]
    }
  }
}
```

### Self-hosted

Point to your own TorrentClaw instance:

```json
{
  "mcpServers": {
    "torrentclaw": {
      "command": "npx",
      "args": ["-y", "torrentclaw-mcp"],
      "env": {
        "TORRENTCLAW_API_URL": "http://localhost:3030",
        "TORRENTCLAW_ALLOW_PRIVATE": "true"
      }
    }
  }
}
```

## Environment Variables

| Variable                    | Default                   | Description                                                            |
| --------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `TORRENTCLAW_API_URL`       | `https://torrentclaw.com` | Base URL of the TorrentClaw API                                        |
| `TORRENTCLAW_ALLOW_PRIVATE` | `false`                   | Set to `true` to allow private/localhost URLs (for self-hosted setups) |

## Development

```bash
git clone https://github.com/buryni/torrentclaw-mcp.git
cd torrentclaw-mcp
npm install
npm run build
```

Test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

Run tests:

```bash
npm test
```

## License

MIT
