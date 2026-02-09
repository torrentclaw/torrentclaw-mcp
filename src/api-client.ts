import { config } from "./config.js";
import type {
  SearchResponse,
  PopularResponse,
  RecentResponse,
  WatchProvidersResponse,
  CreditsResponse,
  StatsResponse,
} from "./types.js";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    const messages: Record<number, string> = {
      400: "Bad request — check that all parameters are valid.",
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

export interface SearchParams {
  query: string;
  type?: string;
  genre?: string;
  year_min?: number;
  year_max?: number;
  min_rating?: number;
  quality?: string;
  language?: string;
  sort?: string;
  page?: number;
  limit?: number;
  country?: string;
}

export class TorrentClawClient {
  private baseUrl: string;
  private userAgent: string;

  constructor() {
    this.baseUrl = config.apiUrl;
    this.userAgent = `torrentclaw-mcp/${config.version}`;
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

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
        "X-Search-Source": "mcp",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      // Only expose body for 4xx (client errors); omit for 5xx (may leak internals)
      let body = "";
      if (response.status >= 400 && response.status < 500) {
        try {
          body = (await response.text()).slice(0, 200);
        } catch {}
      }
      throw new ApiError(response.status, body);
    }

    return response.json() as Promise<T>;
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
      sort: params.sort,
      page: params.page,
      limit: params.limit,
      country: params.country,
    });
  }

  async getPopular(limit?: number, page?: number): Promise<PopularResponse> {
    return this.request<PopularResponse>("/api/v1/popular", { limit, page });
  }

  async getRecent(limit?: number, page?: number): Promise<RecentResponse> {
    return this.request<RecentResponse>("/api/v1/recent", { limit, page });
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

  getTorrentDownloadUrl(infoHash: string): string {
    return `${this.baseUrl}/api/v1/torrent/${infoHash}`;
  }
}
