# Worksheet Content Generation Specification

> For Antigravity (or any AI agent) to batch-generate the remaining 90 CIE 0580 micro-topic worksheets.

---

## 1. Scope

**90 placeholder topics** across 16 CIE domains need real content. Each topic requires exactly 2 files:

| Domain | Code Range | Count |
|--------|-----------|-------|
| Algebra Core | C2.1 – C2.11 (skip C2.3, C2.8, C2.12) | 9 |
| Algebra Extended | E2.1 – E2.13 | 13 |
| Coordinate Core | C3.1 – C3.6 (skip C3.4, C3.7) | 5 |
| Coordinate Extended | E3.1 – E3.7 | 7 |
| Geometry Core | C4.1 – C4.7 | 7 |
| Geometry Extended | E4.1 – E4.8 | 8 |
| Mensuration Core | C5.1 – C5.5 | 5 |
| Mensuration Extended | E5.1 – E5.5 | 5 |
| Trigonometry Core | C6.1 – C6.2 | 2 |
| Trigonometry Extended | E6.1 – E6.6 | 6 |
| Transformations Core | C7.1 | 1 |
| Transformations Extended | E7.1 – E7.4 | 4 |
| Probability Core | C8.1 – C8.3 | 3 |
| Probability Extended | E8.1 – E8.4 | 4 |
| Statistics Core | C9.1 – C9.4 | 4 |
| Statistics Extended | E9.1 – E9.7 | 7 |
| **Total** | | **90** |

---

## 2. File Locations

Base path:
```
/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics/
```

Each topic lives at:
```
{domain}-{tier}/{code}-{slug}/worksheet-student.md
{domain}-{tier}/{code}-{slug}/worksheet-answers.md
```

Examples:
```
algebra-c2/c2-01-introduction-to-algebra/worksheet-student.md
algebra-c2/c2-01-introduction-to-algebra/worksheet-answers.md
algebra-e2/e2-03-algebraic-fractions/worksheet-student.md
algebra-e2/e2-03-algebraic-fractions/worksheet-answers.md
```

**The directories already exist.** You are overwriting the existing placeholder files.

---

## 3. File Format: `worksheet-student.md`

Must follow this EXACT template (no extra/missing lines):

```markdown
# CIE 0580 Worksheet (Student)
## {CODE} {Topic Name}

Name: ____________________   Date: ____________________

## Syllabus focus
- {One sentence describing the syllabus objective, starting with a verb}

## Model example
{A brief worked example showing a key technique for this topic. Use backticks for math.}

## Practice (10)
1. {Question 1}
2. {Question 2}
3. {Question 3}
4. {Question 4}
5. {Question 5}
6. {Question 6}
7. {Question 7}
8. {Question 8}
9. {Question 9}
10. {Question 10}
```

### Critical format rules:
- Line 1: Always `# CIE 0580 Worksheet (Student)`
- Line 2: `## {CODE} {Topic Name}` — CODE is like `C2.1` or `E6.5`, matching the directory code
- Line 4: Exactly `Name: ____________________   Date: ____________________` (3 spaces between Name/Date blocks)
- Line 6: Exactly `## Syllabus focus`
- Line 7: Starts with `- ` (bullet) then one sentence
- Line 9: Exactly `## Model example`
- Lines 10+: Worked example (1-3 lines)
- Then blank line, then `## Practice (10)`
- Questions numbered `1.` through `10.` — each on its own line
- No trailing blank lines after question 10

---

## 4. File Format: `worksheet-answers.md`

```markdown
# CIE 0580 Worksheet (Answers)
## {CODE} {Topic Name}

1. {Answer 1}
2. {Answer 2}
3. {Answer 3}
4. {Answer 4}
5. {Answer 5}
6. {Answer 6}
7. {Answer 7}
8. {Answer 8}
9. {Answer 9}
10. {Answer 10}
```

### Critical format rules:
- Line 1: Always `# CIE 0580 Worksheet (Answers)`
- Line 2: `## {CODE} {Topic Name}` — must match student file exactly
- Blank line, then answers `1.` through `10.`
- Answers should be concise (one line each preferred)
- Use backticks for mathematical expressions: `` `x = 5` ``
- No trailing content, no "Tier:" line, no marking notes

---

## 5. Math Notation Convention

Use **markdown backticks** for all mathematical expressions. The build script converts them to LaTeX.

| Write this | Renders as |
|-----------|-----------|
| `` `x^2 + 3x - 4` `` | x² + 3x − 4 |
| `` `sqrt(12)` `` | √12 |
| `` `2/3` `` | ²⁄₃ (fraction) |
| `` `3 x 5` `` | 3 × 5 (multiplication sign) |
| `` `2^3` `` | 2³ |
| `` `a^2 + b^2 = c^2` `` | a² + b² = c² |
| `` `$5.60` `` | $5.60 (dollar sign — AVOID backticks for currency) |

**Important:**
- Use `x` (letter x) between numbers for multiplication → auto-converts to `\times`
- Use `a/b` for fractions → auto-converts to `\frac{a}{b}`
- Use `sqrt(n)` → auto-converts to `\sqrt{n}`
- Use `^` for exponents → e.g. `x^2`, `3^(n-1)`
- For currency like $5.60, write it OUTSIDE backticks: `$5.60` or `\$5.60`
- Parentheses in math are fine: `(2x+1)(x-3)`

---

## 6. Content Quality Standards

### 6.1 Difficulty Calibration

**Core (C-prefix):** IGCSE Foundation/Core level
- Straightforward application of formulas
- Integer or simple decimal answers preferred
- 1-2 step problems
- No questions requiring knowledge beyond Core syllabus

**Extended (E-prefix):** IGCSE Extended level
- Multi-step problems with reasoning
- May include surds, algebraic fractions, harder manipulation
- 2-3 step problems typical
- Can reference any Extended syllabus content

### 6.2 Question Progression

Within each set of 10 questions, follow this difficulty curve:
- **Q1-Q3**: Direct application (1 step, recall/apply)
- **Q4-Q6**: Standard application (1-2 steps)
- **Q7-Q9**: Multi-step or contextual (2-3 steps)
- **Q10**: Challenge/extension (hardest, may combine skills)

### 6.3 Question Types Mix

Each worksheet should include a variety:
- At least 2 **pure calculation** questions
- At least 2 **conceptual/explain** questions (e.g., "Is X prime? Explain.")
- At least 2 **applied/word problems** with real-world context
- At least 1 **reverse/inverse** question (given the answer, find the input)

### 6.4 Answer Correctness — CRITICAL

**Every answer MUST be mathematically verified.** Common errors to avoid:
- Arithmetic mistakes (double-check all calculations)
- Sign errors in algebra
- Forgetting units in mensuration/measurement questions
- Incorrect formula application (e.g., volume vs surface area)
- Off-by-one errors in sequences
- Probability answers must be 0 ≤ p ≤ 1

### 6.5 Consistency Between Student & Answer Files

- Question numbering 1-10 must match exactly
- Topic name and code in `## ` header must be identical
- Every question in student file must have a corresponding answer
- Answer format should match what the question asks (e.g., if question says "as a fraction", answer must be a fraction)

---

## 7. Topic-by-Topic Content Guide

Below is the syllabus focus and key concepts for each of the 90 topics.

### Algebra — Core (C2)

**C2.1 Introduction to algebra**
- Focus: Use letters to represent unknowns, substitute values and simplify expressions.
- Key: substitution, collecting like terms, simple expressions
- Example model: Substitute `x=3` into `2x+5` → `2(3)+5 = 11`

**C2.2 Algebraic manipulation**
- Focus: Expand brackets, factorise simple expressions, and simplify algebraic fractions.
- Key: expanding single brackets, factorising common factors, simplifying
- Example model: Expand `3(2x-4)` → `6x-12`

**C2.4 Indices II**
- Focus: Apply the rules of indices to simplify expressions with integer and zero exponents.
- Key: `a^m x a^n = a^(m+n)`, `a^m / a^n = a^(m-n)`, `a^0 = 1`, `(a^m)^n = a^(mn)`
- Example model: Simplify `x^3 x x^4` → `x^7`

**C2.5 Equations**
- Focus: Solve linear equations including those with brackets and unknowns on both sides.
- Key: one-step, two-step, brackets, unknowns both sides
- Example model: Solve `3x + 7 = 22` → `x = 5`

**C2.6 Inequalities**
- Focus: Solve simple linear inequalities and represent solutions on a number line.
- Key: solving like equations, number line notation, integers satisfying inequality
- Example model: Solve `2x + 1 < 9` → `x < 4`

**C2.7 Sequences**
- Focus: Recognise and continue sequences, find the nth term of a linear sequence.
- Key: term-to-term rule, nth term `an + b`, arithmetic sequences
- Example model: 3, 7, 11, 15, ... → nth term = `4n - 1`

**C2.9 Graphs in practical situations**
- Focus: Interpret and draw graphs for real-life situations including travel and conversion graphs.
- Key: distance-time graphs, speed = gradient, conversion graphs
- Example model: A travel graph rises 30 km in 2 hours → speed = `15 km/h`

**C2.10 Graphs of functions**
- Focus: Plot and interpret graphs of linear and simple quadratic functions.
- Key: plotting from table of values, recognising y = mx + c, basic parabolas
- Example model: For `y = x^2 - 3`, when `x = 2`, `y = 1`

**C2.11 Sketching curves**
- Focus: Recognise and sketch graphs of linear, quadratic, and simple cubic functions.
- Key: shape recognition, intercepts, turning points
- Example model: `y = x^2` is a U-shaped parabola with vertex at origin

### Algebra — Extended (E2)

**E2.1 Introduction to algebra**
- Focus: Construct and manipulate algebraic expressions and formulae in extended contexts.
- Key: forming expressions from word problems, substitution with negatives/fractions
- Example model: "A pen costs `p` and a book costs `3p+2`; total for 5 pens and 2 books = `5p + 2(3p+2) = 11p + 4`"

**E2.2 Algebraic manipulation**
- Focus: Expand products of two or more brackets, factorise quadratics and use algebraic fractions.
- Key: double bracket expansion, factorising `ax^2+bx+c`, difference of two squares
- Example model: Factorise `x^2 - 5x + 6` → `(x-2)(x-3)`

**E2.3 Algebraic fractions**
- Focus: Simplify, add, subtract, multiply and divide algebraic fractions.
- Key: finding common denominators with algebra, cancelling, cross-multiplication
- Example model: Simplify `(x^2-4)/(x+2)` → `x-2`

**E2.4 Indices II**
- Focus: Use rules of indices with fractional and negative exponents.
- Key: `a^(-n) = 1/a^n`, `a^(1/2) = sqrt(a)`, `a^(m/n) = (n-th root of a)^m`
- Example model: Evaluate `8^(2/3)` → `(cube root 8)^2 = 2^2 = 4`

**E2.5 Equations**
- Focus: Solve quadratic equations by factorising, completing the square, and using the formula.
- Key: quadratic formula, completing the square, forming and solving
- Example model: Solve `x^2 - 5x + 6 = 0` → `(x-2)(x-3) = 0`, `x = 2` or `x = 3`

**E2.6 Inequalities**
- Focus: Solve quadratic and simultaneous inequalities, represent solution sets.
- Key: quadratic inequalities, graphical representation, integer solutions
- Example model: Solve `x^2 - 4 < 0` → `-2 < x < 2`

**E2.7 Sequences**
- Focus: Find nth term rules for quadratic sequences and recognise geometric sequences.
- Key: second differences, quadratic nth term `an^2+bn+c`, geometric ratio
- Example model: 2, 5, 10, 17, ... second difference = 2, so `n^2+1`

**E2.8 Proportion**
- Focus: Set up and solve direct and inverse proportion equations.
- Key: `y = kx`, `y = k/x`, `y = kx^2`, finding k
- Example model: `y` proportional to `x^2`: if `y=12` when `x=2`, then `k=3`, so `y=3x^2`

**E2.9 Graphs in practical situations**
- Focus: Interpret graphs with variable rates of change and apply calculus concepts graphically.
- Key: average speed, acceleration from speed-time graphs, area under curve
- Example model: Area under speed-time graph = `0.5 x 10 x 30 = 150 m` (distance)

**E2.10 Graphs of functions**
- Focus: Draw and interpret graphs of quadratic, cubic, reciprocal and exponential functions.
- Key: plotting from tables, reading roots from graphs, tangent line for gradient
- Example model: `y = 1/x` has two separate branches, never crosses the axes

**E2.11 Sketching curves**
- Focus: Sketch transformed curves and identify key features including asymptotes.
- Key: translations `f(x)+a` and `f(x+a)`, reflections, stretches, asymptotes
- Example model: `y = (x-2)^2 + 3` is `y = x^2` translated 2 right and 3 up

**E2.12 Differentiation**
- Focus: Differentiate polynomials and apply to finding gradients and turning points.
- Key: `dy/dx` of `ax^n` is `nax^(n-1)`, stationary points, increasing/decreasing
- Example model: `y = 3x^2 - 6x + 1` → `dy/dx = 6x - 6`, turning point at `x = 1`

**E2.13 Functions**
- Focus: Use function notation, find composite and inverse functions.
- Key: `f(x)`, `fg(x)`, `f^(-1)(x)`, domain and range
- Example model: If `f(x) = 2x+3`, then `f^(-1)(x) = (x-3)/2`

### Coordinate Geometry — Core (C3)

**C3.1 Coordinates**
- Focus: Plot and read coordinates in all four quadrants.
- Key: (x,y) notation, quadrants, integer coordinates
- Example model: Point A is at `(3, -2)` — 3 right, 2 down from origin

**C3.2 Drawing linear graphs**
- Focus: Draw straight-line graphs from a table of values or equation.
- Key: table of values, plotting points, joining with ruler
- Example model: For `y = 2x + 1`, table: x=0→y=1, x=1→y=3, x=2→y=5

**C3.3 Gradient of linear graphs**
- Focus: Calculate and interpret the gradient of a straight line.
- Key: gradient = rise/run, positive/negative gradient, horizontal/vertical lines
- Example model: Line through `(1,2)` and `(4,8)`: gradient = `(8-2)/(4-1) = 2`

**C3.5 Equations of linear graphs**
- Focus: Find and use the equation of a straight line in the form `y = mx + c`.
- Key: identify m and c, write equation from graph, sketch from equation
- Example model: Gradient 3, y-intercept -1 → `y = 3x - 1`

**C3.6 Parallel lines**
- Focus: Identify parallel lines using equal gradients.
- Key: parallel ↔ same gradient, recognising from equations
- Example model: `y = 2x + 5` and `y = 2x - 3` are parallel (both gradient 2)

### Coordinate Geometry — Extended (E3)

**E3.1 Coordinates**
- Focus: Use coordinates to solve geometrical problems in all four quadrants.
- Key: coordinates, plotting vertices of shapes, checking properties
- Example model: Rectangle ABCD with A(1,2), B(5,2), C(5,6), D(1,6)

**E3.2 Drawing linear graphs**
- Focus: Draw and interpret linear graphs from equations and contextual problems.
- Key: plotting, gradient-intercept method, finding intercepts
- Example model: `2x + 3y = 12` → x-intercept (6,0), y-intercept (0,4)

**E3.3 Gradient of linear graphs**
- Focus: Calculate gradients including from the equation of a line.
- Key: gradient from two points, rearranging to `y = mx + c`, negative gradients
- Example model: Rearrange `3x + 2y = 8` → `y = -3/2 x + 4`, gradient = `-3/2`

**E3.4 Length and midpoint**
- Focus: Calculate the distance between two points and the midpoint of a line segment.
- Key: distance formula `sqrt((x2-x1)^2 + (y2-y1)^2)`, midpoint `((x1+x2)/2, (y1+y2)/2)`
- Example model: Distance from `(1,2)` to `(4,6)` = `sqrt(9+16) = 5`

**E3.5 Equations of linear graphs**
- Focus: Find equations of lines given gradient and point, or two points.
- Key: `y - y1 = m(x - x1)`, rearranging, finding equation from context
- Example model: Gradient 2 through `(3,7)`: `y - 7 = 2(x - 3)` → `y = 2x + 1`

**E3.6 Parallel lines**
- Focus: Use gradient conditions to determine if lines are parallel.
- Key: same gradient = parallel, different y-intercept
- Example model: Show `2x - y = 5` and `4x - 2y = 1` are parallel (both m=2)

**E3.7 Perpendicular lines**
- Focus: Use the gradient relationship for perpendicular lines.
- Key: perpendicular gradients multiply to -1, `m1 x m2 = -1`
- Example model: Line with gradient 3 ⊥ line with gradient `-1/3`

### Geometry — Core (C4)

**C4.1 Geometrical terms**
- Focus: Understand and use geometrical vocabulary including types of angles and shapes.
- Key: acute/obtuse/reflex, parallel/perpendicular, polygon names
- Example model: A pentagon has 5 sides; interior angle sum = `(5-2) x 180 = 540`

**C4.2 Geometrical constructions**
- Focus: Construct triangles, bisectors and loci using standard methods.
- Key: perpendicular bisector, angle bisector, constructing triangles (SSS, SAS, ASA)
- Example model: To bisect angle BAC, arc from A cuts AB and AC, then arcs from those points cross

**C4.3 Scale drawings**
- Focus: Use scale drawings to solve measurement problems.
- Key: reading scales, converting scale to real, measuring angles with protractor
- Example model: Scale `1:50000`, map distance 4 cm → real = `4 x 50000 = 200000 cm = 2 km`

**C4.4 Similarity**
- Focus: Identify similar shapes and use scale factors for lengths.
- Key: corresponding sides proportional, finding missing lengths, similar triangles
- Example model: Triangle sides 3,4,5 similar to 6,8,10 (scale factor 2)

**C4.5 Symmetry**
- Focus: Identify line symmetry and rotational symmetry in 2D shapes.
- Key: lines of symmetry, order of rotational symmetry
- Example model: A regular hexagon has 6 lines of symmetry, rotational symmetry order 6

**C4.6 Angles**
- Focus: Calculate unknown angles using angle properties of lines, triangles and polygons.
- Key: angles on line=180, triangle=180, vertically opposite, parallel line angles
- Example model: Angles in triangle: `70 + 55 + x = 180` → `x = 55`

**C4.7 Circle theorems**
- Focus: Apply basic circle theorems to find unknown angles.
- Key: angle at centre = 2x angle at circumference, angle in semicircle = 90
- Example model: Angle at centre = 120° → angle at circumference = 60°

### Geometry — Extended (E4)

**E4.1 Geometrical terms**
- Focus: Use extended geometrical vocabulary and properties of shapes.
- Key: congruence conditions, polygon properties, regular polygon angles
- Example model: Regular octagon interior angle = `(8-2) x 180 / 8 = 135`

**E4.2 Geometrical constructions**
- Focus: Construct loci and solve problems involving intersecting loci.
- Key: loci from fixed point (circle), from line (parallel lines), equidistant (bisector)
- Example model: Locus of points equidistant from A and B is the perpendicular bisector of AB

**E4.3 Scale drawings**
- Focus: Use scale drawings and bearings to solve problems.
- Key: three-figure bearings, scale conversions, angles from North
- Example model: Bearing of B from A is 065°, distance 5 km, scale 1:100000

**E4.4 Similarity**
- Focus: Apply area and volume scale factors in similar shapes problems.
- Key: length ratio k, area ratio k^2, volume ratio k^3
- Example model: Scale factor 3 → area factor = 9, volume factor = 27

**E4.5 Symmetry**
- Focus: Describe symmetry properties of 2D and 3D shapes.
- Key: planes of symmetry, axes of rotational symmetry in 3D
- Example model: A cube has 9 planes of symmetry and rotational symmetry of various orders

**E4.6 Angles**
- Focus: Solve angle problems involving irregular polygons and multi-step reasoning.
- Key: exterior angle = 360/n, interior + exterior = 180, algebraic angle problems
- Example model: Exterior angle of regular polygon = 40° → n = 9 sides

**E4.7 Circle theorems I**
- Focus: Apply circle theorems including cyclic quadrilaterals and tangent properties.
- Key: opposite angles of cyclic quad = 180, tangent perpendicular to radius, alternate segment theorem
- Example model: Cyclic quad: opposite angles sum to 180° → if one angle = 72°, opposite = 108°

**E4.8 Circle theorems II**
- Focus: Apply advanced circle theorems and solve multi-step circle geometry problems.
- Key: alternate segment theorem, two tangents from external point equal, combined theorem problems
- Example model: Two tangents from point P: PA = PB, and angle between tangent and chord = angle in alternate segment

### Mensuration — Core (C5)

**C5.1 Units of measure**
- Focus: Convert between metric units and between simple units of area and volume.
- Key: mm↔cm↔m↔km, cm^2↔m^2, ml↔l, g↔kg
- Example model: `3.5 m = 350 cm`, `25000 cm^2 = 2.5 m^2`

**C5.2 Area and perimeter**
- Focus: Calculate area and perimeter of rectangles, triangles, parallelograms and trapeziums.
- Key: rectangle `lw`, triangle `1/2 bh`, parallelogram `bh`, trapezium `1/2(a+b)h`
- Example model: Triangle base 8 cm, height 5 cm → area = `1/2 x 8 x 5 = 20 cm^2`

**C5.3 Circles, arcs and sectors**
- Focus: Calculate circumference and area of circles, and arc length and sector area.
- Key: `C = pi x d`, `A = pi x r^2`, arc = `theta/360 x 2 pi r`, sector = `theta/360 x pi r^2`
- Example model: Circle radius 7 cm → area = `pi x 49 = 153.9 cm^2` (1 d.p.)

**C5.4 Surface area and volume**
- Focus: Calculate surface area and volume of prisms, cylinders, cones, spheres and pyramids.
- Key: prism `V = Ah`, cylinder `V = pi r^2 h`, sphere `V = 4/3 pi r^3`
- Example model: Cylinder r=3, h=10 → V = `pi x 9 x 10 = 90pi = 282.7 cm^3`

**C5.5 Compound shapes and parts of shapes**
- Focus: Calculate areas and volumes of compound shapes by addition and subtraction.
- Key: breaking into standard shapes, adding/subtracting areas, L-shapes, semicircles
- Example model: L-shape = large rectangle minus small rectangle

### Mensuration — Extended (E5)

**E5.1 Units of measure**
- Focus: Convert compound units and use dimensional analysis.
- Key: speed (m/s ↔ km/h), density (g/cm^3), compound unit conversions
- Example model: `72 km/h = 72 x 1000/3600 = 20 m/s`

**E5.2 Area and perimeter**
- Focus: Find areas involving algebraic expressions and apply in extended contexts.
- Key: setting up and solving equations from area, reverse problems
- Example model: Rectangle width `x`, length `x+4`, area = 45 → `x(x+4) = 45`

**E5.3 Circles, arcs and sectors**
- Focus: Solve problems involving sectors, segments and combinations with exact values.
- Key: segment area = sector - triangle, exact answers in terms of pi
- Example model: Sector 60° radius 6: area = `60/360 x pi x 36 = 6pi`

**E5.4 Surface area and volume**
- Focus: Apply volume and surface area formulas to cones, spheres, pyramids and composite solids.
- Key: cone `V = 1/3 pi r^2 h`, `SA = pi r l + pi r^2`, frustums, composite solids
- Example model: Hemisphere r=5: V = `2/3 pi x 125 = 250pi/3`

**E5.5 Compound shapes and parts of shapes**
- Focus: Calculate areas and volumes of complex compound shapes including frustums.
- Key: frustum = whole cone - removed cone, complex 3D shapes
- Example model: Frustum: large cone volume minus small cone volume

### Trigonometry — Core (C6)

**C6.1 Pythagoras' theorem**
- Focus: Apply Pythagoras' theorem to find sides in right-angled triangles.
- Key: `a^2 + b^2 = c^2`, finding hypotenuse, finding shorter side
- Example model: Sides 3 and 4 → hypotenuse = `sqrt(9+16) = sqrt(25) = 5`

**C6.2 Right-angled triangles**
- Focus: Use trigonometric ratios to find sides and angles in right-angled triangles.
- Key: SOH CAH TOA, sin/cos/tan, finding angles with inverse trig
- Example model: Opposite=5, hypotenuse=13 → `sin(x) = 5/13` → `x = 22.6°`

### Trigonometry — Extended (E6)

**E6.1 Pythagoras' theorem**
- Focus: Apply Pythagoras' theorem in extended contexts including coordinate geometry.
- Key: 3D Pythagoras, distance formula, surds in answers
- Example model: Diagonal of cuboid `3 x 4 x 12`: `sqrt(9+16+144) = sqrt(169) = 13`

**E6.2 Right-angled triangles**
- Focus: Solve multi-step problems using trigonometric ratios in right-angled triangles.
- Key: angles of elevation/depression, bearings with trigonometry, multi-triangle problems
- Example model: Angle of elevation 35° from 50 m away → height = `50 x tan(35) = 35.0 m`

**E6.3 Exact trigonometric values**
- Focus: Know and use exact values of sin, cos and tan for 0°, 30°, 45°, 60° and 90°.
- Key: `sin 30 = 1/2`, `cos 45 = sqrt(2)/2`, `tan 60 = sqrt(3)`
- Example model: `sin 60 = sqrt(3)/2`, `cos 60 = 1/2`, `tan 60 = sqrt(3)`

**E6.4 Trigonometric functions**
- Focus: Sketch and interpret graphs of trigonometric functions.
- Key: graphs of `y = sin(x)`, `y = cos(x)`, `y = tan(x)`, period, amplitude
- Example model: `y = sin(x)` has period 360°, amplitude 1, range -1 to 1

**E6.5 Non-right-angled triangles**
- Focus: Use the sine and cosine rules and the area formula for any triangle.
- Key: sine rule `a/sinA = b/sinB`, cosine rule `a^2 = b^2 + c^2 - 2bc cosA`, area = `1/2 ab sinC`
- Example model: Triangle a=8, B=40°, C=70° → A=70° → `a/sin70 = 8/sin40` → solve

**E6.6 Pythagoras and trigonometry in 3D**
- Focus: Apply Pythagoras and trigonometry to three-dimensional problems.
- Key: finding diagonals, angles between line and plane, pyramid/cuboid problems
- Example model: Angle of diagonal with base of cuboid `4 x 3 x 5`: base diagonal = 5, `tan(theta) = 5/5 = 1`, `theta = 45°`

### Transformations — Core (C7)

**C7.1 Transformations**
- Focus: Describe and perform reflections, rotations, translations and enlargements.
- Key: mirror line for reflection, centre+angle for rotation, vector for translation, centre+scale factor for enlargement
- Example model: Reflect triangle in line `y = x` → swap x and y coordinates

### Transformations — Extended (E7)

**E7.1 Transformations**
- Focus: Describe transformations fully and find images under combined transformations.
- Key: combined transformations, inverse transformations, fractional/negative enlargements
- Example model: Enlargement scale factor -2, centre origin: `(1,3)` → `(-2,-6)`

**E7.2 Vectors in two dimensions**
- Focus: Use column vectors for translations and represent position vectors.
- Key: column vector notation, adding/subtracting vectors, scalar multiplication
- Example model: `a = (3, 2)`, `b = (1, -4)` → `a + b = (4, -2)`

**E7.3 Magnitude of a vector**
- Focus: Calculate the magnitude of a vector and find unit vectors.
- Key: magnitude `|v| = sqrt(x^2 + y^2)`, unit vector
- Example model: `v = (3, 4)` → `|v| = sqrt(9+16) = 5`

**E7.4 Vector geometry**
- Focus: Use vectors to prove geometric properties and solve problems.
- Key: showing collinear points, midpoints in vector form, ratio problems
- Example model: If `M` is midpoint of AB, then `OM = OA + 1/2(AB) = 1/2(a+b)`

### Probability — Core (C8)

**C8.1 Introduction to probability**
- Focus: Calculate simple probabilities of single events.
- Key: `P = favourable/total`, probability scale 0 to 1, impossible/certain/even
- Example model: Fair die: `P(3) = 1/6`, `P(even) = 3/6 = 1/2`

**C8.2 Relative and expected frequencies**
- Focus: Use relative frequency as an estimate for probability and calculate expected frequency.
- Key: relative frequency = frequency/total trials, expected = P x n
- Example model: Coin tossed 200 times, 112 heads → relative freq = `112/200 = 0.56`

**C8.3 Probability of combined events**
- Focus: Calculate probabilities of combined events using lists, tables and tree diagrams.
- Key: sample space, tree diagrams, AND = multiply, OR = add
- Example model: Two coins: P(both heads) = `1/2 x 1/2 = 1/4`

### Probability — Extended (E8)

**E8.1 Introduction to probability**
- Focus: Calculate probabilities and use the complement rule in extended contexts.
- Key: `P(A') = 1 - P(A)`, setting up probability equations
- Example model: `P(rain) = 0.35` → `P(no rain) = 0.65`

**E8.2 Relative and expected frequencies**
- Focus: Interpret experimental probability and compare with theoretical probability.
- Key: increasing trials → closer to theoretical, predicting outcomes
- Example model: After 500 rolls, all faces near `500/6 ≈ 83` if fair

**E8.3 Probability of combined events**
- Focus: Use tree diagrams and Venn diagrams for dependent and independent events.
- Key: without replacement (dependent), Venn diagram probability, mutually exclusive
- Example model: 5 red, 3 blue balls. P(2 red without replacement) = `5/8 x 4/7 = 20/56 = 5/14`

**E8.4 Conditional probability**
- Focus: Calculate conditional probabilities using tree diagrams, tables and formulae.
- Key: `P(A|B) = P(A and B)/P(B)`, two-way tables, tree diagrams for conditional
- Example model: `P(A and B) = 0.12`, `P(B) = 0.3` → `P(A|B) = 0.4`

### Statistics — Core (C9)

**C9.1 Classifying statistical data**
- Focus: Classify data as discrete, continuous, categorical, and understand sampling.
- Key: discrete vs continuous, qualitative vs quantitative, types of sampling
- Example model: "Shoe size" is discrete; "height" is continuous

**C9.2 Interpreting statistical data**
- Focus: Read and interpret information from tables, charts and graphs.
- Key: two-way tables, pictograms, bar charts, reading values
- Example model: Bar chart shows 15 students prefer football, 12 prefer cricket

**C9.3 Averages and range**
- Focus: Calculate mean, median, mode and range for a set of data.
- Key: mean = sum/n, median = middle value, mode = most frequent, range = max-min
- Example model: Data 3,5,5,7,10 → mean=6, median=5, mode=5, range=7

**C9.4 Statistical charts and diagrams**
- Focus: Draw and interpret pie charts, bar charts and line graphs.
- Key: pie chart angles = `(freq/total) x 360`, constructing bar charts, interpreting trends
- Example model: 20 out of 60 prefer maths → `(20/60) x 360 = 120°`

### Statistics — Extended (E9)

**E9.1 Classifying statistical data**
- Focus: Classify data and understand sampling methods including stratified sampling.
- Key: stratified sampling, bias, random/systematic sampling
- Example model: 200 students, 120 boys, 80 girls. Stratified sample of 50: `30 boys, 20 girls`

**E9.2 Interpreting statistical data**
- Focus: Interpret complex tables and diagrams including comparative data.
- Key: comparative bar charts, population pyramids, multi-variable tables
- Example model: Compare two distributions using dual bar chart

**E9.3 Averages and range**
- Focus: Calculate mean from grouped frequency tables and identify the modal class.
- Key: estimated mean = `sum(fx)/sum(f)`, modal class, class containing median
- Example model: Grouped data: midpoints x freq, sum, divide by total frequency

**E9.4 Statistical charts and diagrams**
- Focus: Draw and interpret frequency polygons and stem-and-leaf diagrams.
- Key: frequency polygon from midpoints, back-to-back stem-and-leaf, ordered data
- Example model: Stem-and-leaf: 2|3 5 7 means 23, 25, 27

**E9.5 Scatter diagrams**
- Focus: Draw scatter diagrams, describe correlation and draw lines of best fit.
- Key: positive/negative/no correlation, line of best fit, using line to predict
- Example model: Points trend upward = positive correlation; predict y for given x from line

**E9.6 Cumulative frequency diagrams**
- Focus: Draw and use cumulative frequency curves to find median, quartiles and percentiles.
- Key: cumulative freq table, S-curve, median at n/2, Q1 at n/4, Q3 at 3n/4, IQR
- Example model: 60 students → median at 30th value, Q1 at 15th, Q3 at 45th

**E9.7 Histograms**
- Focus: Draw and interpret histograms with unequal class widths using frequency density.
- Key: freq density = frequency/class width, area = frequency, reading histograms
- Example model: Class 10-20 (width 10), freq 30 → freq density = 3

---

## 8. Verification Checklist

After generating each worksheet pair, verify:

- [ ] `## Syllabus focus` header exists (not repeated topic name)
- [ ] `## Model example` header exists
- [ ] `## Practice (10)` header exists
- [ ] Exactly 10 questions numbered `1.` through `10.`
- [ ] Exactly 10 answers numbered `1.` through `10.`
- [ ] All answers are mathematically correct (spot-check at minimum Q1, Q5, Q10)
- [ ] Topic code matches directory name (e.g., `c2-01` → `C2.1`)
- [ ] Core topics contain Core-level questions only
- [ ] Extended topics are appropriately harder
- [ ] Math expressions use backtick notation (not LaTeX `$...$`)
- [ ] No smart quotes (use straight `"` and `'` only)
- [ ] Currency amounts written outside backticks
- [ ] Student file has `Name: ____________________   Date: ____________________` line
- [ ] Answer file has NO Name/Date line, NO Tier line, NO marking notes

---

## 9. Batch Execution Plan

### Recommended order:
1. **Algebra C2** (9 topics) → verify → commit
2. **Algebra E2** (13 topics) → verify → commit
3. **Coordinate C3** (5) + **E3** (7) → verify → commit
4. **Geometry C4** (7) + **E4** (8) → verify → commit
5. **Mensuration C5** (5) + **E5** (5) → verify → commit
6. **Trigonometry C6** (2) + **E6** (6) → verify → commit
7. **Transformations C7** (1) + **E7** (4) → verify → commit
8. **Probability C8** (3) + **E8** (4) → verify → commit
9. **Statistics C9** (4) + **E9** (7) → verify → commit

### After all content is written:
Run the build script for each topic:
```bash
bash /path/to/agent/scripts/build_worksheet_pdf.sh /path/to/micro-topic-dir
```

Verify output is 3-page PDF (2 student + 1 answer).

---

## 10. Reference Examples

### Good student file (C1.11 Ratio and proportion):
```markdown
# CIE 0580 Worksheet (Student)
## C1.11 Ratio and proportion

Name: ____________________   Date: ____________________

## Syllabus focus
- Solve direct ratio and proportion problems in numeric contexts.

## Model example
Share 84 in ratio `3:4`.
Total parts = 7, one part = 12, shares = 36 and 48.

## Practice (10)
1. Simplify `24:36`.
2. Divide 72 in ratio `5:3`.
3. In ratio `2:7`, larger part is 63. Find smaller part.
4. Cost of 15 pens if 8 pens cost $6.40.
5. Scale factor 1.5 applied to length 12 cm.
6. If `y` directly proportional to `x`, `y=14` at `x=4`, find `y` at `x=9`.
7. If `y` inversely proportional to `x`, `y=20` at `x=3`, find `y` at `x=12`.
8. Ratio red:blue:green = `4:3:3`, total 250 ml, find blue.
9. Which is better value: 2 kg for $5.60 or 3 kg for $8.10?
10. Map scale `1:25000`, map distance 8 cm. Real distance?
```

### Good answer file (C1.11):
```markdown
# CIE 0580 Worksheet (Answers)
## C1.11 Ratio and proportion

1. `2:3`
2. `45` and `27`
3. `18`
4. $12.00
5. `18 cm`
6. `31.5`
7. `5`
8. `75 ml`
9. 3 kg pack is better value ($2.70/kg vs $2.80/kg)
10. `8 x 25000 cm = 200000 cm = 2 km`
```

---

## 11. Common Pitfalls to Avoid

1. **Wrong header format** — Must be `## Syllabus focus`, NOT `## E2.1 Introduction to algebra` repeated
2. **Smart quotes** — Ensure `"` not `"` or `"`
3. **Missing backticks for math** — `x^2 + 3` not just x^2 + 3
4. **Currency inside backticks** — Write `$5.60` outside backticks (the `$` inside backticks triggers math mode)
5. **Trailing Tier/Notes** — Answer files should NOT have `## Tier` or marking scheme notes
6. **Incorrect answers** — Triple-check all arithmetic, especially:
   - Fraction simplification
   - Negative number operations
   - Trigonometric calculations (use exact values where possible)
   - Probability fractions (numerator ≤ denominator)
7. **Core/Extended mismatch** — Don't put Extended concepts (quadratic formula, differentiation, etc.) in Core worksheets
