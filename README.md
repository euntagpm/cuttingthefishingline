# 낚시줄끊기 (cuttingthefishingline)

> 팔랑귀 팔랑귀 (that's red-red) · FOMO에 흔들리기 (that's red-red) · 급한 척 급한 척 (that's red-red) · **낚시줄 끊기 green green**

고가·FOMO 마케팅이 심한 **강의/부트캠프 랜딩 URL**을 유저가 직접 붙여넣으면, **마케팅 vs 실제 학습 범위**의 갭, **FOMO 문장 분리**, **용어 풀이**, **무료·저가 대안 루트**(유튜브·인프런·아티클)를 **중립 신호**로 보여 줍니다. **구매 결정은 항상 유저**가 합니다.

## 핵심 원칙

- **신호만 제공.** 갭, FOMO 문장, 대안 링크. 일방적 “쓰레기” 단정·비방 금지.
- **유저 개시 데이터.** 유저가 붙여넣은 URL만 페치합니다. 페이월·로그인 뒤 콘텐츠 무단 크롤·재배포는 비목표.
- **결정권은 유저.** UI 어디서나 “참고용 신호이며 구매 결정은 본인 책임” 면책을 표시합니다.

## 모노레포 구조

```
web/        — 온보딩 웹 (Next.js 15, App Router) — URL 붙여넣기 → 사이드 패널
extension/  — 브라우저 확장 (Chrome MV3) — 활성 탭 URL 분석 (B → A 연속 경로)
docs/specs/ — SSOT 스펙 (PRD + 1-pager + 딥 인터뷰)
```

## 실행

```bash
# 1) web 개발 서버
npm install
npm run dev               # http://localhost:3000

# 2) 빌드/시작
npm run build && npm start

# 3) 확장 (개발자 모드 로드)
npm run ext:build
# Chrome → 확장 프로그램 → 개발자 모드 → '압축해제된 확장 프로그램 로드' → extension/dist
```

## 배치 전략

**B(웹) → A(확장).** 먼저 단독 웹에서 효용·신뢰를 쌓은 뒤, 동일 패턴을 일상 탐색에 잇는 확장 프로그램으로 확장합니다.

## 면책

본 도구는 공개 URL의 텍스트·메타에서 추출한 **참고용 신호**를 제공합니다. 특정 강사·플랫폼을 비방하거나 법적 판단을 대체하지 않습니다. 구매 결정은 본인 책임입니다.

## 스펙 (SSOT)

- [PRD + Working Backward + 1-Pager](docs/specs/prd-fomo-landing-insight-1pager.md)
- [딥 인터뷰](docs/specs/deep-interview-kr-fomo-alternatives.md)
