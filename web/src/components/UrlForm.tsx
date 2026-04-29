"use client";
import { FormEvent, useState } from "react";

export function UrlForm({ onSubmit, loading }: { onSubmit: (url: string) => void; loading: boolean }) {
  const [url, setUrl] = useState("");

  function handle(e: FormEvent) {
    e.preventDefault();
    const v = url.trim();
    if (!/^https?:\/\//i.test(v)) return;
    onSubmit(v);
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="url"
        inputMode="url"
        required
        placeholder="https://강의-랜딩-주소를-붙여넣으세요"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base shadow-sm focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-ink px-5 py-3 text-base font-semibold text-white disabled:opacity-50"
      >
        {loading ? "분석 중…" : "낚시줄 끊기"}
      </button>
    </form>
  );
}
