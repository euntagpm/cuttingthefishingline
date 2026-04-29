import { GoogleGenAI } from "@google/genai";
import type { LlmAnalyzeResult, LlmProvider } from "./types";
import { loadSystemPrompt } from "./prompts/load";

const apiKey = process.env.GOOGLE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MAX_TEXT = 30_000;

function clip(s: string | null | undefined): string {
  if (!s) return "";
  return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT) : s;
}

function stripCodeFence(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
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

    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      contents: JSON.stringify(payload),
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

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
