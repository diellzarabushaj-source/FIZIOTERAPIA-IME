-- Clinical exercise recommendation engine
-- The engine supports therapist-controlled recommendations only.
-- It never diagnoses and never auto-publishes a patient plan.

create extension if not exists pgcrypto;

create table if not exists public.body_regions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_sq text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_conditions (
  id uuid primary key default gen_random_uuid(),
  body_region_id uuid not null references public.body_regions(id) on delete restrict,
  slug text not null unique,
  name_sq text not null,
  description_sq text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rehab_phases (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid references public.clinical_conditions(id) on delete cascade,
  slug text not null,
  name_sq text not null,
  week_from integer,
  week_to integer,
  description_sq text,
  sort_order integer not null default 0,
  unique(condition_id, slug)
);

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sanity_document_id text,
  title_sq text not null,
  short_description_sq text,
  instructions_sq text[] not null default '{}',
  safety_notes_sq text[] not null default '{}',
  body_region_id uuid not null references public.body_regions(id) on delete restrict,
  exercise_type text not null check (exercise_type in ('mobility','strength','stability','balance','stretching','motor_control','functional','breathing')),
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  position text,
  equipment text[] not null default '{}',
  default_sets integer check (default_sets is null or default_sets between 1 and 20),
  default_reps integer check (default_reps is null or default_reps between 1 and 200),
  default_hold_seconds integer check (default_hold_seconds is null or default_hold_seconds between 1 and 600),
  media_type text not null default 'image' check (media_type in ('image','video','none')),
  media_url text,
  thumbnail_url text,
  is_active boolean not null default true,
  clinical_review_status text not null default 'draft' check (clinical_review_status in ('draft','reviewed','approved','archived')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.condition_exercise_rules (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references public.clinical_conditions(id) on delete cascade,
  exercise_id uuid not null references public.exercise_library(id) on delete cascade,
  base_score integer not null default 50 check (base_score between 0 and 100),
  evidence_level text not null default 'expert_consensus' check (evidence_level in ('guideline','systematic_review','clinical_trial','expert_consensus','local_protocol')),
  rationale_sq text not null,
  therapist_notes_sq text,
  is_allowed boolean not null default true,
  unique(condition_id, exercise_id)
);

create table if not exists public.exercise_phase_rules (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercise_library(id) on delete cascade,
  rehab_phase_id uuid not null references public.rehab_phases(id) on delete cascade,
  score_modifier integer not null default 0 check (score_modifier between -100 and 100),
  is_allowed boolean not null default true,
  rationale_sq text,
  unique(exercise_id, rehab_phase_id)
);

create table if not exists public.clinical_flags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_sq text not null,
  category text not null check (category in ('absolute_contraindication','relative_contraindication','precaution','capability','goal')),
  description_sq text
);

create table if not exists public.exercise_flag_rules (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercise_library(id) on delete cascade,
  flag_id uuid not null references public.clinical_flags(id) on delete cascade,
  action text not null check (action in ('block','penalize','boost','inform')),
  score_modifier integer not null default 0 check (score_modifier between -100 and 100),
  rationale_sq text not null,
  unique(exercise_id, flag_id)
);

create table if not exists public.recommendation_audits (
  id uuid primary key default gen_random_uuid(),
  therapist_user_id text not null,
  patient_id uuid,
  condition_id uuid references public.clinical_conditions(id) on delete set null,
  rehab_phase_id uuid references public.rehab_phases(id) on delete set null,
  request_payload jsonb not null,
  result_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_exercise_library_region on public.exercise_library(body_region_id) where is_active = true;
create index if not exists idx_condition_rules_condition on public.condition_exercise_rules(condition_id);
create index if not exists idx_phase_rules_phase on public.exercise_phase_rules(rehab_phase_id);
create index if not exists idx_flag_rules_exercise on public.exercise_flag_rules(exercise_id);

alter table public.body_regions enable row level security;
alter table public.clinical_conditions enable row level security;
alter table public.rehab_phases enable row level security;
alter table public.exercise_library enable row level security;
alter table public.condition_exercise_rules enable row level security;
alter table public.exercise_phase_rules enable row level security;
alter table public.clinical_flags enable row level security;
alter table public.exercise_flag_rules enable row level security;
alter table public.recommendation_audits enable row level security;

-- Reference content is readable by authenticated clinical users.
create policy "authenticated_read_body_regions" on public.body_regions for select to authenticated using (true);
create policy "authenticated_read_conditions" on public.clinical_conditions for select to authenticated using (is_active = true);
create policy "authenticated_read_rehab_phases" on public.rehab_phases for select to authenticated using (true);
create policy "authenticated_read_exercises" on public.exercise_library for select to authenticated using (is_active = true and clinical_review_status in ('reviewed','approved'));
create policy "authenticated_read_condition_rules" on public.condition_exercise_rules for select to authenticated using (true);
create policy "authenticated_read_phase_rules" on public.exercise_phase_rules for select to authenticated using (true);
create policy "authenticated_read_flags" on public.clinical_flags for select to authenticated using (true);
create policy "authenticated_read_flag_rules" on public.exercise_flag_rules for select to authenticated using (true);

-- Audit records remain server-managed through the service role.
comment on table public.recommendation_audits is 'Server-only audit trail of recommendation requests and results.';
comment on column public.condition_exercise_rules.base_score is 'Compatibility score, not probability of safety or treatment success.';

insert into public.body_regions (slug, name_sq, sort_order) values
  ('cervical', 'Qafa', 10),
  ('shoulder', 'Shpatulla', 20),
  ('lumbar', 'Shpina lumbare', 30),
  ('hip', 'Ijët', 40),
  ('knee', 'Gjuri', 50),
  ('ankle-foot', 'Kyçi dhe shputa', 60)
on conflict (slug) do update set name_sq = excluded.name_sq, sort_order = excluded.sort_order;

insert into public.clinical_conditions (body_region_id, slug, name_sq, description_sq)
select id, 'non-specific-low-back-pain', 'Dhimbje jo-specifike e mesit', 'Gjendje muskuloskeletore që kërkon vlerësim individual dhe përjashtim të flamujve të kuq.' from public.body_regions where slug = 'lumbar'
on conflict (slug) do nothing;

insert into public.clinical_conditions (body_region_id, slug, name_sq, description_sq)
select id, 'acl-reconstruction', 'Rehabilitim pas rekonstruksionit ACL', 'Rehabilitim i kontrolluar sipas fazës, kufizimeve kirurgjikale dhe vlerësimit të fizioterapeutit.' from public.body_regions where slug = 'knee'
on conflict (slug) do nothing;

insert into public.clinical_conditions (body_region_id, slug, name_sq, description_sq)
select id, 'rotator-cuff-related-shoulder-pain', 'Dhimbje e shpatullës e lidhur me manshetën rrotatore', 'Programi përshtatet sipas irritabilitetit, forcës dhe tolerancës.' from public.body_regions where slug = 'shoulder'
on conflict (slug) do nothing;

insert into public.rehab_phases (condition_id, slug, name_sq, week_from, week_to, sort_order)
select id, 'early', 'Faza e hershme', 0, 2, 10 from public.clinical_conditions where slug = 'acl-reconstruction'
on conflict (condition_id, slug) do nothing;

insert into public.rehab_phases (condition_id, slug, name_sq, week_from, week_to, sort_order)
select id, 'intermediate', 'Faza e ndërmjetme', 3, 8, 20 from public.clinical_conditions where slug = 'acl-reconstruction'
on conflict (condition_id, slug) do nothing;

insert into public.exercise_library (
  slug, title_sq, short_description_sq, instructions_sq, safety_notes_sq, body_region_id,
  exercise_type, difficulty, position, equipment, default_sets, default_reps, default_hold_seconds,
  media_type, media_url, thumbnail_url, clinical_review_status
)
select values_data.slug, values_data.title_sq, values_data.description_sq, values_data.instructions_sq,
       values_data.safety_notes_sq, br.id, values_data.exercise_type, values_data.difficulty,
       values_data.position, values_data.equipment, values_data.default_sets, values_data.default_reps,
       values_data.default_hold_seconds, 'image', '/exercise-media/placeholder.svg',
       '/exercise-media/placeholder.svg', 'reviewed'
from public.body_regions br
join (values
  ('lumbar','pelvic-tilt','Animi i legenit','Kontroll i butë i pozicionit lumbopelvik.',array['Shtrihu në shpinë me gjunjët të përkulur.','Afroje butë mesin drejt dyshekut.','Merr frymë normalisht dhe relaksohu.'],array['Ndalo nëse dhimbja rritet ose përhapet në këmbë.'],'motor_control','beginner','supine',array[]::text[],2,10,5),
  ('lumbar','cat-camel','Cat–camel','Mobilitet i kontrolluar i shtyllës kurrizore.',array['Vendosu në katër pika.','Lëvize shpinën ngadalë në të dy drejtimet.','Mos e detyro amplitudën.'],array['Lëvizja duhet të jetë e rehatshme dhe pa forcim.'],'mobility','beginner','quadruped',array[]::text[],2,10,null),
  ('lumbar','glute-bridge','Ura gluteale','Forcim i zinxhirit posterior dhe kontroll i trungut.',array['Shtrihu me gjunjët të përkulur.','Shtrëngo glutealët dhe ngrije legenin.','Ule ngadalë pa harkim të tepruar të mesit.'],array['Mos vazhdo nëse shfaqet dhimbje e mprehtë.'],'strength','beginner','supine',array[]::text[],3,12,null),
  ('knee','quadriceps-setting','Aktivizimi izometrik i quadricepsit','Aktivizim i quadricepsit me gjurin të mbështetur.',array['Mbaje këmbën të shtrirë.','Shtype pjesën e pasme të gjurit drejt mbështetjes.','Mbaje tkurrjen pa e ndalur frymëmarrjen.'],array['Respekto kufizimet postoperative të ekipit kirurgjik.'],'strength','beginner','supine',array['peshqir'],3,10,5),
  ('knee','heel-slide','Rrëshqitja e thembrës','Përmirësim gradual i fleksionit të gjurit.',array['Shtrihu në shpinë.','Rrëshqite thembrën drejt vitheve.','Kthehu ngadalë në pozicionin fillestar.'],array['Mos e tejkalo kufirin e lejuar të fleksionit.'],'mobility','beginner','supine',array['peshqir'],3,10,null),
  ('knee','straight-leg-raise','Ngritja e këmbës së drejtë','Forcim i kontrolluar i quadricepsit dhe fleksorëve të ijës.',array['Mbaje gjurin plotësisht të shtrirë.','Ngrije këmbën rreth 20–30 cm.','Ule ngadalë.'],array['Mos e përdor nëse ka extension lag pa miratim të fizioterapeutit.'],'strength','intermediate','supine',array[]::text[],3,10,null),
  ('shoulder','scapular-setting','Vendosja e skapulës','Kontroll i lehtë i pozicionit të skapulës.',array['Qëndro drejt dhe relakso shpatullat.','Afroji skapulat butë poshtë dhe prapa.','Mos i ngrit shpatullat drejt veshëve.'],array['Mos e detyro lëvizjen në dhimbje.'],'motor_control','beginner','standing',array[]::text[],2,10,5),
  ('shoulder','wall-slide','Rrëshqitja në mur','Mobilitet dhe kontroll i shpatullës me mbështetje.',array['Vendosi parakrahët në mur.','Rrëshqiti lart ngadalë.','Kthehu duke ruajtur kontrollin e skapulës.'],array['Përdor vetëm amplitudën e toleruar.'],'mobility','beginner','standing',array['mur'],2,10,null),
  ('hip','clamshell','Clamshell','Forcim i abduktorëve dhe rotatorëve të ijës.',array['Shtrihu anash me gjunjët të përkulur.','Mbaji shputat bashkë dhe ngrije gjurin e sipërm.','Mos e rrotullo legenin prapa.'],array['Redukto amplitudën nëse ka dhimbje laterale të ijës.'],'strength','beginner','side_lying',array[]::text[],3,12,null),
  ('ankle-foot','calf-raise-supported','Ngritja në gishta me mbështetje','Forcim progresiv i muskujve të pulpës.',array['Mbaju lehtë në një mbështetje.','Ngrihu në gishta në mënyrë të kontrolluar.','Ulu ngadalë.'],array['Mos e përdor kur ngarkesa në këmbë është e ndaluar.'],'strength','beginner','standing',array['mbështetje'],3,12,null)
) as values_data(region_slug,slug,title_sq,description_sq,instructions_sq,safety_notes_sq,exercise_type,difficulty,position,equipment,default_sets,default_reps,default_hold_seconds)
on br.slug = values_data.region_slug
on conflict (slug) do update set
  title_sq = excluded.title_sq,
  short_description_sq = excluded.short_description_sq,
  instructions_sq = excluded.instructions_sq,
  safety_notes_sq = excluded.safety_notes_sq,
  updated_at = now();

insert into public.clinical_flags (slug, name_sq, category, description_sq) values
  ('no-weight-bearing','Pa ngarkesë në gjymtyrë','absolute_contraindication','Pacienti nuk lejohet të ngarkojë peshë në gjymtyrën e prekur.'),
  ('extension-lag','Extension lag','precaution','Mungesë e kontrollit aktiv të ekstenzionit të plotë të gjurit.'),
  ('high-pain','Dhimbje e lartë','precaution','Dhimbje 7/10 ose më shumë: ndalo dhe kontakto fizioterapeutin.'),
  ('goal-mobility','Qëllimi: mobilitet','goal','Prioritet për ushtrime të mobilitetit.'),
  ('goal-strength','Qëllimi: forcë','goal','Prioritet për ushtrime të forcës.'),
  ('goal-motor-control','Qëllimi: kontroll motorik','goal','Prioritet për ushtrime të kontrollit motorik.')
on conflict (slug) do nothing;

insert into public.condition_exercise_rules (condition_id, exercise_id, base_score, evidence_level, rationale_sq)
select c.id, e.id,
  case e.slug
    when 'quadriceps-setting' then 95
    when 'heel-slide' then 90
    when 'straight-leg-raise' then 78
    else 55
  end,
  'local_protocol',
  case e.slug
    when 'quadriceps-setting' then 'Përputhet me aktivizimin e hershëm të quadricepsit kur lejohet nga protokolli.'
    when 'heel-slide' then 'Mund të përdoret për rikthim gradual të fleksionit brenda kufizimeve postoperative.'
    when 'straight-leg-raise' then 'Përdoret vetëm kur kontrolli i ekstenzionit është adekuat.'
    else 'Ushtrim ndihmës që kërkon vlerësim individual.'
  end
from public.clinical_conditions c
join public.exercise_library e on e.slug in ('quadriceps-setting','heel-slide','straight-leg-raise','glute-bridge')
where c.slug = 'acl-reconstruction'
on conflict (condition_id, exercise_id) do nothing;

insert into public.condition_exercise_rules (condition_id, exercise_id, base_score, evidence_level, rationale_sq)
select c.id, e.id,
  case e.slug when 'pelvic-tilt' then 86 when 'cat-camel' then 82 when 'glute-bridge' then 80 else 60 end,
  'expert_consensus',
  'Mund të jetë i dobishëm brenda një programi aktiv të individualizuar pas vlerësimit klinik.'
from public.clinical_conditions c
join public.exercise_library e on e.slug in ('pelvic-tilt','cat-camel','glute-bridge')
where c.slug = 'non-specific-low-back-pain'
on conflict (condition_id, exercise_id) do nothing;

insert into public.condition_exercise_rules (condition_id, exercise_id, base_score, evidence_level, rationale_sq)
select c.id, e.id,
  case e.slug when 'scapular-setting' then 84 when 'wall-slide' then 78 else 60 end,
  'expert_consensus',
  'Zgjedhja varet nga irritabiliteti, amplituda e toleruar dhe objektivat funksionale.'
from public.clinical_conditions c
join public.exercise_library e on e.slug in ('scapular-setting','wall-slide')
where c.slug = 'rotator-cuff-related-shoulder-pain'
on conflict (condition_id, exercise_id) do nothing;

insert into public.exercise_flag_rules (exercise_id, flag_id, action, score_modifier, rationale_sq)
select e.id, f.id, 'block', -100, 'Ngritja në gishta kërkon ngarkesë dhe bllokohet kur pacienti është pa weight-bearing.'
from public.exercise_library e, public.clinical_flags f
where e.slug = 'calf-raise-supported' and f.slug = 'no-weight-bearing'
on conflict (exercise_id, flag_id) do nothing;

insert into public.exercise_flag_rules (exercise_id, flag_id, action, score_modifier, rationale_sq)
select e.id, f.id, 'block', -100, 'Straight leg raise nuk propozohet kur ka extension lag pa rishikim profesional.'
from public.exercise_library e, public.clinical_flags f
where e.slug = 'straight-leg-raise' and f.slug = 'extension-lag'
on conflict (exercise_id, flag_id) do nothing;

insert into public.exercise_flag_rules (exercise_id, flag_id, action, score_modifier, rationale_sq)
select e.id, f.id, 'boost', 12, 'Përputhet me objektivin e zgjedhur nga fizioterapeuti.'
from public.exercise_library e
join public.clinical_flags f on
  (f.slug = 'goal-mobility' and e.exercise_type = 'mobility') or
  (f.slug = 'goal-strength' and e.exercise_type = 'strength') or
  (f.slug = 'goal-motor-control' and e.exercise_type = 'motor_control')
on conflict (exercise_id, flag_id) do nothing;
