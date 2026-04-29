import { describe, it, expect } from "vitest";
import { suggestAlternatives } from "../alternatives";

describe("suggestAlternatives", () => {
  it("includes youtube/inflearn/google base sources", () => {
    const items = suggestAlternatives("프론트엔드 부트캠프", []);
    const sources = items.map((i) => i.source);
    expect(sources).toContain("youtube");
    expect(sources).toContain("inflearn");
    expect(sources).toContain("google");
  });
  it("appends term-based articles", () => {
    const items = suggestAlternatives("MLOps 실전", [{ term: "MLOps", plain: "..." }]);
    expect(items.some((i) => i.source === "article")).toBe(true);
  });
});
