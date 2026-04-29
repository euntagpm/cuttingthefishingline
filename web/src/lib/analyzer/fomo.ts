import type { FomoItem } from "./types";

type Rule = { name: string; pattern: RegExp; reason: string };

const RULES: Rule[] = [
  { name: "scarcity-deadline", pattern: /(마감\s*임박|오늘만|내일\s*마감|D[-\s]?\d+|\d+\s*일\s*남음|\d+\s*시간\s*남음|선착순)/i, reason: "마감/희소성 압박 — 시간 한정으로 결정을 재촉합니다." },
  { name: "scarcity-limited", pattern: /(한정|단\s*\d+\s*명|선착순\s*\d+|매진\s*임박|품절\s*임박)/i, reason: "수량/인원 한정 — 결핍감을 유도합니다." },
  { name: "loss-aversion", pattern: /(놓치면|기회를\s*놓|후회|이번\s*기회|지금\s*아니면)/i, reason: "손실 회피 자극 — '놓치는 비용'을 강조합니다." },
  { name: "now-pressure", pattern: /(지금\s*바로|당장|즉시\s*시작|오늘\s*시작)/i, reason: "즉시성 압박 — 즉각 행동을 유도합니다." },
  { name: "social-proof-pressure", pattern: /(\d{2,}[,]?\d*\s*명이\s*수강|\d{2,}[,]?\d*\s*명\s*돌파|이미\s*\d+|벌써\s*\d+)/i, reason: "사회적 증거 — '남들 다 한다'는 압박입니다." },
  { name: "guarantee-claim", pattern: /(100%\s*보장|확실히\s*[이끄지]|반드시\s*성공|무조건)/i, reason: "성과/결과 보장 — 학습 결과는 개인차가 큽니다." },
  { name: "discount-urgency", pattern: /(할인\s*마감|\d+%\s*할인.*(오늘|마감|종료)|특가\s*마감)/i, reason: "할인 종료 압박 — 가격 앵커링과 시간 압박을 결합합니다." },
  { name: "fear-fall-behind", pattern: /(뒤처지|도태|밀려나|남들과\s*격차)/i, reason: "뒤처짐 공포 — 비교 감정을 자극합니다." },
];

export function extractFomo(text: string): FomoItem[] {
  const sentences = splitSentences(text);
  const out: FomoItem[] = [];
  const seen = new Set<string>();
  for (const s of sentences) {
    for (const r of RULES) {
      if (r.pattern.test(s)) {
        const key = r.name + "|" + s.slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ sentence: s, reason: r.reason, pattern: r.name });
        break;
      }
    }
    if (out.length >= 24) break;
  }
  return out;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。…])\s+|[\n\r]+/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6 && s.length <= 240);
}
