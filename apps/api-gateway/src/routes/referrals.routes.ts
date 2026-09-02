import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import { IReferral, ReferralUrgency, ReferralStatus } from "@arogyasetu/shared-types";

const router = Router();

const MOCK_REFERRALS: IReferral[] = [
  {
    id: "ref-2026-101",
    encounterId: "enc-2026-001",
    patientId: "pat-ndb-1001",
    referringFacilityId: "fac-ndb-sc-toranmal",
    referringProviderId: "usr-cho-snehal-gaikwad",
    receivingFacilityId: "fac-pne-dh-aupne",
    specialistSpecialtyNeeded: "OBSTETRICS_GYNECOLOGY",
    urgency: ReferralUrgency.PRIORITY,
    status: ReferralStatus.INITIATED,
    clinicalReason: "Gestational hypertension (165/105) & impending pre-eclampsia at 32 weeks gestation.",
    transportRequired: true,
    transportVehicleNumber: "MH-39-AMB-1081",
    mjpjayPreAuthNumber: "MJPJAY-2026-OBGYN-88412",
    initiatedAt: new Date("2026-08-30T10:30:00")
  }
];

router.get("/", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, count: MOCK_REFERRALS.length, data: MOCK_REFERRALS });
});

router.post("/", authenticateToken, (req: AuthRequest, res: Response) => {
  const newRef: IReferral = {
    id: `ref-${Date.now()}`,
    encounterId: req.body.encounterId,
    patientId: req.body.patientId,
    referringFacilityId: req.body.referringFacilityId || "fac-ndb-sc-toranmal",
    referringProviderId: req.user?.id || "usr-cho-snehal-gaikwad",
    receivingFacilityId: req.body.receivingFacilityId || "fac-pne-dh-aupne",
    specialistSpecialtyNeeded: req.body.specialty || "GENERAL_MEDICINE",
    urgency: req.body.urgency || ReferralUrgency.PRIORITY,
    status: ReferralStatus.INITIATED,
    clinicalReason: req.body.clinicalReason || "Emergency referral",
    transportRequired: req.body.transportRequired || false,
    mjpjayPreAuthNumber: `MJPJAY-2026-AUTO-${Math.floor(Math.random() * 89999 + 10000)}`,
    initiatedAt: new Date()
  };

  MOCK_REFERRALS.unshift(newRef);
  res.status(201).json({ success: true, data: newRef });
});

export default router;
