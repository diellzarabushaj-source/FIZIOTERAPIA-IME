# AI MediaPipe Logic – FizioPlan

AI ne FizioPlan nuk eshte doktor dhe nuk merr vendime klinike. AI eshte vetem movement checker.

## 1. Si punon

1. Pacienti hap kameran.
2. MediaPipe detekton pikat e trupit: shpatulla, ije, gjunje, kyce, etj.
3. Sistemi mat kende dhe pozicione.
4. Rregullat e ushtrimit krahasohen me levizjen reale.
5. Jepet score 0-100.
6. Jepet feedback bazik ne shqip.
7. Nese ka problem krijohet alert per fizioterapeutin.

## 2. Cfare ruhet ne backend

Ne MVP nuk ruhet video e pacientit. Ruhen vetem:

- patient_id
- exercise_id
- score
- feedback
- alert_type
- pain_score
- timestamp

## 3. Shembull: Squat

Kontrollo:
- knee alignment
- hip depth
- trunk angle
- symmetry
- control/speed

Score:
- Knee alignment: 30 pike
- Back posture: 25 pike
- Range/depth: 25 pike
- Control: 20 pike

Feedback shembull:
"Mire, por gjuri i djathte po hyn pak brenda. Mbaje gjurin ne linje me shputen."

## 4. Shembull: Glute Bridge

Kontrollo:
- hip extension
- pelvis stability
- hold time
- symmetry

Feedback shembull:
"Ngri ijet pak me lart dhe mbaje pozicionin 2 sekonda."

## 5. Shembull: Shoulder Abduction

Kontrollo:
- arm angle
- shoulder hiking
- range of motion
- pain score

Feedback shembull:
"Krahu arriti rreth 75 grade. Mos e shty me dhimbje, beje ngadale."

## 6. Kufizime klinike

AI nuk:
- cakton ushtrime
- ndalon ushtrime
- ndryshon plan
- diagnostikon
- zevendeson fizioterapeutin

Fizioterapeuti eshte gjithmone vendimmarresi final.