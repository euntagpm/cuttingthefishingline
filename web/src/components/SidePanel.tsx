"use client";
import { useState } from "react";
import type { AnalysisReport } from "@/lib/analyzer/types";
import { computeScore } from "@/lib/analyzer/score";
import { CourseInfoCard } from "./blocks/CourseInfoCard";
import { ScoreCard } from "./blocks/ScoreCard";
import { AlternativesSummaryCard } from "./blocks/AlternativesSummaryCard";
import { CurriculumBlock } from "./blocks/CurriculumBlock";
import { GapBlock } from "./blocks/GapBlock";
import { FomoBlock } from "./blocks/FomoBlock";
import { FomoKeywordsBlock } from "./blocks/FomoKeywordsBlock";
import { TermsBlock } from "./blocks/TermsBlock";
import { AlternativesBlock } from "./blocks/AlternativesBlock";

type TabId = "fomo" | "gap" | "curriculum" | "terms" | "alternatives";

export function SidePanel({ report }: { report: AnalysisReport }) {
  const [activeTab, setActiveTab] = useState<TabId>("fomo");
  const score = computeScore(report);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "fomo",         label: "FOMO",     count: report.fomo.length + report.fomoKeywords.length },
    { id: "gap",          label: "갭",       count: report.gap.observations.length },
    { id: "curriculum",   label: "커리큘럼", count: report.gap.curriculumItems.length },
    { id: "terms",        label: "용어",     count: report.terms.length },
    { id: "alternatives", label: "대안",     count: report.alternatives.length },
  ];

  return (
    <div className="space-y-3">
      <CourseInfoCard report={report} />
      <ScoreCard score={score} />
      <AlternativesSummaryCard
        items={report.alternatives}
        onJump={() => setActiveTab("alternatives")}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0 text-[10px] tabular-nums ${
                    active ? "bg-ink text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "fomo" && (
          <div className="space-y-4">
            <FomoBlock items={report.fomo} />
            <FomoKeywordsBlock items={report.fomoKeywords} />
          </div>
        )}
        {activeTab === "gap" && <GapBlock gap={report.gap} />}
        {activeTab === "curriculum" && <CurriculumBlock items={report.gap.curriculumItems} />}
        {activeTab === "terms" && <TermsBlock terms={report.terms} />}
        {activeTab === "alternatives" && <AlternativesBlock items={report.alternatives} />}
      </div>
    </div>
  );
}
