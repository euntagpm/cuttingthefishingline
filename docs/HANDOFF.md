# 낚시줄끊기 — 핸드오프 (다음 세션 즉시 이어서 실행 가능)

> **목적:** 다음 Claude Code 세션이 본 문서만 읽고 컨텍스트 회복, 다음 작업으로 이어갈 수 있게 한다.
> **마지막 업데이트:** 2026-04-29
> **현재 버전:** v0 (MVP 스캐폴드 + 검증 통과)
> **저장소:** https://github.com/euntagpm/cuttingthefishingline (PRIVATE, `main`)

---

## 0. 다음 세션이 가장 먼저 할 일

```bash
cd /Users/song-euntaeg/Desktop/cuttingthefishingline
git pull --ff-only
npm install                 # 처음이라면
npm --workspace web run dev # http://localhost:3000
```

새 세션에 다음을 그대로 붙여넣으면 됩니다:

> 레포 `cuttingthefishingline`의 `docs/HANDOFF.md`와 `docs/specs/*` 를 SSOT로 삼아 이어서 작업해줘.
> 다음 우선 과제는 `docs/HANDOFF.md` §6 (Next Plan)의 N1부터 순서대로.

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
| 단위 테스트 (vitest) | ✅ 9/9 | `web/src/lib/analyzer/__tests__/{fomo,price,alternatives}.test.ts` |
| 빌드 검증 | ✅ | `next build` 성공 |
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

## 6. Next Plan (우선순위, 다음 세션이 그대로 집을 수 있게)

### N1. 분석 정확도 — fixture 기반 통합 테스트 추가 *(우선)*

- `web/src/lib/analyzer/__tests__/fixtures/` 에 실제 랜딩 HTML 2~3개 (저작권 안전 — 짧은 발췌만) 저장.
- `report.test.ts` 작성: `parseLanding(html)` → 갭/FOMO/가격이 기대 범위 안인지.
- 가격 추출에서 “여러 가격 표기” 시 **메인 가격(가장 큰 KRW 또는 ‘정가/얼리버드’ 라벨 인접)** 선택 로직 추가.

### N2. UI 다듬기

- `Hero`에 캐치프레이즈 라인 모션(red→green 전환 강조).
- 결과 영역에 **빈 상태/오류 상태** 카피 통일.
- 모바일 폭에서 `lg:grid-cols-[360px_1fr]` 깨지는 케이스 점검.
- 다크모드(시스템 prefers-color-scheme) 옵션 — 옵션이며 v0.2.

### N3. 확장 패키징

- `extension/icons/icon-{16,48,128}.png` 실제 아이콘 추가.
- `popup.html`에 “API 자동 검색” 버튼 (배포 후 기본 URL 자동 채움).
- 빌드 시 `manifest.json`의 `host_permissions`에 배포 도메인을 추가하는 옵션 (현재는 비어 있음 — 의도적).

### N4. 배포 (Vercel)

- `vercel.json` 또는 Vercel 프로젝트 연결 (web 워크스페이스 한정).
- 환경변수: 현재 없음. 추가 시 `.env.example` 작성.
- 배포 후 확장 `popup.html`의 placeholder 기본값을 그 URL로 업데이트.

### N5. v0.2 기능 (이번 세션 범위 밖)

- LLM 후처리 옵션 (Anthropic Claude Haiku/Sonnet) — “FOMO 근거” 자연어화, “갭 요약” 1줄.
- 가격대별 가중치 정책 명문화 (`docs/policy-price-weighting.md`).
- 사용자 피드백 채널 (이슈 템플릿 + 신고 폼).
- 법무 메모: ToS/저작권 중립 카피 검수 (`docs/legal-notes.md` 초안).

### N6. 측정/지표 (스펙 1-pager §성공 지표)

- `report` 응답 시 익명 카운터(가벼운 KV) 추가 — 베타 한정.
  - 첫 가치 도달률, 대안 링크 클릭률(클라이언트 측 이벤트).
- Mixpanel/PostHog 후보 — 플랫폼 결정 후 적용.

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
