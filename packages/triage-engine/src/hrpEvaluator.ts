import { TriageUrgencyTier } from "@arogyasetu/shared-types";
import { IVitals } from "@arogyasetu/shared-types";

export interface HrpEvaluationResult {
  isHighRisk: boolean;
  tier: TriageUrgencyTier;
  dangerSignsFound: string[];
  recommendedAction: string;
}

export function evaluateHrp(
  vitals: Partial<IVitals>,
  symptoms: string[],
  gestationalWeeks?: number
): HrpEvaluationResult {
  const dangerSigns: string[] = [];
  let tier = TriageUrgencyTier.ROUTINE_GREEN;

  const normalizedSymptoms = symptoms.map(s => s.toLowerCase());

  // 1. Critical Obstetric Hemorrhage / Bleeding
  if (
    normalizedSymptoms.some(s => s.includes("bleeding") || s.includes("spotting") || s.includes("hemorrhage"))
  ) {
    dangerSigns.push("Antepartum / Postpartum Vaginal Bleeding");
    tier = TriageUrgencyTier.EMERGENCY_RED;
  }

  // 2. Pre-Eclampsia / Eclampsia Signs
  if (
    (vitals.systolicBp && vitals.systolicBp >= 140) ||
    (vitals.diastolicBp && vitals.diastolicBp >= 90)
  ) {
    dangerSigns.push(`Gestational Hypertension (BP: ${vitals.systolicBp}/${vitals.diastolicBp})`);
    tier = TriageUrgencyTier.URGENT_AMBER;

    if (
      normalizedSymptoms.some(
        s => s.includes("headache") || s.includes("blur") || s.includes("epigastric") || s.includes("convulsion")
      )
    ) {
      dangerSigns.push("Impending Eclampsia / Severe Pre-Eclampsia Symptom Complex");
      tier = TriageUrgencyTier.EMERGENCY_RED;
    }
  }

  // 3. Fetal Distress / Reduced Fetal Movements
  if (
    normalizedSymptoms.some(s => s.includes("fetal movement") || s.includes("decreased movement")) ||
    (vitals.fetalHeartRateBpm && (vitals.fetalHeartRateBpm < 110 || vitals.fetalHeartRateBpm > 160))
  ) {
    dangerSigns.push(`Fetal Distress (FHR: ${vitals.fetalHeartRateBpm || "Reduced Movements"})`);
    tier = TriageUrgencyTier.EMERGENCY_RED;
  }

  // 4. Premature Rupture of Membranes / Preterm Labour
  if (gestationalWeeks && gestationalWeeks < 37 && normalizedSymptoms.some(s => s.includes("leaking") || s.includes("contractions"))) {
    dangerSigns.push("Preterm Labour / Premature Rupture of Membranes (<37 Weeks)");
    if (tier !== TriageUrgencyTier.EMERGENCY_RED) tier = TriageUrgencyTier.URGENT_AMBER;
  }

  // 5. Severe Anemia in Pregnancy
  if (vitals.hemoglobinGPerDl && vitals.hemoglobinGPerDl < 7.0) {
    dangerSigns.push(`Severe Maternal Anemia (Hb: ${vitals.hemoglobinGPerDl} g/dL)`);
    if (tier !== TriageUrgencyTier.EMERGENCY_RED) tier = TriageUrgencyTier.URGENT_AMBER;
  }

  return {
    isHighRisk: dangerSigns.length > 0,
    tier,
    dangerSignsFound: dangerSigns,
    recommendedAction:
      tier === TriageUrgencyTier.EMERGENCY_RED
        ? "Immediate 108 Ambulance Dispatch to Sub-District / District Hospital (FRU)"
        : dangerSigns.length > 0
        ? "Same-day Teleconsultation with OBGYN Specialist & Iron Sucrose Infusion Protocol"
        : "Standard Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) Routine ANC Schedule"
  };
}
