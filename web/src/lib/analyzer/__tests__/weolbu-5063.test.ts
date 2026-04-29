import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseLanding } from "../parse";
import { extractFomo } from "../fomo";
import { extractPrice, pickPrice, priceTier } from "../price";
import { detectTerms } from "../glossary";
import { suggestAlternatives } from "../alternatives";
import { buildGap } from "../gap";

const html = readFileSync(
  path.join(__dirname, "fixtures", "weolbu-5063.html"),
  "utf8"
);

describe("weolbu/product/5063 fixture: 사이드 패널 모든 섹션이 비어있지 않다", () => {
  const parsed = parseLanding(html);
  const fomo = extractFomo(parsed.title, parsed.description, parsed.text);
  const priceFromText = extractPrice(parsed.fullText);
  const price = pickPrice(parsed.jsonLd.priceKrw, priceFromText);
  const tier = priceTier(price.amountKrw);
  const terms = detectTerms(parsed.text);
  const alternatives = suggestAlternatives(parsed.title, terms);
  const gap = buildGap(parsed.marketingClaims, parsed.curriculumItems);

  it("source 메타가 추출된다", () => {
    expect(parsed.title).toBeTruthy();
    expect(parsed.title).toContain("재테크 기초반");
    expect(parsed.description).toBeTruthy();
  });

  it("커리큘럼 항목이 1개 이상 추출된다", () => {
    expect(parsed.curriculumItems.length).toBeGreaterThanOrEqual(1);
    // 실제 강의 라벨 흔적이 있어야 한다 (스트림 코드, 더보기 버튼 등 노이즈 아님)
    expect(parsed.curriculumItems.some((s) => /너나위|로드맵|재테크|투자|강의/.test(s))).toBe(true);
  });

  it("FOMO 신호가 1개 이상 식별되며 첫 항목은 신뢰 가능한 출처(타이틀·메타)에서 온다", () => {
    expect(fomo.length).toBeGreaterThanOrEqual(1);
    // 첫 FOMO 문장은 og:title 또는 description에 등장한 카피에서 비롯되어야 한다.
    const top = fomo[0]!.sentence;
    const haystack = `${parsed.title ?? ""}\n${parsed.description ?? ""}`;
    expect(haystack.includes(top.slice(0, 8))).toBe(true);
  });

  it("가격이 추출되고 tier가 결정된다", () => {
    expect(price.amountKrw).not.toBeNull();
    expect(tier).not.toBe("unknown");
    // 이 페이지의 정가는 JSON-LD Offer.price=400000 이므로 mid 구간이어야 한다.
    expect(price.amountKrw).toBe(400_000);
    expect(tier).toBe("mid");
  });

  it("대안 링크가 3개 이상 제시된다", () => {
    expect(alternatives.length).toBeGreaterThanOrEqual(3);
  });

  it("갭 관찰 코멘트가 비어있지 않다", () => {
    expect(gap.observations.length).toBeGreaterThanOrEqual(1);
    expect(parsed.marketingClaims.length).toBeGreaterThanOrEqual(1);
  });
});
