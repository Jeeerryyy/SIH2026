import { TriageUrgencyTier } from "@arogyasetu/shared-types";
import { IVitals } from "@arogyasetu/shared-types";

export interface VitalsTriageResult {
  tier: TriageUrgencyTier;
  score: number;
  alerts: string[];
}

export function evaluateVitals(vitals: Partial<IVitals>): VitalsTriageResult {
  const alerts: string[] = [];
  let highestTier = TriageUrgencyTier.ROUTINE_GREEN;
  let score = 10;

  // 1. SpO2 Oxygen Saturation (Immediate Hypoxia Danger)
  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 90) {
      alerts.push(`Critical Hypoxemia (SpO2: ${vitals.spo2}%) — Immediate O2 Resuscitation Required`);
      highestTier = TriageUrgencyTier.EMERGENCY_RED;
      score = Math.max(score, 95);
    } else if (vitals.spo2 <= 93) {
      alerts.push(`Moderate Hypoxia (SpO2: ${vitals.spo2}%) — Teleconsultation & Close Monitoring`);
      if (highestTier !== TriageUrgencyTier.EMERGENCY_RED) {
        highestTier = TriageUrgencyTier.URGENT_AMBER;
        score = Math.max(score, 75);
      }
    }
  }

  // 2. Blood Pressure (Hypertensive Emergency / Shock)
  if (vitals.systolicBp !== undefined || vitals.diastolicBp !== undefined) {
    const sbp = vitals.systolicBp || 120;
    const dbp = vitals.diastolicBp || 80;

    if (sbp >= 180 || dbp >= 110) {
      alerts.push(`Hypertensive Crisis (BP: ${sbp}/${dbp} mmHg) — Risk of Encephalopathy / Eclampsia`);
      highestTier = TriageUrgencyTier.EMERGENCY_RED;
      score = Math.max(score, 90);
    } else if (sbp >= 160 || dbp >= 100) {
      alerts.push(`Severe Hypertension (BP: ${sbp}/${dbp} mmHg) — Urgent Medical Officer Review`);
      if (highestTier !== TriageUrgencyTier.EMERGENCY_RED) {
        highestTier = TriageUrgencyTier.URGENT_AMBER;
        score = Math.max(score, 70);
      }
    } else if (sbp < 90 && sbp > 0) {
      alerts.push(`Hypotension / Shock Warning (SBP: ${sbp} mmHg) — Immediate IV Access Required`);
      highestTier = TriageUrgencyTier.EMERGENCY_RED;
      score = Math.max(score, 92);
    }
  }

  // 3. Heart Rate (Severe Bradycardia or Tachycardia)
  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate > 130 || vitals.heartRate < 45) {
      alerts.push(`Severe Arrhythmia / Rate Outlier (Pulse: ${vitals.heartRate} bpm)`);
      if (highestTier !== TriageUrgencyTier.EMERGENCY_RED) {
        highestTier = TriageUrgencyTier.URGENT_AMBER;
        score = Math.max(score, 75);
      }
    }
  }

  // 4. Respiratory Rate (Severe Tachypnea / Respiratory Distress)
  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 8) {
      alerts.push(`Severe Respiratory Distress (RR: ${vitals.respiratoryRate} /min)`);
      highestTier = TriageUrgencyTier.EMERGENCY_RED;
      score = Math.max(score, 95);
    }
  }

  // 5. Blood Glucose (Severe Hypo / Hyperglycemia)
  if (vitals.randomBloodGlucoseMgDl !== undefined) {
    if (vitals.randomBloodGlucoseMgDl < 55) {
      alerts.push(`Severe Hypoglycemia (${vitals.randomBloodGlucoseMgDl} mg/dL) — Give 25% Dextrose Immediately`);
      highestTier = TriageUrgencyTier.EMERGENCY_RED;
      score = Math.max(score, 90);
    } else if (vitals.randomBloodGlucoseMgDl > 350) {
      alerts.push(`Hyperglycemic Hyperosmolar State Warning (${vitals.randomBloodGlucoseMgDl} mg/dL)`);
      if (highestTier !== TriageUrgencyTier.EMERGENCY_RED) {
        highestTier = TriageUrgencyTier.URGENT_AMBER;
        score = Math.max(score, 70);
      }
    }
  }

  // 6. Hemoglobin (Severe Anemia)
  if (vitals.hemoglobinGPerDl !== undefined) {
    if (vitals.hemoglobinGPerDl < 7.0) {
      alerts.push(`Severe Anemia (Hb: ${vitals.hemoglobinGPerDl} g/dL) — Blood Transfusion Preparedness`);
      if (highestTier !== TriageUrgencyTier.EMERGENCY_RED) {
        highestTier = TriageUrgencyTier.URGENT_AMBER;
        score = Math.max(score, 80);
      }
    }
  }

  return { tier: highestTier, score, alerts };
}
