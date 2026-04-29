"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SidePanel } from "@/components/SidePanel";
import { Disclaimer } from "@/components/Disclaimer";
import type { AnalysisReport } from "@/lib/analyzer/types";

const MIN_WIDTH = 320;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 460;

function AnalysisContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      setPanelWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, dragStartWidth.current + delta)));
    }
    function onMouseUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function onDragStart(e: React.MouseEvent) {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  }

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
          className="text-xs font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:text-ink"
        >
          낚시줄끊기
        </a>
        <span className="text-slate-300">›</span>
        <span className="truncate text-sm text-slate-500">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto shrink-0 rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-slate-400"
        >
          새 탭으로 열기 ↗
        </a>
      </header>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: iframe */}
        <div className="relative flex-1 overflow-hidden bg-slate-50">
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

        {/* Drag handle */}
        <div
          className="w-1 shrink-0 cursor-col-resize bg-slate-200 transition-colors hover:bg-slate-400"
          onMouseDown={onDragStart}
        />

        {/* Right: Report panel */}
        <aside
          style={{ width: panelWidth }}
          className="flex shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-paper"
        >
          {/* Scrollable content */}
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

          {/* Disclaimer footer */}
          <div className="shrink-0 border-t border-slate-100 bg-white p-4">
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
