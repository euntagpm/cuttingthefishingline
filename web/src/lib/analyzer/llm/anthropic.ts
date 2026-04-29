import type { LlmProvider } from "./types";
import { loadSystemPrompt } from "./prompts/load";

export const anthropicProvider: LlmProvider = {
  name: "anthropic",
  async analyze(_input) {
    // 시스템 프롬프트는 web/src/lib/analyzer/llm/prompts/system-ko.md 에서 읽는다.
    // SDK 호출은 키를 넣은 다음 단계에서 채운다.
    void loadSystemPrompt;
    throw new Error(
      "anthropic provider not yet implemented. Set LLM_PROVIDER=mock or implement messages.create here.",
    );
  },
};
