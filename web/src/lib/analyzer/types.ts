export type FomoItem = {
  sentence: string;
  reason: string;
  pattern: string;
};

export type GlossaryItem = {
  term: string;
  plain: string;
};

export type AlternativeItem = {
  source: "youtube" | "inflearn" | "google" | "article";
  label: string;
  url: string;
  rationale: string;
};

export type GapReport = {
  marketingClaims: string[];
  curriculumItems: string[];
  observations: string[];
};

export type PriceInfo = {
  raw: string | null;
  amountKrw: number | null;
};

export type PriceTier = "unknown" | "low" | "mid" | "high";

export type AnalysisReport = {
  source: {
    url: string;
    title: string | null;
    description: string | null;
    fetchedAt: string;
  };
  gap: GapReport;
  fomo: FomoItem[];
  price: PriceInfo;
  tier: PriceTier;
  terms: GlossaryItem[];
  alternatives: AlternativeItem[];
  disclaimer: string;
};
