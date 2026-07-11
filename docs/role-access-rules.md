# Role access rules — Fizioterapia Ime

## Admin / platform owner

Admin is a single internal platform owner account.

The admin can:

- manage the whole platform;
- access the owner/admin dashboard;
- manage subscriptions and billing status;
- activate or suspend physiotherapist access;
- review platform-wide feedback and launch decisions;
- manage default exercise library and platform-level templates;
- see platform-level reporting and safety alerts.

Admin access must be restricted to `ADMIN_EMAIL` only. Public pages should not expose admin links.

## Physiotherapist

A physiotherapist is a clinical user, not a platform admin.

A physiotherapist can access only their own dashboard and clinical workspace.

The physiotherapist can:

- create and manage their own patients;
- create plans for their own patients;
- assign exercises from the library;
- add private exercises for their own use;
- monitor adherence, pain scores and AI feedback for their own patients;
- generate or view reports for their own patients;
- view professional contact details of other active physiotherapists;
- send a patient handoff request to another active physiotherapist after confirming patient consent;
- accept or decline a handoff request addressed to them.

Patient handoff rules:

- a patient remains owned by the sending physiotherapist while the request is pending;
- the receiving physiotherapist must explicitly accept the request;
- acceptance transfers the patient record, plans, clinical sessions and clinical alerts atomically;
- the sending physiotherapist cannot forge another sender identity;
- a physiotherapist cannot transfer a patient they do not currently own;
- a physiotherapist cannot transfer a patient to themselves;
- a second pending handoff for the same patient is blocked;
- a transfer is blocked when the receiving physiotherapist already has the same patient identity;
- every request, response and cancellation is audited;
- contact details and collaboration pages are visible only to authenticated active physiotherapists.

A physiotherapist must not:

- access admin dashboard;
- manage global platform billing;
- activate or suspend other physiotherapists;
- view platform-wide patient data;
- open another physiotherapist's patient record before a handoff is accepted;
- manage platform-owner decisions;
- access internal launch, QA, or pilot decision pages.

## Patient

A patient is not a Clerk/admin user.

The patient accesses the patient app with patient code / QR and sees only the plan assigned by their physiotherapist.

The patient can:

- view assigned exercises;
- mark exercises as completed;
- report pain and feedback;
- use AI Movement Check only as feedback.

The patient cannot:

- create their own treatment plan;
- change clinical rules;
- access physiotherapist dashboard;
- access admin pages.

A patient handoff requires confirmed patient consent before the request is created.

## Launch rule

Before public launch:

- admin links must stay hidden from public navigation/footer;
- admin routes must redirect non-admin users;
- physiotherapist routes must remain scoped to the signed-in physiotherapist;
- patient routes must remain code-based and scoped to the patient plan;
- collaboration routes must remain restricted to active physiotherapists;
- patient handoff migration must be applied before transfer actions are enabled;
- public copy should not use internal terms like `admin dashboard`, `owner control`, `QA`, or `pilot decision` unless the page is protected.
