import type { CreditsResponse } from "../types.js";

export function formatCredits(data: CreditsResponse): string {
  const lines: string[] = [];
  lines.push(`Credits for content #${data.contentId}:`);
  lines.push("");

  if (data.director) {
    lines.push(`  Director: ${data.director}`);
  }

  if (data.cast.length > 0) {
    lines.push(`  Cast:`);
    for (const member of data.cast) {
      const character = member.character ? ` as ${member.character}` : "";
      lines.push(`    - ${member.name}${character}`);
    }
  } else {
    lines.push("  No cast information available.");
  }

  return lines.join("\n");
}
