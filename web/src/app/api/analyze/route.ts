import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildReport } from "@/lib/analyzer/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ url: z.string().url().max(2048) });

const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20;
const WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > LIMIT;
}

function err(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) return err(429, "rate_limited", "잠시 후 다시 시도해 주세요.");

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return err(400, "bad_request", "URL이 올바르지 않습니다.");
  }
  let u: URL;
  try { u = new URL(parsed.url); } catch { return err(400, "bad_url", "URL이 올바르지 않습니다."); }
  if (!/^https?:$/.test(u.protocol)) return err(400, "bad_protocol", "http/https URL만 지원합니다.");
  if (/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0)/.test(u.hostname)) {
    return err(400, "blocked_host", "내부 호스트는 분석할 수 없습니다.");
  }

  try {
    const report = await buildReport(u.toString());
    return NextResponse.json({ report });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "분석 실패";
    return err(502, "fetch_failed", msg);
  }
}
