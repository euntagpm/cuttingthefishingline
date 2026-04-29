import type { FomoKeywordHit } from "./types";

type DictEntry = {
  label: string;
  category: FomoKeywordHit["category"];
  patterns: RegExp[];
};

/**
 * 한국 강의/부트캠프 FOMO 마케팅 어휘 사전.
 * 카테고리별로 라벨 단위 매칭. 같은 카테고리 안의 여러 정규식은 하나의 라벨로 합산된다.
 */
const DICT: DictEntry[] = [
  // 돈 관련 — 액수/소득 강조
  { label: "1억", category: "money", patterns: [/\b1\s*억\b/g, /\b일\s*억\b/g] },
  { label: "N억", category: "money", patterns: [/\b\d{1,3}\s*억\b/g] },
  { label: "월천(만원)", category: "money", patterns: [/월\s*천(만원)?/g, /월\s*1[,.]?000\s*만\s*원/g] },
  { label: "월 N백만원", category: "money", patterns: [/월\s*\d{1,3}\s*백\s*만\s*원/g] },
  { label: "월 N만원", category: "money", patterns: [/월\s*\d{2,3}\s*만\s*원/g, /월급\s*\d{2,3}\s*만\s*원/g] },
  { label: "연봉 N", category: "money", patterns: [/연봉\s*\d/g] },
  { label: "경제적 자유 / 조기은퇴 / FIRE", category: "money", patterns: [/경제적\s*자유/g, /조기\s*은퇴/g, /\bFIRE\b/g, /파이어족/g] },
  { label: "패시브 인컴 / 부수입 / 사이드잡", category: "money", patterns: [/패시브\s*인컴/g, /부수입/g, /사이드\s*잡/g, /N\s*잡/g] },
  { label: "재테크 / 투자 수익", category: "money", patterns: [/재테크/g, /투자\s*수익/g, /수익률/g] },

  // 시간 압박 — 마감/한정/지금
  { label: "선착순", category: "urgency", patterns: [/선착순/g] },
  { label: "마감 임박", category: "urgency", patterns: [/마감\s*임박/g, /마감\s*전/g, /마감까지/g] },
  { label: "한정", category: "urgency", patterns: [/한정\s*\d*\s*명?/g, /\b한정\b/g] },
  { label: "지금/오늘만", category: "urgency", patterns: [/오늘만/g, /지금\s*아니면/g, /지금이\s*기회/g, /\b지금\s*시작\b/g] },
  { label: "마지막 기회", category: "urgency", patterns: [/마지막\s*기회/g, /마지막\s*\d+\s*명/g] },
  { label: "단 N일/시간", category: "urgency", patterns: [/단\s*\d+\s*(?:일|시간|분)/g, /\d+\s*시간\s*남음/g] },
  { label: "곧 종료", category: "urgency", patterns: [/곧\s*종료/g, /종료\s*임박/g] },

  // 변신/약속 — 빠른/쉬운/누구나
  { label: "딱 한 번", category: "transformation", patterns: [/딱\s*한\s*번/g] },
  { label: "N년 안에", category: "transformation", patterns: [/\d+\s*년\s*안에/g, /\d+\s*년\s*만에/g] },
  { label: "N개월 만에", category: "transformation", patterns: [/\d+\s*개월\s*만에/g, /\d+\s*달\s*만에/g] },
  { label: "단숨에 / 한 번에", category: "transformation", patterns: [/단숨에/g, /한\s*번에/g, /원샷/g] },
  { label: "초보도 / 누구나", category: "transformation", patterns: [/(?:왕)?\s*초보도?/g, /비전공자도?/g, /\b누구나\b/g, /문과도?/g] },
  { label: "쉽게 / 간단히", category: "transformation", patterns: [/\b쉽게\b/g, /간단히/g, /손쉽게/g] },
  { label: "보장 / 확실", category: "transformation", patterns: [/\b보장\b/g, /보장합니다/g, /\b확실\b/g, /확실하게/g] },
  { label: "성공 / 변화", category: "transformation", patterns: [/\b성공\b/g, /인생\s*변화/g, /삶이\s*바뀝/g] },

  // 손실 회피
  { label: "놓치면 후회", category: "loss-aversion", patterns: [/놓치면\s*후회/g, /놓치면\s*[안않]/g, /후회하지/g] },
  { label: "이 기회를 놓치면", category: "loss-aversion", patterns: [/기회를\s*놓치/g, /기회를\s*잃/g] },
  { label: "지금 안 하면 / 10년 후", category: "loss-aversion", patterns: [/지금\s*안\s*하면/g, /10\s*년\s*(?:후|뒤)/g, /\d+\s*년\s*뒤/g] },
  { label: "퇴사 / 백수 / 노후 걱정", category: "loss-aversion", patterns: [/\b퇴사\b/g, /\b백수\b/g, /노후\s*걱정/g, /노후\s*불안/g] },

  // 사회 증명
  { label: "수강생 N명 / 누적 N명", category: "social-proof", patterns: [/수강생\s*\d/g, /누적\s*\d+\s*명/g, /\d+\s*명\s*돌파/g] },
  { label: "후기 N개 / 별점", category: "social-proof", patterns: [/후기\s*\d/g, /\d+\s*개의\s*후기/g, /별점\s*\d/g, /\d\.\d+\s*점/g] },
  { label: "1위 / 베스트셀러", category: "social-proof", patterns: [/\b1\s*위\b/g, /베스트\s*셀러/g, /\bTOP\s*\d+/g] },
  { label: "대한민국 1위 / 최고", category: "social-proof", patterns: [/대한민국\s*1\s*위/g, /국내\s*1\s*위/g, /\b최고\b/g, /\b최강\b/g] },

  // 공포 / 권위
  { label: "AI 시대 / 도태", category: "fear", patterns: [/AI\s*시대/g, /도태/g, /살아남/g] },
  { label: "남들 다 / 뒤처지", category: "fear", patterns: [/남들\s*다/g, /뒤처지/g, /뒤처질/g] },
  { label: "전문가 / 검증된", category: "fear", patterns: [/전문가가?\s*직접/g, /검증된/g, /\b입증\b/g] },
];

const STRIP_RE = /\s+/g;

function compact(s: string): string {
  return s.replace(STRIP_RE, " ").trim();
}

function snippet(haystack: string, idx: number, span = 40): string {
  const start = Math.max(0, idx - span);
  const end = Math.min(haystack.length, idx + span);
  return compact(haystack.slice(start, end));
}

/** 본문에서 FOMO 사전을 매칭해 카운트 + 예시까지 반환. count desc 정렬, count=0은 제외. */
export function detectFomoKeywords(...texts: (string | null | undefined)[]): FomoKeywordHit[] {
  const haystack = texts.filter((t): t is string => Boolean(t)).join("\n");
  if (!haystack) return [];

  const hits: FomoKeywordHit[] = [];
  for (const entry of DICT) {
    let count = 0;
    const examples: string[] = [];
    for (const re of entry.patterns) {
      // /g 플래그 정규식이라 lastIndex 초기화 필요.
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(haystack)) !== null) {
        count += 1;
        if (examples.length < 3) {
          examples.push(snippet(haystack, m.index));
        }
        if (m.index === re.lastIndex) re.lastIndex += 1;
      }
    }
    if (count > 0) {
      hits.push({ keyword: entry.label, category: entry.category, count, examples });
    }
  }

  hits.sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword));
  return hits;
}
