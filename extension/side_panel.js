const TIER_LABEL = {
  unknown: "가격 미검출",
  low: "저가대 — 부담이 작아 빠른 시도가 합리적",
  mid: "중가대 — 무료/저가 루트와 병행 비교 권장",
  high: "고가대 — 용어·커리큘럼 풀이 + 무료 루트 비중 확대",
};
const ICON = { youtube: "▶", inflearn: "🎓", google: "🔎", article: "📄" };

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));

async function getActiveUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? null;
}

async function getApiBase() {
  const { apiBase } = await chrome.storage.sync.get(["apiBase"]);
  return apiBase || "http://localhost:3000";
}

function render(report) {
  $("url").textContent = report.source.url;
  $("disclaimer").textContent = report.disclaimer;
  const root = $("root");
  root.innerHTML = "";

  const gap = document.createElement("section");
  gap.innerHTML = `
    <h2>갭 — 마케팅 vs 커리큘럼</h2>
    <div class="cols">
      <ul>${report.gap.marketingClaims.map((c) => `<li class="gap-m">${esc(c)}</li>`).join("") || `<li class="muted">추출된 항목이 없습니다.</li>`}</ul>
      <ul>${report.gap.curriculumItems.map((c) => `<li class="gap-c">${esc(c)}</li>`).join("") || `<li class="muted">표면에 없습니다.</li>`}</ul>
    </div>
  `;
  root.appendChild(gap);

  const fomo = document.createElement("section");
  fomo.className = "fomo";
  fomo.innerHTML = `
    <h2>FOMO 문장 — red red</h2>
    <ul>${report.fomo.length === 0 ? `<li class="muted">감지된 FOMO 표현이 없습니다.</li>` :
      report.fomo.map((f) => `<li class="fomo">“${esc(f.sentence)}”<div class="reason">근거: ${esc(f.reason)}</div></li>`).join("")}</ul>
  `;
  root.appendChild(fomo);

  const price = document.createElement("section");
  price.innerHTML = `
    <h2>가격대</h2>
    <div class="price">${report.price.raw ? esc(report.price.raw) : `<span class="muted">검출되지 않음</span>`}</div>
    <div class="tier">${esc(TIER_LABEL[report.tier])}</div>
  `;
  root.appendChild(price);

  if (report.terms.length) {
    const terms = document.createElement("section");
    terms.innerHTML = `<h2>용어 풀이</h2>` +
      report.terms.map((t) => `<div><strong>${esc(t.term)}</strong><div class="muted" style="font-size:11px">${esc(t.plain)}</div></div>`).join("");
    root.appendChild(terms);
  }

  const alt = document.createElement("section");
  alt.className = "alt";
  alt.innerHTML = `<h2>대안 루트 — green green</h2>` +
    report.alternatives.map((a) =>
      `<div style="margin-bottom:6px"><a href="${esc(a.url)}" target="_blank" rel="noreferrer">${ICON[a.source] || "·"} ${esc(a.label)}</a><p>${esc(a.rationale)}</p></div>`
    ).join("");
  root.appendChild(alt);
}

function showError(msg) {
  $("root").innerHTML = `<p class="error">${esc(msg)}</p><p class="muted">팝업에서 API 주소를 설정했는지 확인하세요.</p>`;
}

(async function main() {
  const url = await getActiveUrl();
  if (!url || !/^https?:/.test(url)) { showError("이 탭은 분석할 수 없는 URL입니다."); return; }
  $("url").textContent = url;
  const api = await getApiBase();
  try {
    const res = await fetch(`${api.replace(/\/$/, "")}/api/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
    render(data.report);
  } catch (e) {
    showError(e instanceof Error ? e.message : "분석 실패");
  }
})();
