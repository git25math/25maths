#!/usr/bin/env node
/**
 * Fix nested ${$...$}$ patterns and ${...}$ with inner $ signs.
 * These are the most dangerous broken patterns — they create
 * multiple accidental LaTeX pairs.
 */

const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '_data', 'exercises');

let totalFixes = 0;
let filesModified = 0;

function fixNestedDollar(s) {
  if (!s) return s;
  let result = s;

  // Fix 1: ${$CONTENT$}$ → $CONTENT$
  // e.g. "${$x > 3$}$" → "$x > 3$"
  // e.g. "${$(-3)^2$ - 2(-3)(4)}$" → "$(-3)^2 - 2(-3)(4)$"
  result = result.replace(/\$\{\$([^$]+)\$([^}]*)\}\$/g, (match, inner, extra) => {
    if (extra.trim()) {
      // Has content after the inner $...$: merge into one $...$
      return `$${inner}${extra}$`;
    }
    return `$${inner}$`;
  });

  // Fix 2: ${CONTENT with $VAR$ inside}$ → $CONTENT with VAR inside$
  // e.g. "${tan($\theta$) = 8/12}$" → "$\\tan(\\theta) = 8/12$"
  // This is trickier — need to remove inner $ pairs within ${...}$
  result = result.replace(/\$\{([^}]*\$[^}]*)\}\$/g, (match, content) => {
    // Remove all inner $ signs (they're nested)
    const cleaned = content.replace(/\$/g, '');
    return `$${cleaned}$`;
  });

  // Fix 3: Remaining ${...}$ where content has no backslash → remove braces
  // e.g. "${x}$" → "$x$", "${x < 5}$" → "$x < 5$"
  // Only if content is short and math-like
  result = result.replace(/\$\{([^}]{1,50})\}\$/g, (match, content) => {
    // If content contains backslash, it may be legitimate LaTeX grouping
    // But ${...}$ with braces right after $ is almost never needed
    return `$${content}$`;
  });

  return result;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filepath = path.join(DIR, file);
  const original = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(original);
  let fileChanged = false;
  let fileFixes = 0;

  for (const q of data.questions || []) {
    for (const field of ['questionText', 'explanation']) {
      if (!q[field]) continue;
      const before = q[field];
      const after = fixNestedDollar(before);
      if (after !== before) {
        q[field] = after;
        fileChanged = true;
        fileFixes++;
      }
    }
    if (Array.isArray(q.options)) {
      for (let i = 0; i < q.options.length; i++) {
        const before = q.options[i];
        const after = fixNestedDollar(before);
        if (after !== before) {
          q.options[i] = after;
          fileChanged = true;
          fileFixes++;
        }
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
    filesModified++;
    totalFixes += fileFixes;
    console.log(`  ${fileFixes.toString().padStart(3)} fixes — ${file}`);
  }
}

console.log(`\n=== Nested Fix Report ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total fixes: ${totalFixes}`);
