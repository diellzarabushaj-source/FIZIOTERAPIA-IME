# PostgreSQL integration tests

Workflow-i `.github/workflows/postgres-integration.yml` ngre një PostgreSQL 16 të izoluar për çdo ekzekutim. Ai nuk lidhet me Supabase production, staging ose me të dhëna reale.

## Kapaciteti i pacientëve

Testi `tests/database/patient-capacity-integration.sh`:

1. Krijon skemën minimale të pacientëve dhe abonimeve.
2. Aplikon migrimin real `20260713_atomic_patient_capacity.sql`.
3. Verifikon privilegjet e funksionit:
   - `anon` nuk ka `EXECUTE`;
   - `authenticated` nuk ka `EXECUTE`;
   - vetëm `service_role` ka `EXECUTE`.
4. Provon drejtpërdrejt që roli `authenticated` merr `permission denied` kur tenton të zgjedhë vetë një `physio_id`.
5. Nis dy lidhje PostgreSQL paralelisht kur fizioterapisti ka katër pacientë falas:
   - vetëm njëra krijon pacientin e pestë;
   - tjetra refuzohet me `subscription_required`;
   - numri final mbetet pesë.
6. Verifikon që një abonim aktiv lejon të dy krijimet paralele.
7. Verifikon që dy kërkesa identike paralele krijojnë vetëm një kartelë dhe kërkesa tjetër e ripërdor atë.

## Billing dhe veprimet administrative

Testi `tests/database/admin-billing-integration.sh` e rivendos skemën testuese dhe aplikon migrimet reale:

- `20260710134000_harden_admin_access_operations.sql`;
- `20260710_harden_manual_payment_approval.sql`.

Ai verifikon:

1. `anon` dhe `authenticated` nuk mund të ekzekutojnë RPC-të financiare.
2. Aktivizimi i një fizioterapisti pending krijon abonim aktiv dhe aktivizon profilin.
3. Një profil i bllokuar ose një profil jo-physio nuk mund të aktivizohet.
4. Suspendimi ruan arsyen dhe nuk mund të përsëritet mbi të njëjtin abonim.
5. Refuzimi i pagesës ruan reviewer-in dhe arsyen dhe nuk mund të përsëritet.
6. Dy aprovime paralele mbi të njëjtën dëshmi:
   - vetëm njëri aprovohet;
   - vetëm një abonim krijohet;
   - kërkesa tjetër dështon pasi statusi nuk është më `proof_uploaded`.
7. Një pagesë e re e zgjat qasjen pas përfundimit të abonimit ekzistues.

## Defense in depth

Kufiri mbahet në disa shtresa:

- aplikacioni ia kalon RPC-së së pacientit vetëm `actor.profileId`;
- backend service lejon mutacionet financiare vetëm për rolin `owner`;
- databaza nuk lejon që `anon` ose `authenticated` të ekzekutojnë RPC-të service-only;
- funksionet e aprovimit përdorin row locking dhe status transitions për të parandaluar veprime të dyfishta.

Leximet dhe mutacionet individuale vazhdojnë të kontrollojnë `physio_id` kundrejt actor-it të autentikuar në backend service.

## Ekzekutimi lokal

Kërkohet PostgreSQL 16 dhe `psql`:

```bash
export DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/app_test'
bash tests/database/patient-capacity-integration.sh
bash tests/database/admin-billing-integration.sh
```

Databaza e përdorur duhet të jetë vetëm për testim. Fixture-i i billing-ut e fshin dhe e rikrijon skemën `public`.
