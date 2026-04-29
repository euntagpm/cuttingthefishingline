import type { FomoItem } from "@/lib/analyzer/types";

const PATTERN_KO: Record<string, string> = {
  scarcity:                 "희소성",
  "discount-urgency":       "할인마감",
  "loss-aversion":          "손실회피",
  "now-pressure":           "지금당장",
  "transformation-promise": "변화약속",
  "social-proof":           "사회증명",
  guarantee:                "보증",
  fear:                     "공포",
};

export function FomoBlock({ items }: { items: FomoItem[] }) {
  return (
    <section className="rounded-xl border border-red-soft bg-red-soft/10 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-red">FOMO 문장 — red red</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">감지된 FOMO 표현이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="rounded-md border border-red-soft bg-white px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">“{it.sentence}”</p>
                {it.pattern && (
                  <span className="shrink-0 rounded-full bg-red-soft px-2 py-0.5 text-xs font-medium text-red">
                    {PATTERN_KO[it.pattern] ?? it.pattern}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{it.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
