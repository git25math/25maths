# CIE 0580 Extended Round-4 Extended Sampling

## Scope
- Continue deep verification on additional high-risk Section C questions.
- Topics checked this round:
  - `E6.6`, `E8.3`, `E8.4`, `E9.3`, `E9.7`, `E7.2`, `E5.5`
- Goal: validate arithmetic/probability/statistics/vector consistency beyond auto-check coverage.

## Global QC Snapshot (after Round-4)
- Format pass: `72/72`
- Difficulty heuristic pass: `72/72`
- Answer auto-check pass: `70/70`
- Source: `EXTENDED-QC-REPORT.md`

## Verification Notes

### E6.6 Pythagoras and Trigonometry in 3D (Q11-Q15)
- Q11: \(5-12-13\) triangle -> `13 m` correct.
- Q12: \(\theta=\tan^{-1}(5/12)\approx22.6^\circ\) correct.
- Q13: slant edge \(=\sqrt{8^2+(3\sqrt2)^2}=\sqrt{82}\approx9.06\) correct.
- Q14: line-plane angle \(=\tan^{-1}\left(\frac{8}{3\sqrt2}\right)\approx62.1^\circ\).  
  Action: corrected answer from `62.6°` to `62.1°`.
- Q15: 3D distance \(=\sqrt{4^2+7^2+1^2}=\sqrt{66}\approx8.12\) correct.

### E8.3 Probability of Combined Events (Q11-Q15)
- Q11: \(P(H)\cdot P(\text{even }1\!-\!5)=\frac12\cdot\frac25=\frac15\) correct.
- Q12: \(P(M\cup S)=\frac{18+12-5}{30}=\frac{25}{30}=\frac56\) correct.
- Q13: \(1-\frac{17}{20}\cdot\frac{16}{19}=\frac{27}{95}\) correct.
- Q14: \(P(A\cap B)=P(B|A)P(A)=0.3\times0.7=0.21\) correct.
- Q15: \(0.76=p+0.6-0.6p\Rightarrow p=0.4\) correct.

### E8.4 Conditional Probability (Q11-Q15)
- Q11: kings among face cards \(=\frac4{12}=\frac13\) correct.
- Q12: sum 8 outcomes are 5, first die 3 in 1 of them -> \(\frac15\) correct.
- Q13: \(0.05\times0.9=0.045\) correct.
- Q14: \(P(+)=0.045+0.95\times0.08=0.121\) correct.
- Q15: \(P(D|+)=0.045/0.121\approx0.372\) correct.

### E9.3 Averages and Range (Q11-Q15)
- Q11: combined mean \(=(20\cdot68+30\cdot74)/50=71.6\) correct.
- Q12: mean of \(a,a+2,a+4\) is \(a+2=18\Rightarrow a=16\) correct.
- Q13: median of 9 ordered values is 5th value \(=8\) correct.
- Q14: \(Q_1=6.5,\ Q_3=14.5,\ \text{IQR}=8\) correct.
- Q15: midpoint mean \(=(2.5\cdot4+7.5\cdot6+12.5\cdot10)/20=9\) correct.

### E9.7 Histograms (Q11-Q15)
- Q11 densities: \(10/5=2,\ 18/10=1.8,\ 24/15=1.6\) -> \(0\!-\!5\) highest, correct.
- Q12 median position in \(n=52\) is between 26th and 27th, correct.
- Q13 modal class is class with density 3.1, correct.
- Q14 frequency \(=0.6\times15=9\), correct.
- Q15 density \(=14/4=3.5\), correct.

### E7.2 Vectors in Two Dimensions (Q11-Q15)
- Q11 vector sum \((1,4)+(-2,6)=(-1,10)\) correct.
- Q12 internal ratio point \(B+\frac25(C-B)=(5,3)\) correct.
- Q13 \((4,6)=2(2,3)\) parallel, correct.
- Q14 parallel condition \(k/12=2/3\Rightarrow k=8\), correct.
- Q15 resultant \((4-7,\ 3-1)=(-3,2)\), correct.

### E5.5 Compound Shapes and Parts of Shapes (Q11-Q15)
- Q11 annulus area \(\pi(7^2-4^2)=33\pi\), correct.
- Q12 semicircle difference \(=\frac12\pi(5^2-3^2)=8\pi\), correct.
- Q13 four quarter-circles radius 3 remove one full circle area \(9\pi\): \(240-9\pi\), correct.
- Q14 stadium perimeter \(=2\cdot18+8\pi=36+8\pi\), correct.
- Q15 unshaded area \(=\frac{4}{5}\cdot100\pi=80\pi\), correct.

## Corrections Log (Rounds 3-4)
- `E6.5 Q13`: updated to `70.3°` (from `70.0°`).
- `E6.6 Q14`: updated to `62.1°` (from `62.6°`).

## Final Verdict
- Round-4 extended sampling passed after precision corrections.
- Current worksheet set remains fully passing on global QC and stronger on manual answer fidelity.
