import { describe, it, expect } from "vitest";
import { isRetryableLlmError } from "../llm/google";

describe("isRetryableLlmError", () => {
  it.each([
    '{"error":{"code":503,"status":"UNAVAILABLE","message":"high demand"}}',
    '{"error":{"code":429,"status":"RESOURCE_EXHAUSTED"}}',
    "Service is currently experiencing high demand",
    "model overloaded, please try again",
    "UNAVAILABLE: backend timeout",
  ])("재시도 대상으로 판정: %s", (msg) => {
    expect(isRetryableLlmError(new Error(msg))).toBe(true);
  });

  it.each([
    "GOOGLE_API_KEY not set",
    '{"error":{"code":400,"status":"INVALID_ARGUMENT"}}',
    '{"error":{"code":401,"status":"UNAUTHENTICATED"}}',
    '{"error":{"code":403,"status":"PERMISSION_DENIED"}}',
    "Unexpected token in JSON at position 0",
    "google provider: empty response",
  ])("재시도 대상 아님: %s", (msg) => {
    expect(isRetryableLlmError(new Error(msg))).toBe(false);
  });

  it("undefined / null 입력은 재시도 대상 아님", () => {
    expect(isRetryableLlmError(undefined)).toBe(false);
    expect(isRetryableLlmError(null)).toBe(false);
  });
});
