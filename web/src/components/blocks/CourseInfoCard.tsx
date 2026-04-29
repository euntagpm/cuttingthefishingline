import type { AnalysisReport, PriceTier } from "@/lib/analyzer/types";

const TIER_META: Record<PriceTier, { label: string; cls: string }> = {
  low:     { label: "저가",       cls: "bg-green-soft text-green" },
  mid:     { label: "중가",       cls: "bg-amber-100 text-amber-700" },
  high:    { label: "고가",       cls: "bg-red-soft text-red" },
  unknown: { label: "가격 미검출", cls: "bg-slate-100 text-slate-500" },
};

export function CourseInfoCard({ report }: { report: AnalysisReport }) {
  const tier = TIER_META[report.tier];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      {report.source.title && (
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          {report.source.title}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        {report.price.raw ? (
          <span className="text-base font-bold tabular-nums text-ink">{report.price.raw}</span>
        ) : (
          <span className="text-sm text-slate-400">가격 미검출</span>
        )}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tier.cls}`}>
          {tier.label}
        </span>
      </div>

      {report.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {report.keywords.map((k, i) => (
            <span
              key={`${k}-${i}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
            >
              {k}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
