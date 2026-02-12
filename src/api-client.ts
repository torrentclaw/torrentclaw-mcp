import { config } from "./config.js";
import type {
  SearchResponse,
  PopularResponse,
  RecentResponse,
  WatchProvidersResponse,
  CreditsResponse,
  StatsResponse,
  AutocompleteResponse,
  TrackResponse,
  ScanRequestResponse,
} from "./types.js";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    const messages: Record<number, string> = {
      400: "Bad request — check that all parameters are valid.",
      401: "API key required or invalid. Set TORRENTCLAW_API_KEY environment variable.",
      403: "Insufficient API tier or endpoint not allowed for this key.",
      404: "Not found — the requested content ID does not exist. Use search_content to find valid IDs.",
      429: "Rate limit exceeded. Wait 10-30 seconds before retrying.",
      500: "TorrentClaw server error. Try again in a moment.",
      502: "TorrentClaw is temporarily unavailable. Try again in a moment.",
      503: "TorrentClaw is under maintenance. Try again later.",
    };
    super(messages[status] || `API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_MAX_SIZE = 200;

export class ResponseCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private ttl: number;
  private maxSize: number;

  constructor(ttl = DEFAULT_CACHE_TTL, maxSize = DEFAULT_CACHE_MAX_SIZE) {
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // Move to end for LRU ordering (Map preserves insertion order)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    // Delete first to refresh position if key exists
    this.store.delete(key);
    // Evict oldest entries if at capacity
    while (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
      else break;
    }
    this.store.set(key, { data, expiresAt: Date.now() + this.ttl });
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

export interface SearchParams {
  query: string;
  type?: string;
  genre?: string;
  year_min?: number;
  year_max?: number;
  min_rating?: number;
  quality?: string;
  language?: string;
  audio?: string;
  hdr?: string;
  availability?: string;
  locale?: string;
  season?: number;
  episode?: number;
  sort?: string;
  page?: number;
  limit?: number;
  country?: string;
}

export class TorrentClawClient {
  private baseUrl: string;
  private userAgent: string;
  private apiKey: string | undefined;
  readonly cache: ResponseCache;

  constructor(cacheTtl?: number) {
    this.baseUrl = config.apiUrl;
    this.userAgent = `torrentclaw-mcp/${config.version}`;
    this.apiKey = config.apiKey;
    this.cache = new ResponseCache(cacheTtl);
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "User-Agent": this.userAgent,
      Accept: "application/json",
      "X-Search-Source": "mcp",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let body = "";
    if (response.status >= 400 && response.status < 500) {
      try {
        body = (await response.text()).slice(0, 200);
      } catch {}
    }
    throw new ApiError(response.status, body);
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(15_000),
      });
      if (response.status === 429 && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** attempt, 10_000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return response;
    }
    // Unreachable, but TypeScript needs it
    throw new ApiError(429, "");
  }

  private async request<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const cacheKey = url.toString();
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== undefined) return cached;

    const response = await this.fetchWithRetry(url.toString(), {
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const data = (await response.json()) as T;
    this.cache.set(cacheKey, data);
    return data;
  }

  private async postRequest<T>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    const headers = this.buildHeaders();
    headers["Content-Type"] = "application/json";

    const response = await this.fetchWithRetry(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return (await response.json()) as T;
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    return this.request<SearchResponse>("/api/v1/search", {
      q: params.query,
      type: params.type,
      genre: params.genre,
      year_min: params.year_min,
      year_max: params.year_max,
      min_rating: params.min_rating,
      quality: params.quality,
      lang: params.language,
      audio: params.audio,
      hdr: params.hdr,
      availability: params.availability,
      locale: params.locale,
      season: params.season,
      episode: params.episode,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
      country: params.country,
    });
  }

  async autocomplete(query: string): Promise<AutocompleteResponse> {
    return this.request<AutocompleteResponse>("/api/v1/autocomplete", {
      q: query,
    });
  }

  async getPopular(
    limit?: number,
    page?: number,
    locale?: string,
  ): Promise<PopularResponse> {
    return this.request<PopularResponse>("/api/v1/popular", {
      limit,
      page,
      locale,
    });
  }

  async getRecent(
    limit?: number,
    page?: number,
    locale?: string,
  ): Promise<RecentResponse> {
    return this.request<RecentResponse>("/api/v1/recent", {
      limit,
      page,
      locale,
    });
  }

  async getWatchProviders(
    contentId: number,
    country: string,
  ): Promise<WatchProvidersResponse> {
    return this.request<WatchProvidersResponse>(
      `/api/v1/content/${contentId}/watch-providers`,
      { country },
    );
  }

  async getCredits(contentId: number): Promise<CreditsResponse> {
    return this.request<CreditsResponse>(
      `/api/v1/content/${contentId}/credits`,
    );
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>("/api/v1/stats");
  }

  async track(
    infoHash: string,
    action: "magnet" | "torrent_download" | "copy",
  ): Promise<TrackResponse> {
    return this.postRequest<TrackResponse>("/api/v1/track", {
      infoHash,
      action,
    });
  }

  async submitScanRequest(
    infoHash: string,
    email: string,
  ): Promise<ScanRequestResponse> {
    return this.postRequest<ScanRequestResponse>("/api/v1/scan-request", {
      infoHash,
      email,
      website: "",
    });
  }

  async getScanStatus(infoHash: string): Promise<ScanRequestResponse> {
    return this.request<ScanRequestResponse>(
      `/api/v1/scan-request/${infoHash}`,
    );
  }

  getTorrentDownloadUrl(infoHash: string): string {
    return `${this.baseUrl}/api/v1/torrent/${infoHash}`;
  }
}
