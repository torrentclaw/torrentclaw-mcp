import { describe, it, expect } from "vitest";
import { formatWatchProviders } from "../../src/formatters/providers.js";
import type { WatchProvidersResponse } from "../../src/types.js";

describe("formatWatchProviders", () => {
  it("formats providers by availability type", () => {
    const data: WatchProvidersResponse = {
      contentId: 42,
      country: "ES",
      providers: {
        flatrate: [
          {
            providerId: 8,
            name: "Netflix",
            logo: null,
            link: null,
            displayPriority: 1,
          },
          {
            providerId: 337,
            name: "Disney+",
            logo: null,
            link: null,
            displayPriority: 2,
          },
        ],
        rent: [
          {
            providerId: 2,
            name: "Apple TV",
            logo: null,
            link: null,
            displayPriority: 1,
          },
        ],
        buy: [
          {
            providerId: 3,
            name: "Google Play",
            logo: null,
            link: null,
            displayPriority: 1,
          },
        ],
        free: [],
      },
      attribution: "Watch provider data provided by JustWatch via TMDB.",
    };

    const text = formatWatchProviders(data);
    expect(text).toContain("Watch providers for content #42 in ES");
    expect(text).toContain("Stream: Netflix, Disney+");
    expect(text).toContain("Rent: Apple TV");
    expect(text).toContain("Buy: Google Play");
    expect(text).not.toContain("Free:");
    expect(text).toContain("JustWatch");
  });

  it("handles no providers", () => {
    const data: WatchProvidersResponse = {
      contentId: 10,
      country: "US",
      providers: { flatrate: [], rent: [], buy: [], free: [] },
      attribution: "JustWatch",
    };

    const text = formatWatchProviders(data);
    expect(text).toContain("No watch providers found in US");
  });

  it("shows VPN suggestion when available", () => {
    const data: WatchProvidersResponse = {
      contentId: 5,
      country: "AR",
      providers: { flatrate: [], rent: [], buy: [], free: [] },
      vpnSuggestion: {
        availableIn: ["US", "ES", "FR"],
        affiliateUrl: "https://example.com/vpn",
      },
      attribution: "JustWatch",
    };

    const text = formatWatchProviders(data);
    expect(text).toContain("Available in other countries: US, ES, FR");
  });

  it("sorts providers by display priority", () => {
    const data: WatchProvidersResponse = {
      contentId: 1,
      country: "GB",
      providers: {
        flatrate: [
          {
            providerId: 2,
            name: "Second",
            logo: null,
            link: null,
            displayPriority: 20,
          },
          {
            providerId: 1,
            name: "First",
            logo: null,
            link: null,
            displayPriority: 1,
          },
        ],
        rent: [],
        buy: [],
        free: [],
      },
      attribution: "JustWatch",
    };

    const text = formatWatchProviders(data);
    expect(text).toContain("Stream: First, Second");
  });

  it("shows free providers", () => {
    const data: WatchProvidersResponse = {
      contentId: 1,
      country: "US",
      providers: {
        flatrate: [],
        rent: [],
        buy: [],
        free: [
          {
            providerId: 100,
            name: "Tubi",
            logo: null,
            link: null,
            displayPriority: 1,
          },
        ],
      },
      attribution: "JustWatch",
    };

    const text = formatWatchProviders(data);
    expect(text).toContain("Free: Tubi");
  });
});
