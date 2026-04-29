import type { LlmProvider, LlmProviderName } from "./types";
import { mockProvider } from "./mock";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";
import { googleProvider } from "./google";

export { SYSTEM_PROMPT_PATH } from "./prompts/load";
export type { LlmProvider, LlmProviderName, LlmAnalyzeInput, LlmAnalyzeResult } from "./types";

export function getLlmProvider(): LlmProvider {
  const requested = (process.env.LLM_PROVIDER ?? "mock") as LlmProviderName;
  if (requested === "anthropic" && process.env.ANTHROPIC_API_KEY) return anthropicProvider;
  if (requested === "openai" && process.env.OPENAI_API_KEY) return openaiProvider;
  if (requested === "google" && process.env.GOOGLE_API_KEY) return googleProvider;
  return mockProvider;
}
