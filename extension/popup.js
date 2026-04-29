const $ = (id) => document.getElementById(id);

chrome.storage.sync.get(["apiBase"], ({ apiBase }) => {
  if (apiBase) $("api").value = apiBase;
});

$("api").addEventListener("change", (e) => {
  chrome.storage.sync.set({ apiBase: e.target.value.trim() });
});

$("open").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.sidePanel.setOptions({ tabId: tab.id, path: "side_panel.html", enabled: true });
  await chrome.sidePanel.open({ tabId: tab.id });
  window.close();
});
