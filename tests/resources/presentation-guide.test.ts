import { describe, it, expect } from "vitest";
import { createMockServer } from "../helpers.js";
import { registerPresentationGuideResource } from "../../src/resources/presentation-guide.js";

describe("presentation-guide resource", () => {
  it("returns markdown guide with best practices", async () => {
    const { server, getResourceHandler } = createMockServer();
    registerPresentationGuideResource(server);

    const handler = getResourceHandler("torrentclaw://presentation-guide");
    const result = await handler({ href: "torrentclaw://presentation-guide" });

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].mimeType).toBe("text/markdown");
    const text = result.contents[0].text;

    // Check for key sections
    expect(text).toContain("# TorrentClaw Results Presentation Guide");
    expect(text).toContain("## Critical Requirements");
    expect(text).toContain("### 1. Clickable Magnet Links");
    expect(text).toContain("### 2. Content URL for Browsing");
    expect(text).toContain("### 3. User-Friendly Presentation Format");

    // Check for markdown examples
    expect(text).toContain("[📥 Download](magnet:");
    expect(text).toContain("[🔗 View");

    // Check for good vs bad examples
    expect(text).toContain("❌ BAD");
    expect(text).toContain("✅ GOOD");

    // Check for warnings about seeders
    expect(text).toContain("⚠️ No active seeders");
    expect(text).toContain("⭐ Recommended");
  });

  it("provides guidance for TV shows", async () => {
    const { server, getResourceHandler } = createMockServer();
    registerPresentationGuideResource(server);

    const handler = getResourceHandler("torrentclaw://presentation-guide");
    const result = await handler({ href: "torrentclaw://presentation-guide" });

    const text = result.contents[0].text;
    expect(text).toContain("**For TV Shows**");
    expect(text).toContain("S04E01");
    expect(text).toContain("Entrevías");
  });

  it("provides guidance for movies", async () => {
    const { server, getResourceHandler } = createMockServer();
    registerPresentationGuideResource(server);

    const handler = getResourceHandler("torrentclaw://presentation-guide");
    const result = await handler({ href: "torrentclaw://presentation-guide" });

    const text = result.contents[0].text;
    expect(text).toContain("**For Movies**");
    expect(text).toContain("Inception");
    expect(text).toContain("BluRay");
  });

  it("warns against bad practices", async () => {
    const { server, getResourceHandler } = createMockServer();
    registerPresentationGuideResource(server);

    const handler = getResourceHandler("torrentclaw://presentation-guide");
    const result = await handler({ href: "torrentclaw://presentation-guide" });

    const text = result.contents[0].text;

    // Check for warnings
    expect(text).toContain("### 5. What NOT to Do");
    expect(text).toContain("without clickable links");
    expect(text).toContain("truncated magnet links");
    expect(text).toContain("omit the content URL");
  });
});
