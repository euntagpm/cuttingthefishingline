import type { ScoreBreakdown, ScoreLevel } from "@/lib/analyzer/score";

const LEVEL_META: Record<ScoreLevel, { text: string; ring: string; bar: string }> = {
  high: { text: "text-red",       ring: "stroke-red",       bar: "bg-red" },
  mid:  { text: "text-amber-600", ring: "stroke-amber-500", bar: "bg-amber-500" },
  low:  { text: "text-green",     ring: "stroke-green",     bar: "bg-green" },
};

function CircularGauge({ value, level }: { value: number; level: ScoreLevel }) {
  const meta = LEVEL_META[level];
  const radius = 28;
  const stroke = 5;
  const size = 68;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className={`${meta.ring} transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold tabular-nums ${meta.text}`}>{value}</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, barCls }: { label: string; value: number; barCls: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] leading-tight">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono tabular-nums text-slate-400">{Math.round(value)}</span>
      </div>
      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full transition-all duration-500 ${barCls}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScoreCard({ score }: { score: ScoreBreakdown }) {
  const meta = LEVEL_META[score.level];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2.5 flex items-center gap-3">
        <CircularGauge value={score.total} level={score.level} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            낚시성 점수
          </p>
          <p className={`text-sm font-semibold ${meta.text}`}>{score.label}</p>
          <p className="text-[11px] text-slate-500">FOMO·키워드·갭 평균</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <MetricBar label="FOMO 문장 강도"     value={score.fomo}     barCls={meta.bar} />
        <MetricBar label="FOMO 키워드 밀도"   value={score.keywords} barCls={meta.bar} />
        <MetricBar label="마케팅·커리큘럼 갭" value={score.gap}      barCls={meta.bar} />
      </div>
    </section>
  );
}
