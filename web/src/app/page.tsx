"use client";
import { useRouter } from "next/navigation";
import Lightning from "@/components/Lightning";
import { UrlForm } from "@/components/UrlForm";

export default function Page() {
  const router = useRouter();

  function onSubmit(url: string) {
    router.push(`/analysis?url=${encodeURIComponent(url)}`);
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      {/* Lightning background */}
      <div className="absolute inset-0">
        <Lightning hue={220} speed={1.2} intensity={0.9} size={1.2} />
      </div>

      {/* Dark gradient for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-2xl text-center">
          {/* Caption pill */}
          <p className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/70 backdrop-blur-sm sm:text-xs">
            cuttingthefishingline
          </p>

          {/* Hero title */}
          <h1 className="mt-8 text-6xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_32px_rgba(0,0,0,0.6)] sm:mt-10 sm:text-8xl">
            낚시줄끊기
          </h1>

          {/* Tagline */}
          <p className="mx-auto mt-6 max-w-md text-sm text-white/75 sm:mt-8 sm:text-base">
            FOMO 마케팅이 심한 강의 랜딩 URL을 중립 신호로 정리합니다
          </p>

          {/* URL form */}
          <div className="mx-auto mt-10 max-w-xl sm:mt-12">
            <UrlForm onSubmit={onSubmit} loading={false} />
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-[11px] text-white/40 sm:text-xs">
            참고용 신호이며 구매 결정은 본인 책임입니다
          </p>
        </div>
      </div>
    </main>
  );
}
