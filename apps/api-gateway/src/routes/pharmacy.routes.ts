import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import { FefoManager } from "@arogyasetu/eaushadhi-bridge";
import { IDrugInventoryBatch } from "@arogyasetu/shared-types";

const router = Router();

const MOCK_BATCHES: IDrugInventoryBatch[] = [
  {
    id: "batch-101",
    facilityId: "fac-ndb-sc-toranmal",
    medicineId: "med-paracetamol-500",
    batchNumber: "MSM-PCM-2026A",
    mfgDate: new Date("2026-01-10"),
    expiryDate: new Date("2027-01-10"),
    quantityAvailable: 1500,
    isFefoPriority: true,
    isQuarantined: false
  },
  {
    id: "batch-102",
    facilityId: "fac-ndb-sc-toranmal",
    medicineId: "med-asv-polyvalent",
    batchNumber: "SII-ASV-2026-X",
    mfgDate: new Date("2026-02-15"),
    expiryDate: new Date("2027-08-15"),
    quantityAvailable: 25,
    isFefoPriority: true,
    isQuarantined: false
  }
];

router.get("/stock/:facilityId", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, count: MOCK_BATCHES.length, data: MOCK_BATCHES });
});

router.post("/plan-dispense", authenticateToken, (req: AuthRequest, res: Response) => {
  const { medicineId, quantityNeeded } = req.body;
  const medicineBatches = MOCK_BATCHES.filter(b => b.medicineId === medicineId);
  const plan = FefoManager.planDispense(medicineBatches, quantityNeeded || 10);

  res.json({ success: true, data: plan });
});

export default router;
