import type { GapReport } from "./types";

export function buildGap(marketingClaims: string[], curriculumItems: string[]): GapReport {
  const observations: string[] = [];
  if (marketingClaims.length === 0) {
    observations.push("랜딩에서 마케팅 주장 문장을 충분히 추출하지 못했습니다 — 페이지 구조가 비표준일 수 있습니다.");
  }
  if (curriculumItems.length === 0) {
    observations.push("커리큘럼/목차가 표면에 노출되지 않습니다. 실제 학습 범위를 별도로 확인해 보세요.");
  } else {
    observations.push(`커리큘럼 항목 ${curriculumItems.length}개를 추출했습니다 — 마케팅 카피가 이 범위를 정확히 반영하는지 직접 비교해 보세요.`);
  }
  if (marketingClaims.length > 0 && curriculumItems.length > 0) {
    const claimsPlain = marketingClaims.join(" ").toLowerCase();
    const overlap = curriculumItems.filter((c) => claimsPlain.includes(c.slice(0, 6).toLowerCase())).length;
    if (overlap === 0) {
      observations.push("마케팅 카피와 커리큘럼 항목 간 어휘 일치가 거의 보이지 않습니다 — 카피가 결과 위주, 커리큘럼이 절차 위주일 수 있습니다.");
    }
  }
  return { marketingClaims, curriculumItems, observations };
}
