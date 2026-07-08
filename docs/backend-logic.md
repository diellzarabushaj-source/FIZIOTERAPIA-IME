# Backend Logic – FizioPlan

Backend-i eshte pjesa qe ruan te dhenat, kontrollon rolet dhe lidh pacientin me fizioterapeutin.

## 1. Rrjedha e pacientit

1. Fizioterapeuti krijon pacientin.
2. Sistemi gjeneron kod unik, p.sh. ARB-4821.
3. Pacienti hyn me kod.
4. Backend kontrollon nese kodi ekziston dhe ka plan aktiv.
5. Pacienti sheh vetem planin e vet.
6. Pacienti kryen ushtrim, raporton dhimbje dhe mund te beje AI check.
7. Backend ruan log, pain score, AI score dhe feedback.
8. Fizioterapeuti i sheh ne dashboard.

## 2. Rrjedha e fizioterapeutit

1. Hyn me Clerk email/password.
2. Backend kontrollon role = physio.
3. Fizioterapeuti sheh vetem pacientet qe i takojne atij.
4. Mund te krijoje plan dhe te caktoje ushtrime.
5. Mund te shohe alerts.
6. Mund t'i dergoje pacientit korrigjim.

## 3. Rrjedha e owner/admin

1. Owner nuk shfaqet ne landing page.
2. Owner nuk ka signup publik.
3. Owner ekziston manualisht ne Clerk/Supabase.
4. Backend kontrollon role = owner.
5. Owner sheh krejt fizioterapeutet, revenue, usage dhe exercise library.

## 4. Alerts

Backend krijon alerts kur:

- pain_score > 7
- ai_score < 60
- pacienti nuk i kryen ushtrimet per disa dite
- ka koment shqetesues

## 5. Rregulla sigurie

- Pacienti sheh vetem te dhenat e veta.
- Fizioterapeuti sheh vetem pacientet e vet.
- Owner sheh krejt sistemin.
- Asnje sekret/API key nuk ruhet ne GitHub.
- Te dhenat sensitive ruhen ne Supabase dhe mbrohen me RLS.