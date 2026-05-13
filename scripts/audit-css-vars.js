#!/usr/bin/env node
/**
 * CSS variable completeness audit for [slug].astro
 *
 * Finds every var(--x) reference in the profile page CSS and checks
 * that --x is defined somewhere in the same file's CSS blocks.
 * Catches bugs like --text-on-brand being referenced but never defined.
 *
 * Usage: node scripts/audit-css-vars.js
 * Exit code 1 if any undefined vars are found.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const FILES_TO_CHECK = [
  'src/pages/[slug].astro',
  'src/pages/landing.astro',
  'src/pages/find.astro',
  'src/pages/join.astro',
  'src/pages/for-trainers.astro',
  'src/pages/pricing.astro',
];

// Variables defined globally in Base.astro :root — always available
const BASE_VARS = new Set([
  '--brand', '--brand-dim', '--brand-border',
  '--bg', '--surface', '--surface-2', '--surface-3',
  '--border', '--border-hover',
  '--text', '--text-2', '--text-3', '--text-muted',
  '--green', '--green-dim', '--green-border',
  '--red', '--radius', '--radius-lg', '--shadow', '--transition',
  '--reps',
]);

let hasErrors = false;

for (const relPath of FILES_TO_CHECK) {
  const filePath = resolve(ROOT, relPath);
  let src;
  try {
    src = readFileSync(filePath, 'utf8');
  } catch {
    continue;
  }

  // Collect all var(--x) references
  const referenced = new Set();
  for (const m of src.matchAll(/var\((--[\w-]+)/g)) {
    referenced.add(m[1]);
  }

  // Collect all --x: definitions in this file
  const defined = new Set(BASE_VARS);
  for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) {
    defined.add(m[1]);
  }

  // Find referenced but never defined
  const missing = [...referenced].filter(v => !defined.has(v));

  if (missing.length > 0) {
    console.error(`\n❌  ${relPath}`);
    for (const v of missing) {
      console.error(`    ${v}  — referenced but not defined in this file or Base.astro`);
    }
    hasErrors = true;
  } else {
    console.log(`✅  ${relPath}`);
  }
}

if (hasErrors) {
  console.error('\nFix undefined CSS variables before deploying.\n');
  process.exit(1);
} else {
  console.log('\nAll CSS variables accounted for.\n');
}
