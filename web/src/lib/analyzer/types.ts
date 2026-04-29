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

export type AnalysisMeta = {
  /** 실제 응답을 만든 provider. 폴백이 일어났다면 "mock". */
  provider: "mock" | "anthropic" | "openai" | "google";
  /** 원래 요청된 provider. 폴백이 일어났을 때 그 이름이 들어가고, 정상 응답이면 null. */
  fallbackFrom: "mock" | "anthropic" | "openai" | "google" | null;
  /** 사용자가 톤·기준을 수정할 수 있는 시스템 프롬프트 파일 경로(레포 루트 기준 표시용). */
  systemPromptPath: string;
};

export type FomoKeywordHit = {
  /** 사전에 정의된 FOMO 키워드/구절 라벨. */
  keyword: string;
  /** 카테고리: 돈/시간압박/변신약속/손실회피/사회증명/공포. */
  category:
    | "money"
    | "urgency"
    | "transformation"
    | "loss-aversion"
    | "social-proof"
    | "fear";
  /** 본문에서 매칭된 횟수. */
  count: number;
  /** 실제 매칭된 원문 단편 0~3개 (UI 툴팁/근거 노출용). */
  examples: string[];
};

export type AnalysisReport = {
  source: {
    url: string;
    title: string | null;
    description: string | null;
    fetchedAt: string;
  };
  /** 강의를 한 줄로 설명할 수 있는 핵심 키워드 (최대 10개). */
  keywords: string[];
  gap: GapReport;
  fomo: FomoItem[];
  /** FOMO 조성 키워드 사전 매칭 결과 (등장한 항목만, count desc). */
  fomoKeywords: FomoKeywordHit[];
  price: PriceInfo;
  tier: PriceTier;
  terms: GlossaryItem[];
  alternatives: AlternativeItem[];
  disclaimer: string;
  meta: AnalysisMeta;
};
