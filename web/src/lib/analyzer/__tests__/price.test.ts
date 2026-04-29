import { describe, it, expect } from "vitest";
import { extractPrice, priceTier } from "../price";

describe("extractPrice", () => {
  it("parses 원 with comma", () => {
    expect(extractPrice("정가 1,200,000원").amountKrw).toBe(1_200_000);
  });
  it("parses ₩ prefix", () => {
    expect(extractPrice("얼리버드 ₩ 350,000").amountKrw).toBe(350_000);
  });
  it("returns null when no price", () => {
    expect(extractPrice("8주간 진행됩니다.")).toEqual({ raw: null, amountKrw: null });
  });
});

describe("priceTier", () => {
  it("buckets correctly", () => {
    expect(priceTier(null)).toBe("unknown");
    expect(priceTier(50_000)).toBe("low");
    expect(priceTier(300_000)).toBe("mid");
    expect(priceTier(900_000)).toBe("high");
  });
});
