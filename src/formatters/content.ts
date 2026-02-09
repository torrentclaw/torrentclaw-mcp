import type {
  SearchResponse,
  SearchResult,
  TorrentInfo,
  PopularResponse,
  PopularItem,
  RecentResponse,
  RecentItem,
} from "../types.js";

function formatSize(bytes: string | null): string {
  if (!bytes) return "?";
  const b = parseInt(bytes, 10);
  if (isNaN(b)) return "?";
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(1)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(0)} MB`;
  return `${(b / 1024).toFixed(0)} KB`;
}

function formatRating(imdb: string | null, tmdb: string | null): string {
  const parts: string[] = [];
  if (imdb) parts.push(`IMDb: ${imdb}`);
  if (tmdb) parts.push(`TMDB: ${tmdb}`);
  return parts.length > 0 ? parts.join(" | ") : "No ratings";
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function formatTorrent(t: TorrentInfo, compact?: boolean): string {
  const parts: string[] = [];
  if (t.quality) parts.push(t.quality);
  if (t.sourceType) parts.push(t.sourceType);
  if (t.codec) parts.push(t.codec);
  if (t.hdrType) parts.push(t.hdrType);
  const label = parts.length > 0 ? parts.join(" ") : "Unknown quality";
  const size = formatSize(t.sizeBytes);
  const seeds = `${t.seeders} seeders`;
  const score = t.qualityScore !== null ? `Score: ${t.qualityScore}` : null;

  let line = `  - ${label} (${size}) | ${seeds}`;
  if (score) line += ` | ${score}`;
  line += `\n    Info hash: ${t.infoHash}`;
  if (compact) {
    // Short magnet (hash only, no trackers) — still clickable, saves ~200 chars per torrent
    line += `\n    Magnet: magnet:?xt=urn:btih:${t.infoHash}`;
  } else if (t.magnetUrl) {
    line += `\n    Magnet: ${t.magnetUrl}`;
  }
  return line;
}

export interface FormatOptions {
  compact?: boolean;
}

function formatResult(
  r: SearchResult,
  index: number,
  opts?: FormatOptions,
): string {
  const lines: string[] = [];
  const yearStr = r.year ? ` (${r.year})` : "";
  lines.push(`${index}. ${r.title}${yearStr} [${r.contentType}]`);
  lines.push(`   ${formatRating(r.ratingImdb, r.ratingTmdb)}`);
  if (r.genres && r.genres.length > 0) {
    lines.push(`   Genres: ${r.genres.join(", ")}`);
  }
  if (r.overview) {
    lines.push(`   ${truncate(r.overview, 200)}`);
  }

  if (r.torrents.length > 0) {
    const top = r.torrents
      .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))
      .slice(0, 5);
    lines.push(`   Torrents (${r.torrents.length} total, top ${top.length}):`);
    for (const t of top) {
      lines.push(formatTorrent(t, opts?.compact));
    }
  } else {
    lines.push("   No torrents available");
  }

  if (r.streaming) {
    const providers: string[] = [];
    if (r.streaming.flatrate.length > 0)
      providers.push(
        `Stream: ${r.streaming.flatrate.map((p) => p.name).join(", ")}`,
      );
    if (r.streaming.free.length > 0)
      providers.push(
        `Free: ${r.streaming.free.map((p) => p.name).join(", ")}`,
      );
    if (providers.length > 0) lines.push(`   ${providers.join(" | ")}`);
  }

  lines.push(
    `   Content ID: ${r.id} — use with get_watch_providers(content_id=${r.id}) or get_credits(content_id=${r.id})`,
  );
  if (r.imdbId) lines.push(`   IMDb: ${r.imdbId}`);

  return lines.join("\n");
}

export function formatSearchResults(
  data: SearchResponse,
  opts?: FormatOptions,
): string {
  if (data.results.length === 0) {
    return "No results found. Try: (1) a shorter or alternate title, (2) removing filters like quality or year, (3) checking spelling. You can also try get_popular or get_recent to browse available content.";
  }

  const header = `Found ${data.total} results (page ${data.page}, showing ${data.results.length}):`;
  const results = data.results.map((r, i) => formatResult(r, i + 1, opts));
  return [header, "", ...results].join("\n");
}

function formatPopularItem(item: PopularItem, index: number): string {
  const yearStr = item.year ? ` (${item.year})` : "";
  const rating = formatRating(item.ratingImdb, item.ratingTmdb);
  return `${index}. ${item.title}${yearStr} [${item.contentType}] — ${rating} — ${item.clickCount} clicks — ID: ${item.id}`;
}

export function formatPopularResults(data: PopularResponse): string {
  if (data.items.length === 0) {
    return "No popular content found.";
  }

  const header = `Popular content (${data.total} total, page ${data.page}):`;
  const hint = "(Use search_content with a title to get torrents and full details)";
  const items = data.items.map((item, i) => formatPopularItem(item, i + 1));
  return [header, hint, "", ...items].join("\n");
}

function formatRecentItem(item: RecentItem, index: number): string {
  const yearStr = item.year ? ` (${item.year})` : "";
  const rating = formatRating(item.ratingImdb, item.ratingTmdb);
  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${index}. ${item.title}${yearStr} [${item.contentType}] — ${rating} — Added: ${date} — ID: ${item.id}`;
}

export function formatRecentResults(data: RecentResponse): string {
  if (data.items.length === 0) {
    return "No recent content found.";
  }

  const header = `Recently added content (${data.total} total, page ${data.page}):`;
  const hint = "(Use search_content with a title to get torrents and full details)";
  const items = data.items.map((item, i) => formatRecentItem(item, i + 1));
  return [header, hint, "", ...items].join("\n");
}
