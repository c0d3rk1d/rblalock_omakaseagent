// Re-subsets the self-hosted fonts to the site's current charset.
// Run from site/: node fonts/update-fonts.mjs
// Needed whenever index.html or styles.css gains characters the current
// subsets lack (a missing glyph renders in the fallback font).

import { readFileSync, writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const FAMILIES = [
  ["RocknRoll One", "rocknroll-one", "wght@400"],
  ["Shippori Mincho", "shippori-mincho", "wght@400;700"],
  ["JetBrains Mono", "jetbrains-mono", "wght@400"],
];

const chars = new Set(readFileSync("index.html", "utf8") + readFileSync("styles.css", "utf8"));
for (let i = 32; i < 127; i++) chars.add(String.fromCharCode(i));
const text = [...chars].filter((c) => c.charCodeAt(0) >= 32).sort().join("");

for (const [name, slug, axis] of FAMILIES) {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:${axis}` +
    `&text=${encodeURIComponent(text)}&display=swap`;
  const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
  for (const [, body] of css.matchAll(/@font-face\s*{([^}]+)}/g)) {
    const weight = body.match(/font-weight:\s*(\d+)/)[1];
    const src = body.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/)[1];
    const buf = Buffer.from(await (await fetch(src, { headers: { "User-Agent": UA } })).arrayBuffer());
    const file = `fonts/${slug}-${weight}.woff2`;
    writeFileSync(file, buf);
    console.log(`${file}  ${(buf.length / 1024).toFixed(1)} KB  (${text.length} chars requested)`);
  }
}
