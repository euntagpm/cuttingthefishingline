import type { FomoKeywordHit } from "@/lib/analyzer/types";

const CATEGORY_LABELS: Record<FomoKeywordHit["category"], string> = {
  money: "돈",
  urgency: "시간 압박",
  transformation: "변신·약속",
  "loss-aversion": "손실 회피",
  "social-proof": "사회 증명",
  fear: "공포·권위",
};

const CATEGORY_TONE: Record<FomoKeywordHit["category"], string> = {
  money: "border-amber-200 bg-amber-50 text-amber-900",
  urgency: "border-red-soft bg-red-soft/40 text-red",
  transformation: "border-violet-200 bg-violet-50 text-violet-800",
  "loss-aversion": "border-rose-200 bg-rose-50 text-rose-800",
  "social-proof": "border-blue-200 bg-blue-50 text-blue-800",
  fear: "border-slate-300 bg-slate-100 text-slate-700",
};

const FALLBACK_TONE = "border-slate-200 bg-slate-50 text-slate-700";

/** LLM 이 가끔 "money|transformation" 처럼 파이프로 여러 카테고리를 합쳐 보낼 수 있어 첫 토큰만 채택. */
function normalizeCategory(raw: FomoKeywordHit["category"] | string): FomoKeywordHit["category"] | null {
  const head = String(raw).split("|")[0]?.trim();
  if (head && head in CATEGORY_LABELS) return head as FomoKeywordHit["category"];
  return null;
}

export function FomoKeywordsBlock({ items }: { items: FomoKeywordHit[] }) {
  const total = items.reduce((acc, it) => acc + it.count, 0);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">FOMO 키워드</h3>
        <span className="text-xs text-slate-400">총 {items.length}종 · {total}회</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">사전에 매칭된 FOMO 키워드가 없습니다.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((hit, i) => {
            const cat = normalizeCategory(hit.category);
            const tone = cat ? CATEGORY_TONE[cat] : FALLBACK_TONE;
            const label = cat ? CATEGORY_LABELS[cat] : String(hit.category);
            return (
              <li
                key={`${hit.keyword}-${i}`}
                className={`flex flex-wrap items-center gap-2 rounded border px-2.5 py-1.5 text-sm ${tone}`}
              >
                <span className="font-semibold">{hit.keyword}</span>
                <span className="rounded-full border border-current/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
                  {label}
                </span>
                <span className="ml-auto text-xs font-mono">×{hit.count}</span>
                {hit.examples?.length > 0 && (
                  <p className="basis-full text-[11px] italic opacity-80">
                    ‘{hit.examples[0]}’
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
