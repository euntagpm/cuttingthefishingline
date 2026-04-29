"use client";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/Hero";
import { UrlForm } from "@/components/UrlForm";
import { Disclaimer } from "@/components/Disclaimer";

export default function Page() {
  const router = useRouter();

  function onSubmit(url: string) {
    router.push(`/analysis?url=${encodeURIComponent(url)}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Hero />
      <section className="mt-10">
        <UrlForm onSubmit={onSubmit} loading={false} />
      </section>
      <footer className="mt-16">
        <Disclaimer />
      </footer>
    </main>
  );
}
