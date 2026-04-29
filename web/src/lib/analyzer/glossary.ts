import type { GlossaryItem } from "./types";

const DICT: Record<string, string> = {
  "코호트": "정해진 기간에 같은 진도로 함께 학습하는 그룹제 운영. 멘토링·피드백·동료 효과가 핵심 가치.",
  "MLOps": "머신러닝 모델을 배포·운영·재학습까지 잇는 엔지니어링 영역.",
  "MVP": "Minimum Viable Product — 최소 기능 제품. 가장 작게 만들어 학습하기 위한 단위.",
  "PMF": "Product–Market Fit — 제품이 특정 시장에서 충분히 매력적이라는 신호.",
  "RAG": "Retrieval-Augmented Generation — 외부 지식을 검색해 LLM 답변을 보완하는 방식.",
  "프롬프트 엔지니어링": "LLM에게 맥락·제약·예시를 설계해 원하는 출력을 끌어내는 기법.",
  "사이드프로젝트": "본업 외에 만들어 보며 학습·포트폴리오·검증을 동시에 노리는 작은 제품.",
  "포트폴리오": "본인 역량을 보여주는 결과물 모음. 채용·이직에서 신뢰 신호로 작동.",
  "프론트엔드": "사용자가 직접 보는 화면(웹/앱)을 만드는 영역.",
  "백엔드": "서버·DB·API 등 화면 뒤의 시스템을 만드는 영역.",
  "데브옵스": "개발과 운영을 잇는 자동화·인프라 실천.",
  "데이터 엔지니어링": "데이터 수집·적재·가공 파이프라인을 만드는 영역.",
  "그로스해킹": "데이터·실험으로 사용자/매출 성장을 빠르게 검증·확장하는 접근.",
  "토이프로젝트": "학습용으로 가볍게 만드는 작은 프로젝트.",
  "리팩토링": "동작은 유지하며 코드 구조를 개선하는 작업.",
  "테스트 주도 개발": "실패 테스트 → 구현 → 리팩토링 사이클을 반복하는 개발 방식.",
  "CI/CD": "코드 변경을 자동으로 빌드·테스트·배포로 이어주는 파이프라인.",
};

export function detectTerms(text: string): GlossaryItem[] {
  const out: GlossaryItem[] = [];
  const seen = new Set<string>();
  for (const term of Object.keys(DICT)) {
    if (text.includes(term) && !seen.has(term)) {
      seen.add(term);
      out.push({ term, plain: DICT[term]! });
    }
    if (out.length >= 12) break;
  }
  return out;
}
