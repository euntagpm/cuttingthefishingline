import { fetchPage } from "./fetch";
import { parseLanding } from "./parse";
import { getLlmProvider, SYSTEM_PROMPT_PATH } from "./llm";
import { mockProvider } from "./llm/mock";
import type {
  LlmAnalyzeInput,
  LlmAnalyzeResult,
  LlmProvider,
  LlmProviderName,
} from "./llm";
import type { AnalysisReport } from "./types";

export const DISCLAIMER =
  "참고용 신호이며 구매 결정은 본인 책임입니다. 본 도구는 특정 강사·플랫폼을 비방하거나 법적 판단을 대체하지 않습니다. 유저가 붙여넣은 공개 URL의 텍스트·메타만 분석합니다.";

/**
 * provider.analyze 가 실패하면 mock 휴리스틱으로 폴백.
 * mock 자체가 실패하면 그 에러는 그대로 전파(그 시점엔 진짜 버그).
 * Gemini 일시 과부하(503/UNAVAILABLE)·rate-limit·키 누락 등이 사용자 요청을 통째로 깨뜨리지 않게 한다.
 */
export async function analyzeWithFallback(
  provider: LlmProvider,
  input: LlmAnalyzeInput,
): Promise<{ result: LlmAnalyzeResult; fallbackFrom: LlmProviderName | null }> {
  try {
    return { result: await provider.analyze(input), fallbackFrom: null };
  } catch (err) {
    if (provider.name === "mock") throw err;
    console.warn(
      `[analyzer] provider="${provider.name}" failed, falling back to mock:`,
      err instanceof Error ? err.message : err,
    );
    return { result: await mockProvider.analyze(input), fallbackFrom: provider.name };
  }
}

export async function buildReport(url: string): Promise<AnalysisReport> {
  const { html, finalUrl } = await fetchPage(url);
  const parsed = parseLanding(html);
  const provider = getLlmProvider();

  const { result: analyzed, fallbackFrom } = await analyzeWithFallback(provider, {
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
      provider: fallbackFrom ? "mock" : provider.name,
      fallbackFrom,
      systemPromptPath: `web/${SYSTEM_PROMPT_PATH}`,
    },
  };
}
