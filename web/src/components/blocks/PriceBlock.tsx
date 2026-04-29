import type { PriceInfo, PriceTier } from "@/lib/analyzer/types";

const LABEL: Record<PriceTier, string> = {
  unknown: "가격 미검출",
  low: "저가대 — 부담이 작아 빠른 시도가 합리적",
  mid: "중가대 — 무료/저가 루트와 병행 비교 권장",
  high: "고가대 — 용어·커리큘럼 풀이 + 무료 루트 비중 확대",
};

export function PriceBlock({ price, tier }: { price: PriceInfo; tier: PriceTier }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">가격대</h3>
      <p className="text-base">
        {price.raw ? <span className="font-semibold">{price.raw}</span> : <span className="text-slate-400">검출되지 않음</span>}
      </p>
      <p className="mt-2 text-xs text-slate-600">{LABEL[tier]}</p>
    </section>
  );
}
