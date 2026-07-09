export const planStatuses = [
  {
    key: "draft",
    label: "Draft",
    description: "Plani është duke u ndërtuar. Pacienti nuk e sheh ende.",
  },
  {
    key: "pending_review",
    label: "Pending review",
    description: "Ushtrimet janë zgjedhur dhe presin kontrollin final të fizioterapeutit.",
  },
  {
    key: "approved",
    label: "Approved",
    description: "Fizioterapeuti e ka miratuar planin klinikisht.",
  },
  {
    key: "sent_to_patient",
    label: "Sent to patient",
    description: "Pacienti e sheh planin me kod, QR ose link.",
  },
  {
    key: "paused",
    label: "Paused",
    description: "Plani është ndalur përkohësisht për shkak të dhimbjes, përkeqësimit ose rishikimit.",
  },
  {
    key: "archived",
    label: "Archived",
    description: "Programi është mbyllur dhe ruhet për histori klinike.",
  },
] as const;

export const physiotherapistPlanFlow = [
  {
    step: "01",
    title: "Patient intake",
    description: "Fizioterapeuti shton pacientin, diagnozën, fazën, qëllimin, dhimbjen 0–10 dhe kujdeset për red flags.",
  },
  {
    step: "02",
    title: "Exercise source",
    description: "Zgjedh AI suggestions, kërkim manual në databazë ose shton ushtrim custom me tekst/video link.",
  },
  {
    step: "03",
    title: "AI suggestions",
    description: "AI propozon ushtrime vetëm nga exercise_library. Nuk krijon plan final dhe nuk e dërgon te pacienti.",
  },
  {
    step: "04",
    title: "Edit plan",
    description: "Fizioterapeuti pranon, refuzon, zëvendëson ose editon sete, reps, frekuencë, instruksione dhe video.",
  },
  {
    step: "05",
    title: "Safety review",
    description: "Kontrollohen dhimbja ≥7/10, contraindications, faza, vështirësia, video/instruksionet dhe red flags.",
  },
  {
    step: "06",
    title: "Approve & send",
    description: "Vetëm fizioterapeuti e aprovon planin. Pacienti e sheh vetëm pasi statusi kalon në sent_to_patient.",
  },
] as const;

export const patientTherapyFlow = [
  {
    step: "01",
    title: "Invitation",
    description: "Pacienti merr kodin, QR ose linkun nga fizioterapeuti.",
  },
  {
    step: "02",
    title: "Login with code",
    description: "Pacienti hyn pa krijuar llogari dhe sheh vetëm planin e vet.",
  },
  {
    step: "03",
    title: "Today's session",
    description: "Shfaqen ushtrimet e ditës, video, sete, reps, kohë dhe instruksionet e thjeshta.",
  },
  {
    step: "04",
    title: "Complete exercise",
    description: "Pacienti e shënon ushtrimin si të kryer, jep pain score 0–10 dhe koment opsional.",
  },
  {
    step: "05",
    title: "Safety alert",
    description: "Nëse dhimbja është 7/10 ose më shumë, app-i e udhëzon pacientin të ndalet dhe njofton fizioterapeutin.",
  },
  {
    step: "06",
    title: "Progress & adjustment",
    description: "Fizioterapeuti sheh adherence, dhimbjen, komentet dhe e ndryshon planin kur duhet.",
  },
] as const;

export const exerciseSourceOptions = [
  {
    key: "ai",
    title: "AI suggestions",
    description: "AI zgjedh kandidatë nga databaza, por fizioterapeuti vendos.",
  },
  {
    key: "database",
    title: "Choose from database",
    description: "Fizioterapeuti kërkon sipas diagnozës, trupit, fazës, qëllimit, pajisjes ose emrit alternativ.",
  },
  {
    key: "custom",
    title: "Add custom exercise",
    description: "Fizioterapeuti shton ushtrim të vetin me instruksione dhe video link opsional.",
  },
] as const;

export const safetyRules = [
  "Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.",
  "AI nuk diagnostikon dhe nuk e zëvendëson vendimin klinik.",
  "Pacienti nuk mund të krijojë ose ndryshojë planin vetë.",
  "Çdo plan duhet të kalojë në Review & Approve para se t’i shfaqet pacientit.",
  "Ushtrimet me red flags ose contraindications duhet të shfaqin paralajmërim para dërgimit.",
] as const;
