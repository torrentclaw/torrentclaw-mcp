import { describe, it, expect } from "vitest";
import { formatCredits } from "../../src/formatters/credits.js";
import type { CreditsResponse } from "../../src/types.js";

describe("formatCredits", () => {
  it("formats director and cast", () => {
    const data: CreditsResponse = {
      contentId: 42,
      director: "Christopher Nolan",
      cast: [
        { name: "Leonardo DiCaprio", character: "Cobb", profileUrl: null },
        { name: "Tom Hardy", character: "Eames", profileUrl: null },
      ],
    };

    const text = formatCredits(data);
    expect(text).toContain("Credits for content #42");
    expect(text).toContain("Director: Christopher Nolan");
    expect(text).toContain("Leonardo DiCaprio as Cobb");
    expect(text).toContain("Tom Hardy as Eames");
  });

  it("handles missing director", () => {
    const data: CreditsResponse = {
      contentId: 10,
      director: null,
      cast: [{ name: "Actor One", character: "Role", profileUrl: null }],
    };

    const text = formatCredits(data);
    expect(text).not.toContain("Director:");
    expect(text).toContain("Actor One as Role");
  });

  it("handles empty cast", () => {
    const data: CreditsResponse = {
      contentId: 5,
      director: "Some Director",
      cast: [],
    };

    const text = formatCredits(data);
    expect(text).toContain("Director: Some Director");
    expect(text).toContain("No cast information available");
  });

  it("handles cast member without character name", () => {
    const data: CreditsResponse = {
      contentId: 1,
      director: null,
      cast: [{ name: "Mystery Actor", character: "", profileUrl: null }],
    };

    const text = formatCredits(data);
    expect(text).toContain("- Mystery Actor");
    expect(text).not.toContain(" as ");
  });
});
