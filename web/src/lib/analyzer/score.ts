import type { AnalysisReport } from "./types";

export type ScoreLevel = "low" | "mid" | "high";

export type ScoreBreakdown = {
  total: number;     // 0-100
  fomo: number;      // 0-100
  keywords: number;  // 0-100
  gap: number;       // 0-100
  level: ScoreLevel;
  label: string;
};

const FOMO_FULL_AT = 8;          // FOMO 문장 8개 → 100
const KEYWORD_FULL_AT = 25;      // FOMO 키워드 누적 25회 → 100
const OBSERVATION_FULL_AT = 4;   // 관찰 4건 → 100

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function computeScore(report: AnalysisReport): ScoreBreakdown {
  const fomo = clamp100((report.fomo.length / FOMO_FULL_AT) * 100);

  const totalKwCount = report.fomoKeywords.reduce((a, k) => a + k.count, 0);
  const keywords = clamp100((totalKwCount / KEYWORD_FULL_AT) * 100);

  const gap = clamp100((report.gap.observations.length / OBSERVATION_FULL_AT) * 100);

  const total = Math.round((fomo + keywords + gap) / 3);

  let level: ScoreLevel;
  let label: string;
  if (total >= 70) {
    level = "high";
    label = "낚시성 높음";
  } else if (total >= 40) {
    level = "mid";
    label = "낚시성 보통";
  } else {
    level = "low";
    label = "낚시성 낮음";
  }

  return { total, fomo, keywords, gap, level, label };
}
