// Builds dist/index.html (one self-contained page) from src/. Zero dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = f => readFileSync(join(root, 'src', f), 'utf8');
const dist = join(root, 'dist');

const dark = src('theme-dark.txt').trim();
const css = src('styles.css').replace('/*DARK*/',
  `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}\n:root[data-theme="dark"]{${dark}}`);

const core = src('core.js').replace(/\nif \(typeof module[^\n]*\n?/, '\n');
const order = ['seed.js', 'ui1.js', 'ui2.js', 'ui3.js', 'ui4.js', 'modals.js', 'main.js'];
const js = [core, ...order.map(src)].join('\n');
if (/<\/script/i.test(js)) throw new Error('A source file contains "</script", which would break the inlined page.');
new Function(js); // syntax check before shipping

const title = 'Alstr: find hackathon teammates';
const desc = 'Alstr helps college students find hackathon teammates, with a Builder Score that shows exactly how it is calculated. Interactive demo.';
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#F1F2F6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1124" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="app"><main class="wrap page"><p>Loading Alstr…</p></main></div>
<noscript><p style="padding:24px;font:16px system-ui">Alstr needs JavaScript to run.</p></noscript>
<div id="modal-root"></div>
<div id="toast-root" class="toasts" aria-live="polite"></div>
<script>
${js}
</script>
</body>
</html>
`;
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'index.html'), page);
if (existsSync(join(root, 'public'))) cpSync(join(root, 'public'), dist, { recursive: true });
console.log(`Built dist/index.html (${(Buffer.byteLength(page) / 1024).toFixed(0)} KB)`);
