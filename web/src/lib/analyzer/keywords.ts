/**
 * 강의를 한 줄로 설명하는 핵심 키워드 추출 (mock 휴리스틱).
 * 한국어 형태소 분석기 없이 단순 빈도 기반 — 마케팅 카피·커리큘럼·타이틀에서 토큰화.
 *
 * 실제 LLM 호출 시에는 이 함수가 호출되지 않는다. system-ko.md 의 추출 규칙에 따른 LLM 응답이 들어온다.
 */

const STOPWORDS = new Set<string>([
  // 한국어 일반어
  "강의", "수업", "강좌", "코스", "클래스", "프로그램", "콘텐츠", "내용", "구성",
  "여러분", "당신", "지금", "오늘", "이제", "그리고", "그래서", "하지만",
  "있는", "있다", "없다", "되는", "되다", "위한", "위해", "통해", "대한",
  "이런", "저런", "그런", "어떤", "모든", "전체", "각종", "다양",
  "정말", "진짜", "매우", "너무", "아주", "가장", "최고",
  "직접", "함께", "특별", "완전", "확실",
  "분이", "분들", "분께", "분에게", "수강생", "초보",
  "기초", "기본", "심화", "고급", "입문", "마스터",
  "한번", "한 번",
  // 영어 stop
  "the", "and", "for", "with", "this", "that", "from", "your", "you", "are", "was",
  // 사이트/플랫폼 일반어
  "월급쟁이부자들", "월부", "패스트캠퍼스", "인프런", "클래스101", "탈잉",
]);

const TOKEN_RE = /[A-Za-z][A-Za-z0-9+#.]*|[가-힣]{2,}/g;

function tokenize(text: string): string[] {
  return (text.match(TOKEN_RE) ?? []).map((t) => t.trim()).filter(Boolean);
}

function isMeaningful(tok: string): boolean {
  if (tok.length < 2) return false;
  if (STOPWORDS.has(tok)) return false;
  if (/^\d+$/.test(tok)) return false;
  return true;
}

/**
 * title + description + marketingClaims + curriculumItems 의 텍스트 토큰을 빈도순으로 정렬.
 * 가중치: title 토큰 +3, description +2, marketingClaims +2, curriculumItems +1.
 * 상위 10개 반환.
 */
export function extractKeywords(input: {
  title: string | null;
  description: string | null;
  marketingClaims: string[];
  curriculumItems: string[];
}): string[] {
  const score = new Map<string, number>();
  const bump = (text: string, weight: number) => {
    for (const tok of tokenize(text)) {
      if (!isMeaningful(tok)) continue;
      score.set(tok, (score.get(tok) ?? 0) + weight);
    }
  };

  if (input.title) bump(input.title, 3);
  if (input.description) bump(input.description, 2);
  for (const c of input.marketingClaims) bump(c, 2);
  for (const c of input.curriculumItems) bump(c, 1);

  return [...score.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([tok]) => tok);
}
