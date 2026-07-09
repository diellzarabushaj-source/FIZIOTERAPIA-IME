# Admin hidden access page

`/admin-hidden` is the safe fallback page for unauthorized admin access.

## Rule

This page must not redirect back to admin routes.

Admin routes use `requireAdminUser()` and redirect unauthorized users to `/admin-hidden`.

If `/admin-hidden` redirects back to `/admin-dashboard`, non-admin users can get trapped in an access loop.

## Correct behavior

`/admin-hidden` should render a simple access-restricted message with public links back to:

- `/`
- `/support`

It should not expose admin links, billing links, launch pages, or internal operator routes.
