export function KeywordsBlock({ keywords }: { keywords: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">키워드</h3>
      {keywords.length === 0 ? (
        <p className="text-sm text-slate-400">추출된 키워드가 없습니다.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {keywords.map((k, i) => (
            <li
              key={`${k}-${i}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {k}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
