#!/usr/bin/env node
/**
 * Evidence Strip Screenshot Generator
 *
 * Captures screenshots of key pages for the homepage evidence strip.
 * Requires: npm install playwright (or npx playwright install chromium)
 *
 * Usage:
 *   node _ops/screenshots/shot.mjs                          # All pages (production)
 *   node _ops/screenshots/shot.mjs --base http://localhost:4000  # Local dev
 *   node _ops/screenshots/shot.mjs --url /cie0580/free/     # Single page
 */

import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const OUTPUT_DIR = resolve(ROOT, 'assets/evidence');

const PAGES = [
  { path: '/cie0580/free/',     filename: 'free-packs.webp',     label: 'Free Packs' },
  { path: '/kahoot/',           filename: 'kahoot-hub.webp',     label: 'Kahoot Hub' },
  { path: '/subscription.html', filename: 'term-pass.webp',      label: 'Term Pass' },
];

const VIEWPORT = { width: 1280, height: 800 };
const QUALITY = 80;

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = getArg(args, '--base') || 'https://www.25maths.com';
  const singleUrl = getArg(args, '--url');

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const pages = singleUrl
    ? PAGES.filter(p => p.path === singleUrl || p.path.startsWith(singleUrl))
    : PAGES;

  if (pages.length === 0) {
    console.error(`No matching page for: ${singleUrl}`);
    console.error('Available:', PAGES.map(p => p.path).join(', '));
    process.exit(1);
  }

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output:   ${OUTPUT_DIR}`);
  console.log(`Pages:    ${pages.length}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT });

  for (const page of pages) {
    const url = `${baseUrl}${page.path}`;
    const outPath = resolve(OUTPUT_DIR, page.filename);

    console.log(`  Capturing ${page.label} → ${page.filename}`);

    const tab = await context.newPage();
    try {
      await tab.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Extra settle time for lazy-loaded content
      await tab.waitForTimeout(500);
      await tab.screenshot({
        path: outPath,
        type: 'png', // Playwright doesn't support webp natively; convert after
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
      });
      console.log(`    ✓ saved`);
    } catch (err) {
      console.error(`    ✗ failed: ${err.message}`);
    } finally {
      await tab.close();
    }
  }

  await browser.close();

  console.log(`\nDone. Screenshots saved to ${OUTPUT_DIR}`);
  console.log('Note: Playwright outputs PNG. Convert to WebP with:');
  console.log('  for f in assets/evidence/*.png; do cwebp -q 80 "$f" -o "${f%.png}.webp" && rm "$f"; done');
}

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
