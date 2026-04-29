import type { AlternativeItem, FomoItem, FomoKeywordHit, GapReport, GlossaryItem, PriceInfo, PriceTier } from "../types";

export type LlmProviderName = "mock" | "anthropic" | "openai" | "google";

export type LlmAnalyzeInput = {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  /** parseLanding.text — 리뷰·푸터 제거된 분석용 본문. */
  primaryText: string;
  /** parseLanding.fullText — 가격 등 fallback용 원문. */
  fullText: string;
  marketingClaims: string[];
  curriculumItems: string[];
  jsonLd: { priceKrw: number | null };
};

export type LlmAnalyzeResult = {
  keywords: string[];
  gap: GapReport;
  fomo: FomoItem[];
  fomoKeywords: FomoKeywordHit[];
  price: PriceInfo;
  tier: PriceTier;
  terms: GlossaryItem[];
  alternatives: AlternativeItem[];
};

export interface LlmProvider {
  name: LlmProviderName;
  analyze(input: LlmAnalyzeInput): Promise<LlmAnalyzeResult>;
}
