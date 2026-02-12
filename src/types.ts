// Response types mirrored from TorrentClaw API (src/types/api.ts)

export interface AudioTrack {
  lang: string | null;
  codec: string | null;
  channels: string | null;
  title: string | null;
  default: boolean | null;
}

export interface SubtitleTrack {
  lang: string | null;
  codec: string | null;
  title: string | null;
  forced: boolean | null;
}

export interface VideoInfo {
  codec: string | null;
  width: number | null;
  height: number | null;
  bitDepth: number | null;
  hdr: string | null;
  frameRate: string | null;
}

export interface TorrentInfo {
  infoHash: string;
  rawTitle: string | null;
  quality: string | null;
  codec: string | null;
  sourceType: string | null;
  sizeBytes: string | null;
  seeders: number;
  leechers: number;
  magnetUrl: string | null;
  torrentUrl: string | null;
  source: string;
  qualityScore: number | null;
  uploadedAt: string | null;
  languages: string[];
  audioCodec: string | null;
  hdrType: string | null;
  releaseGroup: string | null;
  isProper: boolean | null;
  isRepack: boolean | null;
  isRemastered: boolean | null;
  season: number | null;
  episode: number | null;
  audioTracks: AudioTrack[] | null;
  subtitleTracks: SubtitleTrack[] | null;
  videoInfo: VideoInfo | null;
  scanStatus: string | null;
}

export interface StreamingProviderItem {
  providerId: number;
  name: string;
  logo: string | null;
  link: string | null;
}

export interface StreamingInfo {
  flatrate: StreamingProviderItem[];
  rent: StreamingProviderItem[];
  buy: StreamingProviderItem[];
  free: StreamingProviderItem[];
}

export interface SearchResult {
  id: number;
  imdbId: string | null;
  tmdbId: string | null;
  contentType: string;
  title: string;
  titleOriginal: string | null;
  year: number | null;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  genres: string[] | null;
  ratingImdb: string | null;
  ratingTmdb: string | null;
  contentUrl: string | null;
  hasTorrents: boolean;
  torrents: TorrentInfo[];
  streaming?: StreamingInfo;
}

export interface SearchResponse {
  total: number;
  page: number;
  pageSize: number;
  parsedSeason?: number;
  parsedEpisode?: number;
  results: SearchResult[];
}

export interface AutocompleteItem {
  id: number;
  title: string;
  year: number | null;
  contentType: string;
  posterUrl: string | null;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteItem[];
}

export interface TrackRequest {
  infoHash: string;
  action: "magnet" | "torrent_download" | "copy";
}

export interface TrackResponse {
  ok: boolean;
}

export interface ScanRequestResponse {
  status: string;
  source?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface PopularItem {
  id: number;
  title: string;
  year: number | null;
  contentType: string;
  posterUrl: string | null;
  ratingImdb: string | null;
  ratingTmdb: string | null;
  clickCount: number;
}

export interface PopularResponse {
  items: PopularItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RecentItem {
  id: number;
  title: string;
  year: number | null;
  contentType: string;
  posterUrl: string | null;
  ratingImdb: string | null;
  ratingTmdb: string | null;
  createdAt: string;
}

export interface RecentResponse {
  items: RecentItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface CreditsResponse {
  contentId: number;
  director: string | null;
  cast: CastMember[];
}

export interface WatchProviderItem {
  providerId: number;
  name: string;
  logo: string | null;
  link: string | null;
  displayPriority: number;
}

export interface WatchProviders {
  flatrate: WatchProviderItem[];
  rent: WatchProviderItem[];
  buy: WatchProviderItem[];
  free: WatchProviderItem[];
}

export interface WatchProvidersResponse {
  contentId: number;
  country: string;
  providers: WatchProviders;
  vpnSuggestion?: {
    availableIn: string[];
    affiliateUrl: string;
  };
  attribution: string;
}

export interface StatsResponse {
  content: {
    movies: number;
    shows: number;
    tmdbEnriched: number;
  };
  torrents: {
    total: number;
    withSeeders: number;
    bySource: Record<string, number>;
  };
  recentIngestions: {
    source: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    fetched: number;
    new: number;
    updated: number;
  }[];
}
