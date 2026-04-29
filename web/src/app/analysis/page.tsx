"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SidePanel } from "@/components/SidePanel";
import { Disclaimer } from "@/components/Disclaimer";
import type { AnalysisReport } from "@/lib/analyzer/types";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data?.error?.message ?? "분석 실패");
        setReport(data.report as AnalysisReport);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "알 수 없는 오류"))
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <a
          href="/"
          className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-ink transition-colors"
        >
          낚시줄끊기
        </a>
        <span className="text-slate-300">›</span>
        <span className="truncate text-sm text-slate-500">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto shrink-0 rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-400 transition-colors"
        >
          새 탭으로 열기 ↗
        </a>
      </header>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: iframe */}
        <div className="relative flex-1 bg-slate-50">
          {url ? (
            <iframe
              key={url}
              src={url}
              className="h-full w-full border-0"
              title="강의 랜딩 페이지"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              URL이 없습니다
            </div>
          )}
        </div>

        {/* Right: Report */}
        <aside className="flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
          <div className="flex-1 overflow-y-auto p-5">
            {loading && (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                분석 중…
              </div>
            )}
            {error && (
              <p className="rounded-md border border-red-soft bg-red-soft/40 px-3 py-2 text-sm text-red">
                {error}
              </p>
            )}
            {report && <SidePanel report={report} />}
            {!loading && !error && !report && (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                분석 결과를 불러오는 중…
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-slate-100 p-4">
            <Disclaimer />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-slate-400">
          불러오는 중…
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
