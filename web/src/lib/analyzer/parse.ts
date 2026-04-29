import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";

export type ParsedLanding = {
  title: string | null;
  description: string | null;
  /** 분석 텍스트(헤더/메인 위주, 리뷰/푸터 제거 후). FOMO·용어 분석에 사용. */
  text: string;
  /** 본문 전체 텍스트(가격·메타 fallback용). 리뷰가 포함될 수 있음. */
  fullText: string;
  headings: string[];
  marketingClaims: string[];
  curriculumItems: string[];
  /** JSON-LD에서 발견한 신뢰도 높은 메타. */
  jsonLd: JsonLdExtract;
};

export type JsonLdExtract = {
  title: string | null;
  description: string | null;
  priceKrw: number | null;
  priceRaw: string | null;
  ratingValue: number | null;
  reviewCount: number | null;
  instructors: string[];
  category: string | null;
};

const CURRICULUM_LABELS = [
  "커리큘럼", "목차", "강의 구성", "강의 내용", "학습 내용", "학습 목표",
  "이런 걸 배워요", "수업 구성", "챕터", "단원", "Curriculum", "강의 미리보기",
  "강의 소개",
];

const MARKETING_HINTS = [
  "성과", "결과", "변화", "성공", "보장", "확실", "최고", "유일", "혁신",
  "이런 분", "이런 분에게", "이런 분이라면",
];

/** 리뷰·푸터·FAQ 등 분석 노이즈 섹션 라벨. 이 라벨이 처음 등장한 지점부터 뒤는 잘라 낸다. */
const NOISE_SECTION_LABELS = [
  "후기", "리뷰", "수강생 후기", "자주 묻는 질문", "FAQ", "환불규정", "학습정책",
  "공지사항",
];

function compactText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
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

function looksLikeNoise(t: string): boolean {
  if (/\d{6,}/.test(t)) return true;            // pagination "12345678910" / 긴 ID
  if (/접기|펼치기|더보기/.test(t) && t.length < 30) return true;
  if (/^[\s.,·•\-—–]+$/.test(t)) return true;   // 구분자만
  if (/_next|chunks|webpack|sentry/i.test(t)) return true;
  return false;
}

export function parseLanding(html: string): ParsedLanding {
  const $ = cheerio.load(html);
  $("script:not([type='application/ld+json']), style, noscript, svg").remove();

  const jsonLd = harvestJsonLd($);

  const ogTitle = compactText($("meta[property='og:title']").attr("content") || "");
  const tagTitle = compactText($("title").first().text() || "");
  const title =
    ogTitle || jsonLd.title || tagTitle || null;

  const metaDesc = compactText($("meta[name='description']").attr("content") || "");
  const ogDesc = compactText($("meta[property='og:description']").attr("content") || "");
  const description = metaDesc || ogDesc || jsonLd.description || null;

  const headings = $("h1, h2, h3")
    .map((_, el) => compactText($(el).text()))
    .get()
    .filter((s) => s.length > 1 && s.length < 200);

  // 분석용 텍스트는 리뷰/FAQ/푸터 등 노이즈 섹션 이전까지로 한정한다.
  const fullText = compactText($("body").text());
  const text = harvestPrimaryText($);

  const curriculumItems = harvestCurriculum($);
  const marketingClaims = harvestMarketingClaims($, headings, jsonLd, description);

  return {
    title,
    description,
    text: text.slice(0, 60_000),
    fullText: fullText.slice(0, 80_000),
    headings,
    marketingClaims: dedupe(marketingClaims).slice(0, 12),
    curriculumItems: dedupe(curriculumItems).slice(0, 30),
    jsonLd,
  };
}

function harvestPrimaryText($: cheerio.CheerioAPI): string {
  const $body = $("body").clone();
  // 본문 안에 박혀 있는 모든 script(JSON-LD, RSC 스트리밍 페이로드 포함)는 텍스트 분석에서 제거.
  $body.find("script, style, noscript, template").remove();

  // (a) 후기/FAQ/환불 등 노이즈 섹션 헤딩이 등장하면 그 시점부터 모두 잘라낸다.
  const $headings = $body.find("h1, h2, h3, h4").toArray();
  for (const h of $headings) {
    const ht = compactText($(h).text());
    if (NOISE_SECTION_LABELS.some((lbl) => ht.includes(lbl))) {
      let cur: cheerio.Cheerio<AnyNode> = $(h);
      for (let lv = 0; lv < 3 && cur.length; lv++) {
        cur.nextAll().remove();
        cur = cur.parent();
      }
      cur.nextAll().remove();
      $(h).remove();
      break;
    }
  }

  // (b) 후기 캐러셀/프리뷰 카드는 "후기" 헤딩보다 위에 있을 수 있다.
  // "접기" 토글 버튼 텍스트만 정확히 매칭하는 leaf 요소만 제거(과잉 절단 방지).
  $body
    .find("button, span, a")
    .filter((_, el) => {
      const t = compactText($(el).text());
      return t === "접기" || t === "펼치기" || t === "더보기";
    })
    .remove();

  return compactText($body.text());
}

function harvestCurriculum($: cheerio.CheerioAPI): string[] {
  const items: string[] = [];

  // 문서 순서로 모든 노드를 한 번 평탄화(`*`로 가능). 큰 페이지에서도 ms 단위.
  const all = $("*").toArray();

  function isHeading(node: AnyNode): boolean {
    return /^h[1-6]$/i.test((node as Element).tagName ?? "");
  }

  for (let i = 0; i < all.length; i++) {
    const node = all[i] as Element;
    if (!isHeading(node)) continue;
    const ht = compactText($(node).text());
    if (!CURRICULUM_LABELS.some((lbl) => ht.includes(lbl))) continue;

    // 다음 비-커리큘럼 헤딩까지 leaf-text 또는 font-bold 후보 수집.
    for (let j = i + 1; j < all.length; j++) {
      const next = all[j] as Element;
      if (isHeading(next)) {
        const nt = compactText($(next).text());
        // 다음 헤딩이 노이즈 섹션이면 종료. 또 다른 커리큘럼 라벨이면 계속.
        if (NOISE_SECTION_LABELS.some((lbl) => nt.includes(lbl))) break;
        if (CURRICULUM_LABELS.some((lbl) => nt.includes(lbl))) continue;
        // 다른 일반 섹션 헤딩 등장 → 종료
        break;
      }
      const $n = $(next);
      const cls = (next.attribs?.class ?? "").toString();
      const tag = (next.tagName ?? "").toLowerCase();
      // 후보 1: <li>, <p>
      // 후보 2: 클래스에 'font-bold' 포함하는 div/span (커리큘럼 카드 패턴)
      // 후보 3: 자식 요소가 없는 leaf 노드의 짧은 텍스트
      const isCard = /font-bold/.test(cls);
      const isLeafShort =
        $n.children().length === 0 && (tag === "div" || tag === "span" || tag === "li" || tag === "p");
      if (tag !== "li" && tag !== "p" && !isCard && !isLeafShort) continue;

      const t = compactText($n.text());
      if (t.length < 4 || t.length > 200) continue;
      if (looksLikeNoise(t)) continue;
      // 헤더 자체에 들어있는 카운트("총 11개 수업") 같은 메타 줄 제거
      if (/^총\s*\d+\s*개\s*수업$/.test(t)) continue;

      items.push(t);
      if (items.length >= 80) break;
    }
    if (items.length) break;
  }
  return items;
}

function harvestMarketingClaims(
  $: cheerio.CheerioAPI,
  headings: string[],
  jsonLd: JsonLdExtract,
  description: string | null
): string[] {
  const claims: string[] = [];
  // 1) JSON-LD course description / page meta description (가장 신뢰도 높음)
  if (jsonLd.description) claims.push(jsonLd.description);
  if (description && description !== jsonLd.description) claims.push(description);

  // 2) 상위 헤딩(섹션 라벨/프로필 카드는 제외)
  const SKIP_HEADING = new Set([
    ...NOISE_SECTION_LABELS,
    "수강 정보", "강의 설명", "커리큘럼", "크리에이터", "관련 강의",
    "이용약관", "개인정보처리방침",
  ]);
  for (const h of headings.slice(0, 16)) {
    if (h.length < 6 || h.length > 140) continue;
    if (SKIP_HEADING.has(h)) continue;
    if (looksLikeNoise(h)) continue;
    if (/팔로우$/.test(h)) continue;                      // 크리에이터 카드 헤더
    if (/^안녕하세요/.test(h)) continue;                    // 자기소개 인사말
    if (/^[\p{Extended_Pictographic}\s]+/u.test(h.slice(0, 3))) continue; // 이모지로 시작하는 라벨
    claims.push(h);
  }

  // 3) 본문 첫 paragraph/bullet 중 마케팅 힌트 포함 문장
  $("p, li").each((_, el) => {
    const t = compactText($(el).text());
    if (t.length < 12 || t.length > 220) return;
    if (looksLikeNoise(t)) return;
    if (MARKETING_HINTS.some((w) => t.includes(w)) && claims.length < 14) {
      claims.push(t);
    }
  });

  return claims;
}

function harvestJsonLd($: cheerio.CheerioAPI): JsonLdExtract {
  const out: JsonLdExtract = {
    title: null,
    description: null,
    priceKrw: null,
    priceRaw: null,
    ratingValue: null,
    reviewCount: null,
    instructors: [],
    category: null,
  };

  $("script[type='application/ld+json']").each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    let json: unknown;
    try { json = JSON.parse(raw); } catch { return; }
    const list = Array.isArray(json) ? json : [json];
    for (const it of list) walk(it);
  });

  function asNumber(v: unknown): number | null {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/,/g, ""));
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  function walk(v: unknown, depth = 0): void {
    if (depth > 6) return;
    if (!v || typeof v !== "object") return;
    const it = v as Record<string, unknown>;
    const type = it["@type"];
    const types = Array.isArray(type) ? type.map(String) : [String(type ?? "")];

    if (types.some((t) => t === "Course" || t === "Product")) {
      if (typeof it.name === "string" && !out.title) out.title = it.name;
      if (typeof it.description === "string" && !out.description) out.description = it.description;
      const cat = it.category as Record<string, unknown> | string | undefined;
      if (typeof cat === "string" && !out.category) out.category = cat;
      else if (cat && typeof cat === "object" && typeof (cat as Record<string, unknown>).name === "string" && !out.category) {
        out.category = (cat as Record<string, unknown>).name as string;
      }
    }

    if (types.some((t) => t === "Offer") || it.offers !== undefined || (it.priceCurrency !== undefined && it.price !== undefined)) {
      const offers: unknown[] = [];
      if (Array.isArray(it.offers)) offers.push(...it.offers);
      else if (it.offers) offers.push(it.offers);
      if ((it.price !== undefined || it.priceCurrency !== undefined) && types.some((t) => t === "Offer")) offers.push(it);
      for (const o of offers) {
        if (!o || typeof o !== "object") continue;
        const oo = o as Record<string, unknown>;
        const cur = String(oo.priceCurrency ?? "").toUpperCase();
        const num = asNumber(oo.price);
        if (num != null && (cur === "KRW" || cur === "") && (out.priceKrw == null || num > 0)) {
          if (out.priceKrw == null) {
            out.priceKrw = Math.round(num);
            out.priceRaw = `${out.priceKrw.toLocaleString("ko-KR")}원`;
          }
        }
      }
    }

    const agg = it.aggregateRating as Record<string, unknown> | undefined;
    if (agg && typeof agg === "object") {
      if (out.ratingValue == null) out.ratingValue = asNumber(agg.ratingValue);
      if (out.reviewCount == null) {
        const rc = asNumber(agg.reviewCount) ?? asNumber(agg.ratingCount);
        if (rc != null) out.reviewCount = Math.round(rc);
      }
    }

    if (types.some((t) => t === "CourseInstance" || t === "Course") && it.instructor) {
      const ins = Array.isArray(it.instructor) ? it.instructor : [it.instructor];
      for (const p of ins) {
        if (p && typeof p === "object") {
          const name = (p as Record<string, unknown>).name;
          if (typeof name === "string" && !out.instructors.includes(name)) {
            out.instructors.push(name);
          }
        }
      }
    }

    for (const k of Object.keys(it)) {
      const child = it[k];
      if (child && typeof child === "object") walk(child, depth + 1);
    }
  }

  return out;
}
