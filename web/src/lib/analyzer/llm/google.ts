import { GoogleGenAI } from "@google/genai";
import type { LlmAnalyzeResult, LlmProvider } from "./types";
import { loadSystemPrompt } from "./prompts/load";

const apiKey = process.env.GOOGLE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MAX_TEXT = 30_000;
const RETRY_DELAYS_MS = [500, 1500] as const;

function clip(s: string | null | undefined): string {
  if (!s) return "";
  return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT) : s;
}

function stripCodeFence(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

/**
 * Gemini 의 일시적 5xx/quota 에러를 재시도 대상으로 식별.
 * 잘못된 입력(400)·권한(401/403) 같은 영구 에러는 제외해 빠르게 surface.
 */
export function isRetryableLlmError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return /("code"\s*:\s*(429|503))|UNAVAILABLE|RESOURCE_EXHAUSTED|high\s*demand|overloaded/i.test(msg);
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === RETRY_DELAYS_MS.length || !isRetryableLlmError(e)) throw e;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[i]));
    }
  }
  throw lastErr;
}

export const googleProvider: LlmProvider = {
  name: "google",
  async analyze(input): Promise<LlmAnalyzeResult> {
    if (!ai) throw new Error("GOOGLE_API_KEY not set");

    const system = await loadSystemPrompt();
    const payload = {
      url: input.url,
      finalUrl: input.finalUrl,
      title: input.title,
      description: input.description,
      primaryText: clip(input.primaryText),
      fullText: clip(input.fullText),
      marketingClaims: input.marketingClaims,
      curriculumItems: input.curriculumItems,
      jsonLd: input.jsonLd,
    };

    const res = await withRetry(() =>
      ai.models.generateContent({
        model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
        contents: JSON.stringify(payload),
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    );

    const text = (res.text ?? "").trim();
    if (!text) throw new Error("google provider: empty response");

    let parsed: LlmAnalyzeResult;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = JSON.parse(stripCodeFence(text));
    }
    return parsed;
  },
};
