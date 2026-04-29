# 낚시줄끊기 — Teddy 핸드오프

> 다음 개발자/에이전트가 이 문서 하나만 읽고 곧바로 이어받을 수 있도록 정리한 문서.
> **마지막 업데이트:** 2026-04-29
> **저장소:** https://github.com/euntagpm/cuttingthefishingline (PRIVATE)
> **최근 PR:** [#1 N1 통과](https://github.com/euntagpm/cuttingthefishingline/pull/1) · [#2 / ↔ /analysis 라우트 분리](https://github.com/euntagpm/cuttingthefishingline/pull/2) · [#3 LLM provider 추상화 + Google Gemini · 리포트 4개 항목 확장](https://github.com/euntagpm/cuttingthefishingline/pull/3)

---

## 0. 부트스트랩 (5줄)

```bash
cd /Users/song-euntaeg/Desktop/cuttingthefishingline
git checkout main && git pull --ff-only
npm install                               # 처음이라면
cp web/.env.example web/.env.local        # 키 안 채워도 mock 으로 동작
npm --workspace web run dev               # http://localhost:3000
```

브라우저에서 `http://localhost:3000` 의 입력란에 강의 URL을 붙여 넣고 클릭하면 자동으로 `/analysis?url=...` 로 이동해 좌측 iframe + 우측 분석 패널이 뜬다. 테스트 URL:

```
https://weolbu.com/product/5063
```

기대 동작:
- **좌측**: 입력 URL이 iframe 으로 즉시 표시 (weolbu 는 X-Frame-Options 차단이 정상이며, 헤더의 "새 탭으로 열기" 링크가 폴백).
- **우측**: 잠깐의 분석 중 스켈레톤 → 8블록 패널(키워드 → 가격 → 커리큘럼 → 갭 → FOMO 문장 → FOMO 키워드 → 용어 → 대안). 키가 없으면 mock 응답이며 상단에 노란 안내 띠로 시스템 프롬프트 파일 경로가 표시된다.

CLI 검증:
```bash
curl -sS -X POST http://localhost:3000/api/analyze \
  -H 'content-type: application/json' \
  -d '{"url":"https://weolbu.com/product/5063"}' \
  | jq '.report.meta, .report.keywords, (.report.gap.curriculumItems|length), (.report.fomoKeywords|length)'
```

---

## 1. 한 줄 요약

`/` 에서 URL 입력 → `/analysis?url=...` 로 라우팅 → **좌 iframe + 우 LLM 분석 패널**. 분석은 LLM provider 추상화로 처리되며 (mock / anthropic / openai / google), 키가 없으면 자동으로 **mock provider** 로 폴백한다. 분석 톤·기준은 단일 시스템 프롬프트 파일에서 관리.

## 2. 무엇이 어디에서 들어왔는가 (작업 출처)

| 영역 | 어떤 PR | 상태 |
|---|---|---|
| 분석기 N1 통과 (휴리스틱 fomo/price/glossary/alternatives/gap, weolbu 픽스처) | #1 | merged |
| `/` 홈 ↔ `/analysis` 라우트 분리, 좌/우 iframe 풀스크린 split UI | #2 | merged |
| LLM provider 추상화 (`mock`/`anthropic`/`openai`/`google`), Google Gemini 실 호출, 시스템 프롬프트 SSOT, 리포트 4개 항목 확장 (keywords·커리큘럼 블록·FOMO 키워드 사전·meta), env 자리, mock 안내 띠 | #3 | review 중 |

본 핸드오프는 #3 머지 시점을 기준으로 작성됐다.

## 3. 페이지 구조

- **`/` ([web/src/app/page.tsx](web/src/app/page.tsx))** — Hero + UrlForm. 제출 시 `router.push('/analysis?url=...')`.
- **`/analysis` ([web/src/app/analysis/page.tsx](web/src/app/analysis/page.tsx))** — 풀스크린 split. 좌측 iframe + 우측 SidePanel. `useSearchParams` 로 url 받아 `/api/analyze` 호출.

## 4. 분석 라이브러리 — LLM provider 추상화

```
web/src/lib/analyzer/
├─ types.ts                                # AnalysisReport (+ keywords, fomoKeywords, meta)
├─ report.ts                               # buildReport: fetch → parse → provider.analyze
├─ keywords.ts                             # mock 모드용 키워드 추출 휴리스틱 (빈도 기반)
├─ fomoKeywords.ts                         # mock 모드용 한국어 FOMO 어휘 사전 매칭 (6 카테고리)
├─ {fetch,parse,fomo,price,glossary,alternatives,gap}.ts  # 기존 N1 휴리스틱
└─ llm/
   ├─ index.ts                             # getLlmProvider() 팩토리 (env 기반)
   ├─ types.ts                             # LlmProvider 인터페이스, LlmAnalyzeInput/Result
   ├─ mock.ts                              # 휴리스틱 재사용 (키 없을 때 자동 폴백)
   ├─ anthropic.ts                         # TODO 스텁 (SDK 호출 자리)
   ├─ openai.ts                            # TODO 스텁 (SDK 호출 자리)
   ├─ google.ts                            # ★ 실 구현됨 (@google/genai 사용)
   └─ prompts/
      ├─ system-ko.md                      # ★ 분석 프롬프트 SSOT (수정은 여기만)
      └─ load.ts                           # fs.readFile 로 매 요청마다 로딩
```

`buildReport(url)` 흐름:
1. `fetchPage(url)` → HTML 다운로드.
2. `parseLanding(html)` → title/description/text/fullText/marketingClaims/curriculumItems/jsonLd 추출.
3. `getLlmProvider().analyze(input)` → mock 이면 휴리스틱 모듈 그대로 호출, 실 LLM 이면 system-ko.md + JSON 모드.
4. `meta = { provider, systemPromptPath }` 부착해서 반환.

## 5. 우측 패널 — 8블록 순서

키워드 → 가격 → 커리큘럼 전체 → 갭(마케팅·관찰) → FOMO 문장 → FOMO 키워드 → 용어 → 대안.

신규 블록 ([web/src/components/blocks/](web/src/components/blocks)):
- **KeywordsBlock**: 강의를 한 줄로 설명하는 키워드 10개 (칩).
- **CurriculumBlock**: 커리큘럼 항목 전체 (번호 매김).
- **FomoKeywordsBlock**: FOMO 어휘를 6 카테고리(money / urgency / transformation / loss-aversion / social-proof / fear) 색으로 구분, count 와 원문 단편 표시. LLM 응답이 카테고리를 파이프 결합("money|transformation")으로 보내면 첫 토큰만 채택하는 폴백 포함.

기존 블록 (그대로): GapBlock(커리큘럼 항목은 신규 CurriculumBlock 으로 분리됨), FomoBlock, PriceBlock, TermsBlock, AlternativesBlock.

[SidePanel](web/src/components/SidePanel.tsx) 상단에 `report.meta.provider === "mock"` 일 때 노란 안내 띠로 시스템 프롬프트 파일 경로 노출.

## 6. LLM provider 전환

`web/.env.local` 의 `LLM_PROVIDER` 와 키 유무로 자동 라우팅:
- `LLM_PROVIDER=mock` 또는 키 없음 → mock provider (휴리스틱).
- `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` → [llm/anthropic.ts](web/src/lib/analyzer/llm/anthropic.ts) (스텁 — SDK 호출 채워야 동작).
- `LLM_PROVIDER=openai` + `OPENAI_API_KEY` → [llm/openai.ts](web/src/lib/analyzer/llm/openai.ts) (스텁 — SDK 호출 채워야 동작).
- `LLM_PROVIDER=google` + `GOOGLE_API_KEY` → [llm/google.ts](web/src/lib/analyzer/llm/google.ts) (**실 구현 완료** — `@google/genai` 의 `models.generateContent`, `responseMimeType: "application/json"`, temperature 0.2, JSON.parse 실패 시 코드펜스 한 번 벗기고 재시도).

env 자리는 [web/.env.example](web/.env.example). `.env.local` 은 `.gitignore` 의 `.env*` + `!.env.example` 규칙으로 자동 차단.

### mock vs Google Gemini 응답 비교 (weolbu/product/5063)

| 영역 | mock | google (Gemini 2.5 Flash) |
|---|---|---|
| keywords | 재테크/ETF/기초반/만드는/방법/투자/투자로/돈이/만들기/고민이라면 | 재테크/월급관리/ETF/부동산 투자/세금/연말정산/대출/통장 쪼개기/주식 투자/절세계좌 |
| 커리큘럼 | 28개 | 28개 |
| 가격 | 400,000원 (mid) | 400,000원 (mid) |
| FOMO 문장 | 패턴 라벨만 | 자연어 reason 포함 |
| FOMO 키워드 | 사전 정규식 8종 | LLM 자체 추출 (1억/10억/3년 안에 등, 단일 카테고리) |
| 용어 풀이 | 0 | 10 |

## 7. 분석 톤·기준을 바꾸려면

**[web/src/lib/analyzer/llm/prompts/system-ko.md](web/src/lib/analyzer/llm/prompts/system-ko.md) 한 파일만 수정.**

출력 JSON 스키마(keywords/gap/fomo/fomoKeywords/price/tier/terms/alternatives), 추출 규칙, 카테고리 정의, 톤·금기를 모두 담고 있다. dev 서버 재시작 없이 다음 요청부터 즉시 반영(매 요청마다 fs로 다시 읽음). mock provider 는 이 파일을 호출하지 않지만 응답 `meta.systemPromptPath` 에 경로가 항상 노출되므로 사용자가 어디를 고쳐야 할지 알 수 있다.

## 8. 다음 단계 후보

- [ ] `llm/anthropic.ts` / `llm/openai.ts` 의 SDK 호출 채우기 — `@google/genai` 와 동일 패턴: 시스템 프롬프트 주입 + JSON 모드 + JSON.parse + 코드펜스 폴백.
- [ ] LLM 응답을 zod 로 검증해 스키마 깨지면 mock 으로 안전 폴백.
- [ ] iframe 차단 사이트 (weolbu 포함) 용 서버측 페이지 미리보기(스크린샷/프록시) — Playwright 후보.
- [ ] 익스텐션(`extension/**`) 을 동일 분석 흐름에 맞춰 갱신 (현재는 손대지 않음).
- [ ] mock 휴리스틱 키워드 추출의 불용어 사전 보강 ("만드는", "방법", "투자로" 같은 일반 동사·결합형 제거).

## 9. 알려진 제약

- **iframe 임베드 차단**: weolbu 등은 X-Frame-Options/CSP `frame-ancestors` 로 임베드를 거부한다. 클라이언트에서 우회 불가능. 헤더 "새 탭으로 열기" 가 폴백.
- **rate-limit 인-메모리**: 기존 그대로. 배포 시 외부 스토어 필요.
- **dev 서버와 production build 충돌**: dev 서버가 떠 있는 동안 `npm run build` 를 돌리면 `.next` 안에 dev 청크와 prod 청크가 섞여 webpack runtime 이 청크 해시를 못 찾는 상태가 된다. 빌드 검증 시엔 dev 서버를 끄고 `rm -rf web/.next` 후 빌드.

## 10. 검증 명령

```bash
# 단위 테스트 (회귀 확인)
npm --workspace web run test            # 4 files / 15 tests passing 기대

# 빌드 (타입체크 포함)
npm --workspace web run build           # 5 routes: /, /_not-found, /analysis, /api/analyze

# 라이브 점검
npm --workspace web run dev
curl -sS -X POST http://localhost:3000/api/analyze \
  -H 'content-type: application/json' \
  -d '{"url":"https://weolbu.com/product/5063"}' | jq '.report.meta'
# → { "provider": "mock" } (키 없을 때) 또는 "google" (있을 때)
```

## 11. 비목표 (변경 금지)

- 특정 강사·플랫폼 비방, 법적 자문 대행 — 금지.
- 페이월/로그인 뒤 콘텐츠 무단 수집 — 금지.
- "무료가 항상 정답" 결론 — 금지.
- 결정권은 항상 유저 — UI 면책 카피 항시 노출.

## 12. 커밋 컨벤션

- prefix: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- 본문: 한국어 OK. **변경 "무엇"보다 "왜"** 위주.
- 트레일러: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
