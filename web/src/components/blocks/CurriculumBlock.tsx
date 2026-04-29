export function CurriculumBlock({ items }: { items: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">커리큘럼 전체</h3>
        <span className="text-xs text-slate-400">{items.length}개 항목</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">표면에 노출된 커리큘럼 항목이 없습니다.</p>
      ) : (
        <ol className="space-y-1 text-sm">
          {items.map((c, i) => (
            <li key={i} className="flex gap-2 rounded bg-green-soft/30 px-2 py-1">
              <span className="shrink-0 text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-slate-700">{c}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
