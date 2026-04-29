import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "낚시줄끊기 — FOMO 강의 랜딩, 신호로 정리",
  description:
    "URL 붙여넣기 → 마케팅 vs 커리큘럼 갭, FOMO 문장 분리, 용어 풀이, 무료·저가 대안 루트를 중립 신호로. 구매 결정은 본인 책임.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
