import type { WatchProvidersResponse, WatchProviderItem } from "../types.js";

function formatProviderList(
  label: string,
  providers: WatchProviderItem[],
): string | null {
  if (providers.length === 0) return null;
  const names = providers
    .sort((a, b) => a.displayPriority - b.displayPriority)
    .map((p) => p.name)
    .join(", ");
  return `  ${label}: ${names}`;
}

export function formatWatchProviders(data: WatchProvidersResponse): string {
  const lines: string[] = [];
  lines.push(
    `Watch providers for content #${data.contentId} in ${data.country}:`,
  );
  lines.push("");

  const sections = [
    formatProviderList("Stream", data.providers.flatrate),
    formatProviderList("Free", data.providers.free),
    formatProviderList("Rent", data.providers.rent),
    formatProviderList("Buy", data.providers.buy),
  ].filter(Boolean) as string[];

  if (sections.length === 0) {
    lines.push(
      `  No watch providers found in ${data.country}.`,
    );
  } else {
    lines.push(...sections);
  }

  if (data.vpnSuggestion) {
    lines.push("");
    lines.push(
      `  Available in other countries: ${data.vpnSuggestion.availableIn.join(", ")}`,
    );
  }

  lines.push("");
  lines.push(data.attribution);

  return lines.join("\n");
}
