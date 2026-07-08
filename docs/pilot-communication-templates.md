# Pilot communication templates — Fizioterapia ime

Route:

- `/pilot-communications`

## Purpose

Use these scripts for the first controlled pilot.

Scope:

- 1 physiotherapist
- 1–3 patients
- 3–7 days
- controlled pilot only
- no public launch

## WhatsApp — first physiotherapist invite

```text
Përshëndetje,

Po e hapim pilotin e parë të Fizioterapia ime.

Qëllimi është me testu: krijimin e pacientit, planin e ushtrimeve, hyrjen e pacientit me username + kod, pain score, AI Movement Check dhe raportin PDF.

Ky është pilot i kontrolluar 3–7 ditë me 1–3 pacientë, jo lansim publik.

AI nuk diagnostikon dhe nuk zëvendëson fizioterapeutin. Vendimi klinik mbetet gjithmonë te fizioterapeuti.

Linkat:
/pilot-launch
/patient-handout
/pilot-feedback
```

## Email — professional invite

```text
Subject: Pilot i kontrolluar — Fizioterapia ime

Përshëndetje,

Po ju ftojmë në pilotin e parë të Fizioterapia ime, platformë digjitale për fizioterapi me plan ushtrimesh, monitorim progresi, pain score, AI Movement Check dhe raport PDF.

Ky pilot zgjat 3–7 ditë dhe bëhet vetëm me 1–3 pacientë testues. Nuk është lansim publik.

Qëllimi është të kuptojmë sa i qartë është workflow për fizioterapeutin dhe pacientin para zgjerimit.

Me respekt,
Fizioterapia ime
```

## WhatsApp — patient instructions

```text
Përshëndetje,

Fizioterapeuti juaj e ka krijuar planin tuaj në Fizioterapia ime.

Hyni këtu:
/patient-portal

Username: __________
Kodi: __________

Ju lutem kryeni ushtrimet ngadalë dhe shënoni dhimbjen 0–10.

Nëse dhimbja është 7/10 ose më shumë, ndaloni ushtrimin dhe kontaktoni fizioterapeutin.

AI Movement Check është vetëm feedback për lëvizje, jo diagnozë.
```

## Reminder — day 2/3

```text
Përshëndetje,

Vetëm kujtesë e shkurtër: ju lutem hapni Fizioterapia ime, kryeni ushtrimet e ditës dhe shënoni pain score.

Nëse keni dhimbje 7/10 ose më shumë, ndaloni ushtrimet dhe kontaktoni fizioterapeutin.
```

## Feedback request after pilot

```text
Përshëndetje,

Faleminderit për testimin e pilotit të Fizioterapia ime.

Ju lutem plotësoni feedback formën:
/pilot-feedback

Na intereson sidomos:
- a ishte i lehtë krijimi i pacientit,
- a ishte i qartë plani i ushtrimeve,
- a e kuptoi pacienti hyrjen me username + kod,
- a ishte i dobishëm raporti,
- çka duhet rregulluar para zgjerimit.
```

## Escalation — P0/P1

```text
Përshëndetje,

E ndalim përkohësisht pilotin derisa ta rregullojmë problemin.

Arsyeja: është shënuar si P0/P1 sepse prek funksion kritik, siguri, login, të dhëna pacienti, feedback ose raport.

Do të vazhdojmë vetëm pasi problemi të rregullohet dhe smoke test/build të kalojnë përsëri.
```

## Communication safety rules

- Do not promise diagnosis from AI.
- Do not say AI replaces the physiotherapist.
- Do not request sensitive diagnosis details in feedback.
- Repeat the pain 7/10 stop rule.
- Keep pilot scope small and clear.
