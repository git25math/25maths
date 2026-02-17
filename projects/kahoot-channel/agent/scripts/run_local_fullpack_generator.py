#!/usr/bin/env python3
"""Deterministic local generator for one Edexcel full topic pack.

Outputs:
- worksheet-student.md
- worksheet-answers.md
- kahoot-question-set.md
- listing-copy.md
"""

from __future__ import annotations

import argparse
import hashlib
import random
import re
from pathlib import Path


def seeded_rng(topic_dir: Path) -> random.Random:
    digest = hashlib.sha256(str(topic_dir).encode("utf-8")).hexdigest()
    return random.Random(int(digest[:12], 16))


def parse_meta(topic_dir: Path) -> dict[str, str]:
    student = topic_dir / "worksheet-student.md"
    if not student.exists():
        raise FileNotFoundError(f"Missing file: {student}")

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
        m2 = re.match(r"^([fh][0-9]+)-([0-9]{2})-", slug, flags=re.IGNORECASE)
        if m2:
            code = f"{m2.group(1).upper()}.{int(m2.group(2))}"
        else:
            code = slug.upper()

    if not title:
        parts = re.sub(r"^[fh][0-9]+-[0-9]{2}-", "", slug, flags=re.IGNORECASE)
        title = parts.replace("-", " ").strip().title()

    section = topic_dir.parent.name
    domain = section.split("-")[0].lower()

    tier = "Foundation" if code.startswith("F") else "Higher"
    board = "Edexcel 4MA1"

    return {
        "code": code,
        "title": title,
        "domain": domain,
        "tier": tier,
        "board": board,
    }


def model_example(domain: str, rng: random.Random) -> str:
    if domain == "equations":
        a = rng.randint(2, 6)
        b = rng.randint(3, 9)
        c = rng.randint(18, 42)
        return (
            f"Example: solve `{a}x + {b} = {c}` by inverse operations. "
            f"Subtract `{b}` then divide by `{a}` to get `x = {(c - b) // a}`."
        )
    if domain == "number":
        p = rng.randint(12, 25)
        return (
            f"Example: increase `80` by `{p}%`: compute `80 x (1 + {p}/100)` "
            f"to get `{80 * (100 + p) / 100:.1f}`."
        )
    if domain == "geometry":
        b = rng.randint(6, 12)
        h = rng.randint(4, 10)
        return (
            f"Example: area of a triangle with base `{b}` and height `{h}` is "
            f"`1/2 x {b} x {h} = {b*h//2}`."
        )
    if domain == "sequences":
        a = rng.randint(2, 6)
        b = rng.randint(-4, 8)
        return (
            f"Example: for nth term `{a}n + {b}`, term 5 is "
            f"`{a} x 5 + {b} = {a*5+b}`."
        )
    if domain == "vectors":
        x1, y1 = rng.randint(-1, 4), rng.randint(-2, 3)
        x2, y2 = rng.randint(5, 10), rng.randint(4, 9)
        return (
            f"Example: vector `AB` from `A({x1},{y1})` to `B({x2},{y2})` is "
            f"`({x2-x1},{y2-y1})`."
        )
    # statistics
    nums = [rng.randint(4, 18) for _ in range(5)]
    mean = sum(nums) / len(nums)
    return f"Example: mean of `{nums}` is `{sum(nums)}/{len(nums)} = {mean:.1f}`."


def qa_number(rng: random.Random, higher: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(20, 60)
    b = rng.randint(8, 19)
    c = rng.randint(2, 9)
    n1 = a + b * c

    d1, d2 = rng.randint(2, 8), rng.randint(9, 15)
    f_num = d1 + d2
    f_den = 24
    g = rng.randint(12, 45)
    p = rng.randint(10, 30)
    h = rng.randint(3, 8)
    sf = rng.randint(2, 4) if higher else 2
    m = rng.randint(2, 6)
    exp = rng.randint(4, 7) if higher else rng.randint(3, 6)
    power_base = rng.randint(2, 5)
    rootsq = rng.choice([36, 49, 64, 81, 100, 121])

    q = [
        f"Evaluate `{a} + {b} x {c}`.",
        f"Write `{d1}/24 + {d2}/24` as a simplified fraction.",
        f"Calculate `{g/10:.1f} + {p/100:.2f}`.",
        f"Work out `{power_base}^{exp}`.",
        f"Find `sqrt({rootsq})`.",
        f"Increase `120` by `{p}%`.",
        f"Share `{h*15}` in the ratio `2:3` and give the larger share.",
        f"Round `{(rng.randint(1000,9999))/10}` to `{sf}` significant figures.",
        f"Write `{m*10**4}` in standard form.",
        (
            "A notebook costs `£2.40` and a pen costs `£1.35`. "
            "How much do 3 notebooks and 2 pens cost?"
        ),
    ]
    a_out = [
        str(n1),
        f"`{f_num//(2 if f_num % 2 == 0 else 1)}/{f_den//(2 if f_num % 2 == 0 else 1)}`",
        f"{g/10 + p/100:.2f}",
        str(power_base**exp),
        str(int(rootsq**0.5)),
        f"{120*(100+p)/100:.1f}",
        str((h * 15) * 3 // 5),
        "Use place value; correct rounded value shown in working.",
        f"`{m} x 10^4`",
        "£9.90",
    ]
    return q, a_out


def qa_equations(rng: random.Random, higher: bool) -> tuple[list[str], list[str]]:
    a = rng.randint(2, 6)
    b = rng.randint(2, 9)
    c = rng.randint(1, 8)
    x = rng.randint(3, 10)
    rhs = a * x + b
    p = rng.randint(2, 7)
    q = rng.randint(1, 8)
    k1 = rng.randint(2, 6)
    k2 = rng.randint(2, 7)
    s = rng.randint(8, 20)
    diff = rng.randint(2, 8)
    x1 = (s + diff) // 2
    y1 = (s - diff) // 2
    root1 = rng.randint(2, 8)
    root2 = rng.randint(1, 7)
    aa = rng.randint(2, 5)
    bb = rng.randint(6, 14)
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
            f"If area is `{(x+2)*(x+5)}`, find `x`."
        ),
    ]
    answers = [
        f"`{a+c}x`",
        str(p * x - q),
        f"`{k1}x + {k1*k2}`",
        str(x),
        f"`x = (y - {b})/{a}`",
        f"`x = {x1}, y = {y1}`",
        f"`x = {root1}` or `x = {root2}`",
        f"`x > {bb/aa:.2f}`",
        "40 g",
        str(x),
    ]
    if higher:
        q_text[9] = (
            "Given `x^2 - 7x + 12 = 0`, solve and state both roots."
        )
        answers[9] = "`x = 3` or `x = 4`"
    return q_text, answers


def qa_sequences(rng: random.Random, higher: bool) -> tuple[list[str], list[str]]:
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
    if not higher:
        q[9] = "Find `f(8)` if `f(x) = 2x - 1`."
        ans[9] = "15"
    return q, ans


def qa_geometry(rng: random.Random, higher: bool) -> tuple[list[str], list[str]]:
    tri_a = rng.randint(35, 70)
    tri_b = rng.randint(30, 65)
    n = rng.randint(5, 9)
    side = rng.randint(5, 16)
    radius = rng.randint(3, 10)
    p1 = rng.randint(3, 8)
    p2 = rng.randint(4, 11)
    hyp = int((p1**2 + p2**2) ** 0.5)
    if hyp * hyp != p1 * p1 + p2 * p2:
        hyp = f"sqrt({p1*p1+p2*p2})"
    angle = rng.randint(25, 55)
    q = [
        f"Find third angle in a triangle with angles `{tri_a}°` and `{tri_b}°`.",
        f"Find sum of interior angles of a `{n}`-sided polygon.",
        "State the order of rotational symmetry of a regular hexagon.",
        f"Find perimeter of rectangle `{side} cm` by `{side+4} cm`.",
        f"Find area of circle radius `{radius} cm` in terms of `pi`.",
        f"Use Pythagoras: legs `{p1}` and `{p2}`.",
        f"In a right triangle, `sin(theta)=0.5`. Find `theta` (acute).",
        f"Find volume of cuboid `{side} x {side+2} x {side+4}`.",
        "Two similar shapes have scale factor `3`. Area scale factor?",
        f"A cylinder has radius `{radius}` and height `{side}`. Write volume in terms of `pi`.",
    ]
    ans = [
        str(180 - tri_a - tri_b),
        str((n - 2) * 180),
        "6",
        f"{2*side + 2*(side+4)} cm",
        f"`{radius*radius}pi cm^2`",
        f"`{hyp}`",
        "30°",
        str(side * (side + 2) * (side + 4)),
        "9",
        f"`{radius*radius*side}pi`",
    ]
    if higher:
        q[9] = f"A cone has radius `{radius}` and height `{side+3}`. Write volume in terms of `pi`."
        ans[9] = f"`{radius*radius*(side+3)/3}pi`"
    return q, ans


def qa_vectors(rng: random.Random, higher: bool) -> tuple[list[str], list[str]]:
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
        f"`(({ax+bx}/2),({ay+by}/2))`",
        "`(-3,5)`",
        "They are scalar multiples.",
        "`(9,6)`",
    ]
    if higher:
        qn[9] = "If `a=(3,-2)` and `b=(1,4)`, find `3a-2b`."
        ans[9] = "`(7,-14)`"
    return qn, ans


def qa_statistics(rng: random.Random, higher: bool) -> tuple[list[str], list[str]]:
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
    if higher:
        qn[9] = "If events are independent with `P(A)=0.4` and `P(B)=0.7`, find `P(A and B)`."
        ans[9] = "0.28"
    return qn, ans


def generate_qa(meta: dict[str, str], rng: random.Random) -> tuple[list[str], list[str]]:
    domain = meta["domain"]
    higher = meta["tier"] == "Higher"
    if domain == "number":
        return qa_number(rng, higher)
    if domain == "equations":
        return qa_equations(rng, higher)
    if domain == "sequences":
        return qa_sequences(rng, higher)
    if domain == "geometry":
        return qa_geometry(rng, higher)
    if domain == "vectors":
        return qa_vectors(rng, higher)
    return qa_statistics(rng, higher)


def normalize_cell(text: str) -> str:
    return text.replace("|", "/").strip()


def make_options(correct: str, rng: random.Random) -> tuple[list[str], str]:
    raw = correct.replace("`", "").strip()

    options: list[str] = []
    if re.fullmatch(r"-?[0-9]+", raw):
        n = int(raw)
        options = [str(n), str(n + 1), str(n - 1), str(n + 2)]
    elif re.fullmatch(r"-?[0-9]+(?:\\.[0-9]+)?", raw):
        x = float(raw)
        options = [f"{x:.2f}", f"{x + 0.5:.2f}", f"{x - 0.5:.2f}", f"{x + 1.0:.2f}"]
    elif re.fullmatch(r"-?[0-9]+/[0-9]+", raw):
        a, b = raw.split("/")
        aa, bb = int(a), int(b)
        options = [raw, f"{aa+1}/{bb}", f"{aa}/{bb+1}", f"{aa+2}/{bb}"]
    else:
        options = [raw, "Cannot be determined", "No solution", "0"]

    # Ensure uniqueness.
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
    tier_tag = "HigherTrack" if meta["tier"] == "Higher" else "FoundationTrack"
    domain_tag = meta["domain"].title().replace(" ", "")
    return "\n".join(
        [
            f"# Kahoot Listing Copy - {meta['code']} {meta['title']}",
            "",
            "## Kahoot Name",
            f"Edexcel 4MA1 {meta['code']} | {meta['title']} | {meta['tier'].upper()} TRACK",
            "",
            "## Kahoot Description",
            (
                f"{meta['code']} {meta['title']} exam-style practice for Edexcel 4MA1 "
                f"({meta['tier']}). Includes a 15-question Kahoot sequence plus a printable "
                "worksheet with worked answers for class use and independent revision."
            ),
            "",
            "## Tags",
            f"#Edexcel4MA1 #{tier_tag} #{domain_tag} #{code_tag} #ExamStyleMaths",
            "",
        ]
    )


def build_student(meta: dict[str, str], focus: str, model: str, questions: list[str]) -> str:
    lines = [
        "# Edexcel 4MA1 Worksheet (Student)",
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
        "# Edexcel 4MA1 Worksheet (Answers)",
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
        f"Apply {meta['title'].lower()} methods accurately in Edexcel 4MA1 "
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
    parser = argparse.ArgumentParser(description="Generate one or many Edexcel full topic packs locally.")
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
