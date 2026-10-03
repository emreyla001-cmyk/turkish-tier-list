// Script to add missing aria-label attributes to all button elements in the codebase
// Uses jscodeshift (npm i -D jscodeshift) to transform JSX files.

const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('**/*.{js,jsx,tsx,ts}', {
  cwd: process.cwd(),
  ignore: ['node_modules/**', 'dist/**', 'build/**']
});

files.forEach((relativePath)=> {
  const absPath = path.resolve(process.cwd(), relativePath);
  const source = readFileSync(absPath, 'utf8');
  // Simple regex approach: find <button ... aria-label="without aria-label
  const buttonRegex = /]*?)>([\s\S]*?)/gi;
  let transformed = source;
  let match;
  while ((match = buttonRegex.exec(source)) !== null) {
    const full = match[0];
    const attrs = match[1];
    const inner = match[2];
    if (/aria-label\s*=/.test(attrs)) continue; // already has aria-label
    // Derive label from inner text (strip tags and whitespace)
    const derived = inner.replace(/]+>/g, '').trim();
    const label = derived || 'button';
    const newAttrs = attrs + ` aria-label="${label}"`;
    const replacement = `${inner}"> without aria-label
  const buttonRegex = /<button([^>]*?)>([\s\S]*?)<\/button>/gi;
  let transformed = source;
  let match;
  while ((match = buttonRegex.exec(source)) !== null) {
    const full = match[0];
    const attrs = match[1];
    const inner = match[2];
    if (/aria-label\s*=/.test(attrs)) continue; // already has aria-label
    // Derive label from inner text (strip tags and whitespace)
    const derived = inner.replace(/<[^>]+>/g, '').trim();
    const label = derived || 'button';
    const newAttrs = attrs + ` aria-label="${label}"`;
    const replacement = `<button${newAttrs}>${inner}</button>`;
    transformed = transformed.replace(full, replacement);
  }
  if (transformed !== source) {
    writeFileSync(absPath, transformed, 'utf8');
    console.log('Updated', relativePath);
  }
});

console.log('Ariaâ€‘label enrichment completed');



