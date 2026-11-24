#!/usr/bin/env node
// Serve the before/after review page for an audit and record the keep/drop choices.
// Usage: compare.mjs <audit-dir> [--port 4870]
// Reads <audit-dir>/findings.json and <audit-dir>/shots/<state>/*.png.
// Finding N is compared against the state before it: `base` for the first, the previous finding after that.
// Saving writes <audit-dir>/choices.json: { kept: [id], dropped: [id], notes: { id: text } }.
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const args = process.argv.slice(2);
const dir = resolve(args.find((a) => !a.startsWith('--')) ?? '.design-audit');
const portArg = args.indexOf('--port');
const port = portArg >= 0 ? Number(args[portArg + 1]) : 4870;
const findingsPath = join(dir, 'findings.json');
if (!existsSync(findingsPath)) {
  console.error(`no findings.json in ${dir}`);
  process.exit(2);
}

function model() {
  const audit = JSON.parse(readFileSync(findingsPath, 'utf8'));
  const choices = existsSync(join(dir, 'choices.json')) ? JSON.parse(readFileSync(join(dir, 'choices.json'), 'utf8')) : {};
  let before = 'base';
  const findings = audit.findings.map((f) => {
    const afterDir = join(dir, 'shots', f.id);
    const shots = existsSync(afterDir) ? readdirSync(afterDir).filter((n) => n.endsWith('.png')).sort() : [];
    const pairs = shots
      .filter((n) => !f.screens || f.screens.some((s) => n.startsWith(`${s}--`)))
      .map((n) => {
        const [screen, mode, viewport] = n.replace(/\.png$/, '').split('--');
        return { screen, mode, viewport, before: `shots/${before}/${n}`, after: `shots/${f.id}/${n}` };
      });
    const out = { ...f, before, pairs, keep: !(choices.dropped ?? []).includes(f.id), note: choices.notes?.[f.id] ?? '' };
    before = f.id;
    return out;
  });
  return { ...audit, findings };
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function page(m) {
  const cards = m.findings
    .map(
      (f, i) => `
<section class="finding" data-id="${esc(f.id)}">
  <header>
    <label class="keep"><input type="checkbox" ${f.keep ? 'checked' : ''}> Keep</label>
    <h2>${i + 1}. ${esc(f.title)}</h2>
    <p class="meta">${esc(f.rule)}${f.commit ? ` · <code>${esc(f.commit.slice(0, 7))}</code>` : ''}</p>
  </header>
  ${f.why ? `<p class="why">${esc(f.why)}</p>` : ''}
  ${
    f.pairs.length
      ? f.pairs
          .map(
            (p) => `
  <figure class="pair" data-mode="${esc(p.mode)}" data-viewport="${esc(p.viewport)}">
    <figcaption>${esc(p.screen)} · ${esc(p.mode)} · ${esc(p.viewport)}</figcaption>
    <div class="stage">
      <img class="before" src="${esc(p.before)}" alt="before">
      <img class="after" src="${esc(p.after)}" alt="after">
      <input class="slider" type="range" min="0" max="100" value="50" aria-label="Reveal after">
    </div>
  </figure>`,
          )
          .join('')
      : '<p class="none">No screenshots: this finding changes no rendered screen.</p>'
  }
  <textarea placeholder="Note for the agent (optional)">${esc(f.note)}</textarea>
</section>`,
    )
    .join('');
  const modes = [...new Set(m.findings.flatMap((f) => f.pairs.map((p) => p.mode)))];
  const viewports = [...new Set(m.findings.flatMap((f) => f.pairs.map((p) => p.viewport)))];
  const radios = (name, values) =>
    values.map((v, i) => `<label><input type="radio" name="${name}" value="${esc(v)}" ${i ? '' : 'checked'}> ${esc(v)}</label>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Design audit: ${esc(m.repo)}</title>
<style>
:root { color-scheme: dark; --bg:#1a1d21; --surface:#22262b; --border:#3d424a; --text:#f0efeb; --muted:#8b919a; --accent:#d4ccb4; }
@media (prefers-color-scheme: light) { :root { color-scheme: light; --bg:#f0efeb; --surface:#ffffff; --border:#b8b5b0; --text:#1a1d21; --muted:#5f5c58; --accent:#554b36; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:14px/1.45 Inter, ui-sans-serif, system-ui, sans-serif; }
.bar { position:sticky; top:0; z-index:2; display:flex; flex-wrap:wrap; gap:16px; align-items:center; padding:10px 20px; background:var(--surface); border-bottom:1px solid var(--border); }
.bar h1 { font-size:14px; font-weight:600; margin:0 12px 0 0; }
.bar fieldset { border:0; margin:0; padding:0; display:flex; gap:10px; color:var(--muted); }
.bar button { margin-left:auto; font:inherit; padding:5px 12px; border-radius:4px; border:1px solid var(--border); background:var(--accent); color:var(--bg); cursor:pointer; }
#status { color:var(--muted); }
main { max-width:1600px; margin:0 auto; padding:16px 20px 64px; }
.finding { border-top:1px solid var(--border); padding:16px 0; }
.finding:first-child { border-top:0; }
.finding header { display:flex; flex-wrap:wrap; gap:4px 14px; align-items:baseline; }
.finding h2 { font-size:15px; font-weight:600; margin:0; }
.meta, .why, .none, figcaption { color:var(--muted); margin:4px 0; }
.meta code { font:12px ui-monospace, SFMono-Regular, Menlo, monospace; }
.finding:has(.keep input:not(:checked)) .pair { opacity:.45; }
.pair { margin:10px 0; }
.pair[hidden] { display:none; }
.stage { position:relative; display:grid; border:1px solid var(--border); }
.stage img { display:block; width:100%; height:auto; grid-area:1/1; }
.slider { display:none; }
body[data-view="side"] .stage { grid-template-columns:1fr 1fr; gap:8px; border:0; }
body[data-view="side"] .stage .after { grid-area:1/2; }
body[data-view="side"] .stage img { outline:1px solid var(--border); }
body[data-view="side"] figcaption::after { content:" · before left, after right"; }
body[data-view="slider"] figcaption::after { content:" · before left of the handle, after right"; }
body[data-view="diff"] figcaption::after { content:" · black where nothing changed"; }
body[data-view="slider"] .stage .after { clip-path: inset(0 0 0 var(--cut, 50%)); }
body[data-view="slider"] .slider { display:block; position:absolute; inset:auto 0 8px; width:100%; }
body[data-view="diff"] .stage .after { mix-blend-mode:difference; }
textarea { width:100%; min-height:2.4em; margin-top:8px; font:inherit; color:inherit; background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:6px 8px; }
</style></head>
<body data-view="side">
<div class="bar">
  <h1>Design audit: ${esc(m.repo)}</h1>
  <fieldset>View ${radios('view', ['side', 'slider', 'diff'])}</fieldset>
  ${modes.length > 1 ? `<fieldset>Mode ${radios('mode', modes)}</fieldset>` : ''}
  ${viewports.length > 1 ? `<fieldset>Size ${radios('viewport', viewports)}</fieldset>` : ''}
  <span id="status"></span>
  <button id="save">Save choices</button>
</div>
<main>${cards}</main>
<script>
const pick = (n) => document.querySelector('input[name="' + n + '"]:checked')?.value;
function apply() {
  document.body.dataset.view = pick('view');
  const mode = pick('mode'), vp = pick('viewport');
  document.querySelectorAll('.pair').forEach((p) => {
    p.hidden = (mode && p.dataset.mode !== mode) || (vp && p.dataset.viewport !== vp);
  });
}
document.querySelectorAll('.bar input').forEach((i) => i.addEventListener('change', apply));
document.querySelectorAll('.slider').forEach((s) => s.addEventListener('input', () => s.parentElement.style.setProperty('--cut', s.value + '%')));
document.getElementById('save').addEventListener('click', async () => {
  const kept = [], dropped = [], notes = {};
  document.querySelectorAll('.finding').forEach((f) => {
    (f.querySelector('.keep input').checked ? kept : dropped).push(f.dataset.id);
    const t = f.querySelector('textarea').value.trim();
    if (t) notes[f.dataset.id] = t;
  });
  const r = await fetch('choices', { method: 'POST', body: JSON.stringify({ kept, dropped, notes }) });
  document.getElementById('status').textContent = r.ok ? 'Saved ' + kept.length + ' kept, ' + dropped.length + ' dropped. Tell the agent you are done.' : 'Save failed';
});
apply();
</script></body></html>`;
}

const types = { '.png': 'image/png', '.json': 'application/json' };
createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/choices') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const c = JSON.parse(body);
        writeFileSync(join(dir, 'choices.json'), JSON.stringify({ ...c, savedAt: new Date().toISOString() }, null, 2) + '\n');
        res.writeHead(204).end();
      } catch {
        res.writeHead(400).end('bad json');
      }
    });
    return;
  }
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page(model()));
    return;
  }
  const file = normalize(join(dir, decodeURIComponent(url.pathname)));
  if (!file.startsWith(dir + '/') || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/`));
