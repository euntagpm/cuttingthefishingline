import type { AlternativeItem } from "@/lib/analyzer/types";

const ICON: Record<AlternativeItem["source"], string> = {
  youtube: "▶",
  inflearn: "🎓",
  google: "🔎",
  article: "📄",
};

export function AlternativesBlock({ items }: { items: AlternativeItem[] }) {
  return (
    <section className="rounded-xl border border-green-soft bg-green-soft/20 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-green">대안 루트 — green green</h3>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={i} className="rounded-md border border-green-soft bg-white p-3">
            <a className="block text-sm font-semibold text-ink underline" href={it.url} target="_blank" rel="noreferrer">
              {ICON[it.source]} {it.label}
            </a>
            <p className="mt-1 text-xs text-slate-600">{it.rationale}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
