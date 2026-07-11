# Production recovery runbook

Ky dokument përdoret kur `Fizioterapia Ime` ndërtohet me sukses, por production raporton `503`, `degraded` ose `not_ready`.

## Gjendja që duhet të jetë e vërtetë para pilotimit

- `GET /api/health` kthen HTTP `200` dhe `status: "healthy"`.
- `GET /api/readiness` kthen HTTP `200`, `status: "ready"` dhe `schemaVersion: "20260711.4"`.
- `PATIENT_SESSION_SECRET` është vendosur në production dhe nuk ka prefiks `NEXT_PUBLIC_`.
- `PATIENT_SESSION_REGISTRY_ENABLED=1` vetëm pasi migrimi i regjistrit të sesioneve është aplikuar.
- Clerk production keys, Supabase production keys dhe URL-ja kanonike janë vendosur në Vercel.
- Domain-i i Resend është verifikuar para dërgimit të email-eve te përdoruesit realë.

## 1. Ndale aktivizimin e funksioneve të reja

Mos aktivizo planin e pacientit, mos krijo ushtrime private dhe mos regjistro seanca të reja derisa readiness të jetë `ready`. Leximi i bibliotekës standarde mund të funksionojë në modalitet kompatibiliteti, por shkrimet e reja që kërkojnë schema-n moderne mbeten të bllokuara qëllimisht.

## 2. Apliko migrimet e Supabase në rend

Përdor Supabase CLI të lidhur me projektin e saktë të production-it:

```bash
supabase login
supabase link --project-ref <PRODUCTION_PROJECT_REF>
supabase db push --linked
```

Nëse migrimet aplikohen manualisht nga SQL Editor, ekzekuto çdo skedar në `supabase/migrations/` sipas emrit, nga më i vjetri te më i riu. Mos ekzekuto vetëm migrimin e fundit.

Migrimet kritike për këtë rollout janë:

1. `20260711_database_schema_readiness.sql`
2. `20260711_patient_session_registry.sql`
3. të gjitha migrimet e seancave klinike dhe planeve që vijnë para migrimit final
4. `20260711_zz_exercise_library_readiness.sql`

Migrimi final duhet të vendosë `app_schema_state.schema_version` në `20260711.4` dhe të krijojë RPC-në `deployment_readiness`.

## 3. Gjenero secrets të veçanta

Gjenero vlera të reja; mos ripërdor Clerk, Supabase ose Resend keys.

```bash
openssl rand -base64 48
```

Vendosi në Vercel për environment-in `Production`:

- `PATIENT_SESSION_SECRET`
- `HEALTH_MONITOR_SECRET`

`PATIENT_SESSION_SECRET` duhet të ketë së paku 32 bytes entropi dhe nuk duhet të ruhet në repository, dokumente publike ose screenshots.

## 4. Aktivizo regjistrin e sesioneve vetëm pas migrimit

Pasi tabela `patient_auth_sessions` dhe funksioni `rotate_patient_access_code` të ekzistojnë:

```text
PATIENT_SESSION_REGISTRY_ENABLED=1
```

Nëse vendoset `1` para migrimit, hyrja e pacientit do të dështojë fail-closed. Kjo është sjellje e qëllimshme sigurie.

## 5. Redeploy production

Pas ndryshimit të environment variables ose migrimeve:

1. bëj redeploy të commit-it të verifikuar;
2. mos përdor cache të një deployment-i të vjetër;
3. kontrollo build logs për warnings dhe errors;
4. kontrollo runtime errors pas testit të parë.

## 6. Verifiko endpoints

Pa secret, endpoint-i i readiness tregon vetëm statusin minimal:

```bash
curl -i https://<DOMAIN>/api/health
curl -i https://<DOMAIN>/api/readiness
```

Për diagnostikë të mbrojtur:

```bash
curl -i \
  -H "x-monitor-secret: $HEALTH_MONITOR_SECRET" \
  https://<DOMAIN>/api/readiness
```

Pritet:

```json
{
  "status": "ready",
  "schemaVersion": "20260711.4",
  "expectedSchemaVersion": "20260711.4",
  "missingTables": [],
  "missingColumns": [],
  "missingFunctions": []
}
```

Mos kopjo output-in e mbrojtur në issue publike nëse përmban detaje të infrastrukturës.

## 7. Smoke test klinik

Përdor llogari testimi dhe të dhëna jo reale:

1. hyr si fizioterapeut i aprovuar;
2. krijo një pacient testues;
3. hap bibliotekën e ushtrimeve;
4. krijo një draft-plan;
5. shto një ushtrim standard dhe një privat;
6. dërgoje draftin për kontroll, aprovoje dhe aktivizoje;
7. hape programin me kodin e pacientit;
8. shëno një ushtrim si të përfunduar;
9. planifiko dhe përfundo një seancë;
10. gjenero raportin për printim/PDF;
11. ndërro kodin e pacientit dhe verifiko që kodi i vjetër nuk funksionon.

## 8. Resend

Aktualisht email-et nuk duhet të konsiderohen production-ready pa:

- domain të verifikuar;
- `RESEND_API_KEY` në Vercel;
- `RESEND_FROM_EMAIL` nga domain-i i verifikuar;
- `RESEND_REPLY_TO_EMAIL` të kontrolluar;
- template të publikuara;
- test delivery, bounce dhe complaint handling.

Mos përdor `onboarding@resend.dev` për përdorues realë.

## 9. Rollback

Nëse deployment-i i ri ka regression:

1. rikthe deployment-in e fundit të verifikuar në Vercel;
2. mos kthe prapa migrimet destruktive pa backup dhe plan të dokumentuar;
3. mbaj `PATIENT_SESSION_REGISTRY_ENABLED=0` vetëm nëse regjistri nuk është gati;
4. verifiko përsëri `/api/health` dhe `/api/readiness`;
5. dokumento timestamp-in, commit SHA-n, deployment ID-n dhe simptomën.

## 10. Evidenca që duhet ruajtur

Për çdo incident ruaj privatisht:

- commit SHA;
- Vercel deployment ID;
- kohën e fillimit dhe përfundimit;
- statusin e health/readiness;
- kodet e gabimeve të Supabase pa të dhëna klinike;
- migrimin e fundit të aplikuar;
- veprimin e rollback/recovery;
- personin që e verifikoi smoke test-in.
