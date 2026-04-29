import { fetchPage } from "./fetch";
import { parseLanding } from "./parse";
import { extractFomo } from "./fomo";
import { extractPrice, pickPrice, priceTier } from "./price";
import { detectTerms } from "./glossary";
import { suggestAlternatives } from "./alternatives";
import { buildGap } from "./gap";
import type { AnalysisReport } from "./types";

export const DISCLAIMER =
  "참고용 신호이며 구매 결정은 본인 책임입니다. 본 도구는 특정 강사·플랫폼을 비방하거나 법적 판단을 대체하지 않습니다. 유저가 붙여넣은 공개 URL의 텍스트·메타만 분석합니다.";

export async function buildReport(url: string): Promise<AnalysisReport> {
  const { html, finalUrl } = await fetchPage(url);
  const parsed = parseLanding(html);
  // FOMO/용어 분석은 신뢰도 높은 출처(타이틀·메타) → 본문(리뷰 제거됨) 순으로 본다.
  const fomo = extractFomo(parsed.title, parsed.description, parsed.text);
  const priceFromText = extractPrice(parsed.fullText);
  const price = pickPrice(parsed.jsonLd.priceKrw, priceFromText);
  const tier = priceTier(price.amountKrw);
  const terms = detectTerms(parsed.text);
  const alternatives = suggestAlternatives(parsed.title, terms);
  const gap = buildGap(parsed.marketingClaims, parsed.curriculumItems);

  return {
    source: {
      url: finalUrl,
      title: parsed.title,
      description: parsed.description,
      fetchedAt: new Date().toISOString(),
    },
    gap,
    fomo,
    price,
    tier,
    terms,
    alternatives,
    disclaimer: DISCLAIMER,
  };
}
