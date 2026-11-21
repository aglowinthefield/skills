#!/usr/bin/env node
// Check a vault note (Markdown) or a vault-report source (HTML) before it lands.
//   1. Visual budget: every ## section that runs past the word budget with no
//      diagram or image is flagged; text inside a collapsed callout is not counted. A section can opt out with
//      `%% text-only: <reason> %%` (Markdown) or `<!-- text-only: <reason> -->` (HTML).
//   2. Wide tables: table cells over the cell budget are prose in disguise.
//   3. Diagrams: each ```mermaid block (Markdown only) is rendered by the running
//      Obsidian app, so parse errors show exactly as the reader would see them.
// Exit 1 on any error or budget hit. Usage:
//   check-note.mjs <file> [--words 150] [--cell 20] [--vault <name>] [--no-render]

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : args[i + 1];
};
const file = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.match(/^--(words|cell|vault)$/));
if (!file) {
  console.error("usage: check-note.mjs <note.md|report.html> [--words 150] [--cell 20] [--vault <name>] [--no-render]");
  process.exit(2);
}
const WORDS = Number(opt("words", 150));
const CELL = Number(opt("cell", 20));
const vaultPath = process.env.DEV_VAULT || `${process.env.HOME}/Documents/somewhere.garden`;
const VAULT = opt("vault", basename(vaultPath));
const isHtml = /\.html?$/i.test(file);
const src = readFileSync(file, "utf8");
const problems = [];
const words = (s) => (s.match(/[A-Za-z0-9][\w'’.-]*/g) || []).length;

// ---- split into ## sections, keeping start lines ----
function sectionsMd(text) {
  const lines = text.split("\n");
  const out = [];
  let cur = { title: "(top)", line: 1, body: [] };
  let fence = false;
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) fence = !fence;
    if (!fence && /^##\s/.test(l)) {
      out.push(cur);
      cur = { title: l.replace(/^#+\s*/, ""), line: i + 1, body: [] };
    } else cur.body.push(l);
  });
  out.push(cur);
  return out.map((s) => {
    const body = s.body.join("\n");
    const visual = /```mermaid|!\[|<svg|<img|%%\s*text-only:/m.test(body);
    // Collapsed callouts (> [!info]- ...) hold detail the reader opens on purpose,
    // so their text is not counted. Open callouts count like any other prose.
    let folded = false;
    const prose = body
      .replace(/^---[\s\S]*?^---/m, "") // frontmatter
      .replace(/```[\s\S]*?```/g, "")
      .split("\n")
      .filter((l) => {
        if (!/^\s*>/.test(l)) { folded = false; return !/^\s*\|/.test(l) && !/^#/.test(l); }
        if (/^\s*>\s*\[![^\]]+\]-/.test(l)) folded = true;
        return !folded;
      })
      .map((l) => l.replace(/^\s*>\s*(\[![^\]]+\][+-]?)?/, ""))
      .join(" ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    return { ...s, visual, words: words(prose) };
  });
}

function sectionsHtml(text) {
  const main = text.match(/<main[\s\S]*<\/main>/i)?.[0] ?? text;
  const parts = main.split(/(?=<h2[\s>])/i);
  return parts.map((p, i) => {
    const title = p.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "(top)";
    const line = text.slice(0, text.indexOf(p)).split("\n").length;
    const visual = /class="[^"]*mermaid|<svg|<img|<!--\s*text-only:/i.test(p);
    const prose = p
      .replace(/<(pre|script|style|svg|table|details)[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]+>/g, " ");
    return { title, line, visual, words: words(prose) };
  });
}

const secs = isHtml ? sectionsHtml(src) : sectionsMd(src);
for (const s of secs) {
  if (s.words > WORDS && !s.visual) {
    problems.push(`line ${s.line}: section "${s.title}" has ${s.words} words of prose and no diagram or image (budget ${WORDS})`);
  }
}

// ---- table cells ----
if (isHtml) {
  for (const m of src.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)) {
    const n = words(m[1].replace(/<[^>]+>/g, " "));
    if (n > CELL) problems.push(`line ${src.slice(0, m.index).split("\n").length}: table cell has ${n} words (budget ${CELL}); move it to prose or a callout`);
  }
} else {
  src.split("\n").forEach((l, i) => {
    if (!/^\s*\|/.test(l)) return;
    for (const cell of l.split("|")) {
      const n = words(cell.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"));
      if (n > CELL) problems.push(`line ${i + 1}: table cell has ${n} words (budget ${CELL}); move it to prose or a callout`);
    }
  });
}

// ---- diagrams already rendered to SVG (vault-report output) ----
if (!isHtml) {
  for (const m of src.matchAll(/<svg[^>]*viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/g)) {
    const [w, h] = [Number(m[1]), Number(m[2])];
    const line = src.slice(0, m.index).split("\n").length;
    if (w > 1100) problems.push(`line ${line}: rendered diagram is ${Math.round(w)}px wide and its text will shrink in a pane; split it or switch LR to TB`);
    else if (h > 1400) problems.push(`line ${line}: rendered diagram is ${Math.round(h)}px tall; split it`);
  }
}

// ---- render mermaid in Obsidian ----
const blocks = [];
if (!isHtml) {
  const re = /^```mermaid\n([\s\S]*?)^```/gm;
  for (const m of src.matchAll(re)) blocks.push({ line: src.slice(0, m.index).split("\n").length, code: m[1] });
}
let rendered = "skipped";
if (blocks.length && !args.includes("--no-render")) {
  const cli = process.env.OBSIDIAN_CLI || "/Applications/Obsidian.app/Contents/MacOS/obsidian-cli";
  const js = `(async()=>{
    const leaf=app.workspace.getLeavesOfType('markdown')[0];
    if(!leaf) return JSON.stringify({error:'open any markdown note in Obsidian first'});
    let R=null,p=Object.getPrototypeOf(leaf.view.previewMode);
    while(p&&!R){ if(typeof p.constructor?.render==='function') R=p.constructor; p=Object.getPrototypeOf(p); }
    const out=[];
    for(const code of ${JSON.stringify(blocks.map((b) => b.code))}){
      const el=document.createElement('div'); el.className='markdown-rendered'; document.body.appendChild(el);
      try{
        await R.render(app,'\`\`\`mermaid\\n'+code+'\`\`\`',el,'check.md',leaf.view);
        for(let i=0;i<40&&!el.querySelector('svg')&&!/error/i.test(el.textContent);i++) await new Promise(r=>setTimeout(r,100));
        const svg=el.querySelector('svg');
        const err=!svg||svg.getAttribute('aria-roledescription')==='error'||/parse error|syntax error/i.test(el.textContent);
        const vb=svg?.viewBox?.baseVal;
        out.push(err?{error:el.textContent.slice(0,300)||'no svg'}:{w:Math.round(vb?.width||0),h:Math.round(vb?.height||0)});
      }catch(e){ out.push({error:String(e.message||e)}) }
      el.remove();
    }
    return JSON.stringify(out);
  })()`;
  try {
    const raw = execFileSync(cli, [`vault=${VAULT}`, "eval", `code=${js}`], { encoding: "utf8", timeout: 60000 });
    const json = raw.replace(/^=>\s*/, "").trim();
    const res = JSON.parse(json);
    if (res.error) throw new Error(res.error);
    res.forEach((r, i) => {
      const b = blocks[i];
      if (r.error) problems.push(`line ${b.line}: mermaid block does not render: ${r.error.replace(/\s+/g, " ")}`);
      else if (r.w > 1100) problems.push(`line ${b.line}: diagram is ${r.w}px wide and will shrink in a pane; split it or switch LR to TB`);
      else if (r.h > 1400) problems.push(`line ${b.line}: diagram is ${r.h}px tall; split it`);
    });
    rendered = `${blocks.length} rendered in Obsidian`;
  } catch (e) {
    rendered = `not rendered (${String(e.message).split("\n")[0]}); run with Obsidian open, or check with npx -y @mermaid-js/mermaid-cli`;
  }
}

const visuals = secs.filter((s) => s.visual).length;
console.log(`${file}: ${secs.length} sections, ${visuals} with a visual, ${blocks.length} mermaid blocks (${rendered})`);
for (const p of problems) console.log(`  ${p}`);
process.exit(problems.length ? 1 : 0);
