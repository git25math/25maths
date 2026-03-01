#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', '_data', 'exercises');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let issues = 0;

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (let qi = 0; qi < (data.questions || []).length; qi++) {
    const q = data.questions[qi];
    const fields = [
      { name: 'questionText', val: q.questionText },
      { name: 'explanation', val: q.explanation },
      ...(q.options || []).map((o, i) => ({ name: `option[${i}]`, val: o }))
    ];
    for (const { name, val } of fields) {
      if (!val) continue;

      // Broken: $DIGIT$letter (e.g. "$4$x", "$3$x")
      if (/\$\d+\$[a-zA-Z]/.test(val)) {
        console.log(`BROKEN $N$x: ${f} Q${qi} ${name}: ${val.slice(0, 150)}`);
        issues++;
      }

      // Broken: digit$DIGIT$ (e.g. "2$0$", "1$3$")
      if (/[a-zA-Z0-9]\$\d+\$/.test(val) && !/\\/.test(val.match(/[a-zA-Z0-9]\$([^$]*)\$/)?.[1] || '')) {
        const match = val.match(/[a-zA-Z0-9]\$(\d+)\$/);
        if (match) {
          console.log(`BROKEN N$N$: ${f} Q${qi} ${name}: ${val.slice(0, 150)}`);
          issues++;
        }
      }

      // Broken: empty $$ (display math where inline intended)
      if (/\$\$[^$]/.test(val)) {
        console.log(`BROKEN $$: ${f} Q${qi} ${name}: ${val.slice(0, 150)}`);
        issues++;
      }

      // Broken: unmatched $ (odd number of $ signs, excluding \\$)
      const dollars = (val.match(/(?<!\\)\$/g) || []).length;
      if (dollars % 2 !== 0) {
        console.log(`ODD $: ${f} Q${qi} ${name}: ${val.slice(0, 150)}`);
        issues++;
      }
    }
  }
}
console.log(`\nTotal issues found: ${issues}`);
