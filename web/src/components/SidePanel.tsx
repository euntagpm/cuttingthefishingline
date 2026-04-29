import type { AnalysisReport } from "@/lib/analyzer/types";
import { KeywordsBlock } from "./blocks/KeywordsBlock";
import { PriceBlock } from "./blocks/PriceBlock";
import { CurriculumBlock } from "./blocks/CurriculumBlock";
import { GapBlock } from "./blocks/GapBlock";
import { FomoBlock } from "./blocks/FomoBlock";
import { FomoKeywordsBlock } from "./blocks/FomoKeywordsBlock";
import { TermsBlock } from "./blocks/TermsBlock";
import { AlternativesBlock } from "./blocks/AlternativesBlock";

export function SidePanel({ report }: { report: AnalysisReport }) {
  const isMock = report.meta?.provider === "mock";
  return (
    <div className="space-y-4">
      {isMock && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <p className="font-semibold">mock 응답 — 실제 LLM 호출이 아닙니다.</p>
          <p className="mt-1">
            분석 톤·기준은 <code className="rounded bg-amber-100 px-1">{report.meta.systemPromptPath}</code> 파일에서 수정합니다.
          </p>
        </div>
      )}
      <KeywordsBlock keywords={report.keywords} />
      <PriceBlock price={report.price} tier={report.tier} />
      <CurriculumBlock items={report.gap.curriculumItems} />
      <GapBlock gap={report.gap} />
      <FomoBlock items={report.fomo} />
      <FomoKeywordsBlock items={report.fomoKeywords} />
      <TermsBlock terms={report.terms} />
      <AlternativesBlock items={report.alternatives} />
    </div>
  );
}
