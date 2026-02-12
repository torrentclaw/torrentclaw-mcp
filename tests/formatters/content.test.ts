import { describe, it, expect } from "vitest";
import {
  formatSearchResults,
  formatPopularResults,
  formatRecentResults,
} from "../../src/formatters/content.js";
import type {
  SearchResponse,
  PopularResponse,
  RecentResponse,
} from "../../src/types.js";

describe("formatSearchResults", () => {
  it("formats empty results", () => {
    const response: SearchResponse = {
      total: 0,
      page: 1,
      pageSize: 10,
      results: [],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("No results found");
  });

  it("formats a single movie with torrents", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 42,
          imdbId: "tt1375666",
          tmdbId: "27205",
          contentType: "movie",
          title: "Inception",
          titleOriginal: "Inception",
          year: 2010,
          overview:
            "A thief who steals corporate secrets through dream-sharing technology.",
          posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
          backdropUrl: null,
          genres: ["Action", "Science Fiction"],
          ratingImdb: "8.8",
          ratingTmdb: "8.4",
          hasTorrents: true,
          torrents: [
            {
              infoHash: "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
              quality: "1080p",
              codec: "x265",
              sourceType: "BluRay",
              sizeBytes: "2147483648",
              seeders: 847,
              leechers: 23,
              magnetUrl:
                "magnet:?xt=urn:btih:aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e",
              source: "yts",
              qualityScore: 85,
              uploadedAt: "2024-03-15T12:00:00Z",
              languages: ["en"],
              audioCodec: "aac",
              hdrType: null,
              releaseGroup: "YTS",
              isProper: false,
              isRepack: false,
              isRemastered: false,
            },
          ],
        },
      ],
    };

    const text = formatSearchResults(response);
    expect(text).toContain("Found 1 results");
    expect(text).toContain("Inception (2010) [movie]");
    expect(text).toContain("IMDb: 8.8");
    expect(text).toContain("TMDB: 8.4");
    expect(text).toContain("Action, Science Fiction");
    expect(text).toContain("1080p BluRay x265");
    expect(text).toContain("2.0 GB");
    expect(text).toContain("847 seeders");
    expect(text).toContain("Score: 85");
    expect(text).toContain("magnet:");
    expect(text).toContain("Content ID: 42");
    expect(text).toContain("tt1375666");
  });

  it("caps torrents at 5 and sorts by qualityScore", () => {
    const torrents = Array.from({ length: 8 }, (_, i) => ({
      infoHash: `${"a".repeat(39)}${i}`,
      quality: `${720 + i * 10}p`,
      codec: "x264",
      sourceType: "WEB-DL",
      sizeBytes: "1073741824",
      seeders: 100 + i,
      leechers: 10,
      magnetUrl: `magnet:?xt=urn:btih:${"a".repeat(39)}${i}`,
      source: "knaben:test",
      qualityScore: i * 10,
      uploadedAt: null,
      languages: ["en"],
      audioCodec: null,
      hdrType: null,
      releaseGroup: null,
      isProper: false,
      isRepack: false,
      isRemastered: false,
    }));

    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Test Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: true,
          torrents,
        },
      ],
    };

    const text = formatSearchResults(response);
    expect(text).toContain("8 total, top 5");
    // Highest score (70) should appear first
    expect(text).toContain("Score: 70");
  });

  it("formats KB-sized torrent", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Small File",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "a".repeat(40),
              quality: null,
              codec: null,
              sourceType: null,
              sizeBytes: "512000",
              seeders: 5,
              leechers: 0,
              magnetUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("500 KB");
    expect(text).toContain("Unknown quality");
    expect(text).not.toContain("Score:");
  });

  it("formats MB-sized torrent", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Medium File",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "b".repeat(40),
              quality: "720p",
              codec: null,
              sourceType: null,
              sizeBytes: "524288000",
              seeders: 10,
              leechers: 1,
              magnetUrl: null,
              source: "test",
              qualityScore: 50,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("500 MB");
  });

  it("handles null and NaN sizeBytes", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "No Size",
          titleOriginal: null,
          year: null,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "c".repeat(40),
              quality: "1080p",
              codec: null,
              sourceType: null,
              sizeBytes: null,
              seeders: 1,
              leechers: 0,
              magnetUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
            {
              infoHash: "d".repeat(40),
              quality: "720p",
              codec: null,
              sourceType: null,
              sizeBytes: "not-a-number",
              seeders: 1,
              leechers: 0,
              magnetUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    // Both null and NaN should produce "?"
    expect(text).toContain("(?)");
    // No year in title
    expect(text).toContain("No Size [movie]");
    // No ratings
    expect(text).toContain("No ratings");
  });

  it("truncates long overviews", () => {
    const longOverview = "A".repeat(300);
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "show",
          title: "Long Overview",
          titleOriginal: null,
          year: 2024,
          overview: longOverview,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: false,
          torrents: [],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("...");
    expect(text).not.toContain("A".repeat(300));
  });

  it("shows HDR type in torrent label", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "HDR Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: "7.0",
          ratingTmdb: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "e".repeat(40),
              quality: "2160p",
              codec: "x265",
              sourceType: "WEB-DL",
              sizeBytes: "10737418240",
              seeders: 50,
              leechers: 2,
              magnetUrl: "magnet:?xt=urn:btih:" + "e".repeat(40),
              source: "yts",
              qualityScore: 95,
              uploadedAt: null,
              languages: ["en"],
              audioCodec: null,
              hdrType: "hdr10",
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("2160p WEB-DL x265 hdr10");
    expect(text).toContain("10.0 GB");
  });

  it("compact mode uses short magnet links", () => {
    const hash = "aaf1e71c0a0e3b1c0f1a2b3c4d5e6f7a8b9c0d1e";
    const fullMagnet = `magnet:?xt=urn:btih:${hash}&dn=Inception&tr=udp://tracker.example.com:6969&tr=udp://tracker2.example.com:6969`;
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 42,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Inception",
          titleOriginal: null,
          year: 2010,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: hash,
              quality: "1080p",
              codec: null,
              sourceType: null,
              sizeBytes: "2147483648",
              seeders: 100,
              leechers: 5,
              magnetUrl: fullMagnet,
              source: "yts",
              qualityScore: 85,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
          ],
        },
      ],
    };

    const compact = formatSearchResults(response, { compact: true });
    const full = formatSearchResults(response);

    // Compact: short magnet with just the hash
    expect(compact).toContain(`magnet:?xt=urn:btih:${hash}`);
    // Compact: no tracker URLs
    expect(compact).not.toContain("tracker.example.com");
    // Full: includes the full magnet URL with trackers
    expect(full).toContain(fullMagnet);
    // Compact output should be shorter
    expect(compact.length).toBeLessThan(full.length);
    // Both include the info hash
    expect(compact).toContain(`Info hash: ${hash}`);
    expect(full).toContain(`Info hash: ${hash}`);
  });

  it("compact mode generates magnet even when magnetUrl is null", () => {
    const hash = "b".repeat(40);
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "No Magnet",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: hash,
              quality: "720p",
              codec: null,
              sourceType: null,
              sizeBytes: "1073741824",
              seeders: 10,
              leechers: 0,
              magnetUrl: null,
              source: "test",
              qualityScore: 50,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
            },
          ],
        },
      ],
    };

    const compact = formatSearchResults(response, { compact: true });
    const full = formatSearchResults(response);

    // Compact always generates a magnet from info_hash
    expect(compact).toContain(`magnet:?xt=urn:btih:${hash}`);
    // Full mode: no magnet when magnetUrl is null
    expect(full).not.toContain("Magnet:");
  });

  it("shows season and episode in torrent line", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "show",
          title: "Breaking Bad",
          titleOriginal: null,
          year: 2008,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "a".repeat(40),
              rawTitle: null,
              quality: "1080p",
              codec: null,
              sourceType: null,
              sizeBytes: "1073741824",
              seeders: 50,
              leechers: 2,
              magnetUrl: null,
              torrentUrl: null,
              source: "test",
              qualityScore: 70,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
              season: 1,
              episode: 5,
              audioTracks: null,
              subtitleTracks: null,
              videoInfo: null,
              scanStatus: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("S01E05");
  });

  it("shows season without episode", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "show",
          title: "Some Show",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "b".repeat(40),
              rawTitle: null,
              quality: "720p",
              codec: null,
              sourceType: null,
              sizeBytes: "500000000",
              seeders: 10,
              leechers: 1,
              magnetUrl: null,
              torrentUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
              season: 3,
              episode: null,
              audioTracks: null,
              subtitleTracks: null,
              videoInfo: null,
              scanStatus: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("S03");
    expect(text).not.toContain("S03E");
  });

  it("shows torrentUrl when present", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Torrent URL Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "c".repeat(40),
              rawTitle: null,
              quality: "1080p",
              codec: null,
              sourceType: null,
              sizeBytes: "2000000000",
              seeders: 20,
              leechers: 1,
              magnetUrl: null,
              torrentUrl: "https://example.com/torrent/ccc.torrent",
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
              season: null,
              episode: null,
              audioTracks: null,
              subtitleTracks: null,
              videoInfo: null,
              scanStatus: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("Torrent: https://example.com/torrent/ccc.torrent");
  });

  it("shows audio tracks with languages and codecs", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Audio Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "d".repeat(40),
              rawTitle: null,
              quality: "1080p",
              codec: null,
              sourceType: null,
              sizeBytes: "4000000000",
              seeders: 30,
              leechers: 2,
              magnetUrl: null,
              torrentUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
              season: null,
              episode: null,
              audioTracks: [
                { lang: "en", codec: "aac", channels: "5.1", title: "English", default: true },
                { lang: "es", codec: "aac", channels: "5.1", title: "Spanish", default: false },
                { lang: "en", codec: "ac3", channels: "2.0", title: "Commentary", default: false },
              ],
              subtitleTracks: null,
              videoInfo: null,
              scanStatus: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("Audio: en, es");
    expect(text).toContain("(aac, ac3)");
  });

  it("shows audio tracks with null lang as ?", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Unknown Lang Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "f".repeat(40),
              rawTitle: null,
              quality: "720p",
              codec: null,
              sourceType: null,
              sizeBytes: "1000000000",
              seeders: 5,
              leechers: 0,
              magnetUrl: null,
              torrentUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
              season: null,
              episode: null,
              audioTracks: [
                { lang: null, codec: null, channels: null, title: null, default: null },
              ],
              subtitleTracks: null,
              videoInfo: null,
              scanStatus: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("Audio: ?");
    // No codecs listed after Audio line when all codecs are null
    expect(text).not.toMatch(/Audio: \?\s*\(/);
  });

  it("shows subtitle tracks summary", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Sub Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: true,
          torrents: [
            {
              infoHash: "e".repeat(40),
              rawTitle: null,
              quality: "1080p",
              codec: null,
              sourceType: null,
              sizeBytes: "3000000000",
              seeders: 25,
              leechers: 3,
              magnetUrl: null,
              torrentUrl: null,
              source: "test",
              qualityScore: null,
              uploadedAt: null,
              languages: [],
              audioCodec: null,
              hdrType: null,
              releaseGroup: null,
              isProper: null,
              isRepack: null,
              isRemastered: null,
              season: null,
              episode: null,
              audioTracks: null,
              subtitleTracks: [
                { lang: "en", codec: "srt", title: "English", forced: false },
                { lang: "es", codec: "srt", title: "Spanish", forced: false },
                { lang: "fr", codec: "ass", title: "French", forced: false },
              ],
              videoInfo: null,
              scanStatus: null,
            },
          ],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("Subtitles: en, es, fr");
  });

  it("shows contentUrl when present", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 99,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "URL Movie",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: "https://torrentclaw.com/content/99",
          hasTorrents: false,
          torrents: [],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("URL: https://torrentclaw.com/content/99");
  });

  it("shows parsedSeason and parsedEpisode in header", () => {
    const response: SearchResponse = {
      total: 5,
      page: 1,
      pageSize: 10,
      parsedSeason: 2,
      parsedEpisode: 7,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "show",
          title: "Test Show",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: false,
          torrents: [],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("Detected season/episode: S02E07");
  });

  it("shows parsedSeason only in header (no episode)", () => {
    const response: SearchResponse = {
      total: 3,
      page: 1,
      pageSize: 10,
      parsedSeason: 4,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "show",
          title: "Another Show",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          contentUrl: null,
          hasTorrents: false,
          torrents: [],
        },
      ],
    };
    const text = formatSearchResults(response);
    expect(text).toContain("Detected season/episode: S04");
    expect(text).not.toContain("S04E");
  });

  it("shows streaming info when available", () => {
    const response: SearchResponse = {
      total: 1,
      page: 1,
      pageSize: 10,
      results: [
        {
          id: 1,
          imdbId: null,
          tmdbId: null,
          contentType: "movie",
          title: "Streaming Test",
          titleOriginal: null,
          year: 2024,
          overview: null,
          posterUrl: null,
          backdropUrl: null,
          genres: null,
          ratingImdb: null,
          ratingTmdb: null,
          hasTorrents: false,
          torrents: [],
          streaming: {
            flatrate: [
              { providerId: 8, name: "Netflix", logo: null, link: null },
              { providerId: 337, name: "Disney+", logo: null, link: null },
            ],
            rent: [],
            buy: [],
            free: [{ providerId: 100, name: "Tubi", logo: null, link: null }],
          },
        },
      ],
    };

    const text = formatSearchResults(response);
    expect(text).toContain("Stream: Netflix, Disney+");
    expect(text).toContain("Free: Tubi");
  });
});

describe("formatPopularResults", () => {
  it("formats empty results", () => {
    const response: PopularResponse = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    expect(formatPopularResults(response)).toContain("No popular content");
  });

  it("formats popular items with click counts", () => {
    const response: PopularResponse = {
      items: [
        {
          id: 1,
          title: "Popular Movie",
          year: 2024,
          contentType: "movie",
          posterUrl: null,
          ratingImdb: "7.5",
          ratingTmdb: "7.2",
          clickCount: 150,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    };

    const text = formatPopularResults(response);
    expect(text).toContain("Popular Movie (2024) [movie]");
    expect(text).toContain("150 clicks");
    expect(text).toContain("ID: 1");
  });
});

describe("formatRecentResults", () => {
  it("formats empty results", () => {
    const response: RecentResponse = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
    expect(formatRecentResults(response)).toContain("No recent content");
  });

  it("formats recent items with dates", () => {
    const response: RecentResponse = {
      items: [
        {
          id: 5,
          title: "New Show",
          year: 2025,
          contentType: "show",
          posterUrl: null,
          ratingImdb: null,
          ratingTmdb: "6.8",
          createdAt: "2025-12-25T10:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    };

    const text = formatRecentResults(response);
    expect(text).toContain("New Show (2025) [show]");
    expect(text).toContain("TMDB: 6.8");
    expect(text).toContain("Dec");
    expect(text).toContain("ID: 5");
  });
});
