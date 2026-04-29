import * as cheerio from "cheerio";

export type ParsedLanding = {
  title: string | null;
  description: string | null;
  text: string;
  headings: string[];
  marketingClaims: string[];
  curriculumItems: string[];
};

const CURRICULUM_LABELS = [
  "커리큘럼", "목차", "강의 구성", "강의 내용", "학습 내용", "학습 목표",
  "이런 걸 배워요", "수업 구성", "챕터", "단원", "Curriculum",
];

const MARKETING_HINTS = [
  "성과", "결과", "후기", "수강생", "변화", "성공",
  "보장", "확실", "최고", "유일", "혁신",
];

function compactText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function parseLanding(html: string): ParsedLanding {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  const title =
    compactText($("meta[property='og:title']").attr("content") || $("title").first().text() || "") || null;
  const description =
    compactText(
      $("meta[name='description']").attr("content") ||
        $("meta[property='og:description']").attr("content") ||
        ""
    ) || null;

  const headings = $("h1, h2, h3")
    .map((_, el) => compactText($(el).text()))
    .get()
    .filter((s) => s.length > 1 && s.length < 200);

  const text = compactText($("body").text()).slice(0, 60_000);

  // Curriculum: find sections whose nearest heading matches a label, then collect <li> or <p> within ~300 chars.
  const curriculumItems: string[] = [];
  $("h1, h2, h3, h4").each((_, el) => {
    const h = compactText($(el).text());
    if (CURRICULUM_LABELS.some((lbl) => h.includes(lbl))) {
      const $section = $(el).nextUntil("h1, h2, h3, h4");
      $section.find("li, p").each((__, item) => {
        const t = compactText($(item).text());
        if (t.length >= 4 && t.length <= 160) curriculumItems.push(t);
      });
    }
  });

  // Marketing claims: top headings + first 4 paragraphs that contain marketing hints.
  const marketingClaims: string[] = [];
  for (const h of headings.slice(0, 8)) {
    if (h.length >= 6 && h.length <= 120) marketingClaims.push(h);
  }
  $("p, li").each((_, el) => {
    const t = compactText($(el).text());
    if (t.length < 12 || t.length > 200) return;
    if (MARKETING_HINTS.some((w) => t.includes(w)) && marketingClaims.length < 16) {
      marketingClaims.push(t);
    }
  });

  return {
    title,
    description,
    text,
    headings,
    marketingClaims: dedupe(marketingClaims).slice(0, 12),
    curriculumItems: dedupe(curriculumItems).slice(0, 24),
  };
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const k = s.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(s); }
  }
  return out;
}
