# Fizioterapia Ime — Therapy Flow

## Core rule

AI suggests. Physiotherapist reviews and approves. Patient receives only approved plans.

## Physiotherapist flow

1. Create patient plan.
2. Add diagnosis, phase, goal, pain score, notes and red flags.
3. Choose source: AI suggestions, exercise database, or custom exercise.
4. Edit each exercise: sets, reps, frequency, instructions, video and patient note.
5. Review safety: pain score, contraindications, wrong phase, missing instructions.
6. Approve and send to patient.

## Patient flow

1. Patient receives code, QR or link.
2. Patient logs in with code.
3. Patient sees today's session.
4. Patient watches video and reads instructions.
5. Patient marks exercise complete.
6. Patient enters pain score and comment.
7. High pain creates an alert for the physiotherapist.
8. Physiotherapist adjusts the plan when needed.

## Data flow

Excel or CSV exercise library -> Supabase exercise_library -> AI suggestion API -> plan builder -> review -> approve -> patient dashboard.

## Exercise library columns

- primary_name
- alternative_names
- body_part
- diagnosis
- phase
- goal
- difficulty
- equipment
- position
- sets
- reps
- duration
- instructions_sq
- clinical_notes
- contraindications
- stop_if
- video_url
- thumbnail_url
- tags
- ai_enabled
- status

Videos are stored in Supabase Storage, Bunny, Vimeo or another video host. The database stores only the video URL.

## Implemented routes

- /physiotherapist-portal
- /patient-portal
- /patient-dashboard
- /product-flow
- /api/ai/exercise-suggestions

## Next build steps

1. Add AI suggestions UI inside physiotherapist portal.
2. Add dedicated Review & Approve screen.
3. Add approve/send server actions.
4. Add CSV exercise import.
5. Add video upload or video URL manager.
