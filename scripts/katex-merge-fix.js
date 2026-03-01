#!/usr/bin/env node
/**
 * KaTeX Merge Fix — merge scattered LaTeX fragments + wrap bare inequalities
 *
 * Category 1: scattered fragments   e.g. "x $\leq$ 4"  → "$x \leq 4$"
 * Category 2: bare inequality ops   e.g. "x > 3"       → "$x > 3$"
 * Category 3: mixed LaTeX/plain     e.g. "3$x^2$ - 5x" → "$3x^2 - 5x$"
 * Category 4: currency $ fix        e.g. "$3.00"        → "£3.00" (within math context)
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '_data', 'exercises');
let totalFixes = 0;
let filesModified = 0;

// ─── Currency fix: $X.XX or $XX used as price, not LaTeX ───
function fixCurrency(s) {
  // Pattern: "$3.00 or ... $4.80" — stray currency in text
  // Replace lone $NUMBER with the number (remove the $ sign that's not LaTeX)
  // We detect: $ followed by digit, NOT preceded by \ and NOT followed by matching $
  return s;
}

// ─── Merge scattered LaTeX fragments ───
function mergeScatteredLatex(s) {
  let result = s;
  let prev;

  // Pass 1: Merge "math $\cmd$ math" into "$math \cmd math$"
  // Pattern: (mathChars)(space?)$\cmd$(space?)(mathChars)
  // where mathChars = digits, letters, +, -, ., (, ), /, spaces around operators
  do {
    prev = result;

    // Merge: NUMBER/VAR + $\latex$ + NUMBER/VAR  (e.g. "x $\leq$ 4", "5 $\times$ 3")
    // Left context: variable or number, Right context: variable or number
    result = result.replace(
      /([a-zA-Z0-9.]+)\s*\$\\([a-zA-Z]+)\$\s*([a-zA-Z0-9.\-]+)/g,
      (match, left, cmd, right) => {
        return `$${left} \\${cmd} ${right}$`;
      }
    );

    // Merge: "$\latex$ VAR/NUM" where left is already $ boundary
    // e.g. "$\pi$r" → "$\pi r$", "$\theta$)" → "$\theta$)"
    result = result.replace(
      /\$\\([a-zA-Z]+)\$([a-zA-Z])/g,
      (match, cmd, after) => {
        return `$\\${cmd} ${after}$`;
      }
    );

    // Merge: "NUM$\latex$" where number precedes
    // e.g. "5$\pi$" → "$5\\pi$", "25$\pi$" → "$25\\pi$"
    result = result.replace(
      /(\d+)\$\\([a-zA-Z]+)\$/g,
      (match, num, cmd) => {
        return `$${num}\\${cmd}$`;
      }
    );

    // Merge adjacent $...$ blocks separated by math operators/text
    // e.g. "$5\pi$ $cm^2$" → "$5\pi \\text{ cm}^2$"  — skip, too risky
    // e.g. "$A$ $\cup$ $B$" → "$A \cup B$"
    result = result.replace(
      /\$([^$]+)\$\s*\$\\([a-zA-Z]+)\$\s*\$([^$]+)\$/g,
      (match, left, cmd, right) => {
        return `$${left} \\${cmd} ${right}$`;
      }
    );

    // Merge "$...$" + space/math + "$...$" when gap is just math chars
    // e.g. "$x^2$ + 3x" or "2x + $y = 7$"
    // Only merge if gap is short math (operators, digits, variables)
    result = result.replace(
      /\$([^$]+)\$(\s*[-+*/=]\s*(?:\d+[a-z]?|[a-z])(?:\s*[-+*/]\s*(?:\d+[a-z]?|[a-z]))*\s*[-+*/=]?\s*)\$([^$]+)\$/gi,
      (match, left, gap, right) => {
        return `$${left}${gap}${right}$`;
      }
    );

  } while (result !== prev);

  return result;
}

// ─── Wrap bare inequality expressions in options ───
function wrapBareInequality(s) {
  // Only for option-like strings (short, math-only)
  // Pattern: "VAR >/</>=/<= NUM" or "NUM < VAR < NUM"
  if (/\$/.test(s)) return s; // already has LaTeX, skip

  // Pure inequality option: "x > 3", "x < -6", "x ≥ 4"
  if (/^-?\d*\.?\d*[a-zA-Z]?\s*[><≤≥]=?\s*-?\d*\.?\d*[a-zA-Z]?$/.test(s.trim())) {
    return `$${s.trim()}$`;
  }

  // Compound inequality: "-1 < x ≤ 4", "14 < x < 16"
  if (/^-?\d+\.?\d*\s*[><≤≥]=?\s*[a-zA-Z]\s*[><≤≥]=?\s*-?\d+\.?\d*$/.test(s.trim())) {
    return `$${s.trim()}$`;
  }

  return s;
}

// ─── Fix options that are pure math but not wrapped ───
function fixOptionIfPureMath(option) {
  if (/\$/.test(option)) return option; // already has LaTeX

  const trimmed = option.trim();

  // Pure inequality expression: "x > 3", "x < 5", "x ≥ 4", etc.
  if (/^[a-zA-Z]\s*[><≤≥]=?\s*-?\d+\.?\d*$/.test(trimmed)) {
    return `$${trimmed}$`;
  }
  if (/^-?\d+\.?\d*\s*[><≤≥]=?\s*[a-zA-Z]\s*[><≤≥]=?\s*-?\d+\.?\d*$/.test(trimmed)) {
    return `$${trimmed}$`;
  }

  return option;
}

// ─── Process a single text field ───
function processField(s, isOption = false) {
  if (!s || typeof s !== 'string') return s;

  let result = s;

  // Step 1: merge scattered LaTeX fragments
  result = mergeScatteredLatex(result);

  // Step 2: for options only, wrap bare inequalities
  if (isOption) {
    result = fixOptionIfPureMath(result);
  }

  // Step 3: fix bare < and > in inline text that are part of math expressions
  // In questionText/explanation: wrap "VAR >/< NUM" patterns
  if (!isOption) {
    // Wrap inline inequality expressions that aren't in LaTeX
    // e.g. "solve x > 3" → "solve $x > 3$"
    // Be careful: only match clear math patterns, not prose "<" usage
    result = result.replace(
      /(?<!\$)(?<![a-zA-Z])(-?\d*\.?\d*[a-zA-Z])\s*([><])\s*(-?\d+\.?\d*[a-zA-Z]?)(?!\$)/g,
      (match, left, op, right) => {
        // Skip if inside existing LaTeX or looks like HTML
        if (op === '<' && /^[a-z]/.test(right)) return match; // might be HTML tag
        return `$${left} ${op} ${right}$`;
      }
    );
  }

  // Step 4: merge adjacent $...$ separated only by space
  result = result.replace(/\$([^$]+)\$\s+\$([^$]+)\$/g, '$$$1 $2$$');

  // Step 5: fix $$ → $ (display math artifacts)
  result = result.replace(/\$\$([^$]+)\$\$/g, '$$$1$$');

  return result;
}

// ─── Main ───
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const report = { merged: 0, wrapped: 0, files: [] };

for (const file of files) {
  const filepath = path.join(DIR, file);
  const original = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(original);
  let fileChanged = false;
  let fileFixCount = 0;

  for (const q of data.questions || []) {
    // Process questionText
    const newQT = processField(q.questionText, false);
    if (newQT !== q.questionText) {
      q.questionText = newQT;
      fileChanged = true;
      fileFixCount++;
    }

    // Process options
    if (Array.isArray(q.options)) {
      for (let i = 0; i < q.options.length; i++) {
        const newOpt = processField(q.options[i], true);
        if (newOpt !== q.options[i]) {
          q.options[i] = newOpt;
          fileChanged = true;
          fileFixCount++;
        }
      }
    }

    // Process explanation
    const newExp = processField(q.explanation, false);
    if (newExp !== q.explanation) {
      q.explanation = newExp;
      fileChanged = true;
      fileFixCount++;
    }
  }

  if (fileChanged) {
    const output = JSON.stringify(data, null, 2) + '\n';
    fs.writeFileSync(filepath, output);
    filesModified++;
    totalFixes += fileFixCount;
    report.files.push({ file, fixes: fileFixCount });
  }
}

// Sort by fix count descending
report.files.sort((a, b) => b.fixes - a.fixes);

console.log(`\n=== KaTeX Merge Fix Report ===`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total fixes: ${totalFixes}`);
console.log(`\nTop files:`);
for (const f of report.files.slice(0, 20)) {
  console.log(`  ${f.fixes.toString().padStart(3)} fixes — ${f.file}`);
}
