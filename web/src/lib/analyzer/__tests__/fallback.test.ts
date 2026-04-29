import { describe, it, expect, vi } from "vitest";
import { analyzeWithFallback } from "../report";
import type { LlmAnalyzeInput, LlmAnalyzeResult, LlmProvider } from "../llm";

const baseInput: LlmAnalyzeInput = {
  url: "https://example.com/course/1",
  finalUrl: "https://example.com/course/1",
  title: "재테크 기초반 - 3년 안에 1억 만드는 법",
  description: "재테크가 고민이라면? 월급관리부터 ETF까지",
  primaryText: "재테크 기초반 강의입니다. 월급관리, ETF, 부동산 등을 다룹니다.",
  fullText: "재테크 기초반 강의입니다. 가격 100,000원. 월급관리, ETF, 부동산 등을 다룹니다.",
  marketingClaims: ["3년 안에 1억", "딱 한번 세팅"],
  curriculumItems: ["1주차 시작", "2주차 ETF"],
  jsonLd: { priceKrw: null },
};

const fakeResult: LlmAnalyzeResult = {
  keywords: ["재테크"],
  gap: { marketingClaims: [], curriculumItems: [], observations: [] },
  fomo: [],
  fomoKeywords: [],
  price: { raw: null, amountKrw: null },
  tier: "unknown",
  terms: [],
  alternatives: [],
};

describe("analyzeWithFallback", () => {
  it("성공 경로는 result 그대로, fallbackFrom 은 null", async () => {
    const provider: LlmProvider = {
      name: "google",
      analyze: vi.fn().mockResolvedValue(fakeResult),
    };
    const out = await analyzeWithFallback(provider, baseInput);
    expect(out.fallbackFrom).toBeNull();
    expect(out.result).toBe(fakeResult);
  });

  it("provider 가 throw 하면 mock 휴리스틱으로 폴백, fallbackFrom 에 원 provider 이름", async () => {
    const provider: LlmProvider = {
      name: "google",
      analyze: vi.fn().mockRejectedValue(new Error('{"code":503,"status":"UNAVAILABLE"}')),
    };
    const out = await analyzeWithFallback(provider, baseInput);
    expect(out.fallbackFrom).toBe("google");
    // mock 휴리스틱이 실제 fixture 기반으로 산출되므로 형태만 검증
    expect(Array.isArray(out.result.keywords)).toBe(true);
    expect(Array.isArray(out.result.fomo)).toBe(true);
    expect(out.result.tier).toMatch(/^(unknown|low|mid|high)$/);
  });

  it("mock 자체가 실패하면 폴백하지 않고 그 에러를 그대로 던진다", async () => {
    const broken: LlmProvider = {
      name: "mock",
      analyze: vi.fn().mockRejectedValue(new Error("mock broken")),
    };
    await expect(analyzeWithFallback(broken, baseInput)).rejects.toThrow("mock broken");
  });
});
