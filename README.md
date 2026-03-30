# torrentclaw-mcp

[![npm version](https://img.shields.io/npm/v/torrentclaw-mcp)](https://www.npmjs.com/package/torrentclaw-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/torrentclaw/torrentclaw-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/torrentclaw/torrentclaw-mcp/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

[Model Context Protocol](https://modelcontextprotocol.io/) server for [TorrentClaw](https://torrentclaw.com) — giving AI assistants the ability to search movies and TV shows, find torrents with magnet links, check streaming availability, and explore cast/crew metadata.

torrentclaw-mcp is developed by [TorrentClaw](https://torrentclaw.com) as part of its open-source ecosystem. It wraps the TorrentClaw API into the MCP standard so that any compatible AI assistant (Claude, GPT, etc.) can access the platform's search and discovery features natively.

## Hosted deployment

A hosted deployment is available on [Fronteir AI](https://fronteir.ai/mcp/torrentclaw-torrentclaw-mcp).

## Quick Start

```bash
npx torrentclaw-mcp
```

No API key required (optional for higher rate limits).

## What can it do?

### Tools

| Tool                  | Description                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_content`      | Search movies/shows with filters (query, type, genre, year, rating, quality, language, audio, HDR, season, episode, sort). Returns torrents, magnet links, and optional streaming info. |
| `autocomplete`        | Type-ahead search suggestions (up to 8 results). Use to validate titles before a full search.                                                |
| `get_popular`         | Get popular content ranked by user clicks                                                                                                    |
| `get_recent`          | Get recently added content                                                                                                                   |
| `get_watch_providers` | Streaming availability by country (Netflix, Disney+, etc.)                                                                                   |
| `get_credits`         | Cast and director for a title                                                                                                                |
| `get_torrent_url`     | Get .torrent file download URL from info hash                                                                                                |
| `track_interaction`   | Track user interaction with a torrent (magnet click, download, copy)                                                                         |
| `submit_scan_request` | Submit a torrent for audio/video quality analysis via [TrueSpec](https://github.com/torrentclaw/truespec)                                    |
| `get_scan_status`     | Check the status of a torrent scan request                                                                                                   |

### Resources

| URI                   | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `torrentclaw://stats` | Catalog statistics (content/torrent counts by source) |

### Prompts

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

### Environment Variables

| Variable              | Default                   | Description                                                    |
| --------------------- | ------------------------- | -------------------------------------------------------------- |
| `TORRENTCLAW_API_URL` | `https://torrentclaw.com` | Base URL of the TorrentClaw API                                |
| `TORRENTCLAW_API_KEY` | _(none)_                  | Optional API key for authenticated access (higher rate limits) |

## Project Structure

```
.
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── config.ts             # Configuration & URL validation
│   ├── api-client.ts         # TorrentClaw API client with caching
│   ├── types.ts              # TypeScript interfaces for API responses
│   ├── prompts.ts            # MCP prompt definitions
│   ├── tools/                # MCP tool implementations
│   │   ├── search-content.ts
│   │   ├── autocomplete.ts
│   │   ├── get-popular.ts
│   │   ├── get-recent.ts
│   │   ├── get-watch-providers.ts
│   │   ├── get-credits.ts
│   │   ├── get-torrent-url.ts
│   │   ├── track-interaction.ts
│   │   └── scan-request.ts
│   ├── formatters/           # Output formatting
│   │   ├── content.ts
│   │   ├── providers.ts
│   │   └── credits.ts
│   └── resources/            # MCP resources
│       └── stats.ts
├── tests/                    # Test suite (vitest)
├── .github/workflows/        # CI/CD (lint, build, test, release)
├── lefthook.yml              # Git hooks (commit lint, prettier, tsc)
├── Makefile                  # Dev workflow (build, test, lint, fmt)
├── CONTRIBUTING.md           # Contribution guidelines
├── LICENSE                   # MIT
└── README.md
```

## Development

```bash
git clone https://github.com/torrentclaw/torrentclaw-mcp.git
cd torrentclaw-mcp
make install-tools
make hooks
make build && make test
```

Test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## About TorrentClaw

[TorrentClaw](https://torrentclaw.com) is an open platform focused on improving the quality and reliability of torrent metadata. Our mission is to make torrent search engines more accurate and the torrent ecosystem healthier — by building tools that verify, enrich, and standardize metadata across the network.

torrentclaw-mcp is part of the TorrentClaw open-source ecosystem, alongside [TrueSpec](https://github.com/torrentclaw/truespec) (torrent metadata verification).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.
