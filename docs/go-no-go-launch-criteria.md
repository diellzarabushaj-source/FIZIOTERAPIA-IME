# Go / No-Go launch criteria

Use this before expanding the Fizioterapia ime pilot beyond the first physiotherapist.

## Route

Admin decision dashboard:

- `/pilot-decision`

## Go condition

You may invite 1–2 more physiotherapists only if:

- there are 0 open `P0 blocker` issues
- there are 0 open `P1 high` issues
- there is 0 untriaged feedback
- at least one pilot physiotherapist says they would use it with a real patient
- payment readiness average is 4.0/5 or higher
- AI clarity average is 4.0/5 or higher

This is still a controlled pilot, not a public launch.

## Hold condition

Hold and fix first if:

- feedback exists but is not triaged
- any P1 high issue is still open
- payment readiness is low
- AI clarity is low
- report usefulness is low
- safety concerns are unclear

## No-go condition

Do not invite more users if:

- any P0 blocker is open
- patient login fails
- AI Movement Check crashes after camera permission
- admin billing changes the wrong user
- private keys are visible in browser, logs or public code
- one patient can see another patient’s data

## Public launch condition

Do not launch publicly until:

- multiple pilot cycles pass
- legal/GDPR review is done
- support flow is ready
- billing flow is reliable
- app store assets are ready
- no P0/P1 issues are open

## Decision record template

```text
Date:
Decision: Go / Hold / No-go
Feedback count:
P0 open:
P1 open:
Untriaged:
Payment readiness average:
AI clarity average:
Report usefulness average:
Safety concerns:
Decision owner:
Notes:
Next action:
```
