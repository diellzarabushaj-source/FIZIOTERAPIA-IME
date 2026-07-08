# AI Movement Check Safety SOP

Status: Draft for clinic use.

## Purpose

This SOP defines how AI Movement Check is used safely in the clinic.

AI Movement Check is a support feature. It is not a medical decision system.

## Non-negotiable AI rule

Use this wording everywhere:

```text
AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk vendos diagnozë, nuk cakton terapi dhe nuk e zëvendëson fizioterapeutin.
```

## What AI can do

AI can help evaluate movement quality signals such as:

- body visibility
- posture alignment
- symmetry
- movement control
- stability
- whether landmarks are detected clearly

## What AI cannot do

AI cannot:

- diagnose disease or injury
- prescribe exercises
- decide if a patient is medically safe
- replace physiotherapist assessment
- replace doctor assessment
- handle emergencies
- detect all red flags

## When AI can be enabled

AI can be enabled only when:

- exercise is simple enough for camera feedback
- movement can be visually assessed
- patient can safely perform it at home
- physiotherapist has approved the exercise
- patient understands AI is only feedback

Good examples:

- Glute bridge
- Cat cow
- Pelvic tilt
- Bird dog
- Straight leg raise
- Sit to stand
- Wall slides
- Scapular setting

Avoid AI for:

- complex manual therapy
- painful acute injuries
- unstable patients
- exercises requiring direct hands-on supervision
- patients with unclear red flags

## Pain safety rule

If patient reports pain 7/10 or higher:

```text
Stop exercise + contact physiotherapist
```

This rule is stronger than any AI score.

Even if AI score is good, pain 7/10 means stop.

## Low AI score rule

If AI score is under 60:

```text
Patient should slow down, review instructions, and contact physiotherapist if unsure.
```

Physiotherapist should review:

- which exercise was performed
- patient comment
- pain score
- AI feedback
- whether the plan should be adjusted

## Red flags

Patient should stop and contact physiotherapist/doctor if any of these occur:

- strong pain
- dizziness
- numbness or tingling
- weakness
- loss of balance
- swelling that increases
- new severe headache
- shortness of breath
- chest pain
- loss of bladder/bowel control

For emergency symptoms, patient should seek emergency medical help.

## Camera and privacy

Current MVP rule:

- video is not stored
- score is stored
- feedback is stored
- alert type is stored
- timestamp is stored

Patient must be informed that camera is used only for movement feedback.

## Physiotherapist responsibility

The physiotherapist remains responsible for:

- patient assessment
- plan creation
- exercise selection
- reviewing high pain alerts
- reviewing low AI alerts
- modifying plan when needed
- advising patient when to stop

## Patient instruction text

Use this text before first AI use:

```text
Ky kontroll përdor kamerën për të dhënë feedback mbi cilësinë e lëvizjes. Nuk është diagnozë dhe nuk zëvendëson fizioterapeutin. Nëse ke dhimbje 7/10 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.
```

## Staff checklist before activating AI exercise

- [ ] Exercise is safe for home program.
- [ ] Patient received instructions.
- [ ] Patient understands pain scale.
- [ ] Patient understands AI is feedback only.
- [ ] Patient has camera permission information.
- [ ] Physiotherapist knows how to review AI results.

## Incident workflow

If patient reports high pain or unsafe AI feedback:

1. Review patient log.
2. Review pain score and comment.
3. Review AI score and feedback.
4. Contact patient if needed.
5. Stop or modify exercise if clinically appropriate.
6. Document decision in patient notes/report.

## Language to avoid

Do not say:

- “AI diagnosis”
- “AI treatment”
- “AI replaces physiotherapist”
- “AI knows if you are safe”
- “AI will prescribe exercises”

Use instead:

- “AI feedback”
- “movement-quality check”
- “support tool”
- “physiotherapist remains responsible”
