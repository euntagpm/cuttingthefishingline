import type { GlossaryItem } from "@/lib/analyzer/types";

export function TermsBlock({ terms }: { terms: GlossaryItem[] }) {
  if (terms.length === 0) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">용어 풀이</h3>
      <dl className="space-y-2">
        {terms.map((t, i) => (
          <div key={i}>
            <dt className="text-sm font-semibold">{t.term}</dt>
            <dd className="text-xs text-slate-600">{t.plain}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
