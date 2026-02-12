import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPresentationGuideResource(server: McpServer): void {
  server.resource(
    "presentation-guide",
    "torrentclaw://presentation-guide",
    {
      description:
        "Best practices for presenting torrent search results to users in a user-friendly, actionable format",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const guide = `# TorrentClaw Results Presentation Guide

## Critical Requirements

When presenting torrent search results to users, you MUST follow these practices to make results actionable and user-friendly:

### 1. Clickable Magnet Links

**ALWAYS** make magnet links clickable using markdown format:

✅ **CORRECT**:
- [📥 Download](magnet:?xt=urn:btih:41159dc60579839533e04796df0e96bfa4864cb4&...)
- [🧲 Magnet](magnet:?xt=urn:btih:41159dc60579839533e04796df0e96bfa4864cb4&...)

❌ **INCORRECT**:
- magnet:?xt=urn:btih:41159dc60579839533e04796df0e96bfa4864cb4 (not clickable)
- Showing only the info hash without full magnet URI

### 2. Content URL for Browsing

**ALWAYS** include the TorrentClaw content URL so users can explore all seasons/episodes:

✅ **CORRECT**:
[🔗 View all seasons and episodes on TorrentClaw](https://torrentclaw.com/shows/entrevias-2022-91260)

This allows users to:
- Browse all available seasons
- See all torrents for each episode
- Explore different quality options

### 3. User-Friendly Presentation Format

**For TV Shows** (especially when searching by season):

\`\`\`markdown
### Entrevías - Temporada 4

**Episodio 1** (S04E01)
- 720p HDTV • 879 MB • 6 seeders • [📥 Download](magnet:?xt=urn:btih:...)

**Episodio 2** (S04E02)
- 1080p WEB-DL • 2.5 GB • 0 seeders ⚠️ No active seeders • [📥 Download](magnet:?xt=urn:btih:...)
- 720p HDTV • 976 MB • 1 seeder • [📥 Download](magnet:?xt=urn:btih:...)

**Episodio 3** (S04E03)
- 720p HDTV • 795 MB • 2 seeders • [📥 Download](magnet:?xt=urn:btih:...)

[🔗 View all seasons on TorrentClaw](https://torrentclaw.com/shows/...)
\`\`\`

**For Movies**:

\`\`\`markdown
### Inception (2010)
IMDb: 8.8 | TMDB: 8.4

**Available Torrents:**

1. **2160p BluRay** • 15.2 GB • 147 seeders • [📥 Download](magnet:?xt=...)
2. **1080p BluRay** • 2.0 GB • 847 seeders ⭐ Recommended • [📥 Download](magnet:?xt=...)
3. **720p WEB-DL** • 1.2 GB • 234 seeders • [📥 Download](magnet:?xt=...)

[🔗 View on TorrentClaw](https://torrentclaw.com/movies/...)
\`\`\`

### 4. Helpful User Guidance

Provide context and recommendations:

- ✅ Recommend torrents with most seeders
- ✅ Warn when torrents have 0 seeders: "⚠️ No active seeders"
- ✅ Mark best option: "⭐ Recommended" (based on seeders + quality)
- ✅ Suggest alternatives if requested season has no seeders
- ✅ Offer to search different quality/season

### 5. What NOT to Do

❌ **Never** present results in plain text tables without clickable links
❌ **Never** show truncated magnet links
❌ **Never** omit the content URL
❌ **Never** show info hashes without the full magnet URI
❌ **Never** present results without indicating seeder count

### 6. Example of Good vs Bad Presentation

**❌ BAD** (what user reported as not practical):
\`\`\`
┌──────────┬───────────┬────────┬───────────┬──────────────────────────────────┐
│ Episodio │  Calidad  │ Tamaño │  Seeders  │            Magnet                │
├──────────┼───────────┼────────┼───────────┼──────────────────────────────────┤
│ S04E01   │ 720p HDTV │ 879 MB │ 6 seeders │ magnet:?xt=urn:btih:41159dc...   │
└──────────┴───────────┴────────┴───────────┴──────────────────────────────────┘
\`\`\`

**✅ GOOD**:
\`\`\`markdown
**S04E01**
720p HDTV • 879 MB • 6 seeders • [📥 Download](magnet:?xt=urn:btih:41159dc60579839533e04796df0e96bfa4864cb4&...)

[🔗 View all episodes on TorrentClaw](https://torrentclaw.com/shows/entrevias-2022-91260)
\`\`\`

## Summary

The key is to make results **actionable**: users should be able to:
1. Click magnet links to start downloading immediately
2. Click content URL to explore more options
3. Quickly identify which torrents are best (seeders)
4. Understand warnings (no seeders)

**Remember**: You're not just displaying data, you're helping users take action.
`;

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: guide,
          },
        ],
      };
    },
  );
}
