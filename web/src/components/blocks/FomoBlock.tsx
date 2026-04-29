import type { FomoItem } from "@/lib/analyzer/types";

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
              <p className="text-sm">“{it.sentence}”</p>
              <p className="mt-1 text-xs text-red">근거: {it.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
