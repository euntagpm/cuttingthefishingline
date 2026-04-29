import type { AlternativeItem, GlossaryItem } from "./types";

function topic(title: string | null, terms: GlossaryItem[]): string {
  const head = (title ?? "").replace(/\s+/g, " ").trim();
  if (head) return head.slice(0, 60);
  return terms[0]?.term ?? "온라인 강의";
}

export function suggestAlternatives(title: string | null, terms: GlossaryItem[]): AlternativeItem[] {
  const q = topic(title, terms);
  const enc = encodeURIComponent(q);
  const items: AlternativeItem[] = [
    {
      source: "youtube",
      label: `유튜브: "${q}" 입문 검색`,
      url: `https://www.youtube.com/results?search_query=${enc}+%EC%9E%85%EB%AC%B8`,
      rationale: "무료 영상으로 같은 주제의 입문 흐름을 빠르게 훑어볼 수 있습니다.",
    },
    {
      source: "inflearn",
      label: `인프런: "${q}" 검색`,
      url: `https://www.inflearn.com/courses?s=${enc}`,
      rationale: "저가/무료 입문 강의가 있는지 확인하기 좋은 출발점입니다.",
    },
    {
      source: "google",
      label: `구글: "${q}" 공식 문서/튜토리얼`,
      url: `https://www.google.com/search?q=${enc}+%EA%B3%B5%EC%8B%9D+%EB%AC%B8%EC%84%9C+%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC`,
      rationale: "공식 문서·아티클을 한 번 끼워 보면 마케팅 카피와 실체의 거리가 좁혀집니다.",
    },
  ];
  for (const t of terms.slice(0, 2)) {
    items.push({
      source: "article",
      label: `아티클: "${t.term}" 풀이 검색`,
      url: `https://www.google.com/search?q=${encodeURIComponent(t.term)}+%EC%9D%B4%EB%9E%80`,
      rationale: `용어 "${t.term}"의 의미와 쓰임을 짧게 확인합니다.`,
    });
  }
  return items;
}
