import { readFile } from "node:fs/promises";
import path from "node:path";

export const SYSTEM_PROMPT_PATH = "src/lib/analyzer/llm/prompts/system-ko.md";

export async function loadSystemPrompt(): Promise<string> {
  const abs = path.join(process.cwd(), SYSTEM_PROMPT_PATH);
  return readFile(abs, "utf8");
}
