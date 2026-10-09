#!/usr/bin/env node
// Fails (exit 1) if any src/**/*.{ts,tsx} file contains Russian-only Cyrillic letters.
// Serbian Cyrillic never uses ы э ъ ё щ й — their presence means a copy error.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const FORBIDDEN = /[ыэъёщйЫЭЪЁЩЙ]/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const problems = [];
for (const file of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const found = line.match(FORBIDDEN);
    if (found) problems.push(`${relative(ROOT, file)}:${i + 1}  [${[...new Set(found)].join('')}]  ${line.trim().slice(0, 100)}`);
  });
}

if (problems.length) {
  console.error(`✗ Russian-only letters found (${problems.length}):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('✓ check:copy — no Russian-only letters in src/');
