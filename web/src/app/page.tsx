"use client";
import { useState } from "react";
import { Hero } from "@/components/Hero";
import { UrlForm } from "@/components/UrlForm";
import { SidePanel } from "@/components/SidePanel";
import { Disclaimer } from "@/components/Disclaimer";
import type { AnalysisReport } from "@/lib/analyzer/types";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  async function onSubmit(url: string) {
    setLoading(true); setError(null); setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "분석 실패");
      setReport(data.report as AnalysisReport);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Hero />
      <section className="mt-8">
        <UrlForm onSubmit={onSubmit} loading={loading} />
      </section>
      {error && (
        <p className="mt-4 rounded-md border border-red-soft bg-red-soft/40 px-3 py-2 text-sm text-red">
          {error}
        </p>
      )}
      {report && (
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-500">출처</h2>
            <p className="text-sm">
              <a className="break-all text-blue-600 underline" href={report.source.url} target="_blank" rel="noreferrer">
                {report.source.url}
              </a>
            </p>
            {report.source.title && <p className="text-base font-semibold">{report.source.title}</p>}
            {report.source.description && <p className="text-sm text-slate-600">{report.source.description}</p>}
          </aside>
          <SidePanel report={report} />
        </section>
      )}
      <footer className="mt-16">
        <Disclaimer />
      </footer>
    </main>
  );
}
