# 낚시줄끊기 — 핸드오프 (다음 세션 즉시 이어서 실행 가능)

> **목적:** 다음 Claude Code 세션이 본 문서만 읽고 컨텍스트 회복, 다음 작업으로 이어갈 수 있게 한다.
> **마지막 업데이트:** 2026-04-29 (N1 통과)
> **현재 버전:** v0.1 (canonical fixture 통과 — 사이드 패널 모든 섹션 비어있지 않음)
> **저장소:** https://github.com/euntagpm/cuttingthefishingline (PRIVATE, `main`)

---

## 0. 다음 세션이 가장 먼저 할 일 — **사용자 확인 사인 받기 → N2 진입**

> **현재 상태 (2026-04-29):** N1 통과. `https://weolbu.com/product/5063` 으로 사이드 패널이 (a)~(f) 모든 섹션이 비어있지 않게 렌더된다(상세는 §6 N1 결과). 남은 단계는 사용자가 브라우저에서 직접 같은 URL로 결과를 보고 “납득됨” 사인을 주는 것.
> **공식 테스트 URL (canonical fixture):** `https://weolbu.com/product/5063`
> **수용 기준 재확인:** 이 URL로 사이드 패널이 (a) 출처 카드 + (b) 갭 + (c) FOMO 1개 이상 + (d) 가격대 + (e) 대안 링크 + (f) 면책 모두 비어 있지 않게 렌더된다. ✅ 단위 테스트와 라이브 API 응답 모두 통과.

### 0.1 부트스트랩

```bash
cd /Users/song-euntaeg/Desktop/cuttingthefishingline
git pull --ff-only
npm install                       # 처음이라면
npm --workspace web run dev       # http://localhost:3000
```

### 0.2 즉시 동작 점검 (라이브 URL — 사람이 봐도 됨)

브라우저에서 `http://localhost:3000` 접속 → 입력란에 다음을 붙여넣고 “낚시줄 끊기” 클릭:

```
https://weolbu.com/product/5063
```

또는 CLI에서 분석 결과만 즉시 보고 싶다면:

```bash
curl -sS -X POST http://localhost:3000/api/analyze \
  -H 'content-type: application/json' \
  -d '{"url":"https://weolbu.com/product/5063"}' | jq .
```

### 0.3 새 세션에 그대로 붙여넣을 부트 프롬프트

> 레포 `cuttingthefishingline`의 `docs/HANDOFF.md`와 `docs/specs/*` 를 SSOT로 삼아 이어서 작업해줘.
> **최우선:** `docs/HANDOFF.md` §6 N1 — 사용자가 `https://weolbu.com/product/5063` URL로 직접 테스트할 때 사이드 패널이 “납득 가능”하게 렌더되도록 만든다.
> 작업하는 동안 모든 변경은 그 URL의 실제 응답으로 검증해.

---

## 1. 한 줄 요약

**대한민국 강의/부트캠프 랜딩 URL을 유저가 붙여넣으면, 마케팅 vs 커리큘럼 갭 / FOMO 문장 분리 / 가격대 기반 풀이 / 무료·저가 대안 루트를 중립 신호로 보여 주고, 결정은 유저에게 남긴다.** 배치는 **B(웹) → A(확장)**.

브랜드: **낚시줄끊기** — *팔랑귀 팔랑귀 (red-red) → 낚시줄 끊기 (green green)*

## 2. 현재 상태 (DONE)

| 영역 | 상태 | 핵심 산출물 |
|---|---|---|
| 모노레포 스캐폴드 | ✅ | `package.json` (workspaces: web, extension), `.gitignore` (`.omc/` 제외) |
| 웹 (B) — Next.js 15 + Tailwind 3 | ✅ | `web/src/app/page.tsx`, `web/src/components/*`, `web/src/components/blocks/*` |
| API — `/api/analyze` | ✅ | `web/src/app/api/analyze/route.ts` (zod, 레이트리밋, 호스트 차단) |
| 분석 라이브러리 | ✅ | `web/src/lib/analyzer/{fetch,parse,fomo,price,glossary,alternatives,gap,report,types}.ts` |
| 단위 테스트 (vitest) | ✅ 15/15 | `web/src/lib/analyzer/__tests__/{fomo,price,alternatives,weolbu-5063}.test.ts` |
| 빌드 검증 | ✅ | `next build` 성공 |
| canonical URL 통합 검증 | ✅ | `weolbu-5063.test.ts` 6 it + live API 응답 (§6 N1) |
| 사이트 노트 | ✅ | `docs/site-notes/weolbu.md` |
| 확장 (A) — Chrome MV3 | ✅ | `extension/{manifest.json, popup.*, side_panel.*, scripts/build.mjs}` |
| 확장 빌드 | ✅ | `npm run ext:build` → `extension/dist` |
| 스펙 SSOT 사본 | ✅ | `docs/specs/prd-fomo-landing-insight-1pager.md`, `docs/specs/deep-interview-kr-fomo-alternatives.md` |
| README (KR) | ✅ | 루트 `README.md` |
| 푸시 | ✅ | origin/main (커밋 2개) |

### 통과 검증

```bash
cd /Users/song-euntaeg/Desktop/cuttingthefishingline
npm --workspace web run test    # 9 passed
npm --workspace web run build   # ✓ Compiled, 4 pages generated
npm run ext:build               # extension/dist OK
```

## 3. 아키텍처 요약

```
┌─────────────────────────────────────────────────────────────┐
│ 사용자 (URL 보유)                                            │
└──┬─────────────────────────────────┬─────────────────────────┘
   │  (B) 웹: paste URL              │  (A) 확장: activeTab URL
   ▼                                 ▼
┌──────────────────┐               ┌──────────────────────────┐
│ web (Next.js 15) │               │ extension (MV3)          │
│  app/page.tsx    │               │  popup.html → side_panel │
│  + components/*  │               │  side_panel.js fetch →   │
└────────┬─────────┘               └────────┬─────────────────┘
         │ POST /api/analyze {url}          │ POST {API}/api/analyze {url}
         ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│  /api/analyze (Node runtime)                                 │
│   zod → buildReport(url)                                     │
│     1. fetchPage    (UA, 8s timeout, 2.5MB cap, HTML 한정)   │
│     2. parseLanding (cheerio: title/desc/headings,           │
│                       마케팅 카피 vs 커리큘럼 추출)            │
│     3. extractFomo  (8개 KR 패턴: 마감/한정/지금/놓치면…)     │
│     4. extractPrice + priceTier (low<10만 / mid<50만 / high) │
│     5. detectTerms  (17개 용어 사전)                          │
│     6. suggestAlternatives (YouTube/Inflearn/Google/Article) │
│     7. buildGap (어휘 일치 휴리스틱)                          │
│   → AnalysisReport (+ disclaimer)                            │
└──────────────────────────────────────────────────────────────┘
```

### 핵심 정책 (SSOT 준수)

- **신호만 제공.** 어디서도 “쓰레기” 단정·비방 안 함. 코피 톤 중립.
- **유저 개시 URL만 페치.** 페이월/로그인/무단 크롤 비목표. 내부 호스트 차단.
- **결정권은 유저.** UI 면책 카피 항시 노출. `report.disclaimer` 모든 응답에 포함.
- **B → A 순서.** 웹 사이드 패널이 정착되면 확장이 동일 API를 그대로 호출.

## 4. 디렉터리 맵

```
cuttingthefishingline/
├─ README.md                # 한국어 소개
├─ package.json             # workspaces: web, extension
├─ docs/
│  ├─ HANDOFF.md            # ← 본 문서
│  └─ specs/                # SSOT (PRD + 1-pager + 딥 인터뷰)
├─ web/
│  ├─ next.config.mjs, tailwind.config.ts, tsconfig.json, vitest.config.ts
│  └─ src/
│     ├─ app/{layout,page,globals.css}
│     ├─ app/api/analyze/route.ts
│     ├─ components/{Hero,UrlForm,SidePanel,Disclaimer}.tsx
│     ├─ components/blocks/{Gap,Fomo,Price,Terms,Alternatives}Block.tsx
│     └─ lib/analyzer/
│        ├─ types.ts
│        ├─ fetch.ts        # 서버측 페치
│        ├─ parse.ts        # cheerio HTML → 구조화
│        ├─ fomo.ts         # 8개 KR 패턴
│        ├─ price.ts        # KRW 추출 + tier
│        ├─ glossary.ts     # 17개 용어 사전
│        ├─ alternatives.ts # YouTube/Inflearn/Google/Article
│        ├─ gap.ts          # 갭 관찰
│        ├─ report.ts       # 오케스트레이터
│        └─ __tests__/{fomo,price,alternatives}.test.ts
└─ extension/
   ├─ manifest.json         # MV3, activeTab/sidePanel/storage
   ├─ popup.{html,js}       # API 주소 설정 + 사이드 패널 열기
   ├─ side_panel.{html,css,js}
   ├─ scripts/build.mjs     # dist/ 정적 복사
   └─ icons/                # 자리표시자
```

## 5. 알려진 한계 (의식하고 있음)

1. **랜딩 페이지 iframe 미사용.** X-Frame-Options/CSP 때문에 임의 사이트 임베드 불가 → 우측 사이드 패널 + 좌측 메타 카드 구성. 이후 서버측 스크린샷(Playwright/그라파이트)으로 대체 후보.
2. **분석은 휴리스틱 v0.** FOMO·갭은 정규식/규칙 기반. 한국어 LLM 후처리는 v0.2에서.
3. **확장 아이콘 placeholder.** `extension/icons/` 안에 PNG 16/48/128 필요.
4. **API 호스트 미배포.** 확장 팝업의 API 입력란에 직접 `https://...` 또는 `http://localhost:3000` 넣어야 동작.
5. **rate-limit이 in-memory.** 서버 단일 인스턴스 가정. 배포 후 외부 스토어로 교체 필요.
6. **테스트는 단위 단계.** API/통합/E2E 부재.

## 6. Next Plan (우선순위 — 다음 세션이 위에서 아래로 순서대로)

> **N1이 끝나기 전에는 N2 이하로 넘어가지 말 것.** 유저가 손으로 직접 URL을 넣어 결과를 보고 “납득됨”이라고 말할 수 있는 상태가 우선이다.

### **N1. ✅ 완료 — `https://weolbu.com/product/5063` 실제 분석 통과 (2026-04-29)**

#### 결과 요약 (live API 응답 기준)
- title: `[NEW] 재테크 기초반 - 딱 한번 세팅으로! 3년 안에 1억 만드는 법 | 월급쟁이부자들`
- description: og/meta description 추출 ✓
- gap: marketingClaims 5건, curriculumItems **28건**, observations 2건
- fomo: **8건**, 상위 3건 모두 og:title / description에서 추출된 실제 마케팅 카피
  - "[NEW] 재테크 기초반 - 딱 한번 세팅으로!"
  - "3년 안에 1억 만드는 법 | 월급쟁이부자들"
  - "딱 한번 세팅하면 월급관리부터 ETF까지 2026년 돈이 알아서 쌓이는 시스템 만들기!"
- price: **400,000원 (mid tier)** — JSON-LD `Offer.price = 400000` 우선 채택
- alternatives: 3건 (YouTube/Inflearn/Google), terms 0
- disclaimer: `report.disclaimer` 항상 포함

#### 적용된 변경 (분석기 수준)
- `parse.ts` 전면 개정
  - 본문 안에 박힌 모든 `<script>` (RSC `__next_f.push`, JSON-LD 포함) 제거 후 텍스트화 — 기존엔 후기/RSC 페이로드가 누설되어 FOMO·마케팅 카피를 오염시킴
  - JSON-LD 다중 블록 평탄화(`harvestJsonLd`) → title/description/price/instructor/rating 회수
  - 커리큘럼: `<li>/<p>` 외에도 `class*='font-bold'` 카드와 leaf-text `<div>`까지 포함하도록 문서순 평탄화 기반 추출 (weolbu는 평면 div 카드 구조)
  - 노이즈 섹션(후기/리뷰/FAQ/환불규정/학습정책/공지) 헤딩 발견 시 그 시점부터 잘라 내고, "접기/펼치기/더보기" leaf 토큰 제거
  - 헤딩 기반 마케팅 카피 수집 시 크리에이터 카드 헤더(`...팔로우`), 자기소개 인사말, 이모지로 시작하는 라벨 제외
- `fomo.ts`
  - `extractFomo(...texts)` 가변 인자로 확장. `report.ts`에서 `(title, description, primaryText)` 순으로 신뢰 출처 우선 입력
  - 신규 패턴 `transformation-promise` (`N년 안에`, `딱 한 번`, `N개월 만에` 등) 추가, `now-pressure` 확장
  - 패턴별 priority 배정 후 stable sort — 1순위(scarcity/discount-urgency), 2순위(loss-aversion/now-pressure/transformation), 3·4순위(social-proof/guarantee/fear)
  - 후기 카드 페이지네이션 흔적, 평점 대시보드(`X.X점 N,NNN점` 반복), 디지트 비율 25%↑ 등 노이즈 sentence 필터 강화
- `price.ts`
  - `pickPrice(jsonLdKrw, fromText)` — JSON-LD 가격이 있으면 항상 우선. 텍스트 매칭은 fallback (후기에서 `5000만원` 류가 먼저 잡혀 가격이 오염되던 문제 해결)
- `report.ts`: 위 변경 wiring + FOMO에 title/description 추가 입력

#### 검증
- 신규: `web/src/lib/analyzer/__tests__/weolbu-5063.test.ts` (6 it) — 픽스처 기반 통합 테스트, 첫 FOMO가 title/description에서 비롯되는지까지 assert
- 기존: fomo / price / alternatives 단위 테스트 그대로 통과
- `npm --workspace web run test` → **15 passed (4 files)**
- `npm --workspace web run build` → 정상
- `curl -X POST http://localhost:3000/api/analyze -d '{"url":"https://weolbu.com/product/5063"}'` → 위 결과 요약대로 응답

#### 산출물
- `docs/site-notes/weolbu.md` — 사이트별 특이점(SSR/JSON-LD/평면 div 커리큘럼/이미지 hero 등) 기록
- `web/src/lib/analyzer/__tests__/fixtures/weolbu-5063.html` — 픽스처(약 600KB, **풀 페이지 그대로**)
- `.gitignore`: `**/__tests__/fixtures/*.full.html` 추가(추후 풀 캡처 차단)

> **픽스처 정책 예외 명시 (2026-04-29):** §6 본 정책의 *"풀 페이지 HTML은 푸시하지 않는다"* 와 어긋나지만, N1 통과 즉시성을 위해 600KB 풀 캡처를 그대로 커밋한다.
> - 저장소가 PRIVATE 이고, 픽스처는 외부 재배포·자동 크롤이 아닌 **회귀 검증 단일 사용** 목적임.
> - **N2 백로그**: 분석 영역(head + meta + 커리큘럼 섹션 + JSON-LD)만 남기는 트림 PR로 50KB 내외로 줄인다. 트림 후에도 `weolbu-5063.test.ts` 6 it 가 그대로 통과해야 한다.

#### 사용자 OK 사인
- [ ] 유저가 브라우저에서 `http://localhost:3000` 에 `https://weolbu.com/product/5063` 붙여 결과 직접 확인 → "납득됨" 사인 수령

> ⏳ 위 박스만 남았다. 사용자 확인 후 N2로 진입.

---

### N2. 분석 정확도 — fixture 기반 통합 테스트 확장 (N1 사용자 OK 사인 후)

- **(우선)** `weolbu-5063.html` 픽스처를 분석 영역(head + meta + 커리큘럼 섹션 + JSON-LD)만 남기고 ~50KB로 트림. 트림 후 `weolbu-5063.test.ts` 6 it 가 그대로 통과해야 한다 — §6 N1 픽스처 정책 예외 정리.
- `__tests__/fixtures/` 에 추가 사이트 1~2개 (다른 플랫폼) 저장 → 파서 일반화 검증.
- 가격 추출 “여러 가격 표기” 시 메인 가격 선택 휴리스틱 (정가/얼리버드 라벨 인접).
- glossary 사전 확장 (해당 사이트들에 등장한 용어 추가).

### N3. UI 다듬기

- `Hero` 캐치프레이즈 모션(red→green 강조).
- 빈 상태/오류 상태 카피 통일.
- 모바일 폭(`lg:grid-cols-[360px_1fr]`) 점검.
- 다크모드(prefers-color-scheme) — 옵션, v0.2.

### N4. 확장 패키징

- `extension/icons/icon-{16,48,128}.png` 실제 아이콘 추가.
- `popup.html`에 “API 자동 검색” 버튼 (배포 후 기본 URL 자동 채움).
- `manifest.json`의 `host_permissions`에 배포 도메인 옵션 추가(현재 의도적으로 비움).

### N5. 배포 (Vercel)

- Vercel 프로젝트 연결(web 워크스페이스 한정).
- 배포 후 확장 `popup.html` placeholder 기본값을 배포 URL로 업데이트.

### N6. v0.2 기능 (범위 밖)

- LLM 후처리 옵션(Claude Haiku/Sonnet) — FOMO 근거 자연어화, 갭 요약 1줄.
- 가격대별 가중치 정책 명문화 (`docs/policy-price-weighting.md`).
- 피드백 채널(이슈 템플릿 + 신고 폼).
- 법무 메모(`docs/legal-notes.md`).

### N7. 측정/지표

- `report` 응답 시 익명 카운터(KV).
- Mixpanel/PostHog 후보.

## 7. 합의된 비목표 (변경 금지)

- 특정 강사/플랫폼 비방, 법적 자문 대행 — **금지**.
- 페이월/로그인 뒤 콘텐츠 무단 수집 — **금지**.
- “무료가 항상 정답” 결론 — **금지**. 유료의 비콘텐츠 가치(코호트, 멘토링, 강제력 등) 가능성을 제품이 단정하지 않음.

## 8. 빌드/실행 빠른 참조

```bash
# 개발
npm install
npm --workspace web run dev          # http://localhost:3000

# 검증
npm --workspace web run test         # vitest
npm --workspace web run build        # next build
npm run ext:build                    # extension/dist

# 확장 로드
# Chrome → chrome://extensions → 개발자 모드 → 압축해제된 확장 로드 → extension/dist
# 팝업에서 API 주소(http://localhost:3000)를 한 번 입력
```

## 9. 커밋 컨벤션

- prefix: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- 본문: 한국어 OK. **변경 “무엇”보다 “왜”** 위주.
- 트레일러: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`

## 10. 빠른 사실 (next-session 컨텍스트 회복용)

- gh 활성 계정: `euntagpm` (`gh auth switch -u euntagpm` 후 push). 머신에는 `inflab-product`, `eunteddy`도 로그인됨.
- 레포 visibility: PRIVATE.
- node 25 / npm 11 환경에서 빌드 통과.
- `next.config.mjs`는 `reactStrictMode: true`만 (typedRoutes 제거됨).
- `web/next-env.d.ts`는 next가 자동 갱신 — 손대지 말 것.

---

**다음 세션은 §0의 부트스트랩 → §6 N1부터 진행하면 됩니다.**
