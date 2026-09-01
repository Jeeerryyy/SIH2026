import {
  TriageUrgencyTier,
  FacilityType,
  ICdssEvaluationInput,
  ICdssEvaluationResult
} from "@arogyasetu/shared-types";
import { evaluateVitals } from "./vitalsEvaluator.js";
import { evaluateHrp } from "./hrpEvaluator.js";
import { evaluateEndemicConditions } from "./endemicFilter.js";

export class CdssEngine {
  public static evaluate(input: ICdssEvaluationInput): ICdssEvaluationResult {
    const factors: string[] = [];
    const highRiskFlags: string[] = [];
    const requiredMeds: string[] = [];

    // 1. Evaluate Vitals
    const vitalsResult = evaluateVitals(input.vitals || {});
    factors.push(...vitalsResult.alerts);

    // 2. Evaluate Obstetric Risk (if female / pregnant)
    let hrpResult = {
      isHighRisk: false,
      tier: TriageUrgencyTier.ROUTINE_GREEN,
      dangerSignsFound: [] as string[],
      recommendedAction: ""
    };
    if (input.isPregnant || input.patient.gender === "FEMALE") {
      hrpResult = evaluateHrp(input.vitals || {}, input.symptoms || [], input.gestationalWeeks);
      if (hrpResult.isHighRisk) {
        highRiskFlags.push(...hrpResult.dangerSignsFound);
        factors.push(...hrpResult.dangerSignsFound.map(d => `HRP: ${d}`));
      }
    }

    // 3. Evaluate Endemic Filters (Snakebite / Sickle Cell)
    const endemicResult = evaluateEndemicConditions(
      input.symptoms || [],
      input.recentSnakebiteSuspected,
      input.isSickleCellKnownCrisis
    );
    if (endemicResult.isEndemicAlert) {
      factors.push(...endemicResult.endemicAlerts);
    }

    // 4. Resolve Overall Urgency Tier
    const tierPriority = {
      [TriageUrgencyTier.EMERGENCY_RED]: 4,
      [TriageUrgencyTier.URGENT_AMBER]: 3,
      [TriageUrgencyTier.SEMI_URGENT_YELLOW]: 2,
      [TriageUrgencyTier.ROUTINE_GREEN]: 1
    };

    let resolvedTier = TriageUrgencyTier.ROUTINE_GREEN;
    let maxPriority = 1;

    for (const tier of [vitalsResult.tier, hrpResult.tier, endemicResult.tier]) {
      if (tierPriority[tier] > maxPriority) {
        maxPriority = tierPriority[tier];
        resolvedTier = tier;
      }
    }

    // Calculate urgency score
    let score = vitalsResult.score;
    if (resolvedTier === TriageUrgencyTier.EMERGENCY_RED) score = Math.max(score, 90);
    if (resolvedTier === TriageUrgencyTier.URGENT_AMBER) score = Math.max(score, 70);
    if (resolvedTier === TriageUrgencyTier.SEMI_URGENT_YELLOW) score = Math.max(score, 40);

    // Determine facility, time, and recommended actions
    let recommendedFacility = FacilityType.SC_HWC;
    let maxResponseMinutes = 1440; // 24 hours
    let autoReferral = false;
    let recommendedAction = "Provide routine sub-centre care, lifestyle advice, and standard follow-up.";

    if (resolvedTier === TriageUrgencyTier.EMERGENCY_RED) {
      recommendedFacility = FacilityType.DH;
      maxResponseMinutes = 15;
      autoReferral = true;
      recommendedAction = "EMERGENCY: Immediate life-support stabilization, initiate 108 ambulance dispatch, and alert District Hospital emergency team.";
      requiredMeds.push("Oxygen", "IV Fluids (Normal Saline / Ringer Lactate)", "Anti-Snake Venom", "Magnesium Sulfate (if Eclampsia)");
    } else if (resolvedTier === TriageUrgencyTier.URGENT_AMBER) {
      recommendedFacility = FacilityType.RH_SDH;
      maxResponseMinutes = 120;
      autoReferral = true;
      recommendedAction = "URGENT: Initiate priority teleconsultation with Medical Officer / Specialist within 2 hours. Stabilize locally.";
      requiredMeds.push("Oral / IV Antibiotics", "Antihypertensives", "Iron Sucrose Infusion");
    } else if (resolvedTier === TriageUrgencyTier.SEMI_URGENT_YELLOW) {
      recommendedFacility = FacilityType.PHC;
      maxResponseMinutes = 360;
      recommendedAction = "SEMI-URGENT: Schedule same-day consultation at PHC OPD. Dispense local essential medications.";
      requiredMeds.push("Oral Analgesics", "Antihistamines", "ORS / Zinc");
    }

    const primaryAlert =
      factors.length > 0
        ? factors[0]
        : "Patient vitals and clinical assessment within normal limits.";

    return {
      urgencyTier: resolvedTier,
      urgencyScore: score,
      primaryAlert,
      contributingFactors: factors,
      recommendedAction: hrpResult.isHighRisk && hrpResult.tier === resolvedTier ? hrpResult.recommendedAction : recommendedAction,
      recommendedFacility,
      maxResponseTimeMinutes: maxResponseMinutes,
      requiredMedicationCategories: requiredMeds,
      autoReferralSuggested: autoReferral,
      highRiskPregnancyFlags: highRiskFlags
    };
  }
}
