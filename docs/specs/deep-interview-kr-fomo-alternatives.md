# Deep Interview Spec: 낚시줄끊기 — FOMO 강의 랜딩 → 중립 분석·대안 신호 (KR)

## Metadata

- Interview ID: `di-kr-fomo-alternatives-001`
- **제품명:** 낚시줄끊기
- **캐치프레이즈:** 팔랑귀 팔랑귀 (that's red-red) / FOMO에 흔들리기 (that's red-red) / 급한 척 급한 척 (that's red-red) / 낚시줄 끊기 green green
- Rounds: 4
- Final Ambiguity Score: **19.6%**
- Type: **greenfield**
- Generated: 2026-04-29
- Threshold: 0.2 (20%)
- Initial Context Summarized: no
- Status: **PASSED** (ambiguity ≤ threshold)

## Clarity Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.84 | 0.40 | 0.336 |
| Constraint Clarity | 0.79 | 0.30 | 0.237 |
| Success Criteria | 0.77 | 0.30 | 0.231 |
| **Total Clarity** | | | **0.804** |
| **Ambiguity** | | | **0.196** |

## Goal

**낚시줄끊기**는 한국어 맥락에서 **FOMO·고가·과대 마케팅**으로 불안을 조성하는 **강의/부트캠프 랜딩**을, 유저가 **직접 URL을 붙여넣어** 시작하는 **온보딩 웹(B)** 과 이후 **브라우저 확장(A)** 으로 다루며, **마케팅 주장 vs 실제로 배울 내용의 갭**, **FOMO를 부추기는 문장의 분리**, **가격대에 따른 용어·커리큘럼 풀이 및 무료/저가 학습 루트(유튜브·인프런·아티클 등)** 를 **신호**로 제시한다. **구매 여부는 항상 유저의 판단**에 두고, 제품은 **판사·일방적 ‘쓰레기’ 단정** 역할을 최소화한다. 브랜드 메시지는 *팔랑귀 팔랑귀 (that's red-red) → … → 낚시줄 끊기 green green* 라인으로 **red(낚시·압박)** 와 **green(끊고 판단)** 을 구분해 전달한다.

## Constraints

- **온보딩(B):** 단독 웹에서 유저가 **URL을 붙여넣음** → 해당 URL **콘텐츠를 불러와** **사이드 패널 형태**로 강의/랜딩 정보를 분석·표시.
- **확장(A):** B에서 효용을 느낀 뒤 도입; 구체적 권한 범위(탭 읽기 등)는 구현 단계에서 명세하되, **배치 전략은 B → A**.
- **데이터·자동화:** 최소한 **유저가 제공한 URL** 기반 페치가 전제; 페이월·로그인 필요 페이지·저작권·이용약관 준수는 구현·법무에서 별도 정리.
- **제품 태도:** **신호 중심**(갭, FOMO 문장, 대안 링크); **최종 결정권은 유저**.

## Non-Goals

- 특정 강사·플랫폼을 **비방하거나** 법적 판단을 대신하는 것.
- **무단**으로 유료 강의 본문·영상을 크롤링·재배포하는 것.
- “항상 무료가 정답”이라는 **일방적 결론**을 시스템이 내리는 것.

## Acceptance Criteria

- [ ] 온보딩 웹에서 **유효한 공개 URL** 붙여넣기 후, **사이드 패널**에 분석 결과가 표시된다.
- [ ] **마케팅 주장**과 **커리큘럼/학습 범위**를 구분해 **갭**을 사용자가 이해할 수 있는 형태로 보여준다.
- [ ] **FOMO를 조장하는 표현**을 별도 구역/목록으로 **분리**하고, **왜 FOMO에 해당하는지** 짧은 근거와 함께 **중립적 톤**으로 정리한다.
- [ ] **가격(또는 가격대)** 입력·추출이 가능할 때, **고가**일수록 **용어/커리큘럼 풀이**와 **무료·저가 대체 학습 경로** 추천 비중이 높아지는 **정책**이 반영된다(규칙 또는 모델; 구현 시 문서화).
- [ ] 대안으로 **유튜브·인프런(또는 유사)·아티클** 등 **외부 링크**를 제시할 수 있다.
- [ ] UI/카피 어딘가에 **“참고용 신호이며 구매 결정은 본인 책임”**에 준하는 **면책·중립** 문구가 있다.

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 제품이 한 가지 채널이면 된다 | Round 1: 터치포인트 | **B(단독 웹) + A(확장)** , **B로 효용 → A** 순서. |
| 자동 스크래핑 범위가 자명하다 | Round 2: 데이터 경계 | **온보딩 URL 붙여넣기 → 해당 URL 로드 → 사이드 패널 분석**으로 **유저 개시 페치**에 맞춤. |
| “쓸만하다”가 한 가지 지표다 | Round 3: 첫 방문 성공 | **가격 의존**, **갭 분석은 기본**, **FOMO 문장 분리·해소**, 비싼 경우 **저가·무료 루트** 강화. |
| 비싼 강의는 항상 대체 가능하다 | Round 4: Contrarian | **신호만**, **구매는 유저** — 유료의 비콘텐츠 가치 가능성을 **제품이 단정하지 않음**. |

## Technical Context

- **Greenfield:** 기존 단일 레포에 묶이지 않음. 데스크톱 워크스페이스에는 참고용 소스 트리가 다수 있으나 본 스펙 범위의 수정 대상으로 지정되지 않음.
- 권장 스택·인프라는 **omc-plan / 구현 단계**에서 결정.

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|-----------------|
| Learner (A) | core domain | FOMO, price hesitation, paste URL | uses OnboardingWeb; receives AnalysisPanel signals |
| LandingPage | external system | marketing copy, curriculum hints, price | fetched from pasted URL; input to AnalysisPanel |
| Product (낚시줄끊기) | core domain | B then A, neutral signals policy | hosts OnboardingWeb; ships extension |
| OnboardingWeb | supporting | URL input, page load | opens AnalysisPanel |
| AnalysisPanel | supporting | side panel, FOMO extraction, claim vs substance gap, tiered routes, signals not verdicts | suggests AlternativeContent |
| AlternativeContent | supporting | YouTube, Inflearn, articles, free/low-cost | optional paths for learner |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|-----------------|
| 1 | 4 | 4 | — | — | — |
| 2 | 6 | 2 | 0 | 4 | 67% |
| 3 | 6 | 0 | 0 | 6 | 100% |
| 4 | 6 | 0 | 0 | 6 | 100% |

## Interview Transcript

<details>
<summary>Full Q&A (4 rounds)</summary>

### Round 1

**Q:** 제품이 유저에게 닿는 형태(확장/단독/커뮤니티/혼합)?

**A:** B로 효용을 느끼게 한 뒤 A로 — A와 B 둘 다.

**Ambiguity:** 53.6% (Goal 0.62, Constraints 0.32, Criteria 0.40)

### Round 2

**Q:** 대안 생성 시 강의/랜딩 입력의 자동화·수집 경계?

**A:** 온보딩 단독 웹에 URL 붙여넣기 → URL 내용 로드 → 사이드 패널에서 강의 정보 분석.

**Ambiguity:** 39.1% (Goal 0.75, Constraints 0.58, Criteria 0.45)

### Round 3

**Q:** URL 입력 후 사이드 패널 분석을 본 뒤 ‘쓸만하다’의 첫 기준?

**A:** 가격에 따라 기준 변화. 비싸면 용어·커리큘럼 풀이와 저가·무료 루트. 마케팅 vs 실제 배움 갭은 기본. FOMO 조장 문장은 따로 발라내 FOMO 해소.

**Ambiguity:** 26.4% (Goal 0.82, Constraints 0.62, Criteria 0.74)

### Round 4 (Contrarian)

**Q:** 비싼 강의가 코호트·책임 등 콘텐츠 밖 가치가 핵심일 수 있음 — 제품 태도?

**A:** 신호만 제시(갭·FOMO 문장·대안 링크), 살지 말지는 항상 유저 판단. 제품은 판사 역할 최소화.

**Ambiguity:** 19.6% (Goal 0.84, Constraints 0.79, Criteria 0.77)

</details>
