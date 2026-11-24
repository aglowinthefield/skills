#!/usr/bin/env node
// WCAG contrast ratio between colour pairs.
// Usage: contrast.mjs <fg> <bg> [<fg> <bg> ...]   e.g. contrast.mjs '#8b919a' '#1a1d21'
const hex = (h) => {
  const s = h.replace("#", "");
  const full = s.length === 3 ? [...s].map((c) => c + c).join("") : s;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`not a hex colour: ${h}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
};
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2) {
  console.error("usage: contrast.mjs <fg> <bg> [<fg> <bg> ...]");
  process.exit(2);
}
for (let i = 0; i < args.length; i += 2) {
  let r;
  try {
    r = ratio(args[i], args[i + 1]);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  const meets = [["body 7", 7], ["secondary 4.5", 4.5], ["mark 3", 3], ["border 1.5", 1.5]]
    .filter(([, min]) => r >= min).map(([n]) => n);
  console.log(`${args[i]} on ${args[i + 1]}: ${r.toFixed(2)}:1  meets: ${meets.join(", ") || "none"}`);
}
