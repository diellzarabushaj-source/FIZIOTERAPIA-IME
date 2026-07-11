export type ExerciseType =
  | "mobility"
  | "strength"
  | "stability"
  | "balance"
  | "stretching"
  | "motor_control"
  | "functional"
  | "breathing";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type RuleAction = "block" | "penalize" | "boost" | "inform";

export type ClinicalExercise = {
  id: string;
  slug: string;
  title: string;
  description: string;
  region: string;
  type: ExerciseType;
  difficulty: Difficulty;
  position?: string;
  equipment: string[];
  defaultSets?: number;
  defaultReps?: number;
  defaultHoldSeconds?: number;
  instructions: string[];
  safetyNotes: string[];
  mediaType: "image" | "video" | "none";
  mediaUrl?: string;
  thumbnailUrl?: string;
};

export type ConditionRule = {
  conditionSlug: string;
  exerciseSlug: string;
  baseScore: number;
  rationale: string;
};

export type ExerciseFlagRule = {
  exerciseSlug: string;
  flagSlug: string;
  action: RuleAction;
  scoreModifier: number;
  rationale: string;
};

export type RecommendationInput = {
  conditionSlug: string;
  phaseSlug?: string;
  regionSlug?: string;
  selectedFlags?: string[];
  painScore?: number;
  maxDifficulty?: Difficulty;
  availableEquipment?: string[];
  limit?: number;
};

export type RecommendationReason = {
  kind: "condition" | "goal" | "phase" | "safety" | "equipment" | "difficulty";
  label: string;
  scoreDelta: number;
};

export type ExerciseRecommendation = {
  exercise: ClinicalExercise;
  compatibilityScore: number;
  allowed: boolean;
  blockedBy: string[];
  reasons: RecommendationReason[];
  clinicalRationale: string;
};

export type RecommendationResponse = {
  disclaimer: string;
  generatedAt: string;
  input: RecommendationInput;
  recommendations: ExerciseRecommendation[];
};
