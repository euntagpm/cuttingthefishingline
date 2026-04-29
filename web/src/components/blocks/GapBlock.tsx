import type { GapReport } from "@/lib/analyzer/types";

export function GapBlock({ gap }: { gap: GapReport }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">갭 — 마케팅 vs 커리큘럼</h3>
      <p className="mb-2 text-xs font-semibold text-slate-500">마케팅 주장</p>
      <ul className="space-y-1 text-sm">
        {gap.marketingClaims.length === 0 && <li className="text-slate-400">추출된 항목이 없습니다.</li>}
        {gap.marketingClaims.map((c, i) => (
          <li key={i} className="rounded bg-red-soft/30 px-2 py-1">{c}</li>
        ))}
      </ul>
      {gap.observations.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
          {gap.observations.map((o, i) => (<li key={i}>· {o}</li>))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-slate-400">
        커리큘럼 항목은 위쪽 「커리큘럼 전체」 블록에서 전체 목록을 확인하세요.
      </p>
    </section>
  );
}
