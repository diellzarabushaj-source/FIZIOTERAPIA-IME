import type { Tone } from '../theme';

export type Screen = 'login' | 'plan' | 'exercise' | 'ai-prep' | 'ai-checking' | 'ai-result' | 'pain' | 'pain-warning' | 'saved';
export type AlertType = 'good' | 'needs_attention' | 'contact_physio';

export type Exercise = {
  id: string;
  name: string;
  meta: string;
  duration: string;
  focus: string;
  aiEnabled: boolean;
  instructions: string;
};

export const demoPatient = {
  id: 'demo-patient-1',
  code: 'ARB-4821',
  name: 'Arber Rexha',
  diagnosis: 'Lumbosciatica',
  planTitle: 'Program 14 ditor per lumbosciatica',
  physio: 'Dr. Diellza Rabushaj',
};

export const demoDays = [
  { label: 'Hene', state: 'Done' },
  { label: 'Marte', state: 'Done' },
  { label: 'Sot', state: '3/4', active: true },
  { label: 'Enjte', state: 'Next' },
  { label: 'Premte', state: 'Rest' },
];

export const demoExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Glute bridge',
    meta: '3 sete x 12 perseritje',
    duration: '5 min',
    focus: 'Stabilitet i legenit',
    aiEnabled: true,
    instructions: 'Shtrihu ne shpine, perkul gjunjet dhe ngriti ijet ngadale. Mbaje legenin stabil dhe mos e shpejto levizjen.',
  },
  {
    id: 'ex-2',
    name: 'Cat cow',
    meta: '2 sete x 10 perseritje',
    duration: '4 min',
    focus: 'Mobilitet i shpines',
    aiEnabled: true,
    instructions: 'Fillo me kater kembe. Levize shpinen ngadale, pa dhimbje te forte dhe pa e mbajtur frymen.',
  },
  {
    id: 'ex-3',
    name: 'Piriformis stretch',
    meta: '3 x 30 sekonda',
    duration: '6 min',
    focus: 'Shtrirje e kontrolluar',
    aiEnabled: false,
    instructions: 'Kryqezo kemben mbi gjurin tjeter dhe terhiq butesisht drejt gjoksit derisa te ndjesh shtrirje te kontrolluar.',
  },
  {
    id: 'ex-4',
    name: 'Bird dog',
    meta: '2 sete x 8 secila ane',
    duration: '7 min',
    focus: 'Kontroll i trungut',
    aiEnabled: true,
    instructions: 'Nga pozicioni me kater kembe, zgjat doren dhe kemben e kundert. Mbaje trupin stabil dhe mos e lako shpinen.',
  },
];

export const aiCheck = {
  score: 82,
  readiness: [
    'Vendose telefonin ne nje vend stabil.',
    'Trupi duhet te shihet qarte ne ekran.',
    'Leviz ngadale dhe ndalo nese dhimbja rritet.',
  ],
  feedback: [
    'Mbaje legenin me stabil gjate ngritjes.',
    'Ritmi eshte i mire, por kthimi duhet te jete me i ngadalte.',
    'Nese dhimbja rritet, ndalo dhe kontakto fizioterapeutin.',
  ],
};

export function resolveAiAlert(score: number, painScore?: number): AlertType {
  if (painScore !== undefined && painScore >= 7) return 'contact_physio';
  if (score > 80) return 'good';
  if (score >= 60) return 'needs_attention';
  return 'contact_physio';
}

export function getPainTone(score: number): Tone {
  if (score >= 7) return 'danger';
  if (score >= 4) return 'warning';
  return 'success';
}
