# PostgreSQL integration tests

Workflow-i `.github/workflows/postgres-integration.yml` ngre një PostgreSQL 16 të izoluar për çdo ekzekutim. Ai nuk lidhet me Supabase production, staging ose me të dhëna reale.

## Çfarë testohet

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

## Defense in depth

Kufiri mbahet në dy shtresa:

- aplikacioni ia kalon RPC-së vetëm `actor.profileId`;
- databaza nuk lejon që `anon` ose `authenticated` ta ekzekutojnë RPC-në service-only.

Leximet dhe mutacionet individuale vazhdojnë të kontrollojnë `physio_id` kundrejt actor-it të autentikuar në backend service.

## Ekzekutimi lokal

Kërkohet PostgreSQL 16 dhe `psql`:

```bash
export DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/app_test'
bash tests/database/patient-capacity-integration.sh
```

Databaza e përdorur duhet të jetë bosh dhe vetëm për testim, sepse fixture-i krijon role dhe tabela testuese.
