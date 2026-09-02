import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import { IAshaIncentive, AshaIncentiveType, AshaIncentiveStatus } from "@arogyasetu/shared-types";

const router = Router();

const MOCK_INCENTIVES: IAshaIncentive[] = [
  {
    id: "inc-001",
    ashaId: "usr-asha-kavita-padvi",
    patientId: "pat-ndb-1001",
    encounterId: "enc-2026-001",
    incentiveType: AshaIncentiveType.HRP_IDENTIFICATION,
    amountInr: 250,
    activityDate: new Date("2026-08-30"),
    status: AshaIncentiveStatus.APPROVED_BY_MO,
    claimVoucherNumber: "MH-NDB-ASHA-2026-0089",
    pfmsTransactionId: "PFMS-MH-2026-TX-99881"
  },
  {
    id: "inc-002",
    ashaId: "usr-asha-kavita-padvi",
    patientId: "pat-ndb-1001",
    incentiveType: AshaIncentiveType.JSY_INSTITUTIONAL_DELIVERY,
    amountInr: 300,
    activityDate: new Date("2026-08-25"),
    status: AshaIncentiveStatus.DISBURSED,
    claimVoucherNumber: "MH-NDB-ASHA-2026-0045",
    pfmsTransactionId: "PFMS-MH-2026-TX-77612"
  }
];

router.get("/my-ledger", authenticateToken, (req: AuthRequest, res: Response) => {
  const ashaId = req.user?.id || "usr-asha-kavita-padvi";
  const claims = MOCK_INCENTIVES.filter(i => i.ashaId === ashaId);
  const totalEarned = claims.reduce((acc, curr) => acc + curr.amountInr, 0);

  res.json({
    success: true,
    totalEarnedInr: totalEarned,
    claimsCount: claims.length,
    data: claims
  });
});

router.post("/claim", authenticateToken, (req: AuthRequest, res: Response) => {
  const newClaim: IAshaIncentive = {
    id: `inc-${Date.now()}`,
    ashaId: req.user?.id || "usr-asha-kavita-padvi",
    patientId: req.body.patientId,
    encounterId: req.body.encounterId,
    incentiveType: req.body.incentiveType || AshaIncentiveType.CBAC_NCD_SCREENING,
    amountInr: req.body.amountInr || 10,
    activityDate: new Date(),
    status: AshaIncentiveStatus.RECORDED,
    claimVoucherNumber: `MH-AUTO-VOUCHER-${Date.now().toString().slice(-6)}`
  };

  MOCK_INCENTIVES.unshift(newClaim);
  res.status(201).json({ success: true, data: newClaim });
});

export default router;
