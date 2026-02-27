#!/usr/bin/env python3
"""Deterministic local generator for one topic full pack.

Outputs:
- worksheet-student.md
- worksheet-answers.md
- kahoot-question-set.md
- listing-copy.md
"""

from __future__ import annotations

import argparse
import hashlib
import math
import random
import re
from pathlib import Path


def seeded_rng(topic_dir: Path) -> random.Random:
    digest = hashlib.sha256(str(topic_dir).encode("utf-8")).hexdigest()
    return random.Random(int(digest[:12], 16))


def detect_board(topic_dir: Path) -> tuple[str, str]:
    parts = {p.lower() for p in topic_dir.parts}
    if "cie0580" in parts:
        return "CIE 0580", "cie0580"
    if "edexcel-4ma1" in parts:
        return "Edexcel 4MA1", "edexcel-4ma1"
    return "Exam Board", "unknown"


def map_domain(board_key: str, section: str) -> str:
    prefix = section.split("-")[0].lower()

    if board_key == "cie0580":
        mapping = {
            "number": "number",
            "algebra": "algebra",
            "coordinate": "coordinate",
            "geometry": "geometry",
            "mensuration": "mensuration",
            "trigonometry": "trigonometry",
            "transformations": "transformations",
            "probability": "probability",
            "statistics": "statistics",
        }
        return mapping.get(prefix, prefix)

    if board_key == "edexcel-4ma1":
        mapping = {
            "number": "number",
            "equations": "equations",
            "sequences": "sequences",
            "geometry": "geometry",
            "vectors": "vectors",
            "statistics": "statistics",
        }
        return mapping.get(prefix, prefix)

    return prefix


def infer_tier(board_key: str, code: str) -> str:
    leading = (code[:1] or "").upper()

    if board_key == "edexcel-4ma1":
        if leading == "F":
            return "Foundation"
        if leading == "H":
            return "Higher"
        return "Higher"

    if board_key == "cie0580":
        if leading == "C":
            return "Core"
        if leading == "E":
            return "Extended"
        return "Extended"

    return "General"


def fmt_number(value: float) -> str:
    if abs(value - round(value)) < 1e-9:
        return str(int(round(value)))
    text = f"{value:.10f}".rstrip("0").rstrip(".")
    return text


def round_sig(value: float, sig_figs: int) -> float:
    if value == 0:
        return 0.0
    shift = sig_figs - int(math.floor(math.log10(abs(value)))) - 1
    return round(value, shift)


def simplify_fraction(numerator: int, denominator: int) -> tuple[int, int]:
    g = math.gcd(abs(numerator), abs(denominator))
    if g == 0:
        return numerator, denominator
    return numerator // g, denominator // g


def parse_meta(topic_dir: Path) -> dict[str, str]:
    student = topic_dir / "worksheet-student.md"
    if not student.exists():
        raise FileNotFoundError(f"Missing file: {student}")

    board_name, board_key = detect_board(topic_dir)

    lines = student.read_text(encoding="utf-8").splitlines()
    title_line = ""
    for line in lines[:8]:
        if line.startswith("## "):
            title_line = line.strip()
            break

    code = ""
    title = ""
    if title_line:
        m = re.match(r"^##\s*([A-Za-z][0-9]+\.[0-9]+)\s+(.+)$", title_line)
        if m:
            code = m.group(1).upper()
            title = m.group(2).strip()

    slug = topic_dir.name
    if not code:
        m2 = re.match(r"^([fhec][0-9]+)-([0-9]{2})-", slug, flags=re.IGNORECASE)
        if m2:
            code = f"{m2.group(1).upper()}.{int(m2.group(2))}"
        else:
            code = slug.upper()

    if not title:
        parts = re.sub(r"^[fhec][0-9]+-[0-9]{2}-", "", slug, flags=re.IGNORECASE)
        title = parts.replace("-", " ").strip().title()

    section = topic_dir.parent.name
    domain = map_domain(board_key, section)
    tier = infer_tier(board_key, code)

    return {
        "code": code,
        "title": title,
        "domain": domain,
        "tier": tier,
        "board": board_name,
        "board_key": board_key,
    }


def model_example(domain: str, rng: random.Random) -> str:
    if domain in {"equations", "algebra"}:
        a = rng.randint(2, 6)
        b = rng.randint(3, 9)
        c = rng.randint(18, 42)
        x = (c - b) / a
        return (
            f"Example: solve `{a}x + {b} = {c}` by inverse operations. "
            f"Subtract `{b}` then divide by `{a}` to get `x = {fmt_number(x)}`."
        )

    if domain == "number":
        p = rng.randint(12, 25)
        ans = 80 * (100 + p) / 100
        return (
            f"Example: increase `80` by `{p}%`: compute `80 x (1 + {p}/100)` "
            f"to get `{fmt_number(ans)}`."
        )

    if domain in {"geometry", "mensuration"}:
        base = rng.randint(6, 12)
        height = rng.randint(4, 10)
        return (
            f"Example: area of a triangle with base `{base}` and height `{height}` is "
            f"`1/2 x {base} x {height} = {base * height // 2}`."
        )

    if domain in {"sequences", "coordinate"}:
        a = rng.randint(2, 6)
        b = rng.randint(-4, 8)
        term = a * 5 + b
        return (
            f"Example: for nth term `{a}n + {b}`, term 5 is "
            f"`{a} x 5 + {b} = {term}`."
        )

    if domain in {"vectors", "transformations"}:
        x1, y1 = rng.randint(-1, 4), rng.randint(-2, 3)
        x2, y2 = rng.randint(5, 10), rng.randint(4, 9)
        return (
            f"Example: vector `AB` from `A({x1},{y1})` to `B({x2},{y2})` is "
            f"`({x2 - x1},{y2 - y1})`."
        )

    if domain in {"trigonometry", "probability", "statistics"}:
        nums = [rng.randint(4, 18) for _ in range(5)]
        mean = sum(nums) / len(nums)
        return f"Example: mean of `{nums}` is `{sum(nums)}/{len(nums)} = {mean:.1f}`."

    nums = [rng.randint(4, 18) for _ in range(5)]
    mean = sum(nums) / len(nums)
    return f"Example: mean of `{nums}` is `{sum(nums)}/{len(nums)} = {mean:.1f}`."


def qa_number(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(20, 60)
    b = rng.randint(8, 19)
    c = rng.randint(2, 9)
    n1 = a + b * c

    d1, d2 = rng.randint(2, 10), rng.randint(8, 16)
    frac_num = d1 + d2
    frac_den = 24
    simp_num, simp_den = simplify_fraction(frac_num, frac_den)

    g = rng.randint(12, 45)
    p = rng.randint(10, 30)
    h = rng.randint(3, 9)
    sf = rng.randint(2, 4) if advanced else 2
    m = rng.randint(2, 6)
    exp = rng.randint(4, 7) if advanced else rng.randint(3, 6)
    power_base = rng.randint(2, 5)
    rootsq = rng.choice([36, 49, 64, 81, 100, 121])

    round_source = rng.randint(1000, 9999) / 10
    rounded = round_sig(round_source, sf)

    q = [
        f"Evaluate `{a} + {b} x {c}`.",
        f"Write `{d1}/24 + {d2}/24` as a simplified fraction.",
        f"Calculate `{g / 10:.1f} + {p / 100:.2f}`.",
        f"Work out `{power_base}^{exp}`.",
        f"Find `sqrt({rootsq})`.",
        f"Increase `120` by `{p}%`.",
        f"Share `{h * 15}` in the ratio `2:3` and give the larger share.",
        f"Round `{round_source}` to `{sf}` significant figures.",
        f"Write `{m * 10**4}` in standard form.",
        (
            "A notebook costs `£2.40` and a pen costs `£1.35`. "
            "How much do 3 notebooks and 2 pens cost?"
        ),
    ]
    a_out = [
        str(n1),
        f"`{simp_num}/{simp_den}`",
        f"{g / 10 + p / 100:.2f}",
        str(power_base**exp),
        str(int(rootsq**0.5)),
        fmt_number(120 * (100 + p) / 100),
        str((h * 15) * 3 // 5),
        fmt_number(rounded),
        f"`{m} x 10^4`",
        "£9.90",
    ]
    return q, a_out


def qa_equations(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(2, 6)
    b = rng.randint(2, 9)
    c = rng.randint(1, 8)
    x = rng.randint(3, 10)
    rhs = a * x + b

    p = rng.randint(2, 7)
    q = rng.randint(1, 8)
    k1 = rng.randint(2, 6)
    k2 = rng.randint(2, 7)

    x1 = rng.randint(5, 12)
    y1 = rng.randint(1, x1 - 1)
    s = x1 + y1
    diff = x1 - y1

    root1 = rng.randint(2, 8)
    root2 = rng.randint(1, 7)
    while root2 == root1:
        root2 = rng.randint(1, 7)

    aa = rng.randint(2, 5)
    bb = rng.randint(6, 14)

    rect_x = rng.randint(2, 8)
    rect_area = (rect_x + 2) * (rect_x + 5)

    q_text = [
        f"Simplify `{a}x + {c}x`.",
        f"When `x = {x}`, evaluate `{p}x - {q}`.",
        f"Expand `{k1}(x + {k2})`.",
        f"Solve `{a}x + {b} = {rhs}`.",
        f"Rearrange `y = {a}x + {b}` to make `x` the subject.",
        f"Solve simultaneously: `x + y = {s}`, `x - y = {diff}`.",
        f"Solve `x^2 - {root1 + root2}x + {root1 * root2} = 0`.",
        f"Solve the inequality `{aa}x - {bb} > 0`.",
        "A recipe uses sugar and flour in ratio `3:5`. If sugar is `24 g`, find flour.",
        (
            f"A rectangle has width `x+2` and length `x+5`. "
            f"If area is `{rect_area}`, find `x`."
        ),
    ]

    answers = [
        f"`{a + c}x`",
        str(p * x - q),
        f"`{k1}x + {k1 * k2}`",
        str(x),
        f"`x = (y - {b})/{a}`",
        f"`x = {x1}, y = {y1}`",
        f"`x = {root1}` or `x = {root2}`",
        f"`x > {bb / aa:.2f}`",
        "40 g",
        str(rect_x),
    ]

    if advanced:
        q_text[9] = "Given `x^2 - 7x + 12 = 0`, solve and state both roots."
        answers[9] = "`x = 3` or `x = 4`"

    return q_text, answers


def qa_algebra(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(2, 6)
    b = rng.randint(2, 7)
    c = rng.randint(1, 9)
    x = rng.randint(2, 9)
    n = rng.randint(3, 7)
    ineq_rhs = rng.randint(10, 30)

    root1 = rng.randint(2, 6)
    root2 = rng.randint(3, 8)
    while root2 == root1:
        root2 = rng.randint(3, 8)

    q = [
        f"Simplify `{a}x + {b}x - {c}x`.",
        f"Expand and simplify `{a}(x + {b})`.",
        f"Factorise `{a}x + {a*b}` fully.",
        f"Solve `{a}x - {b} = {a*x - b}`.",
        f"When `x = {x}`, evaluate `{a}x^2 - {b}x + {c}`.",
        f"Solve the inequality `{a}x + {b} >= {ineq_rhs}`.",
        f"The nth term is `{a}n + {c}`. Find term `{n}`.",
        f"Rearrange `y = {a}x - {b}` to make `x` the subject.",
        f"Solve `x^2 - {root1 + root2}x + {root1 * root2} = 0`.",
        "Given `f(x)=2x-3`, find `f(8)`.",
    ]
    ans = [
        f"`{a + b - c}x`",
        f"`{a}x + {a*b}`",
        f"`{a}(x + {b})`",
        str(x),
        str(a * x * x - b * x + c),
        f"`x >= {fmt_number((ineq_rhs - b) / a)}`",
        str(a * n + c),
        f"`x = (y + {b})/{a}`",
        f"`x = {root1}` or `x = {root2}`",
        "13",
    ]
    if advanced:
        q[9] = "Given `f(x)=3x^2-2x+1`, find `f(4)`."
        ans[9] = str(3 * 16 - 8 + 1)
    return q, ans


def qa_coordinate(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    x1, y1 = rng.randint(-4, -1), rng.randint(-3, 5)
    x2, y2 = rng.randint(4, 10), rng.randint(2, 9)
    m = rng.randint(2, 6)
    c = rng.randint(-5, 8)
    x0 = rng.randint(2, 7)

    q = [
        f"State the quadrant of point `({x1},{y2})`.",
        f"Find midpoint of `({x1},{y1})` and `({x2},{y2})`.",
        f"Find gradient of the line through `({x1},{y1})` and `({x2},{y2})`.",
        f"Write equation of line with gradient `{m}` and intercept `{c}`.",
        f"For `y = {m}x + {c}`, find `y` when `x = {x0}`.",
        f"For `y = {m}x + {c}`, find `x` when `y = {m*x0+c}`.",
        f"Find equation of line parallel to `y = {m}x + {c}` passing through `(0,{c+3})`.",
        f"Find gradient of line perpendicular to `y = {m}x + {c}`.",
        f"Find distance between points `({x1},{y1})` and `({x1},{y2})`.",
        f"Find x-intercept of `y = {m}x + {c}`.",
    ]

    mid_x = (x1 + x2) / 2
    mid_y = (y1 + y2) / 2
    grad = (y2 - y1) / (x2 - x1)
    perp = -1 / m
    x_intercept = -c / m

    ans = [
        "II" if x1 < 0 and y2 > 0 else "I",
        f"`({fmt_number(mid_x)},{fmt_number(mid_y)})`",
        fmt_number(grad),
        f"`y = {m}x + {c}`",
        str(m * x0 + c),
        str(x0),
        f"`y = {m}x + {c+3}`",
        fmt_number(perp),
        str(abs(y2 - y1)),
        fmt_number(x_intercept),
    ]

    if advanced:
        q[9] = f"Find equation of line with gradient `{m}` through `({x0},{m*x0+c+2})`."
        ans[9] = f"`y = {m}x + {c+2}`"

    return q, ans


def qa_sequences(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(2, 6)
    d = rng.randint(2, 7)
    b = rng.randint(-3, 8)
    m = rng.randint(2, 5)
    c = rng.randint(-4, 6)
    x0 = rng.randint(2, 6)
    g = rng.randint(2, 7)
    k = rng.randint(-5, 5)
    q = [
        f"Write the next two terms: `{a}, {a+d}, {a+2*d}, ...`",
        f"Find the nth term of `{a}, {a+d}, {a+2*d}, ...`.",
        f"Find term 12 of sequence with nth term `{d}n + {b}`.",
        f"Given `f(x) = {m}x + {c}`, find `f({x0})`.",
        f"For `f(x) = {m}x + {c}`, find `x` when `f(x) = {m*x0+c}`.",
        f"Find the gradient between points `({x0}, {m*x0+c})` and `({x0+2}, {m*(x0+2)+c})`.",
        f"Find equation of line with gradient `{g}` and intercept `{k}`.",
        "State whether this graph relation is linear or non-linear: `y = x^2`.",
        f"Differentiate `y = {a}x^2 + {b}x`.",
        f"Find gradient when `x=3` for `y = {a}x^2 + {b}x`.",
    ]
    ans = [
        f"`{a+3*d}, {a+4*d}`",
        f"`{d}n + {a-d}`",
        str(d * 12 + b),
        str(m * x0 + c),
        str(x0),
        str(m),
        f"`y = {g}x + {k}`",
        "Non-linear",
        f"`dy/dx = {2*a}x + {b}`",
        str(2 * a * 3 + b),
    ]
    if not advanced:
        q[9] = "Find `f(8)` if `f(x) = 2x - 1`."
        ans[9] = "15"
    return q, ans


def qa_geometry(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    tri_a = rng.randint(35, 70)
    tri_b = rng.randint(30, 65)
    n = rng.randint(5, 9)
    side = rng.randint(5, 16)
    radius = rng.randint(3, 10)
    p1 = rng.randint(3, 8)
    p2 = rng.randint(4, 11)
    hyp_sq = p1**2 + p2**2
    hyp = int(math.isqrt(hyp_sq))
    hyp_text = str(hyp) if hyp * hyp == hyp_sq else f"sqrt({hyp_sq})"

    q = [
        f"Find third angle in a triangle with angles `{tri_a}°` and `{tri_b}°`.",
        f"Find sum of interior angles of a `{n}`-sided polygon.",
        "State the order of rotational symmetry of a regular hexagon.",
        f"Find perimeter of rectangle `{side} cm` by `{side+4} cm`.",
        f"Find area of circle radius `{radius} cm` in terms of `pi`.",
        f"Use Pythagoras: legs `{p1}` and `{p2}`.",
        "In a right triangle, `sin(theta)=0.5`. Find `theta` (acute).",
        f"Find volume of cuboid `{side} x {side+2} x {side+4}`.",
        "Two similar shapes have scale factor `3`. Area scale factor?",
        f"A cylinder has radius `{radius}` and height `{side}`. Write volume in terms of `pi`.",
    ]
    ans = [
        str(180 - tri_a - tri_b),
        str((n - 2) * 180),
        "6",
        f"{2 * side + 2 * (side + 4)} cm",
        f"`{radius * radius}pi cm^2`",
        f"`{hyp_text}`",
        "30°",
        str(side * (side + 2) * (side + 4)),
        "9",
        f"`{radius * radius * side}pi`",
    ]
    if advanced:
        q[9] = f"A cone has radius `{radius}` and height `{side+3}`. Write volume in terms of `pi`."
        ans[9] = f"`{radius * radius * (side + 3) / 3}pi`"
    return q, ans


def qa_mensuration(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    l = rng.randint(6, 15)
    w = rng.randint(4, 12)
    h = rng.randint(3, 10)
    r = rng.randint(3, 9)
    q = [
        f"Find perimeter of rectangle `{l} cm` by `{w} cm`.",
        f"Find area of rectangle `{l} cm` by `{w} cm`.",
        f"Find area of triangle base `{l}` cm, height `{h}` cm.",
        f"Find circumference of circle radius `{r}` cm in terms of `pi`.",
        f"Find area of circle radius `{r}` cm in terms of `pi`.",
        f"Find volume of cuboid `{l} x {w} x {h}`.",
        f"Find surface area of cube side `{h}` cm.",
        f"A prism has cross-section area `{l*w}` and length `{h}`. Find volume.",
        f"Convert `{l*w}` cm^2 to mm^2.",
        f"A sector is `90°` of a circle radius `{r}`. Find arc length in terms of `pi`.",
    ]
    ans = [
        f"{2*(l+w)} cm",
        f"{l*w} cm^2",
        f"{l*h/2} cm^2",
        f"`{2*r}pi cm`",
        f"`{r*r}pi cm^2`",
        str(l * w * h),
        str(6 * h * h),
        str(l * w * h),
        str(l * w * 100),
        f"`{r}pi/2`",
    ]
    if advanced:
        q[9] = f"A cone has radius `{r}` and height `{h}`. Find volume in terms of `pi`."
        ans[9] = f"`{r*r*h/3}pi`"
    return q, ans


def qa_vectors(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    ax, ay = rng.randint(-2, 3), rng.randint(-2, 3)
    bx, by = rng.randint(4, 10), rng.randint(3, 9)
    p, q = rng.randint(1, 5), rng.randint(1, 6)
    qn = [
        f"Find vector `AB` from `A({ax},{ay})` to `B({bx},{by})`.",
        f"Find magnitude of vector `({p},{q})`.",
        f"Work out `({p},{q}) + ({q},{p})`.",
        f"Work out `3({p},{q})`.",
        "Translate point `(2,-1)` by vector `(4,3)`.",
        f"Work out `({bx-ax},{by-ay}) - ({p},{q})`.",
        f"Find midpoint of points `({ax},{ay})` and `({bx},{by})`.",
        "A translation maps `(x,y)` to `(x-3,y+5)`. State the vector.",
        "State one condition for two vectors to be parallel.",
        "If `a=(2,1)` and `b=(5,4)`, find `2a+b`.",
    ]
    ans = [
        f"`({bx-ax},{by-ay})`",
        f"`sqrt({p*p+q*q})`",
        f"`({p+q},{p+q})`",
        f"`({3*p},{3*q})`",
        "`(6,2)`",
        f"`({bx-ax-p},{by-ay-q})`",
        f"`({fmt_number((ax+bx)/2)},{fmt_number((ay+by)/2)})`",
        "`(-3,5)`",
        "They are scalar multiples.",
        "`(9,6)`",
    ]
    if advanced:
        qn[9] = "If `a=(3,-2)` and `b=(1,4)`, find `3a-2b`."
        ans[9] = "`(7,-14)`"
    return qn, ans


def qa_transformations(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    vx, vy = rng.randint(-5, 5), rng.randint(-5, 5)
    ax, ay = rng.randint(-3, 3), rng.randint(-3, 3)
    qx, qy = rng.randint(1, 4), rng.randint(1, 4)
    q = [
        f"Translate point `({ax},{ay})` by vector `({vx},{vy})`.",
        "State the coordinates of image of `(2,3)` after reflection in x-axis.",
        "State the coordinates of image of `(2,3)` after reflection in y-axis.",
        "Rotate point `(1,2)` by `90°` anticlockwise about origin.",
        "Enlargement scale factor `2` about origin maps `(3,-1)` to what point?",
        f"Find vector from `A({ax},{ay})` to `B({ax+qx},{ay+qy})`.",
        "State one invariant under translation.",
        "State one invariant under rotation.",
        "If two vectors are parallel, what is true about their components?",
        "If `a=(2,1)` and `b=(1,-3)`, find `a+b`.",
    ]
    ans = [
        f"`({ax+vx},{ay+vy})`",
        "`(2,-3)`",
        "`(-2,3)`",
        "`(-2,1)`",
        "`(6,-2)`",
        f"`({qx},{qy})`",
        "Length and angle stay unchanged.",
        "Distance from centre stays unchanged.",
        "They are proportional.",
        "`(3,-2)`",
    ]
    if advanced:
        q[9] = "If `a=(3,-2)` and `b=(4,1)`, find `2a-b`."
        ans[9] = "`(2,-5)`"
    return q, ans


def qa_probability(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    p = rng.randint(1, 4)
    total = rng.randint(40, 80)
    red = rng.randint(3, 9)
    blue = rng.randint(2, 7)
    q = [
        f"A fair die is rolled. Find `P(score > {p})`.",
        "If `P(A)=0.35`, find `P(not A)`.",
        f"Expected frequency for probability `0.3` in `{total}` trials.",
        "If `P(A)=0.4` and `P(B)=0.7` are independent, find `P(A and B)`.",
        "If `P(A)=0.4` and `P(B)=0.7` are independent, find `P(A or B)`.",
        f"A bag has {red} red and {blue} blue counters. Find `P(red)`.",
        "A spinner has 8 equal sections, 3 are blue. Find `P(blue)`.",
        "In a class, 18 of 30 students are girls. Find `P(girl)`.",
        "If `P(A)=0.25` and `P(B)=0.45` are mutually exclusive, find `P(A or B)`.",
        "A fair coin is tossed twice. Find `P(two heads)`.",
    ]
    ans = [
        f"`{6-p}/6`",
        "0.65",
        str(int(total * 0.3)),
        "0.28",
        "0.82",
        f"`{red}/{red+blue}`",
        "`3/8`",
        "`18/30 = 3/5`",
        "0.70",
        "`1/4`",
    ]
    if advanced:
        q[9] = "Given `P(A)=0.6`, `P(B)=0.5`, and `P(A and B)=0.3`, find `P(A|B)`."
        ans[9] = "0.60"
    return q, ans


def qa_trigonometry(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(3, 8)
    b = rng.randint(4, 9)
    hyp_sq = a * a + b * b
    hyp = int(math.isqrt(hyp_sq))
    hyp_text = str(hyp) if hyp * hyp == hyp_sq else f"sqrt({hyp_sq})"

    q = [
        f"Use Pythagoras to find hypotenuse when legs are `{a}` and `{b}`.",
        "Find `sin 30°`.",
        "Find `cos 60°`.",
        "Find `tan 45°`.",
        "In a right triangle, `sin(theta)=0.5`. Find `theta` (acute).",
        "In a right triangle, `cos(theta)=0.5`. Find `theta` (acute).",
        "Find one value of `theta` in `0°..90°` if `tan(theta)=1`.",
        "State the sine rule formula.",
        "State the cosine rule formula for side `a`.",
        "A ladder reaches 4 m up a wall and is 5 m long. Find angle with ground (nearest degree).",
    ]
    ans = [
        f"`{hyp_text}`",
        "`1/2`",
        "`1/2`",
        "1",
        "30°",
        "60°",
        "45°",
        "`a/sinA = b/sinB = c/sinC`",
        "`a^2 = b^2 + c^2 - 2bc cosA`",
        "53°",
    ]
    if not advanced:
        q[8] = "Find side opposite 30° in a triangle with hypotenuse 10."
        ans[8] = "5"
    return q, ans


def qa_statistics(rng: random.Random, advanced: bool) -> tuple[list[str], list[str]]:
    nums = [rng.randint(5, 20) for _ in range(5)]
    nums_sorted = sorted(nums)
    mean = sum(nums) / len(nums)
    p = rng.randint(1, 5)
    q = rng.randint(p + 2, 9)
    total = rng.randint(40, 80)
    qn = [
        f"Find mean of `{nums}`.",
        f"Find median of `{nums_sorted}`.",
        f"Find range of `{nums}`.",
        f"A fair die is rolled. Find `P(score > {p})`.",
        f"If `P(A)=0.{q}`, find `P(not A)`.",
        f"Expected frequency if probability is `0.3` in `{total}` trials.",
        "State which average is least affected by outliers: mean, median, or mode.",
        "A class has 12 boys and 18 girls. Choose one at random. Find `P(girl)`.",
        "In a two-way table, 14 out of 50 students prefer algebra. Find the probability.",
        "A spinner has 8 equal sections, 3 are blue. Find `P(blue)`.",
    ]
    ans = [
        f"{mean:.1f}",
        str(nums_sorted[2]),
        str(max(nums) - min(nums)),
        f"`{6-p}/6`",
        f"0.{10-q}",
        str(int(total * 0.3)),
        "Median",
        "`18/30 = 3/5`",
        "`14/50 = 7/25`",
        "`3/8`",
    ]
    if advanced:
        qn[9] = "If events are independent with `P(A)=0.4` and `P(B)=0.7`, find `P(A and B)`."
        ans[9] = "0.28"
    return qn, ans


def generate_qa(meta: dict[str, str], rng: random.Random) -> tuple[list[str], list[str]]:
    domain = meta["domain"]
    tier = meta["tier"]
    advanced = tier in {"Higher", "Extended"}

    if domain == "number":
        return qa_number(rng, advanced)
    if domain == "equations":
        return qa_equations(rng, advanced)
    if domain == "algebra":
        return qa_algebra(rng, advanced)
    if domain == "coordinate":
        return qa_coordinate(rng, advanced)
    if domain == "sequences":
        return qa_sequences(rng, advanced)
    if domain == "geometry":
        return qa_geometry(rng, advanced)
    if domain == "mensuration":
        return qa_mensuration(rng, advanced)
    if domain == "vectors":
        return qa_vectors(rng, advanced)
    if domain == "transformations":
        return qa_transformations(rng, advanced)
    if domain == "trigonometry":
        return qa_trigonometry(rng, advanced)
    if domain == "probability":
        return qa_probability(rng, advanced)
    if domain == "statistics":
        return qa_statistics(rng, advanced)
    return qa_algebra(rng, advanced)


def normalize_cell(text: str) -> str:
    return text.replace("|", "/").strip()


def make_options(correct: str, rng: random.Random) -> tuple[list[str], str]:
    raw = correct.replace("`", "").strip()

    options: list[str] = []
    if re.fullmatch(r"-?[0-9]+", raw):
        n = int(raw)
        options = [str(n), str(n + 1), str(n - 1), str(n + 2)]
    elif re.fullmatch(r"-?[0-9]+(?:\.[0-9]+)?", raw):
        x = float(raw)
        options = [f"{x:.2f}", f"{x + 0.5:.2f}", f"{x - 0.5:.2f}", f"{x + 1.0:.2f}"]
    elif re.fullmatch(r"-?[0-9]+/[0-9]+", raw):
        a, b = raw.split("/")
        aa, bb = int(a), int(b)
        options = [raw, f"{aa+1}/{bb}", f"{aa}/{bb+1}", f"{aa+2}/{bb}"]
    else:
        options = [raw, "Cannot be determined", "No solution", "0"]

    uniq: list[str] = []
    for opt in options:
        o = normalize_cell(opt)
        if o not in uniq:
            uniq.append(o)
    while len(uniq) < 4:
        uniq.append(str(rng.randint(2, 99)))
    uniq = uniq[:4]

    correct_text = normalize_cell(raw)
    if correct_text not in uniq:
        uniq[0] = correct_text

    rng.shuffle(uniq)
    idx = uniq.index(correct_text)
    letter = "ABCD"[idx]
    return uniq, letter


def build_kahoot(meta: dict[str, str], questions: list[str], answers: list[str], rng: random.Random) -> str:
    extra_q = [
        f"Context check: {questions[1]}",
        f"Context check: {questions[3]}",
        f"Context check: {questions[5]}",
        f"Context check: {questions[7]}",
        f"Context check: {questions[9]}",
    ]
    extra_a = [answers[1], answers[3], answers[5], answers[7], answers[9]]

    q15 = questions + extra_q
    a15 = answers + extra_a
    types = ["Fluency"] * 5 + ["Method"] * 6 + ["Context"] * 4

    lines = [
        f"# {meta['code']} Kahoot Question Set - {meta['title']}",
        "",
        "## Metadata",
        f"- Board: {meta['board']}",
        f"- Tier: {meta['tier']}",
        f"- Micro-topic: {meta['code']}",
        "- Questions: 15 MCQ",
        "",
        "| # | Question | A | B | C | D | Correct | Type |",
        "|---|---|---|---|---|---|---|---|",
    ]

    for i in range(15):
        opts, correct_letter = make_options(a15[i], rng)
        q = normalize_cell(q15[i])
        row = f"| {i+1} | {q} | {opts[0]} | {opts[1]} | {opts[2]} | {opts[3]} | {correct_letter} | {types[i]} |"
        lines.append(row)

    lines.extend(
        [
            "",
            "## Timer",
            "- Q1-Q5: 20s",
            "- Q6-Q11: 30s",
            "- Q12-Q15: 45s",
        ]
    )
    return "\n".join(lines) + "\n"


def build_listing(meta: dict[str, str]) -> str:
    code_tag = meta["code"].replace(".", "")
    domain_tag = meta["domain"].title().replace(" ", "")

    if meta["board_key"] == "cie0580":
        tier_tag = "CoreTrack" if meta["tier"] == "Core" else "ExtendedTrack"
        board_tag = "#CIE0580"
    else:
        tier_tag = "HigherTrack" if meta["tier"] == "Higher" else "FoundationTrack"
        board_tag = "#Edexcel4MA1"

    return "\n".join(
        [
            f"# Kahoot Listing Copy - {meta['code']} {meta['title']}",
            "",
            "## Kahoot Name",
            f"{meta['board']} {meta['code']} | {meta['title']} | {meta['tier'].upper()} TRACK",
            "",
            "## Kahoot Description",
            (
                f"{meta['code']} {meta['title']} exam-style practice for {meta['board']} "
                f"({meta['tier']}). Includes a 15-question Kahoot sequence plus a printable "
                "worksheet with worked answers for class use and independent revision."
            ),
            "",
            "## Tags",
            f"{board_tag} #{tier_tag} #{domain_tag} #{code_tag} #ExamStyleMaths",
            "",
        ]
    )


def build_student(meta: dict[str, str], focus: str, model: str, questions: list[str]) -> str:
    lines = [
        f"# {meta['board']} Worksheet (Student)",
        f"## {meta['code']} {meta['title']}",
        "",
        "Name: ____________________   Date: ____________________",
        "",
        "## Syllabus focus",
        f"- {focus}",
        "",
        "## Model example",
        model,
        "",
        "## Practice (10)",
    ]
    for i, q in enumerate(questions, start=1):
        lines.append(f"{i}. {q}")
    lines.append("")
    return "\n".join(lines)


def build_answers(meta: dict[str, str], answers: list[str]) -> str:
    lines = [
        f"# {meta['board']} Worksheet (Answers)",
        f"## {meta['code']} {meta['title']}",
        "",
    ]
    for i, a in enumerate(answers, start=1):
        lines.append(f"{i}. {a}")
    lines.append("")
    return "\n".join(lines)


def generate_topic(topic_dir: Path, force: bool) -> None:
    from subprocess import DEVNULL, run

    script_dir = Path(__file__).resolve().parent
    validator = script_dir / "validate_worksheet.py"
    checker = script_dir / "quality_check_worksheet.py"
    pack_checker = script_dir / "quality_check_topic_pack.py"

    if not force:
        ok = (
            run([str(validator), str(topic_dir), "--quiet"], stdout=DEVNULL, stderr=DEVNULL).returncode == 0
            and run([str(checker), str(topic_dir)], stdout=DEVNULL, stderr=DEVNULL).returncode == 0
            and run([str(pack_checker), str(topic_dir)], stdout=DEVNULL, stderr=DEVNULL).returncode == 0
        )
        if ok:
            print(f"SKIP: already pass ({topic_dir})")
            return

    meta = parse_meta(topic_dir)
    rng = seeded_rng(topic_dir)
    questions, answers = generate_qa(meta, rng)
    focus = (
        f"Apply {meta['title'].lower()} methods accurately in {meta['board']} "
        f"{meta['tier']} exam questions."
    )
    model = model_example(meta["domain"], rng)

    student_text = build_student(meta, focus, model, questions)
    answers_text = build_answers(meta, answers)
    kahoot_text = build_kahoot(meta, questions, answers, rng)
    listing_text = build_listing(meta)

    (topic_dir / "worksheet-student.md").write_text(student_text, encoding="utf-8")
    (topic_dir / "worksheet-answers.md").write_text(answers_text, encoding="utf-8")
    (topic_dir / "kahoot-question-set.md").write_text(kahoot_text, encoding="utf-8")
    (topic_dir / "listing-copy.md").write_text(listing_text, encoding="utf-8")
    print(f"WROTE: {topic_dir}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate one or many topic full packs locally.")
    parser.add_argument("topic_dir", nargs="?", help="Topic directory.")
    parser.add_argument("--topic", dest="topic_opt", help="Topic directory.")
    parser.add_argument("--base", help="Base directory containing topic folders.")
    parser.add_argument("--force", action="store_true", help="Force overwrite even if checks already pass.")
    args = parser.parse_args()

    topic_arg = args.topic_opt or args.topic_dir

    topic_dirs: list[Path] = []
    if topic_arg:
        topic_dirs = [Path(topic_arg).resolve()]
    elif args.base:
        base = Path(args.base).resolve()
        topic_dirs = sorted([p for p in base.glob("*/*") if p.is_dir()])
    else:
        parser.error("Provide <topic_dir>, --topic, or --base.")

    for t in topic_dirs:
        generate_topic(t, force=args.force)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
