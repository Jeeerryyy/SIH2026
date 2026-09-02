import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import { IPrescription } from "@arogyasetu/shared-types";

const router = Router();

const MOCK_PRESCRIPTIONS: IPrescription[] = [];

router.post("/", authenticateToken, (req: AuthRequest, res: Response) => {
  const prescription: IPrescription = {
    id: `rx-${Date.now()}`,
    encounterId: req.body.encounterId,
    patientId: req.body.patientId,
    doctorId: req.user?.id || "usr-spec-anjali-deshmukh",
    doctorRegistrationNumber: "MMC-2012/04/1042",
    prescribedAt: new Date(),
    nmcAppendix2Compliant: true,
    digitalSignatureHash: `SHA256-${Date.now()}-SIG-AUTH`,
    items: req.body.items || [],
    isDispensed: false
  };

  MOCK_PRESCRIPTIONS.push(prescription);

  res.status(201).json({
    success: true,
    data: prescription,
    message: "NMC 2020 Appendix 2 e-Prescription digitally signed and queued for FEFO dispensary"
  });
});

router.get("/encounter/:encounterId", authenticateToken, (req: AuthRequest, res: Response) => {
  const rx = MOCK_PRESCRIPTIONS.find(p => p.encounterId === req.params.encounterId);
  res.json({ success: true, data: rx || null });
});

export default router;
