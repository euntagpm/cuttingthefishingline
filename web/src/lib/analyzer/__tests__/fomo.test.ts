import { describe, it, expect } from "vitest";
import { extractFomo } from "../fomo";

describe("extractFomo", () => {
  it("flags deadline pressure", () => {
    const out = extractFomo("마감 임박! 지금 바로 신청하세요. 오늘만 50% 할인 마감.");
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out.some((i) => i.pattern === "scarcity-deadline" || i.pattern === "now-pressure")).toBe(true);
  });

  it("flags loss aversion", () => {
    const out = extractFomo("이번 기회를 놓치면 후회합니다.");
    expect(out.some((i) => i.pattern === "loss-aversion")).toBe(true);
  });

  it("ignores neutral copy", () => {
    const out = extractFomo("이 강의는 8주간 진행되며 매주 과제가 있습니다.");
    expect(out).toHaveLength(0);
  });
});
