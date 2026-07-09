# Admin physiotherapist profile creation

Because physiotherapists must be admin-activated, the owner/admin needs a simple way to create a physiotherapist profile before billing activation.

## Admin Billing flow

1. Admin opens `/admin-billing`.
2. Admin enters physiotherapist email, name and clinic.
3. The app creates or updates a `profiles` row with:
   - `role = physio`
   - `status = active`
4. Admin activates subscription for +1 month after payment confirmation.
5. Physiotherapist can sign in with Clerk and access only their own workspace.

## Rules

- Normal Clerk sign-in must not auto-create physiotherapist access.
- Admin/owner controls who exists as a physiotherapist.
- Billing activation remains separate from profile creation.
- Suspended or blocked profiles should not be automatically reactivated unless admin intentionally changes them.
