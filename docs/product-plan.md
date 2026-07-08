# FizioPlan – Product Plan

## 1. Produkti

FizioPlan eshte platforme per menaxhimin e ushtrimeve fizioterapeutike ne distance.

Qellimi: fizioterapeuti krijon planin, pacienti e ndjek planin ne telefon, ndersa AI analizon levizjen dhe sinjalizon probleme.

## 2. Rolet

### Pacient
- Hyn vetem me kod pacienti, p.sh. ARB-4821.
- Nuk krijon plan vet.
- Sheh ushtrimet e veta.
- Raporton dhimbjen 0-10.
- Mund te perdore kameran per AI check.

### Fizioterapeut
- Hyn me email/password permes Clerk.
- Krijon pacient.
- Gjeneron kod pacienti.
- Cakton ushtrime.
- Monitoron progres, adherence, dhimbje dhe AI score.
- Vendos per ndryshim, ndalim ose vazhdim te ushtrimeve.

### Owner/Admin
- Nuk shfaqet ne UI publike.
- Nuk ka signup publik.
- Ka akses vetem permes role owner.
- Menaxhon fizioterapeutet, revenue, AI usage dhe exercise library.

## 3. MVP screens

### Patient
1. Hyrja me kod
2. Plani 14 dite
3. Detajet e ushtrimit
4. AI camera check
5. Pain modal
6. Plani perfunduar

### Physio
1. Login
2. Dashboard KPI
3. Lista e pacienteve
4. Shto pacient / plan
5. Progres pacienti
6. Dergim korrigjimi

### Owner
1. Fizioterapeutet
2. Revenue
3. AI & Video Usage
4. Exercise Library

## 4. Parimet

- UI shqip si default.
- Design medical clean: e bardhe, blue header, green CTA.
- Font i madh dhe spacing i bollshem per paciente te moshuar.
- Privacy first: mos ruaj video te pacientit ne MVP, ruaj vetem score/feedback/pain.