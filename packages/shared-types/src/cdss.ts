import { TriageUrgencyTier, FacilityType } from "./enums.js";
import { IVitals, IPatient } from "./entities.js";

export interface ICdssEvaluationInput {
  patient: Partial<IPatient>;
  vitals: Partial<IVitals>;
  symptoms: string[];
  isPregnant?: boolean;
  gestationalWeeks?: number;
  knownConditions?: string[];
  recentSnakebiteSuspected?: boolean;
  isSickleCellKnownCrisis?: boolean;
}

export interface ICdssEvaluationResult {
  urgencyTier: TriageUrgencyTier;
  urgencyScore: number; // 0 (Routine) to 100 (Immediate Life Threat)
  primaryAlert: string;
  contributingFactors: string[];
  recommendedAction: string;
  recommendedFacility: FacilityType;
  maxResponseTimeMinutes: number;
  requiredMedicationCategories: string[];
  autoReferralSuggested: boolean;
  highRiskPregnancyFlags: string[];
}
