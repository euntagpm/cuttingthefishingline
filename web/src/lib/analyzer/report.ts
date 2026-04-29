import { fetchPage } from "./fetch";
import { parseLanding } from "./parse";
import { getLlmProvider, SYSTEM_PROMPT_PATH } from "./llm";
import type { AnalysisReport } from "./types";

export const DISCLAIMER =
  "참고용 신호이며 구매 결정은 본인 책임입니다. 본 도구는 특정 강사·플랫폼을 비방하거나 법적 판단을 대체하지 않습니다. 유저가 붙여넣은 공개 URL의 텍스트·메타만 분석합니다.";

export async function buildReport(url: string): Promise<AnalysisReport> {
  const { html, finalUrl } = await fetchPage(url);
  const parsed = parseLanding(html);
  const provider = getLlmProvider();

  const analyzed = await provider.analyze({
    url,
    finalUrl,
    title: parsed.title,
    description: parsed.description,
    primaryText: parsed.text,
    fullText: parsed.fullText,
    marketingClaims: parsed.marketingClaims,
    curriculumItems: parsed.curriculumItems,
    jsonLd: { priceKrw: parsed.jsonLd.priceKrw },
  });

  return {
    source: {
      url: finalUrl,
      title: parsed.title,
      description: parsed.description,
      fetchedAt: new Date().toISOString(),
    },
    ...analyzed,
    disclaimer: DISCLAIMER,
    meta: {
      provider: provider.name,
      systemPromptPath: `web/${SYSTEM_PROMPT_PATH}`,
    },
  };
}
