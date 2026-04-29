import type { LlmProvider } from "./types";
import { loadSystemPrompt } from "./prompts/load";

export const openaiProvider: LlmProvider = {
  name: "openai",
  async analyze(_input) {
    void loadSystemPrompt;
    throw new Error(
      "openai provider not yet implemented. Set LLM_PROVIDER=mock or implement chat.completions.create here.",
    );
  },
};
