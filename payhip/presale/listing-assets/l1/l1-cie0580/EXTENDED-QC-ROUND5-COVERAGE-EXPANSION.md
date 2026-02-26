# CIE 0580 Extended Round-5 Coverage Expansion

## Scope
- Further expanded manual verification coverage on additional Section C topics:
  - `E1.17`, `E2.4`, `E3.5`, `E4.6`, `E5.3`, `E6.4`, `E7.3`, `E9.4`
- Objective: continue reducing residual risk in numeric precision and topic-fit consistency.

## Current Global QC Baseline
- Format pass: `72/72`
- Difficulty heuristic pass: `72/72`
- Answer auto-check pass: `70/70`
- Source: `EXTENDED-QC-REPORT.md`

## Round-5 Verification Results

### E1.17 Exponential Growth and Decay (Q11-Q15)
- Q11 threshold inequality \(1500(1.12)^n>3000\) gives smallest integer `n=7` -> matches.
- Q12 decay threshold \(7000(0.94)^n<4000\) gives smallest integer `n=10` -> matches.
- Q13 increase after 5 years: \(25000[(1.024)^5-1]=3147.50\) -> matches.
- Q14 3 half-lives in 15 h: initial \(=40\times2^3=320\) g -> matches.
- Q15 \(V/V_0=2^{27/9}=8\) -> matches.
- Verdict: pass.

### E2.4 Indices II (Q11-Q15)
- Q11 \(2^{x-1}=16\Rightarrow x=5\) -> matches.
- Q12 \(9^x=27\Rightarrow x=3/2\) -> matches.
- Q13 \(5^{2x+1}=125\Rightarrow x=1\) -> matches.
- Q14 \(64^{2/3}\times8^{-1}=16\times1/8=2\) -> matches.
- Q15 \(\frac{32x^{-2}y^{3/2}}{4x^{1/2}y^{-1/2}}=\frac{8y^2}{x^{5/2}}\) -> matches.
- Verdict: pass.

### E3.5 Equations of Linear Graphs (Q11-Q15)
- Q11 \(7=3(-2)+c\Rightarrow c=13\) -> matches.
- Q12 through \((1,2)\), y-intercept \(-1\) gives \(y=3x-1\) -> matches.
- Q13 through \((0,-3)\), \((4,5)\) gives \(y=2x-3\) -> matches.
- Q14 intersection of \(y=2x+1\), \(y=-x+10\) is \((3,7)\) -> matches.
- Q15 for \(3x+2y=12\): intercepts \((4,0)\), \((0,6)\) -> matches.
- Verdict: pass.

### E4.6 Angles (Q11-Q15)
- Q11 pentagon interior sum \(=(5-2)180=540^\circ\) -> matches.
- Q12 regular nonagon interior angle \(=140^\circ\) -> matches.
- Q13 exterior angle \(24^\circ\Rightarrow n=360/24=15\) -> matches.
- Q14 \(x+2x+3x+4x=360\Rightarrow x=36^\circ\) -> matches.
- Q15 right triangle with \(35^\circ\) gives third angle \(55^\circ\) -> matches.
- Verdict: pass.

### E5.3 Circles, Arcs, and Sectors (Q11-Q15)
- Q11 segment area \(=25\pi-50\) -> matches.
- Q12 annulus area \(=\pi(14^2-10^2)=96\pi\) -> matches.
- Q13 circumference with \(r=0.35\): \(2\pi r=0.7\pi\) m -> matches.
- Q14 revolutions for 44 m: \(44/(0.7\pi)\approx20\) -> matches.
- Q15 40% sector angle \(=0.4\times360=144^\circ\) -> matches.
- Verdict: pass.

### E6.4 Trigonometric Functions (Q11-Q15)
- Q11 \(2\sin x=1\Rightarrow x=30^\circ,150^\circ\) in \(0^\circ\le x\le180^\circ\) -> matches.
- Q12 \(\cos x=-1/2\Rightarrow x=120^\circ,240^\circ\) in \(0^\circ\le x<360^\circ\) -> matches.
- Q13 \(\tan x=1\Rightarrow x=45^\circ,225^\circ\) in \(0^\circ\le x<360^\circ\) -> matches.
- Q14 period of \(\sin x\): \(360^\circ\) -> matches.
- Q15 max of \(2\sin x\): `2` -> matches.
- Verdict: pass.

### E7.3 Magnitude of a Vector (Q11-Q15)
- Q11 \(\sqrt{k^2+5^2}=13\Rightarrow k=\pm12\) -> matches.
- Q12 \(|(p,p)|=\sqrt{2}p=10\Rightarrow p=5\sqrt2\) (positive) -> matches.
- Q13 resultant of perpendicular 9 and 40 is 41 -> matches.
- Q14 \(|0.5\mathbf a|=0.5|\mathbf a|=5\) for \(\mathbf a=(6,8)\) -> matches.
- Q15 \((2,7)\) and \((7,2)\) have equal magnitude \(\sqrt{53}\) -> matches.
- Verdict: pass.

### E9.4 Statistical Charts and Diagrams (Q11-Q15)
- Q11 pie sector frequency \(=48/360\times150=20\) -> matches.
- Q12 composition by category -> pie chart, matches.
- Q13 grouped continuous unequal widths -> histogram, matches.
- Q14 frequency polygon class \(12\!-\!18\) x-value is midpoint 15, matches.
- Q15 stem-and-leaf \(6|3\Rightarrow63\), matches.
- Verdict: pass.

## Change Log in This Round
- No new corrections were required in Round-5.
- Previously applied precision fixes remain valid:
  - `E6.5 Q13 -> 70.3°`
  - `E6.6 Q14 -> 62.1°`

## Final Verdict
- Round-5 expanded coverage passed.
- Extended worksheet bank remains stable after cumulative QC rounds.
