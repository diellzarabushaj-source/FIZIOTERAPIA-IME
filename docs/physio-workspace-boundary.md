# Physiotherapist workspace boundary

A physiotherapist is not a platform admin.

The physiotherapist portal must remain scoped to the signed-in physiotherapist workspace.

## Allowed for physiotherapist

- View their own dashboard.
- View patients linked to their own `profile.id` / `physio_id`.
- Create patients for their own account.
- Create plans for their own patients.
- Assign exercises only to their own patients.
- Use default exercise library.
- Create private exercises for their own workspace.
- View logs, pain scores, AI feedback and reports only for their own patients.

## Not allowed for physiotherapist

- Access admin dashboard.
- Access admin billing/global subscription management.
- See all platform patients.
- Activate/suspend other physiotherapists.
- Manage global platform settings.
- Access internal launch, QA, pilot decision or owner pages.

## Current code boundary

The physiotherapist dashboard queries patients through `physio_id` for non-admin users.

The platform owner/admin is the only exception and may have broader access for internal management.

`/physiotherapist-portal` is protected by `requirePhysioWorkspaceUser()` so anonymous users and non-clinical roles cannot render the portal page.
