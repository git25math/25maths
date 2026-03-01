#!/usr/bin/env python3
"""
Batch-convert exercise JSON files from Unicode/backtick math to LaTeX $...$ notation.

Usage:
    python3 scripts/convert_exercise_math.py --dry-run           # preview changes
    python3 scripts/convert_exercise_math.py                     # apply changes
    python3 scripts/convert_exercise_math.py --files surds.json  # specific files
    python3 scripts/convert_exercise_math.py --report-file r.json # write report

The normalizeInlineMath() guard in exercise_engine.js requires $...$ content to
contain at least one of: \\ ^ _ { }. Expressions without these are treated as
currency and skipped. We wrap such expressions as ${...}$ so the braces trigger
the guard while remaining harmless grouping in LaTeX.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

# ── Unicode superscript maps ──────────────────────────────────────────────────

SUPERSCRIPT_DIGITS = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
}
SUPERSCRIPT_SIGNS = {
    '⁻': '-', '⁺': '+',
}
SUPERSCRIPT_PARENS = {
    '⁽': '(', '⁾': ')',
}
ALL_SUPERSCRIPT = {**SUPERSCRIPT_DIGITS, **SUPERSCRIPT_SIGNS, **SUPERSCRIPT_PARENS}
SUPERSCRIPT_CHARS = set(ALL_SUPERSCRIPT.keys())
SUPERSCRIPT_RE_CLASS = ''.join(re.escape(c) for c in ALL_SUPERSCRIPT.keys())

# Unit words that precede superscripts — skip these (render fine as Unicode)
UNIT_PREFIXES = {'cm', 'mm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'kg', 'g', 'mg',
                 'l', 'ml', 'kl', 'ha', 's', 'min', 'hr', 'h'}

# ── Conversion helpers ────────────────────────────────────────────────────────

def decode_superscript_run(run: str) -> str:
    """Convert a run of Unicode superscript characters to ASCII."""
    return ''.join(ALL_SUPERSCRIPT.get(c, c) for c in run)


def is_unit_superscript(text: str, match_start: int) -> bool:
    """Check if the superscript at match_start is a unit superscript like cm²."""
    # Look backwards from match_start for a unit prefix
    before = text[:match_start]
    # Strip trailing space
    before = before.rstrip()
    for unit in UNIT_PREFIXES:
        if before.endswith(unit):
            # Check it's a word boundary (not part of a longer word)
            pos = len(before) - len(unit)
            if pos == 0 or not before[pos - 1].isalpha():
                return True
    return False


def convert_superscripts(text: str) -> str:
    """Convert Unicode superscript runs to LaTeX exponents.

    Examples:
        x² → $x^{2}$
        3⁶ → $3^{6}$
        a⁶⁺⁽⁻²⁾ → $a^{6+(-2)}$
        10⁻³ → $10^{-3}$
        f⁻¹(x) → $f^{-1}$(x)
        cm² → cm² (unit — skipped)
    """
    # Pre-pass 0: handle fractional exponents like 16³/⁴ → $16^{3/4}$
    frac_exp_pattern = re.compile(
        r'([A-Za-z]+|[0-9]+)'   # base
        r'([' + SUPERSCRIPT_RE_CLASS + r']+)'  # numerator superscript
        r'/'
        r'([' + SUPERSCRIPT_RE_CLASS + r']+)'  # denominator superscript
    )

    def replace_frac_exp(m):
        base = m.group(1)
        num = decode_superscript_run(m.group(2))
        den = decode_superscript_run(m.group(3))
        return f'${base}^{{{num}/{den}}}$'

    text = frac_exp_pattern.sub(replace_frac_exp, text)

    # Pre-pass 0b: handle nth root notation like ⁴√16 → $\sqrt[4]{16}$, ⁵√825 → $\sqrt[5]{825}$
    nth_root_pattern = re.compile(
        r'([' + SUPERSCRIPT_RE_CLASS + r']+)'  # root index
        r'√(\d+(?:\.\d+)?)'  # radicand
    )

    def replace_nth_root(m):
        idx = decode_superscript_run(m.group(1))
        radicand = m.group(2)
        return f'$\\sqrt[{idx}]{{{radicand}}}$'

    text = nth_root_pattern.sub(replace_nth_root, text)

    # First pass: handle parenthesized exponents like (x - 4)², (-2)³, (4.5)²
    paren_pattern = re.compile(
        r'\(([^()]+)\)'   # parenthesized content (no nested parens)
        r'([' + SUPERSCRIPT_RE_CLASS + r']+)'  # superscript run
    )

    def replace_paren_exp(m):
        inner = m.group(1)
        sup_run = m.group(2)
        decoded = decode_superscript_run(sup_run)
        # Recursively convert any superscripts inside the parens
        inner = convert_superscripts(inner)
        # Remove any $...$ wrapping from inner conversion so we can wrap the whole thing
        inner = re.sub(r'\$([^$]+)\$', r'\1', inner)
        if len(decoded) == 1:
            exponent = f'^{decoded}'
        else:
            exponent = f'^{{{decoded}}}'
        return f'$({inner}){exponent}$'

    text = paren_pattern.sub(replace_paren_exp, text)

    # Second pass: handle simple base + superscript (letters, digits only — not ')' )
    pattern = re.compile(
        r'([A-Za-z]+|[0-9]+)'   # base: letters or digits
        r'([' + SUPERSCRIPT_RE_CLASS + r']+)'  # superscript run
    )

    result = []
    last_end = 0
    for m in pattern.finditer(text):
        base = m.group(1)
        sup_run = m.group(2)
        start = m.start()
        end = m.end()

        # Skip if already inside a $...$ span
        before = text[:start]
        dollar_count = before.count('$')
        if dollar_count % 2 == 1:
            # Inside a math span — skip
            result.append(text[last_end:end])
            last_end = end
            continue

        # Skip unit superscripts (cm², m³, km², etc.)
        if is_unit_superscript(text, m.start(2)):
            result.append(text[last_end:end])
            last_end = end
            continue

        decoded = decode_superscript_run(sup_run)

        prefix = text[last_end:start]
        result.append(prefix)

        # Build the LaTeX exponent
        if len(decoded) == 1:
            exponent = f'^{decoded}'
        else:
            exponent = f'^{{{decoded}}}'

        result.append(f'${base}{exponent}$')

        last_end = end

    result.append(text[last_end:])
    return ''.join(result)


def _convert_roots_in_content(text: str) -> str:
    """Convert root symbols to LaTeX commands (no $...$ wrapping).

    Used for content already inside math spans.
    """
    if '\\sqrt' in text:
        return text

    text = re.sub(r'∛(\d+)', lambda m: f'\\sqrt[3]{{{m.group(1)}}}', text)

    def replace_paren_root(m):
        prefix = m.group(1) or ''
        inner = m.group(2)
        inner = inner.replace('×', '\\times')
        return f'{prefix}\\sqrt{{{inner}}}'

    text = re.sub(r'(\d*)√\(([^)]+)\)', replace_paren_root, text)
    text = re.sub(r'(\d+)√(\d+(?:\.\d+)?)',
                  lambda m: f'{m.group(1)}\\sqrt{{{m.group(2)}}}', text)
    text = re.sub(r'√(\d+(?:\.\d+)?)',
                  lambda m: f'\\sqrt{{{m.group(1)}}}', text)
    text = re.sub(r'(\d+)√([a-zA-Z])',
                  lambda m: f'{m.group(1)}\\sqrt{{{m.group(2)}}}', text)
    text = re.sub(r'√([a-zA-Z])',
                  lambda m: f'\\sqrt{{{m.group(1)}}}', text)
    return text


def convert_roots(text: str) -> str:
    """Convert Unicode root symbols to LaTeX.

    Handles roots both inside and outside existing $...$ spans.

    Examples:
        √48 → $\\sqrt{48}$
        4√3 → $4\\sqrt{3}$
        √(16 × 3) → $\\sqrt{16 \\times 3}$
        ∛125 → $\\sqrt[3]{125}$
    """
    if '√' not in text and '∛' not in text:
        return text

    # First pass: convert roots inside existing $...$ spans (no wrapping)
    def convert_in_math_span(m):
        inner = m.group(1)
        converted = _convert_roots_in_content(inner)
        return f'${converted}$'

    text = re.sub(r'\$([^$]+)\$', convert_in_math_span, text)

    # Second pass: convert roots outside $...$ spans (with wrapping)
    # Split text into math and non-math segments
    parts = re.split(r'(\$[^$]+\$)', text)
    result = []
    for part in parts:
        if part.startswith('$') and part.endswith('$'):
            result.append(part)  # Already a math span, skip
        else:
            # Convert roots in non-math text with wrapping
            p = part
            if '\\sqrt' not in p:
                p = re.sub(r'∛(\d+)',
                           lambda m: f'$\\sqrt[3]{{{m.group(1)}}}$', p)

                def replace_paren_root(m):
                    prefix = m.group(1) or ''
                    inner = m.group(2)
                    inner = inner.replace('×', '\\times')
                    if prefix:
                        return f'${prefix}\\sqrt{{{inner}}}$'
                    return f'$\\sqrt{{{inner}}}$'

                p = re.sub(r'(\d*)√\(([^)]+)\)', replace_paren_root, p)
                p = re.sub(r'(\d+)√(\d+(?:\.\d+)?)',
                           lambda m: f'${m.group(1)}\\sqrt{{{m.group(2)}}}$', p)
                p = re.sub(r'√(\d+(?:\.\d+)?)',
                           lambda m: f'$\\sqrt{{{m.group(1)}}}$', p)
                p = re.sub(r'(\d+)√([a-zA-Z])',
                           lambda m: f'${m.group(1)}\\sqrt{{{m.group(2)}}}$', p)
                p = re.sub(r'√([a-zA-Z])',
                           lambda m: f'$\\sqrt{{{m.group(1)}}}$', p)
            result.append(p)
    text = ''.join(result)

    return text


def convert_unicode_operators(text: str) -> str:
    """Convert Unicode math operators to LaTeX when they appear in math context.

    Only converts when surrounded by math-like content (numbers, variables, etc.)
    NOT standalone usage like narrative text.
    """
    # ÷ → \div: only convert inside existing $...$ spans or when merging math spans.
    # Standalone ÷ in narrative text renders fine as Unicode.
    # The merge_adjacent_math step handles $a$ ÷ $b$ → $a \div b$.

    # ≤ → \leq
    text = re.sub(
        r'(?<=[\d\w)x])\s*≤\s*(?=[\d\w(x])',
        lambda m: ' $\\leq$ ',
        text
    )

    # ≥ → \geq
    text = re.sub(
        r'(?<=[\d\w)x])\s*≥\s*(?=[\d\w(x])',
        lambda m: ' $\\geq$ ',
        text
    )

    # Set operators — these are more reliably math context
    text = text.replace('∩', '$\\cap$')
    text = text.replace('∪', '$\\cup$')
    text = text.replace('∈', '$\\in$')
    text = text.replace('∅', '$\\emptyset$')

    return text


def convert_greek_letters(text: str) -> str:
    """Convert standalone Greek letters to LaTeX.

    π → $\\pi$, θ → $\\theta$
    Skip if already inside $...$ or preceded by \\.
    """
    # Skip if already LaTeX
    if '\\pi' in text or '\\theta' in text:
        return text

    # π — but not inside $...$ already
    # We'll do a simple replacement and then fix double-wrapping later
    text = re.sub(r'(?<!\\)π', '$\\\\pi$', text)
    text = re.sub(r'(?<!\\)θ', '$\\\\theta$', text)

    return text


def convert_backtick_expressions(text: str) -> str:
    """Convert backtick-wrapped expressions to $...$ LaTeX.

    `x^2 + 3x` → $x^{2} + 3x$
    `4a + 5a` → ${4a + 5a}$ (no special chars → needs {} wrapper)

    Skip:
    - Tally marks: `|||| |||| |`
    - Calculator display: `8.2E-4`
    - Plain numbers: `400`, `398`
    """

    def replace_backtick(m):
        content = m.group(1).strip()

        # Skip tally marks (only pipes and spaces)
        if re.match(r'^[\|\s]+$', content):
            return m.group(0)

        # Skip calculator display notation (e.g., 8.2E-4)
        if re.match(r'^[\d.]+E[+-]?\d+$', content):
            return m.group(0)

        # Skip pure numbers (e.g., `400`, `0.5`)
        if re.match(r'^\d+\.?\d*$', content):
            return m.group(0)

        # Convert caret expressions: x^2 → x^{2}, x^(n-1) → x^{n-1}
        # Handle ^(...) → ^{...}
        content = re.sub(r'\^(\([^)]+\))', lambda m2: f'^{{{m2.group(1)[1:-1]}}}', content)
        # Handle ^digit(s) → ^{digits} when more than one digit
        content = re.sub(r'\^(\d{2,})', lambda m2: f'^{{{m2.group(1)}}}', content)
        # Handle ^single_digit — keep as ^d (already valid LaTeX)

        # Check if the content has LaTeX special chars that pass the guard
        has_special = bool(re.search(r'[\\^_{}]', content))

        if has_special:
            return f'${content}$'
        else:
            # Wrap in {} to pass the normalizeInlineMath guard
            return f'${{{content}}}$'

    text = re.sub(r'`([^`]+)`', replace_backtick, text)
    return text


def convert_operators_in_math(text: str) -> str:
    """Convert ×, ÷ and other Unicode operators inside $...$ spans.

    We DON'T convert standalone operators outside math mode — they render fine
    as Unicode in HTML. We only convert those inside $...$ after other conversions.
    """
    def replace_in_math(m):
        inner = m.group(1)
        inner = inner.replace('×', '\\times')
        inner = inner.replace('÷', '\\div')
        return f'${inner}$'

    text = re.sub(r'\$([^$]+)\$', replace_in_math, text)
    return text


def merge_adjacent_math(text: str) -> str:
    """Merge adjacent $...$ spans: $x$² → $x^{2}$.

    Also handle: $a$ × $b$ → $a \\times b$
    And: $\\sqrt{3}$/5 → $\\sqrt{3}/5$ (fraction continuations)
    """
    # Run merge passes multiple times to handle chains like $a$ × $b$ × $c$
    for _ in range(3):
        prev = text

        # Merge $...$operator$...$ patterns
        # $a$ × $b$ → $a \times b$
        text = re.sub(
            r'\$([^$]+)\$\s*×\s*\$([^$]+)\$',
            lambda m: f'${m.group(1)} \\times {m.group(2)}$',
            text
        )

        # $a$ ÷ $b$ → $a \div b$
        text = re.sub(
            r'\$([^$]+)\$\s*÷\s*\$([^$]+)\$',
            lambda m: f'${m.group(1)} \\div {m.group(2)}$',
            text
        )

        # $a$ + $b$ → $a + b$
        text = re.sub(
            r'\$([^$]+)\$\s*([+\-])\s*\$([^$]+)\$',
            lambda m: f'${m.group(1)} {m.group(2)} {m.group(3)}$',
            text
        )

        # $a$ = $b$ → $a = b$
        text = re.sub(
            r'\$([^$]+)\$\s*=\s*\$([^$]+)\$',
            lambda m: f'${m.group(1)} = {m.group(2)}$',
            text
        )

        if text == prev:
            break

    # $a$/$b$ → $a/b$  (fraction: $\sqrt{3}$/5)
    text = re.sub(
        r'\$([^$]+)\$/\$([^$]+)\$',
        lambda m: f'${m.group(1)}/{m.group(2)}$',
        text
    )

    # $a$/number → $a/number$
    text = re.sub(
        r'\$([^$]+)\$/(\d+)',
        lambda m: f'${m.group(1)}/{m.group(2)}$',
        text
    )

    # number/$b$ → $number/b$
    text = re.sub(
        r'(\d+)/\$([^$]+)\$',
        lambda m: f'${m.group(1)}/{m.group(2)}$',
        text
    )

    return text


def _parse_frac_operand(s: str, direction: str) -> str:
    """Parse a numerator (left) or denominator (right) from a string boundary.

    direction='left':  scan backwards from end of s to find the numerator.
    direction='right': scan forwards from start of s to find the denominator.

    Returns the operand string (may include LaTeX commands, braces, superscripts).
    """
    if direction == 'left':
        # Scan backwards from end of s
        s_stripped = s.rstrip()
        if not s_stripped:
            return ''
        pos = len(s_stripped) - 1

        # Case 1: closing brace — find matching open brace, then grab preceding \command
        if s_stripped[pos] == '}':
            depth = 1
            i = pos - 1
            while i >= 0 and depth > 0:
                if s_stripped[i] == '}':
                    depth += 1
                elif s_stripped[i] == '{':
                    depth -= 1
                i -= 1
            start = i + 1  # points to '{'
            # Check for preceding \command (e.g., \sqrt, \pi)
            if start > 0 and s_stripped[start - 1] == '\\':
                # not a named command, just backslash + brace
                return s_stripped[start - 1:]
            cmd_start = start
            while cmd_start > 0 and (s_stripped[cmd_start - 1].isalpha() or s_stripped[cmd_start - 1] == '\\'):
                cmd_start -= 1
            if cmd_start < start and s_stripped[cmd_start] == '\\':
                return s_stripped[cmd_start:]
            return s_stripped[start:]

        # Case 2: letters (possibly with preceding \) — LaTeX command or variable
        if s_stripped[pos].isalpha():
            i = pos
            while i >= 0 and s_stripped[i].isalpha():
                i -= 1
            # Check for leading backslash (LaTeX command like \pi, \theta)
            if i >= 0 and s_stripped[i] == '\\':
                # Also grab preceding digits (e.g., "1000\pi" → "1000\\pi")
                j = i - 1
                while j >= 0 and s_stripped[j].isdigit():
                    j -= 1
                return s_stripped[j + 1:]
            # Check for preceding digits (e.g., variable with coefficient)
            j = i
            while j >= 0 and s_stripped[j].isdigit():
                j -= 1
            if j < i:
                return s_stripped[j + 1:]
            return s_stripped[i + 1:]

        # Case 3: digits (possibly with decimal point)
        if s_stripped[pos].isdigit():
            i = pos
            while i >= 0 and (s_stripped[i].isdigit() or s_stripped[i] == '.'):
                i -= 1
            # Check if these digits are an exponent after ^ (e.g., a^4)
            if i >= 0 and s_stripped[i] == '^':
                # Include the base before ^
                j = i - 1
                # Base could be } (closing a brace group), letter, or digit
                if j >= 0 and s_stripped[j] == '}':
                    depth = 1
                    k = j - 1
                    while k >= 0 and depth > 0:
                        if s_stripped[k] == '}':
                            depth += 1
                        elif s_stripped[k] == '{':
                            depth -= 1
                        k -= 1
                    # Check for \command before {
                    while k >= 0 and s_stripped[k].isalpha():
                        k -= 1
                    if k >= 0 and s_stripped[k] == '\\':
                        k -= 1
                    return s_stripped[k + 1:]
                elif j >= 0 and s_stripped[j].isalpha():
                    # Base is letters (variable name)
                    k = j
                    while k >= 0 and s_stripped[k].isalpha():
                        k -= 1
                    # Check for preceding digits (coefficient)
                    while k >= 0 and s_stripped[k].isdigit():
                        k -= 1
                    return s_stripped[k + 1:]
                elif j >= 0 and s_stripped[j].isdigit():
                    k = j
                    while k >= 0 and (s_stripped[k].isdigit() or s_stripped[k] == '.'):
                        k -= 1
                    return s_stripped[k + 1:]
            return s_stripped[i + 1:]

        return ''

    else:  # direction == 'right'
        s_stripped = s.lstrip()
        if not s_stripped:
            return ''
        pos = 0

        # Case 1: opening brace — find matching close brace
        if s_stripped[pos] == '{':
            depth = 1
            i = 1
            while i < len(s_stripped) and depth > 0:
                if s_stripped[i] == '{':
                    depth += 1
                elif s_stripped[i] == '}':
                    depth -= 1
                i += 1
            return s_stripped[:i]

        # Case 2: \command (possibly followed by {arg})
        if s_stripped[pos] == '\\':
            i = 1
            while i < len(s_stripped) and s_stripped[i].isalpha():
                i += 1
            # Check for following {arg}
            if i < len(s_stripped) and s_stripped[i] == '{':
                depth = 1
                j = i + 1
                while j < len(s_stripped) and depth > 0:
                    if s_stripped[j] == '{':
                        depth += 1
                    elif s_stripped[j] == '}':
                        depth -= 1
                    j += 1
                return s_stripped[:j]
            return s_stripped[:i]

        # Case 3: digits (possibly with decimal point)
        if s_stripped[pos].isdigit():
            i = 0
            while i < len(s_stripped) and (s_stripped[i].isdigit() or s_stripped[i] == '.'):
                i += 1
            return s_stripped[:i]

        # Case 4: letters (variable names, possibly followed by ^{exp})
        if s_stripped[pos].isalpha():
            i = 0
            while i < len(s_stripped) and s_stripped[i].isalpha():
                i += 1
            # Check for ^{exp} or ^digit
            if i < len(s_stripped) and s_stripped[i] == '^':
                i += 1
                if i < len(s_stripped) and s_stripped[i] == '{':
                    depth = 1
                    i += 1
                    while i < len(s_stripped) and depth > 0:
                        if s_stripped[i] == '{':
                            depth += 1
                        elif s_stripped[i] == '}':
                            depth -= 1
                        i += 1
                elif i < len(s_stripped) and (s_stripped[i].isdigit() or s_stripped[i].isalpha()):
                    i += 1
            return s_stripped[:i]

        return ''


def convert_fractions_in_math(text: str) -> str:
    r"""Convert a/b inside existing $...$ spans to \frac{a}{b}.

    Examples:
        $\sqrt{3}/2$ → $\frac{\sqrt{3}}{2}$
        $\pi/3$ → $\frac{\pi}{3}$
        $dy/dx$ → $\frac{dy}{dx}$
        $90/d^2$ → $\frac{90}{d^{2}}$
    """
    def convert_span(m):
        inner = m.group(1)
        # Skip if already has \frac
        if '\\frac' in inner:
            return m.group(0)
        # Skip if no slash
        if '/' not in inner:
            return m.group(0)

        # Process each / in the span
        result = inner
        # Find slashes that are NOT inside braces
        iterations = 0
        while '/' in result and iterations < 5:
            iterations += 1
            # Find the first / not inside braces
            depth = 0
            slash_pos = -1
            for i, ch in enumerate(result):
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                elif ch == '/' and depth == 0:
                    slash_pos = i
                    break
            if slash_pos < 0:
                break

            left = result[:slash_pos]
            right = result[slash_pos + 1:]

            numer = _parse_frac_operand(left, 'left')
            denom = _parse_frac_operand(right, 'right')

            if not numer or not denom:
                break

            # Build the replacement — use stripped versions for position calc
            left_s = left.rstrip()
            right_s = right.lstrip()
            prefix = left_s[:len(left_s) - len(numer)].rstrip()
            suffix = right_s[len(denom):].lstrip()

            frac = f'\\frac{{{numer}}}{{{denom}}}'
            parts = []
            if prefix:
                parts.append(prefix + ' ')
            parts.append(frac)
            if suffix:
                parts.append(' ' + suffix)
            result = ''.join(parts)

        return f'${result}$'

    text = re.sub(r'\$([^$]+)\$', convert_span, text)
    return text


# ── Unit rate skip list for plain-text fractions ─────────────────────────────

UNIT_RATE_PATTERN = re.compile(
    r'(?:km|cm|mm|m|ft|yd|mi|in|g|kg|mg|ml|kl|l|ha|cm²|cm³|m²|m³|km²)'
    r'\s*/\s*'
    r'(?:h|hr|hrs|min|mins|s|sec|secs|day|days|week|year|km|cm|mm|m|ft|ml|l|g|kg)',
    re.IGNORECASE
)


def convert_plain_fractions(text: str) -> str:
    r"""Convert plain-text fractions to $\frac{}{}$ outside of $...$ spans.

    Examples:
        3/5 → $\frac{3}{5}$
        75/100 → $\frac{75}{100}$
        2 1/3 → $2\frac{1}{3}$

    Skips:
        km/h, m/s, cm³/s (unit rates)
        opposite / adjacent (prose with spaces around /)
    """
    # Split into math spans and non-math segments
    parts = re.split(r'(\$[^$]+\$)', text)
    result = []
    for part in parts:
        if part.startswith('$') and part.endswith('$') and len(part) > 2:
            result.append(part)
            continue

        # Convert digit fractions in non-math text
        # First: mixed numbers like "2 1/3" → "$2\frac{1}{3}$"
        def replace_mixed(m):
            # Check this isn't part of a unit rate
            start = m.start()
            context = part[max(0, start - 10):m.end() + 10]
            if UNIT_RATE_PATTERN.search(context):
                return m.group(0)
            whole = m.group(1)
            num = m.group(2)
            den = m.group(3)
            return f'${whole}\\frac{{{num}}}{{{den}}}$'

        part = re.sub(
            r'(\d+)\s+(\d+)/(\d+)',
            replace_mixed,
            part
        )

        # Then: simple fractions like "3/5" → "$\frac{3}{5}$"
        def replace_simple(m):
            # Check boundaries — skip if part of a larger word/unit
            start = m.start()
            end = m.end()
            # Check if preceded by a letter (unit rate like "km/h")
            if start > 0 and part[start - 1].isalpha():
                return m.group(0)
            # Check if followed by a letter (unit denominator)
            if end < len(part) and part[end].isalpha():
                return m.group(0)
            # Check this isn't part of a unit rate
            context = part[max(0, start - 10):min(len(part), end + 10)]
            if UNIT_RATE_PATTERN.search(context):
                return m.group(0)
            num = m.group(1)
            den = m.group(2)
            return f'$\\frac{{{num}}}{{{den}}}$'

        part = re.sub(
            r'(\d+)/(\d+)',
            replace_simple,
            part
        )

        result.append(part)

    return ''.join(result)


def ensure_guard_passes(text: str) -> str:
    """Ensure all $...$ spans contain at least one guard character (\\^_{}).

    The normalizeInlineMath() guard skips $...$ without these characters,
    treating them as currency. We wrap the content in {} if needed.
    """
    def check_span(m):
        content = m.group(1)
        # Already has guard chars?
        if re.search(r'[\\^_{}]', content):
            return m.group(0)
        # Looks like currency ($20.50, $C, etc.)? Leave as-is.
        # Currency: $ followed by digits, or $ followed by single uppercase letter
        stripped = content.strip()
        if re.match(r'^\d+\.?\d*$', stripped):
            return m.group(0)
        if re.match(r'^[A-Z]$', stripped):
            return m.group(0)
        # Wrap in {} to pass guard
        return f'${{{content}}}$'

    text = re.sub(r'\$([^$]+)\$', check_span, text)
    return text


# ── Main conversion pipeline ─────────────────────────────────────────────────

CURRENCY_PLACEHOLDER = '\x00CURR\x00'  # NUL-wrapped placeholder for currency $


def protect_currency(text: str) -> str:
    """Replace currency $ signs with a placeholder to prevent false math span pairing.

    Currency patterns: $10, $3.50, $C (single uppercase letter after $).
    Only applies to $ signs that are NOT part of existing $...$ math spans.
    """
    # Split into math spans and non-math segments
    parts = re.split(r'(\$[^$]+\$)', text)
    result = []
    for part in parts:
        if part.startswith('$') and part.endswith('$') and len(part) > 2:
            # This is a math span — leave it alone
            result.append(part)
        else:
            # Non-math segment — protect currency $ signs
            part = re.sub(r'\$(\d+\.?\d*)', CURRENCY_PLACEHOLDER + r'\1', part)
            part = re.sub(r'\$([A-Z])(?![a-zA-Z])', CURRENCY_PLACEHOLDER + r'\1', part)
            result.append(part)
    return ''.join(result)


def restore_currency(text: str) -> str:
    """Restore currency $ signs from placeholders."""
    return text.replace(CURRENCY_PLACEHOLDER, '$')


def convert_text(text: str) -> str:
    """Apply all conversions to a text string."""
    if not text:
        return text

    # Skip if the text is already heavily LaTeX (contains \begin, \mathbf, etc.)
    if '\\begin{' in text or '\\mathbf{' in text:
        return text

    original = text

    # 0a. Clean up artifact braces from previous buggy conversion runs.
    # Pattern: $math${ non-math text }$math$ → $math$ non-math text $math$
    text = re.sub(
        r'(\$[^$]+\$)\{([^{}$]+)\}(\$[^$]+\$)',
        r'\1\2\3',
        text
    )

    # 0. Protect currency $ signs from being paired as math spans
    text = protect_currency(text)

    # 1. Convert backtick expressions first (they may contain ^ which feeds into later steps)
    text = convert_backtick_expressions(text)

    # 2. Convert Unicode superscripts to LaTeX exponents
    text = convert_superscripts(text)

    # 3. Convert root symbols
    text = convert_roots(text)

    # 4. Convert Greek letters
    text = convert_greek_letters(text)

    # 5. Convert Unicode operators (set ops, inequalities)
    text = convert_unicode_operators(text)

    # 6. Convert ×, ÷ inside existing $...$ spans
    text = convert_operators_in_math(text)

    # 7. Merge adjacent math spans
    text = merge_adjacent_math(text)

    # 8. Convert fractions inside $...$ spans to \frac
    text = convert_fractions_in_math(text)

    # 9. Convert plain-text fractions to $\frac{}{}$
    text = convert_plain_fractions(text)

    # 10. Re-merge adjacent spans created by fraction conversion
    text = merge_adjacent_math(text)

    # 11. Ensure all $...$ pass the guard
    text = ensure_guard_passes(text)

    # 11. Restore currency $ signs
    text = restore_currency(text)

    return text


def process_question(question: dict) -> tuple[dict, list[dict]]:
    """Process a single question, converting math in all text fields.

    Returns (updated_question, list_of_changes).
    """
    changes = []
    q = dict(question)

    # Convert questionText
    if 'questionText' in q:
        old = q['questionText']
        new = convert_text(old)
        if new != old:
            q['questionText'] = new
            changes.append({'field': 'questionText', 'old': old, 'new': new})

    # Convert options
    if 'options' in q:
        new_options = []
        for i, opt in enumerate(q['options']):
            new_opt = convert_text(opt)
            if new_opt != opt:
                changes.append({'field': f'options[{i}]', 'old': opt, 'new': new_opt})
            new_options.append(new_opt)
        q['options'] = new_options

    # Convert explanation
    if 'explanation' in q:
        old = q['explanation']
        new = convert_text(old)
        if new != old:
            q['explanation'] = new
            changes.append({'field': 'explanation', 'old': old, 'new': new})

    return q, changes


def process_file(filepath: Path, dry_run: bool = True) -> dict:
    """Process a single JSON file.

    Returns a report dict with file info and changes.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if 'questions' not in data:
        return {'file': str(filepath), 'changes': 0, 'details': []}

    all_changes = []
    new_questions = []

    for qi, question in enumerate(data['questions']):
        updated_q, changes = process_question(question)
        new_questions.append(updated_q)
        for change in changes:
            change['question_index'] = qi
            all_changes.append(change)

    report = {
        'file': filepath.name,
        'changes': len(all_changes),
        'details': all_changes,
    }

    if all_changes and not dry_run:
        data['questions'] = new_questions
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')

    return report


def main():
    parser = argparse.ArgumentParser(
        description='Convert exercise JSON files from Unicode/backtick math to LaTeX'
    )
    parser.add_argument(
        '--dry-run', action='store_true',
        help='Preview changes without writing files'
    )
    parser.add_argument(
        '--files', nargs='+',
        help='Process only specific files (by name or glob pattern)'
    )
    parser.add_argument(
        '--report-file',
        help='Write change report to JSON file'
    )
    parser.add_argument(
        '--verbose', '-v', action='store_true',
        help='Show detailed changes for each file'
    )
    args = parser.parse_args()

    # Find exercise directory
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    exercises_dir = project_root / '_data' / 'exercises'

    if not exercises_dir.exists():
        print(f'Error: exercises directory not found: {exercises_dir}', file=sys.stderr)
        sys.exit(1)

    # Collect files
    if args.files:
        files = []
        for pattern in args.files:
            if '*' in pattern:
                files.extend(exercises_dir.glob(pattern))
            else:
                # Try exact match or substring match
                exact = exercises_dir / pattern
                if exact.exists():
                    files.append(exact)
                else:
                    files.extend(exercises_dir.glob(f'*{pattern}*'))
        files = sorted(set(files))
    else:
        files = sorted(exercises_dir.glob('*.json'))

    if not files:
        print('No files found to process.', file=sys.stderr)
        sys.exit(1)

    print(f'{"[DRY RUN] " if args.dry_run else ""}Processing {len(files)} files...\n')

    total_changes = 0
    total_files_changed = 0
    reports = []

    for filepath in files:
        report = process_file(filepath, dry_run=args.dry_run)
        reports.append(report)

        if report['changes'] > 0:
            total_files_changed += 1
            total_changes += report['changes']
            status = '[DRY RUN] ' if args.dry_run else ''
            print(f'{status}{report["file"]}: {report["changes"]} changes')

            if args.verbose:
                for detail in report['details']:
                    qi = detail['question_index']
                    field = detail['field']
                    print(f'  Q{qi}.{field}:')
                    print(f'    - {detail["old"][:120]}')
                    print(f'    + {detail["new"][:120]}')
                    print()

    print(f'\n{"=" * 60}')
    print(f'Total: {total_changes} changes across {total_files_changed}/{len(files)} files')
    if args.dry_run:
        print('(DRY RUN — no files were modified)')

    if args.report_file:
        report_data = {
            'total_files': len(files),
            'files_changed': total_files_changed,
            'total_changes': total_changes,
            'dry_run': args.dry_run,
            'reports': reports,
        }
        with open(args.report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        print(f'Report written to {args.report_file}')


if __name__ == '__main__':
    main()
