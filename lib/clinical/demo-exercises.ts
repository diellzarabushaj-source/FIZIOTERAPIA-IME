import type { ClinicalExercise, ConditionRule, ExerciseFlagRule } from "./types.ts";

const image = "/exercise-media/placeholder.svg";

export const demoExercises: ClinicalExercise[] = [
  { id:"pelvic-tilt", slug:"pelvic-tilt", title:"Animi i legenit", description:"Kontroll i butë lumbopelvik.", region:"lumbar", type:"motor_control", difficulty:"beginner", position:"supine", equipment:[], defaultSets:2, defaultReps:10, defaultHoldSeconds:5, instructions:["Shtrihu me gjunjët të përkulur.","Afroje butë mesin drejt dyshekut.","Merr frymë normalisht."], safetyNotes:["Ndalo nëse dhimbja përhapet në këmbë."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"cat-camel", slug:"cat-camel", title:"Cat–camel", description:"Mobilitet i kontrolluar i shtyllës.", region:"lumbar", type:"mobility", difficulty:"beginner", position:"quadruped", equipment:[], defaultSets:2, defaultReps:10, instructions:["Vendosu në katër pika.","Lëvize shpinën ngadalë.","Mos e detyro amplitudën."], safetyNotes:["Lëvizja duhet të jetë e rehatshme."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"glute-bridge", slug:"glute-bridge", title:"Ura gluteale", description:"Forcim i zinxhirit posterior.", region:"lumbar", type:"strength", difficulty:"beginner", position:"supine", equipment:[], defaultSets:3, defaultReps:12, instructions:["Shtrëngo glutealët.","Ngrije legenin.","Ule ngadalë."], safetyNotes:["Shmang harkimin e tepruar të mesit."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"quadriceps-setting", slug:"quadriceps-setting", title:"Aktivizimi izometrik i quadricepsit", description:"Aktivizim i kontrolluar i quadricepsit.", region:"knee", type:"strength", difficulty:"beginner", position:"supine", equipment:["peshqir"], defaultSets:3, defaultReps:10, defaultHoldSeconds:5, instructions:["Mbaje këmbën të shtrirë.","Shtype gjurin drejt mbështetjes.","Mos e ndal frymëmarrjen."], safetyNotes:["Respekto kufizimet postoperative."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"heel-slide", slug:"heel-slide", title:"Rrëshqitja e thembrës", description:"Rikthim gradual i fleksionit.", region:"knee", type:"mobility", difficulty:"beginner", position:"supine", equipment:["peshqir"], defaultSets:3, defaultReps:10, instructions:["Rrëshqite thembrën drejt vitheve.","Ndalo në kufirin e lejuar.","Kthehu ngadalë."], safetyNotes:["Mos e tejkalo ROM-in e lejuar."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"straight-leg-raise", slug:"straight-leg-raise", title:"Ngritja e këmbës së drejtë", description:"Forcim me kontroll të gjurit.", region:"knee", type:"strength", difficulty:"intermediate", position:"supine", equipment:[], defaultSets:3, defaultReps:10, instructions:["Mbaje gjurin të shtrirë.","Ngrije këmbën 20–30 cm.","Ule ngadalë."], safetyNotes:["Mos e përdor me extension lag pa miratim."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"scapular-setting", slug:"scapular-setting", title:"Vendosja e skapulës", description:"Kontroll i lehtë skapular.", region:"shoulder", type:"motor_control", difficulty:"beginner", position:"standing", equipment:[], defaultSets:2, defaultReps:10, defaultHoldSeconds:5, instructions:["Relakso shpatullat.","Afroji skapulat butë poshtë-prapa.","Mos i ngrit drejt veshëve."], safetyNotes:["Mos e detyro lëvizjen në dhimbje."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"wall-slide", slug:"wall-slide", title:"Rrëshqitja në mur", description:"Mobilitet i shpatullës me mbështetje.", region:"shoulder", type:"mobility", difficulty:"beginner", position:"standing", equipment:["mur"], defaultSets:2, defaultReps:10, instructions:["Vendosi parakrahët në mur.","Rrëshqiti lart.","Kthehu me kontroll."], safetyNotes:["Përdor vetëm amplitudën e toleruar."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"clamshell", slug:"clamshell", title:"Clamshell", description:"Forcim i abduktorëve të ijës.", region:"hip", type:"strength", difficulty:"beginner", position:"side_lying", equipment:[], defaultSets:3, defaultReps:12, instructions:["Mbaji shputat bashkë.","Ngrije gjurin e sipërm.","Mos e rrotullo legenin."], safetyNotes:["Redukto amplitudën në dhimbje laterale."], mediaType:"image", mediaUrl:image, thumbnailUrl:image },
  { id:"calf-raise-supported", slug:"calf-raise-supported", title:"Ngritja në gishta me mbështetje", description:"Forcim progresiv i pulpës.", region:"ankle-foot", type:"strength", difficulty:"beginner", position:"standing", equipment:["mbështetje"], defaultSets:3, defaultReps:12, instructions:["Mbaju lehtë.","Ngrihu në gishta.","Ulu ngadalë."], safetyNotes:["Mos e përdor kur ngarkesa është e ndaluar."], mediaType:"image", mediaUrl:image, thumbnailUrl:image }
];

export const demoConditionRules: ConditionRule[] = [
  { conditionSlug:"acl-reconstruction", exerciseSlug:"quadriceps-setting", baseScore:95, rationale:"Aktivizim i hershëm i quadricepsit kur lejohet nga protokolli." },
  { conditionSlug:"acl-reconstruction", exerciseSlug:"heel-slide", baseScore:90, rationale:"Rikthim gradual i fleksionit brenda kufizimeve postoperative." },
  { conditionSlug:"acl-reconstruction", exerciseSlug:"straight-leg-raise", baseScore:82, rationale:"Forcim i kontrolluar vetëm kur nuk ka extension lag." },
  { conditionSlug:"non-specific-low-back-pain", exerciseSlug:"pelvic-tilt", baseScore:90, rationale:"Kontroll i butë lumbopelvik." },
  { conditionSlug:"non-specific-low-back-pain", exerciseSlug:"cat-camel", baseScore:84, rationale:"Mobilitet i kontrolluar i shtyllës." },
  { conditionSlug:"non-specific-low-back-pain", exerciseSlug:"glute-bridge", baseScore:78, rationale:"Forcim progresiv i zinxhirit posterior." },
  { conditionSlug:"rotator-cuff-related-pain", exerciseSlug:"scapular-setting", baseScore:90, rationale:"Kontroll skapular me ngarkesë të ulët." },
  { conditionSlug:"rotator-cuff-related-pain", exerciseSlug:"wall-slide", baseScore:82, rationale:"Mobilitet i asistuar i shpatullës." }
];

export const demoFlagRules: ExerciseFlagRule[] = [
  { flagSlug:"extension-lag", exerciseSlug:"straight-leg-raise", action:"block", scoreModifier:-100, rationale:"Mos e përdor straight-leg raise kur ka extension lag pa miratim klinik." },
  { flagSlug:"weight-bearing-restricted", exerciseSlug:"calf-raise-supported", action:"block", scoreModifier:-100, rationale:"Ushtrimi kërkon ngarkesë në këmbë." },
  { flagSlug:"painful-arc", exerciseSlug:"wall-slide", action:"caution", scoreModifier:-25, rationale:"Përdor amplitudë të kufizuar pa painful arc." }
];
