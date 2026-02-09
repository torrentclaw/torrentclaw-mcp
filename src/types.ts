// Response types mirrored from TorrentClaw API (src/types/api.ts)

export interface TorrentInfo {
  infoHash: string;
  quality: string | null;
  codec: string | null;
  sourceType: string | null;
  sizeBytes: string | null;
  seeders: number;
  leechers: number;
  magnetUrl: string | null;
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
  hasTorrents: boolean;
  torrents: TorrentInfo[];
  streaming?: StreamingInfo;
}

export interface SearchResponse {
  total: number;
  page: number;
  pageSize: number;
  results: SearchResult[];
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
