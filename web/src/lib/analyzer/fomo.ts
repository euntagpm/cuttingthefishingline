import type { FomoItem } from "./types";

type Rule = { name: string; pattern: RegExp; reason: string; priority: number };

const RULES: Rule[] = [
  { name: "scarcity-deadline", priority: 1, pattern: /(마감\s*임박|오늘만|내일\s*마감|D[-\s]?\d+|\d+\s*일\s*남음|\d+\s*시간\s*남음|선착순)/i, reason: "마감/희소성 압박 — 시간 한정으로 결정을 재촉합니다." },
  { name: "scarcity-limited", priority: 1, pattern: /(한정\s*수량|한정\s*인원|단\s*\d+\s*명|선착순\s*\d+|매진\s*임박|품절\s*임박)/i, reason: "수량/인원 한정 — 결핍감을 유도합니다." },
  { name: "discount-urgency", priority: 1, pattern: /(할인\s*마감|\d+%\s*할인.*(오늘|마감|종료)|특가\s*마감)/i, reason: "할인 종료 압박 — 가격 앵커링과 시간 압박을 결합합니다." },
  { name: "loss-aversion", priority: 2, pattern: /(놓치면|기회를\s*놓|이번\s*기회|지금\s*아니면)/i, reason: "손실 회피 자극 — '놓치는 비용'을 강조합니다." },
  { name: "now-pressure", priority: 2, pattern: /(지금\s*바로|당장|즉시\s*시작|오늘\s*시작|지금\s*[가-힣]{2,}|시작하세요)/i, reason: "즉시성 압박 — 즉각 행동을 유도합니다." },
  { name: "transformation-promise", priority: 2, pattern: /([0-9]+\s*년\s*안에|[0-9]+\s*개월\s*만에|단\s*[0-9]+\s*[년월일주]|딱\s*한\s*번|\d+\s*시간\s*만에)/i, reason: "단기간 변화 약속 — 학습 결과는 개인차가 큽니다." },
  { name: "social-proof-pressure", priority: 3, pattern: /(\d{2,}[,]?\d*\s*명이\s*수강|\d{2,}[,]?\d*\s*명\s*돌파|이미\s*\d+|벌써\s*\d+|국내\s*1위|업계\s*1위)/i, reason: "사회적 증거 — '남들 다 한다'는 압박입니다." },
  { name: "guarantee-claim", priority: 4, pattern: /(100%\s*보장|확실히\s*[이끄지]|반드시\s*성공|무조건)/i, reason: "성과/결과 보장 — 학습 결과는 개인차가 큽니다." },
  { name: "fear-fall-behind", priority: 4, pattern: /(뒤처지|도태|밀려나|남들과\s*격차)/i, reason: "뒤처짐 공포 — 비교 감정을 자극합니다." },
];

/**
 * `texts`는 우선순위가 높은 출처(타이틀·메타 → 본문) 순으로 넘겨준다.
 * 결과는 패턴 priority 오름차순(중요도 ↑) → 동일 priority 내 출현 순서 유지.
 */
export function extractFomo(...texts: Array<string | null | undefined>): FomoItem[] {
  const out: FomoItem[] = [];
  const seen = new Set<string>();
  for (const text of texts) {
    if (!text) continue;
    for (const s of splitSentences(text)) {
      for (const r of RULES) {
        if (!r.pattern.test(s)) continue;
        const key = r.name + "|" + s.slice(0, 60);
        if (seen.has(key)) break;
        seen.add(key);
        out.push({ sentence: s, reason: r.reason, pattern: r.name });
        break;
      }
      if (out.length >= 24) break;
    }
    if (out.length >= 24) break;
  }
  // 우선순위 재정렬: 같은 priority면 원래 출현 순서 유지(stable sort).
  return out
    .map((item, i) => ({ item, i, p: priorityOf(item.pattern) }))
    .sort((a, b) => a.p - b.p || a.i - b.i)
    .map(({ item }) => item);
}

function priorityOf(name: string): number {
  return RULES.find((r) => r.name === name)?.priority ?? 9;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。…!?])\s+|[\n\r]+/g)
    .flatMap((s) => s.split(/(?<=[다요])\s+(?=[가-힣A-Z\d])/)) // 한국어 종결어미 후 큰 갭이면 분리
    .map((s) => sanitizeSentence(s))
    .filter((s) => s.length >= 6 && s.length <= 180)
    .filter((s) => !looksLikeNoise(s));
}

function sanitizeSentence(s: string): string {
  // 후기 카드 말미의 "접기 1 2 3 4..." 페이지네이션 흔적을 잘라낸다.
  let out = s.replace(/접기\s*\d{2,}.*$/g, "").replace(/펼치기\s*\d{2,}.*$/g, "");
  // 끝에 매달린 6자리 이상 숫자열(페이지네이션) 제거
  out = out.replace(/\s*\d{6,}\s*$/g, "");
  return out.trim();
}

function looksLikeNoise(s: string): boolean {
  if (/\d{6,}/.test(s)) return true;
  if (/^[\s.,·•\-—–]+$/.test(s)) return true;
  // 평점 대시보드 텍스트(4.85점, 10,105점 등이 2개 이상 이어지는 경우)
  if ((s.match(/\d[\d,.]*\s*점/g) ?? []).length >= 2) return true;
  // 후기 카운트 + 평점 콤보
  if (/총\s*[\d,]+\s*개\s*후기|후기\s*총\s*[\d,]+/.test(s)) return true;
  // 카테고리 카드 라벨 묶음 (성별/나이/학습경험 ...)
  if (/(성별|나이|학습경험)\s*전체/.test(s)) return true;
  // 디지트 비율이 25% 넘으면 스코어보드 류로 간주
  const digits = (s.match(/\d/g) ?? []).length;
  if (s.length >= 30 && digits / s.length > 0.25) return true;
  return false;
}
