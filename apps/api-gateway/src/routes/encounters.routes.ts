import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import { IEncounter, EncounterType, EncounterStatus, SyncState, TriageUrgencyTier } from "@arogyasetu/shared-types";

const router = Router();

const MOCK_ENCOUNTERS: IEncounter[] = [
  {
    id: "enc-2026-001",
    patientId: "pat-ndb-1001",
    facilityId: "fac-ndb-sc-toranmal",
    providerId: "usr-cho-snehal-gaikwad",
    encounterType: EncounterType.ANC_CHECKUP,
    status: EncounterStatus.IN_QUEUE,
    startedAt: new Date("2026-08-30T10:15:00"),
    chiefComplaint: "Severe headache, visual blurring, elevated blood pressure at 32 weeks gestation.",
    clinicalNotes: "Patient flagged for High-Risk Pregnancy & gestational hypertension. Urgent OBGYN consult needed.",
    vitals: {
      id: "vit-001",
      encounterId: "enc-2026-001",
      patientId: "pat-ndb-1001",
      recordedById: "usr-cho-snehal-gaikwad",
      recordedAt: new Date("2026-08-30T10:18:00"),
      systolicBp: 165,
      diastolicBp: 105,
      heartRate: 98,
      spo2: 96,
      hemoglobinGPerDl: 8.2,
      fetalHeartRateBpm: 142
    },
    triage: {
      id: "trg-001",
      encounterId: "enc-2026-001",
      patientId: "pat-ndb-1001",
      assessedById: "usr-cho-snehal-gaikwad",
      assessedAt: new Date("2026-08-30T10:20:00"),
      urgencyTier: TriageUrgencyTier.URGENT_AMBER,
      cdssScore: 85,
      primaryRedFlag: "Gestational Hypertension (BP: 165/105) & Impending Pre-Eclampsia Symptoms",
      recommendedAction: "Same-day priority teleconsultation with OBGYN specialist & IV/Oral labetalol protocol.",
      suggestedFacilityType: "RH_SDH" as any,
      isAutoEscalated: true,
      syndromicTags: ["HRP", "Pre-Eclampsia", "Gestational Hypertension"]
    },
    syncState: SyncState.SYNCED
  }
];

router.get("/queue", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: MOCK_ENCOUNTERS });
});

router.post("/", authenticateToken, (req: AuthRequest, res: Response) => {
  const encounter: IEncounter = {
    id: `enc-${Date.now()}`,
    patientId: req.body.patientId,
    facilityId: req.body.facilityId || "fac-ndb-sc-toranmal",
    providerId: req.user?.id || "usr-cho-snehal-gaikwad",
    encounterType: req.body.encounterType || EncounterType.FIELD_SCREENING,
    status: EncounterStatus.IN_QUEUE,
    startedAt: new Date(),
    chiefComplaint: req.body.chiefComplaint || "General checkup",
    vitals: req.body.vitals,
    triage: req.body.triage,
    syncState: SyncState.SYNCED
  };

  MOCK_ENCOUNTERS.unshift(encounter);
  res.status(201).json({ success: true, data: encounter });
});

export default router;
