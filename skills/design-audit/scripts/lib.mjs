// Shared helpers: Playwright outside any repo, and a Chromium to drive.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DEPS = join(homedir(), '.cache/design-audit');

export function playwright() {
  // Prefer the repo's own Playwright, then a copy cached outside any repo.
  for (const base of [join(process.cwd(), 'package.json'), join(DEPS, 'package.json')]) {
    try {
      return createRequire(base)('playwright-core');
    } catch {}
    try {
      return createRequire(base)('playwright');
    } catch {}
  }
  mkdirSync(DEPS, { recursive: true });
  if (!existsSync(join(DEPS, 'package.json'))) writeFileSync(join(DEPS, 'package.json'), '{"private":true}\n');
  console.error(`installing playwright-core into ${DEPS}`);
  execSync('npm i --silent --no-audit --no-fund playwright-core@1', { cwd: DEPS, stdio: 'inherit' });
  return createRequire(join(DEPS, 'package.json'))('playwright-core');
}

export function chromium() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const pw of [join(homedir(), '.cache/ms-playwright'), join(homedir(), 'Library/Caches/ms-playwright')]) {
    if (!existsSync(pw)) continue;
    const dirs = readdirSync(pw)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const d of dirs) {
      for (const p of [
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      ])
        if (existsSync(join(pw, d, p))) return join(pw, d, p);
    }
  }
  for (const p of [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
  ])
    if (existsSync(p)) return p;
  throw new Error('no Chromium found: run `npx playwright install chromium` or set CHROME');
}

export const shotName = (screen, mode, viewport) => `${screen}--${mode}--${viewport}.png`;
