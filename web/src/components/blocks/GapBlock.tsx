import type { GapReport } from "@/lib/analyzer/types";

export function GapBlock({ gap }: { gap: GapReport }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">갭 — 마케팅 vs 커리큘럼</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">마케팅 주장</p>
          <ul className="space-y-1 text-sm">
            {gap.marketingClaims.length === 0 && <li className="text-slate-400">추출된 항목이 없습니다.</li>}
            {gap.marketingClaims.map((c, i) => (
              <li key={i} className="rounded bg-red-soft/30 px-2 py-1">{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">커리큘럼 항목</p>
          <ul className="space-y-1 text-sm">
            {gap.curriculumItems.length === 0 && <li className="text-slate-400">표면에 노출된 항목이 없습니다.</li>}
            {gap.curriculumItems.map((c, i) => (
              <li key={i} className="rounded bg-green-soft/40 px-2 py-1">{c}</li>
            ))}
          </ul>
        </div>
      </div>
      {gap.observations.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
          {gap.observations.map((o, i) => (<li key={i}>· {o}</li>))}
        </ul>
      )}
    </section>
  );
}
