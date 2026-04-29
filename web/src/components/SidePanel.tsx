import type { AnalysisReport } from "@/lib/analyzer/types";
import { GapBlock } from "./blocks/GapBlock";
import { FomoBlock } from "./blocks/FomoBlock";
import { PriceBlock } from "./blocks/PriceBlock";
import { TermsBlock } from "./blocks/TermsBlock";
import { AlternativesBlock } from "./blocks/AlternativesBlock";

export function SidePanel({ report }: { report: AnalysisReport }) {
  return (
    <div className="space-y-4">
      <GapBlock gap={report.gap} />
      <FomoBlock items={report.fomo} />
      <PriceBlock price={report.price} tier={report.tier} />
      <TermsBlock terms={report.terms} />
      <AlternativesBlock items={report.alternatives} />
    </div>
  );
}
