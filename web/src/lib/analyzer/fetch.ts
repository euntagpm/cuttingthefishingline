const UA =
  "Mozilla/5.0 (compatible; cuttingthefishingline/0.1; +https://github.com/euntagpm/cuttingthefishingline) user-initiated";

export async function fetchPage(url: string, timeoutMs = 8000): Promise<{ html: string; finalUrl: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "ko,en;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml/i.test(ct)) throw new Error("HTML이 아닙니다.");
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 2_500_000) throw new Error("페이지가 너무 큽니다.");
    return { html: new TextDecoder("utf-8", { fatal: false }).decode(buf), finalUrl: res.url || url };
  } finally {
    clearTimeout(t);
  }
}
