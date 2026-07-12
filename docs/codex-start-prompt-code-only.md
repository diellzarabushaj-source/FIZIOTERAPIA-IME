# Codex Start Prompt — Code-only patient access

Copy/paste this into Codex after connecting the repository.

```text
Open repository diellzarabushaj-source/FIZIOTERAPIA-IME.

First read AGENTS.md completely.

Then do this task:

1. Run npm install.
2. Run npm run build.
3. Fix only build/type errors.
4. Do not redesign the product.
5. Do not change patient code-only access.
6. Do not reintroduce username as required patient login.
7. Do not change /p/[code], /patient-access/[code], or /api/patient/access-qr/[code].
8. Do not change billing price 9.90 EUR/month.
9. Do not expose secrets.
10. Keep Supabase service-role server-only.
11. Keep AI safety wording: AI is movement-quality feedback only, not diagnosis and not a replacement for physiotherapist.
12. Keep pain rule: pain 7/10 or higher = stop and contact physiotherapist.

After finishing, report:

- build status
- exact command output if build failed
- files changed
- routes checked
- any remaining blockers
```
