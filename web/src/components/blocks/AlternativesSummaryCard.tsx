import type { AlternativeItem } from "@/lib/analyzer/types";

const ICON: Record<AlternativeItem["source"], string> = {
  youtube:  "▶",
  inflearn: "🎓",
  google:   "🔎",
  article:  "📄",
};

const SOURCE_LABEL: Record<AlternativeItem["source"], string> = {
  youtube:  "YouTube",
  inflearn: "인프런",
  google:   "Google",
  article:  "Article",
};

const SOURCE_ORDER: AlternativeItem["source"][] = ["youtube", "inflearn", "google", "article"];

export function AlternativesSummaryCard({
  items,
  onJump,
}: {
  items: AlternativeItem[];
  onJump: () => void;
}) {
  if (items.length === 0) return null;

  const grouped = items.reduce<Record<AlternativeItem["source"], number>>(
    (acc, item) => {
      acc[item.source] = (acc[item.source] ?? 0) + 1;
      return acc;
    },
    { youtube: 0, inflearn: 0, google: 0, article: 0 },
  );

  return (
    <button
      type="button"
      onClick={onJump}
      className="group w-full rounded-xl border border-green-soft bg-green-soft/20 p-3 text-left transition-colors hover:bg-green-soft/30"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-green">
          대안 루트
        </h3>
        <span className="flex items-center gap-1 text-[11px] font-medium text-green">
          {items.length}개 항목
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {SOURCE_ORDER.filter((s) => grouped[s] > 0).map((source) => (
          <span
            key={source}
            className="flex items-center gap-1 rounded-full border border-green-soft bg-white px-2 py-0.5 text-[11px]"
          >
            <span>{ICON[source]}</span>
            <span className="font-medium text-slate-700">{SOURCE_LABEL[source]}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono tabular-nums text-slate-600">{grouped[source]}</span>
          </span>
        ))}
      </div>
    </button>
  );
}
