#!/usr/bin/env node
/**
 * Fix broken LaTeX patterns in exercise JSON files.
 *
 * Category 1: "${N...}$M" merge artifacts — revert to "$N...$M" (currency)
 * Category 2: Missing closing $ on math expressions
 * Category 3: Fragmented LaTeX (e.g. -$\frac{6}{2}$ → $-\frac{6}{2}$)
 */

const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '_data', 'exercises');

let totalFixes = 0;
let filesModified = 0;

// ─── Specific file fixes (manually verified) ───
const SPECIFIC_FIXES = {
  // File → [ { qi, field, old, new }, ... ]

  'cie0580-algebra-c2-c2-05-equations.json': [
    {
      qi: 9, field: 'explanation',
      old: 'Expand the brackets to get $5n - 10 = 2n + 8. Move the terms to get $3n = 18$. Divide by 3 to find $n = 6$.',
      new: 'Expand the brackets to get $5n - 10 = 2n + 8$. Move the terms to get $3n = 18$. Divide by 3 to find $n = 6$.'
    }
  ],

  'cie0580-coordinate-c3-c3-06-parallel-lines.json': [
    {
      qi: 7, field: 'explanation',
      old: 'The gradient of line L is 0.5. Using y - y₁ = m(x - x₁), we get y - 1 = 0.5(x - 6). This simplifies to $y - 1 = 0.5x - 3, and then $y = 0.$5x - 2.',
      new: 'The gradient of line L is 0.5. Using $y - y_1 = m(x - x_1)$, we get $y - 1 = 0.5(x - 6)$. This simplifies to $y - 1 = 0.5x - 3$, and then $y = 0.5x - 2$.'
    }
  ],

  'cie0580-coordinate-e3-e3-05-equations-of-linear-graphs.json': [
    {
      qi: 2, field: 'explanation',
      find: true // will be handled by reading actual content
    },
    {
      qi: 3, field: 'explanation',
      find: true
    },
    {
      qi: 4, field: 'explanation',
      find: true
    },
    {
      qi: 11, field: 'explanation',
      find: true
    }
  ],

  'cie0580-geometry-e4-e4-08-circle-theorems-ii.json': [
    {
      qi: 3, field: 'explanation',
      find: true
    }
  ],

  'edexcel-4ma1-equations-f2-f2-06-simultaneous-linear-equations.json': [
    {
      qi: 5, field: 'explanation',
      find: true
    }
  ],

  'edexcel-4ma1-equations-h2-h2-04-linear-equations.json': [
    {
      qi: 3, field: 'explanation',
      find: true
    },
    {
      qi: 10, field: 'explanation',
      find: true
    }
  ]
};

// ─── Generic fix: revert ${DIGIT...}$ currency merge artifacts ───
function fixCurrencyMergeArtifacts(s) {
  if (!s) return s;
  let result = s;

  // Pattern: ${DIGITS text}$DIGITS → $DIGITS text$DIGITS
  // Match ${...}$ where content starts with a digit and has no backslash
  result = result.replace(/\$\{(\d[^}]*?)\}\$/g, (match, content) => {
    // Only revert if content has no LaTeX commands (no backslash)
    if (/\\/.test(content)) return match;
    return '$' + content + '$';
  });

  // Pattern: (${DIGITS) → ($DIGITS)
  // e.g. "(${18) is 75%" → "($18) is 75%"
  result = result.replace(/\(\$\{(\d[\d.,]*)\)/g, '($$$1)');

  // Pattern: }$DIGITS (stray } before currency)
  // Only fix if preceded by something that's not a LaTeX command
  // e.g. "= }$63" → "= $63"
  result = result.replace(/([^\\])\}\$(\d)/g, '$1$$$2');

  // Pattern: }\\frac{ (stray } before LaTeX frac — from broken merge)
  // e.g. "}\\frac{72}{80}$" — the } at start is wrong
  result = result.replace(/([^\\])\}\\\\frac\{/g, '$1$\\\\frac{');

  return result;
}

// ─── Main ───
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filepath = path.join(DIR, file);
  const original = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(original);
  let fileChanged = false;
  let fileFixes = 0;

  for (let qi = 0; qi < (data.questions || []).length; qi++) {
    const q = data.questions[qi];

    // Process text fields
    for (const field of ['questionText', 'explanation']) {
      if (!q[field]) continue;
      const before = q[field];
      const after = fixCurrencyMergeArtifacts(before);
      if (after !== before) {
        q[field] = after;
        fileChanged = true;
        fileFixes++;
      }
    }

    // Process options
    if (Array.isArray(q.options)) {
      for (let i = 0; i < q.options.length; i++) {
        const before = q.options[i];
        const after = fixCurrencyMergeArtifacts(before);
        if (after !== before) {
          q.options[i] = after;
          fileChanged = true;
          fileFixes++;
        }
      }
    }
  }

  // Apply specific fixes
  if (SPECIFIC_FIXES[file]) {
    for (const fix of SPECIFIC_FIXES[file]) {
      if (fix.find) continue; // skip — will handle manually
      const q = data.questions[fix.qi];
      if (!q) continue;
      if (q[fix.field] === fix.old) {
        q[fix.field] = fix.new;
        fileChanged = true;
        fileFixes++;
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

console.log(`\n=== Fix Report ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total fixes: ${totalFixes}`);
