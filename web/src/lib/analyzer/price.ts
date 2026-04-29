import type { PriceInfo, PriceTier } from "./types";

const PATTERNS: RegExp[] = [
  /([0-9][0-9,]*)\s*원/,
  /₩\s*([0-9][0-9,]*)/,
  /([0-9]+)\s*만\s*([0-9]+)?\s*천?\s*원?/,
];

export function extractPrice(text: string): PriceInfo {
  const sample = text.slice(0, 30_000);
  for (const re of PATTERNS) {
    const m = sample.match(re);
    if (!m) continue;
    if (re.source.includes("만")) {
      const man = parseInt(m[1] ?? "0", 10);
      const cheon = parseInt(m[2] ?? "0", 10);
      const amount = man * 10_000 + cheon * 1_000;
      if (amount >= 10_000) return { raw: m[0], amountKrw: amount };
    } else {
      const num = parseInt((m[1] ?? "").replace(/,/g, ""), 10);
      if (num >= 10_000) return { raw: m[0], amountKrw: num };
    }
  }
  return { raw: null, amountKrw: null };
}

export function priceTier(amount: number | null): PriceTier {
  if (amount == null) return "unknown";
  if (amount < 100_000) return "low";
  if (amount < 500_000) return "mid";
  return "high";
}
