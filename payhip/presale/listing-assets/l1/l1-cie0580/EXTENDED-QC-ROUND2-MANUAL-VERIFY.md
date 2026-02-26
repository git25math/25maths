# CIE 0580 Extended Round-2 Manual Verification

## Scope
- Manual, step-by-step validation for the revised high-risk topics:
  - `E1.6`, `E4.1`, `E4.3`, `E8.2`, `E9.6`
- Focused on revised Section C items (`Q11`-`Q15`) where difficulty and correctness risk is highest.
- Cross-check target: topic alignment, arithmetic correctness, and final-answer consistency.

## Global QC Snapshot (latest run)
- Format pass: `72/72`
- Difficulty heuristic pass: `72/72`
- Answer auto-check: `70/70` (coverage `70/1080`)
- Source: `EXTENDED-QC-REPORT.md`

## Topic-by-Topic Manual Checks

### E1.6 Four Operations (Q11-Q15)
1. Q11  
   - Given 2400 bolts, 12.5% fail -> fail = `2400 * 0.125 = 300`  
   - Remaining = `2400 - 300 = 2100`  
   - Packed in 36s: `2100 = 36 * 58 + 12`  
   - Answer check: `58 full boxes, 12 bolts left` -> Correct
2. Q12  
   - `A = (3.6 - 1.25) * (4.8 / 0.6) = 2.35 * 8 = 18.8`  
   - `B = 2 3/4 + 5/8 = 2.75 + 0.625 = 3.375`  
   - `A - B = 18.8 - 3.375 = 15.425`  
   - Answer check: `15.425` -> Correct
3. Q13  
   - 8 servings use 1.25 kg flour and 0.6 kg sugar  
   - Flour limit factor: `3.5 / 1.25 = 2.8` -> servings `8 * 2.8 = 22.4`  
   - Sugar limit factor: `2.1 / 0.6 = 3.5` -> servings `8 * 3.5 = 28`  
   - Max complete servings = `22`  
   - Answer check: `22` -> Correct
4. Q14  
   - Base fare: `4.80 + 1.35 * 14 = 23.70`  
   - Add 8% tax: `23.70 * 1.08 = 25.596` -> `£25.60` (2 d.p.)  
   - Answer check: `£25.60` -> Correct
5. Q15  
   - Initially `3/5` of 900 L -> `540 L`  
   - Use 120 L -> `420 L`  
   - Refill 18% of remaining -> `420 * 0.18 = 75.6 L`  
   - Final = `420 + 75.6 = 495.6 L`  
   - Answer check: `495.6 L` -> Correct

### E4.1 Geometrical Terms (Q11-Q15)
1. Q11  
   - Regular decagon has 10 sides; exterior angle = `360/10 = 36°`  
   - Answer check: `Decagon, 10 sides, 36°` -> Correct
2. Q12  
   - Radius to tangent at contact point is perpendicular  
   - Angle = `90°`  
   - Answer check: `Tangent, 90°` -> Correct
3. Q13  
   - Two planes in 3D never meeting at constant separation -> parallel planes  
   - Answer check: `Parallel planes` -> Correct
4. Q14  
   - Two hexagonal bases + six rectangular faces -> hexagonal prism with 8 faces  
   - Answer check: `Hexagonal prism, 8 faces` -> Correct
5. Q15  
   - Locus equidistant from two intersecting lines -> both angle bisectors  
   - Answer check: `The two angle bisectors` -> Correct

### E4.3 Scale Drawings (Q11-Q15)
1. Q11  
   - Scale `1:25000`, map 9.6 cm -> real `9.6 * 25000 = 240000 cm = 2.4 km`  
   - First 60%: `1.44 km` at 12 km/h -> `0.12 h = 7.2 min`  
   - Remaining 40%: `0.96 km` at 18 km/h -> `0.0533... h = 3.2 min`  
   - Total = `10.4 min`  
   - Answer check: `10.4 minutes` -> Correct
2. Q12  
   - Plan `7.5 cm x 4.2 cm`, scale `1:400` -> real `30 m x 16.8 m`  
   - Area = `30 * 16.8 = 504 m²`  
   - Answer check: `504 m²` -> Correct
3. Q13  
   - 18 m = 1800 cm appears as 7.2 cm  
   - Ratio `7.2:1800 = 1:250`  
   - Answer check: `1:250` -> Correct
4. Q14  
   - Real sides (x150): `8.1 m`, `9.15 m`, `10.95 m`  
   - Perimeter = `28.2 m`  
   - Cost = `28.2 * 12 = £338.40`  
   - Answer check: `£338.40` -> Correct
5. Q15  
   - Real area `3.24 ha = 32400 m²`  
   - Area scale factor = `1 : 18000²`  
   - Map area = `32400 / 18000² = 0.0001 m² = 1 cm²`  
   - Answer check: `1 cm²` -> Correct

### E8.2 Relative and Expected Frequencies (Q11-Q15)
1. Q11  
   - Defect rate = `36/450 = 0.08`  
   - Defective in 3200 = `3200 * 0.08 = 256`  
   - Non-defective = `3200 - 256 = 2944`  
   - Answer check: `256 defective, 2944 non-defective` -> Correct
2. Q12  
   - Total produced = `120 + 150 + 130 + 140 + 160 = 700`  
   - Total defective = `6 + 9 + 7 + 8 + 10 = 40`  
   - Rate = `40/700 = 0.057142...`  
   - Expected in 900 = `900 * 40/700 = 51.428...` -> nearest whole `51`  
   - Answer check: `51` -> Correct
3. Q13  
   - Win rate = `47/125 = 0.376`  
   - Expected wins in 900 = `900 * 0.376 = 338.4`  
   - `P(not win) = 1 - 0.376 = 0.624`  
   - Answer check: `Expected wins = 338.4, P(not win)=0.624` -> Correct
4. Q14  
   - `84 = n * 0.35` -> `n = 84/0.35 = 240`  
   - Answer check: `240` -> Correct
5. Q15  
   - Bus 18%, car 42%, other = `100% - 60% = 40%`  
   - Other commuters = `15000 * 0.40 = 6000`  
   - Answer check: `6000` -> Correct

### E9.6 Cumulative Frequency Diagrams (Q11-Q15)
Using Q1 grouped data: `0-10:5, 10-20:9, 20-30:12, 30-40:8, 40-50:6`, total `n=40`, cumulative `5,14,26,34,40`.

1. Q11 (`Q3`)
   - `Q3` position = 30th value, in class `30-40` (from 26 to 34)  
   - Fraction into class = `(30-26)/8 = 0.5`  
   - Interpolated value = `30 + 0.5 * 10 = 35`  
   - Answer check: `35` -> Correct
2. Q12 (semi-IQR)
   - Given `Q1=15.6`, `Q3=35`  
   - IQR = `35 - 15.6 = 19.4`  
   - Semi-IQR = `19.4/2 = 9.7`  
   - Answer check: `9.7` -> Correct
3. Q13 (percentage between 18 and 36)
   - CF at 18: in class `10-20`, add `(8/10)*9 = 7.2` to 5 -> `12.2`  
   - CF at 36: in class `30-40`, add `(6/10)*8 = 4.8` to 26 -> `30.8`  
   - Between = `30.8 - 12.2 = 18.6` out of 40 -> `46.5%`  
   - Answer check: `46.5%` -> Correct
4. Q14 (larger spread)
   - Q1 data IQR = `19.4`; Dataset B IQR = `14`  
   - Larger IQR -> larger spread = Q1 data  
   - Answer check: `Q1 data` -> Correct
5. Q15 (95th percentile)
   - Position = `0.95 * 40 = 38th`, in class `40-50` (CF 34 to 40)  
   - Fraction into class = `(38-34)/6 = 4/6`  
   - Value = `40 + (4/6)*10 = 46.666...` -> `46.7`  
   - Answer check: `46.7` -> Correct

## Completeness Confirmation
- All Extended topic folders (`E1.1` to `E9.7`) present.
- Every worksheet remains 15 questions and matching answer rows.
- Revised topics preserve the same template structure and section layout.

## Final Verdict
- Revised high-risk topics pass manual arithmetic and concept checks.
- Global package status is release-ready under the current QC criteria.
