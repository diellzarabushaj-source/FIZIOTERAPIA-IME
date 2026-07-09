# Admin-activated physiotherapist access

Physiotherapists must not self-create platform access by signing in with Clerk alone.

## Access rule

A physiotherapist can access and use the workspace only when:

1. the user is signed in with Clerk;
2. a matching Supabase `profiles` row exists for the email;
3. the profile role is `physio`, `owner`, or `admin`;
4. the profile is not blocked, inactive, or suspended;
5. paid/subscription access is active unless the role is owner/admin.

## Owner/admin

The owner account is determined by `ADMIN_EMAIL`, falling back to `diellzarabushaj@gmail.com`.

Admin billing actions must also use the same configured `ADMIN_EMAIL` instead of a separate hardcoded check.

## Why this matters

Admin is the only platform owner. A normal physiotherapist is a clinical workspace user and must not gain access to platform functionality simply by creating/signing into a Clerk account.

This keeps the launch model controlled:

- admin controls who exists as a physiotherapist;
- admin controls billing activation;
- physiotherapist sees only their own workspace;
- patient access stays code/QR based.
