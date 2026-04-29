# 사이트 노트 — weolbu.com (월급쟁이부자들)

> **표본 URL:** https://weolbu.com/product/5063
> **수집 일자:** 2026-04-29 · 픽스처: `web/src/lib/analyzer/__tests__/fixtures/weolbu-5063.html`

## 1. 페이지 형식

- **Next.js 15 SSR.** 초기 HTML(약 600KB)에 헤더/메타/커리큘럼/후기 미리보기까지 들어 있다. 별도 헤드리스 브라우저 없이도 분석 가능.
- 본문 안에 `self.__next_f.push(...)` RSC 스트리밍 페이로드가 다수 들어 있어 텍스트 추출 시 노이즈로 들어온다 → `parseLanding`은 body clone에서 `script, style, noscript, template`을 모두 제거한 뒤 텍스트를 만든다.

## 2. 신뢰 가능한 메타 출처

- `og:title`, `og:description`, `meta[name=description]` — 풀 마케팅 카피.
- `application/ld+json` 다중 블록(7개)
  - `Course`, `Product` 스키마: `name`, `description`, `Offer.price`(KRW 정수), `priceCurrency`, `instructor[]`, `aggregateRating`.
  - 우리는 `parseLanding → harvestJsonLd`로 이를 평탄화한다. **가격은 항상 JSON-LD가 1순위**(`pickPrice`).
  - 단, 같은 JSON-LD 안에 `review[].reviewBody` 가 통째로 들어 있어 텍스트 분석에는 절대 사용하지 말 것 — 가격 추출만 한다.

## 3. 커리큘럼 추출 특이점

- 커리큘럼 영역은 `<h2>커리큘럼</h2>` 다음에 **`<ul>/<li>` 가 아닌 평면 `<div>` 카드 행**으로 렌더된다. 카드 안의 강의명은 `class="...font-bold"` 가 달린 `<div>`다.
- 따라서 단순 `nextUntil` + `find("li, p")` 로는 0건이다. `harvestCurriculum`은
  1. 문서 전체를 평탄화(`$("*").toArray()`)한 뒤 헤딩 인덱스를 찾고,
  2. 그 이후의 노드를 순회하면서 `<li>/<p>` 또는 `class*='font-bold'` 카드, 또는 leaf-text 짧은 `<div>`를 후보로 삼는다.
  3. 다음에 노이즈 섹션 헤딩(후기, FAQ 등)이 등장하면 종료.
- 표본에서 28개 항목 추출(중복 제거 포함). 회차별 강의명 + 챕터별 세부 라인을 모두 가져온다.

## 4. FOMO 카피 위치

- 본문에 `선착순 30/50/100/250명` 같은 표현은 **JSON-LD 후기 본문 안에만** 등장한다(8건 모두 `<head>` 안 `<script type=application/ld+json>`). 즉, 우리가 텍스트 분석 대상에서 제외하는 영역이다.
- `한정` 표현은 환불규정 섹션 fine-print 1곳에만 나타난다. 페이지의 hero/cta 영역 자체는 “한정/마감” 같은 노골적 시간 압박 카피보다는 **변화 약속(transformation-promise)**·**즉시성(now-pressure)** 위주다.
  - 예) `[NEW] 재테크 기초반 - 딱 한번 세팅으로! 3년 안에 1억 만드는 법`, `2026년 돈이 알아서 쌓이는 시스템`
- 따라서 `extractFomo`는 본문뿐 아니라 **`title` + `description`을 1순위 입력**으로 받아 분석한다(`extractFomo(title, description, primaryText)`).

## 5. 후기 영역 처리

- `<h2>후기</h2>`가 페이지 하단에 있고, 그 위에 “베스트 후기” 미리보기 카드가 또 있다(텍스트 안에 `접기 1 2 3 ...` 페이지네이션 흔적이 남는다).
- `parseLanding`은
  - 후기/리뷰/FAQ/환불규정/학습정책 등 노이즈 섹션 헤딩이 처음 등장하는 지점부터 그 컨테이너의 `nextAll`을 4단계 위까지 제거.
  - 추가로 `접기/펼치기/더보기` 단어 자체만 가진 leaf 요소(=토글 버튼)는 제거.
- 그래도 일부 후기 미리보기 텍스트는 위쪽에 남아 있을 수 있어, FOMO 출력의 4번째 이하에는 후기 문장이 섞일 수 있다. 사용자가 보는 상위 3개는 표본 검증상 모두 상품 카피였다.

## 6. 가격 / 티어

- JSON-LD `Offer.price = 400000`, `priceCurrency = "KRW"` → **400,000원, mid tier**.
- 본문 텍스트 매칭만 사용하면 후기에서 `5000만원` 같은 표현이 먼저 매칭되어 가격이 오염된다(50,000,000 → high). 반드시 JSON-LD 우선.

## 7. 알려진 한계 (이 사이트 한정)

- “강의 설명” 섹션은 거의 전적으로 이미지로 구성되어 있다(텍스트 없음). 이미지 안에 들어 있는 카피(혜택 약속, 베네핏 강조 등)는 우리 분석 대상이 아님 — 추후 OCR 옵션이 필요할 수 있음.
- 후기 미리보기 카드의 캐러셀 페이지네이션은 “접기/페이지번호” 단어 단위로만 정리되며, 카드 본체 텍스트는 일부 남는다.
- 가격에 “할인가/얼리버드/정가” 같은 다중 표기가 본문에 따로 노출되지 않는다(=Offer 1건). 그래서 “정가 vs 할인가” 비교는 이 페이지에서는 없음.

## 8. 픽스처 정책

- `weolbu-5063.html` (≈600KB) 은 분석에 필요한 head + body 전체를 그대로 보관. 재현성 우선.
- 픽스처 안에는 후기 본문(JSON-LD 안)이 그대로 포함되어 있다. 외부에 재배포하지 말 것 — 테스트 fixture로만 사용.
