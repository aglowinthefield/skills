#!/usr/bin/env node
// Screenshot every screen in every mode and viewport.
// Usage: capture.mjs <screens.json> <out-dir>
// Writes <out-dir>/<screen>--<mode>--<viewport>.png
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, playwright, shotName } from './lib.mjs';

const [configPath, outDir] = process.argv.slice(2);
if (!configPath || !outDir) {
  console.error('usage: capture.mjs <screens.json> <out-dir>');
  process.exit(2);
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const viewports = config.viewports ?? [{ name: 'desktop', width: 1440, height: 900 }];
const modes = config.modes ?? { dark: { colorScheme: 'dark' }, light: { colorScheme: 'light' } };
mkdirSync(outDir, { recursive: true });

const browser = await playwright().chromium.launch({ executablePath: chromium() });
let failed = 0;
try {
  for (const [mode, m] of Object.entries(modes)) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: m.colorScheme ?? mode,
        reducedMotion: 'reduce',
        deviceScaleFactor: config.deviceScaleFactor ?? 1,
      });
      // `init` runs before the app's own scripts, e.g. to set a theme in localStorage.
      if (m.init) await context.addInitScript(m.init);
      const page = await context.newPage();
      for (const screen of config.screens) {
        if (screen.viewports && !screen.viewports.includes(vp.name)) continue;
        try {
          await page.goto(new URL(screen.path ?? '/', config.baseUrl).href, { waitUntil: 'networkidle' });
          if (screen.waitFor) await page.waitForSelector(screen.waitFor, { timeout: 15000 });
          // `setup` puts the screen into the state under audit: open a dialog, select a card.
          if (screen.setup) await page.evaluate(screen.setup);
          if (screen.after) await page.waitForSelector(screen.after, { timeout: 15000 });
          await page.evaluate(() => document.fonts?.ready);
          const file = join(outDir, shotName(screen.name, mode, vp.name));
          await page.screenshot({ path: file, fullPage: screen.fullPage ?? false });
          console.log(file);
        } catch (e) {
          failed++;
          console.error(`${screen.name} ${mode} ${vp.name}: ${e.message.split('\n')[0]}`);
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
