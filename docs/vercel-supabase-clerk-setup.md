# Setup Plan – Vercel + Supabase + Clerk

## 1. GitHub

Repo ruan kodin dhe dokumentacionin.

Repo aktual:
`diellzarabushaj-source/FIZIOTERAPIA-IME`

## 2. Vercel

Vercel do lidhet me GitHub repo.

Cdo push ne main branch deploy-ohet automatikisht.

Environment variables qe duhen me vone:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Kujdes: keto nuk duhet te ruhen ne GitHub.

## 3. Clerk

Clerk menaxhon login per:

- physio
- owner/admin

Pacienti nuk perdor Clerk. Pacienti hyn vetem me kod unik.

Owner/admin:
- nuk shfaqet ne homepage
- nuk ka signup publik
- krijohet manualisht
- ka role owner

## 4. Supabase

Supabase ruan:

- patients
- plans
- exercises
- logs
- ai_checks
- alerts
- subscriptions

Supabase Storage ruan:

- exercise videos
- profile images
- reports

Ne MVP nuk ruhet video e pacientit per privacy.

## 5. MediaPipe

MediaPipe ekzekutohet ne browser/mobile client kur pacienti hap kameran.

Output qe dergohet ne backend:

- score
- feedback
- alert_type
- pain_score

## 6. Stripe me vone

Stripe shtohet kur fillon subscription per fizioterapeutet:

- trial
- active
- unpaid
- cancelled