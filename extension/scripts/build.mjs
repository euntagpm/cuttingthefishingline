#!/usr/bin/env node
// Lightweight "build" — copies static files to extension/dist for `Load unpacked`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "dist");

const FILES = [
  "manifest.json",
  "popup.html", "popup.js",
  "side_panel.html", "side_panel.css", "side_panel.js",
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of FILES) {
  fs.copyFileSync(path.join(root, f), path.join(out, f));
}
const iconsSrc = path.join(root, "icons");
const iconsDst = path.join(out, "icons");
if (fs.existsSync(iconsSrc)) {
  fs.mkdirSync(iconsDst, { recursive: true });
  for (const f of fs.readdirSync(iconsSrc)) fs.copyFileSync(path.join(iconsSrc, f), path.join(iconsDst, f));
}
console.log(`Built extension → ${out}`);
