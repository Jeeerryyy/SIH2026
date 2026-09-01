import { TriageUrgencyTier } from "@arogyasetu/shared-types";

export interface EndemicEvaluationResult {
  isEndemicAlert: boolean;
  tier: TriageUrgencyTier;
  endemicAlerts: string[];
  immediateAction: string;
}

export function evaluateEndemicConditions(
  symptoms: string[],
  recentSnakebiteSuspected?: boolean,
  isSickleCellKnownCrisis?: boolean
): EndemicEvaluationResult {
  const alerts: string[] = [];
  let tier = TriageUrgencyTier.ROUTINE_GREEN;
  const normalized = symptoms.map(s => s.toLowerCase());

  // 1. Snakebite Envenomation (Neurotoxic / Hemotoxic)
  if (
    recentSnakebiteSuspected ||
    normalized.some(s => s.includes("snake") || s.includes("fang mark") || s.includes("ptosis") || s.includes("bleeding gums"))
  ) {
    alerts.push("CRITICAL: Suspected Snakebite Envenomation — Neurotoxic / Hemotoxic Signs");
    tier = TriageUrgencyTier.EMERGENCY_RED;
    return {
      isEndemicAlert: true,
      tier,
      endemicAlerts: alerts,
      immediateAction: "Immediate Polyvalent Anti-Snake Venom (ASV) Protocol at nearest PHC/RH with Neostigmine Support"
    };
  }

  // 2. Sickle Cell Disease Crisis (Vaso-occlusive / Acute Chest Syndrome)
  if (
    isSickleCellKnownCrisis ||
    normalized.some(s => s.includes("sickle") || (s.includes("joint pain") && s.includes("fever") && s.includes("chest pain")))
  ) {
    alerts.push("Sickle Cell Vaso-Occlusive Pain Crisis / Suspected Acute Chest Syndrome");
    tier = TriageUrgencyTier.URGENT_AMBER;
    return {
      isEndemicAlert: true,
      tier,
      endemicAlerts: alerts,
      immediateAction: "Hydration (IV Normal Saline), Analgesia (Tramadol / Paracetamol), O2 Therapy, and Hydroxyurea Dose Review"
    };
  }

  return {
    isEndemicAlert: false,
    tier,
    endemicAlerts: [],
    immediateAction: "No specific tribal endemic danger sign flagged"
  };
}
