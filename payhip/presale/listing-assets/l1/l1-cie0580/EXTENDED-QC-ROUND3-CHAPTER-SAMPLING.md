# CIE 0580 Extended Round-3 Chapter Sampling & Boundary Tests

## Scope
- Chapter-level sampling across `E1` to `E9` (one representative topic per chapter).
- Verify high-risk Section C style questions and boundary-sensitive calculations.
- Re-run global QC after any correction.

## Global Status After Round-3
- Format pass: `72/72`
- Difficulty heuristic pass: `72/72`
- Answer auto-check pass: `70/70`
- Report source: `EXTENDED-QC-REPORT.md`

## Chapter Sampling Results

### E1 sample: E1.6 Four Operations
- Auto-checkable items passed: `4/4`
- Checked types: decimal multiplication, signed/BIDMAS evaluation.
- Verdict: pass.

### E2 sample: E2.5 Equations
- Auto-checkable items passed: `10/10`
- Checked types: linear and quadratic solving, positive/dual roots.
- Verdict: pass.

### E3 sample: E3.7 Perpendicular Lines (manual)
- Q11: \((k-1)\cdot\frac14=-1\Rightarrow k=-3\) -> matches.
- Q12: x-intercept of \(y=2x-5\) is \((2.5,0)\), perpendicular slope \(-\frac12\), line \(y=-\frac12x+\frac54\) -> matches.
- Q13: \(m_{AB}= \frac{6}{4}=\frac32\), perpendicular slope \(-\frac23\), through origin -> \(y=-\frac23x\) -> matches.
- Q14: perpendicular slope to \(\frac53\) is \(-\frac35\) -> matches.
- Q15: \(\overrightarrow{AB}=(4,2),\overrightarrow{AC}=(2,-4)\), dot product \(8-8=0\), right angle at \(A\) -> matches.
- Verdict: pass.

### E4 sample: E4.3 Scale Drawings (manual)
- Q11: route time split by 60%/40% speeds gives `10.4 min` -> matches.
- Q12: plan \(7.5\times4.2\) cm at \(1:400\) gives \(30\times16.8\) m, area `504 m^2` -> matches.
- Q13: \(7.2:1800=1:250\) -> matches.
- Q14: scaled perimeter \(=28.2\) m, cost `£338.40` -> matches.
- Q15: \(3.24\) ha at \(1:18000\) gives map area `1 cm^2` -> matches.
- Verdict: pass.

### E5 sample: E5.4 Surface Area and Volume (manual)
- Q11: cube edge 7 cm -> SA \(=6\cdot7^2=294\text{ cm}^2\) -> matches.
- Q12: hemisphere volume \(=\frac23\pi r^3=\frac23\pi\cdot6^3=144\pi\) -> matches.
- Q13: cylinder volume \(=\pi(1.2)^2(2.5)=3.6\pi\) -> matches.
- Q14: cone with same base/height is \(\frac13\) of cylinder volume -> matches.
- Q15: cylinder \(72\pi\) + hemisphere \(18\pi\) -> \(90\pi\) -> matches.
- Verdict: pass.

### E6 sample: E6.5 Non-Right-Angled Triangles (manual)
- Q11: cosine rule gives third side `13.76 cm` -> matches.
- Q12: \(60\sin C=48\Rightarrow \sin C=0.8\Rightarrow C=53.1^\circ\) (acute) -> matches.
- Q13: sine rule gives \(\sin B=\frac{19\sin48^\circ}{15}\), acute \(B\approx70.3^\circ\).
- Q14: sine rule gives acute opposite angle \(\approx55.8^\circ\) -> matches.
- Q15: cosine rule then perimeter gives `31.59 cm` -> matches.
- Action: corrected Q13 answer from `70.0°` to `70.3°` in generator.
- Verdict: pass after correction.

### E7 sample: E7.4 Vector Geometry (manual)
- Q11: \((6,4)=2(3,2)\) -> parallel -> matches.
- Q12: perpendicular condition \(3(2k-1)-2(9)=0\Rightarrow k=3.5\) -> matches.
- Q13: \(\overrightarrow{AD}=\overrightarrow{AB}+\overrightarrow{BC}+\overrightarrow{CD}=(4,5)\) -> matches.
- Q14: midpoint theorem in vector form gives \(\overrightarrow{MN}=\frac12(\mathbf c-\mathbf b)\) -> matches.
- Q15: midpoint position vector \(\overrightarrow{OM}=\frac{\mathbf p+\mathbf q}{2}\) -> matches.
- Verdict: pass.

### E8 sample: E8.2 Relative and Expected Frequencies (manual)
- Q11: defect rate \(36/450=0.08\) -> \(256\) defective, \(2944\) non-defective -> matches.
- Q12: pooled defect rate \(40/700\), in 900 gives \(51.4...\Rightarrow 51\) (nearest whole) -> matches.
- Q13: expected wins \(=900\cdot47/125=338.4\), \(P(\text{not win})=0.624\) -> matches.
- Q14: \(84=np, p=0.35\Rightarrow n=240\) -> matches.
- Q15: remaining share \(=40\%\) of 15000 gives `6000` -> matches.
- Verdict: pass.

### E9 sample: E9.6 Cumulative Frequency Diagrams (manual)
- Q11: \(Q_3\) (30th) in class \(30\!-\!40\) gives `35` -> matches.
- Q12: semi-IQR \(=\frac{35-15.6}{2}=9.7\) -> matches.
- Q13: interpolated CF between 18 and 36 gives `46.5%` -> matches.
- Q14: compare IQR \(19.4\) vs \(14\): Q1 data more spread -> matches.
- Q15: 95th percentile (38th) in class \(40\!-\!50\) gives `46.7` -> matches.
- Verdict: pass.

## Boundary Test Notes
- Percentage-with-remainder arithmetic: validated (`E1.6 Q11`).
- Area scaling with squared scale factor: validated (`E4.3 Q15`).
- Sine-rule acute branch sensitivity: validated and corrected (`E6.5 Q13`).
- Expected-frequency nearest-integer rounding: validated (`E8.2 Q12`).
- Cumulative-frequency interpolation near upper tail: validated (`E9.6 Q15`).

## Final Verdict
- Round-3 chapter sampling passed.
- One precision correction applied (`E6.5 Q13`) and revalidated.
- Current Extended worksheet set is internally consistent under format, difficulty, answer, and completeness checks.
