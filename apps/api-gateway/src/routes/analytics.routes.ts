import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/m-and-e-kpis", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    district: req.user?.district || "Nandurbar",
    kpis: {
      referralCompletionRatePercent: 88.4,       // Target >85% (Up from 41%)
      meanTimeToCareHours: 3.2,                  // Target <4 hrs (Down from 38 hrs)
      hrpEarlyDetectionRatePercent: 92.1,        // Target >90% (Up from 34%)
      essentialDrugStockoutPercent: 2.1,         // Target <5% (Down from 31%)
      teleconsultResolutionRatePercent: 78.6,    // Target >75%
      patientOopeReductionAvgInr: 2150,          // Direct savings per episode
      ashaDigitalIncentiveDisbursalDays: 4.2     // Down from 90+ days
    },
    epidemiologicalHeatmap: [
      { taluka: "Dhadgaon", district: "Nandurbar", activeHrpCases: 42, snakebites7d: 8, sickleCellCrises: 14, alertLevel: "HIGH" },
      { taluka: "Bhamragad", district: "Gadchiroli", activeHrpCases: 29, snakebites7d: 12, sickleCellCrises: 6, alertLevel: "HIGH" },
      { taluka: "Ralegaon", district: "Yavatmal", activeHrpCases: 19, snakebites7d: 3, sickleCellCrises: 2, alertLevel: "MODERATE" },
      { taluka: "Haveli", district: "Pune Rural", activeHrpCases: 12, snakebites7d: 1, sickleCellCrises: 0, alertLevel: "LOW" }
    ]
  });
});

export default router;
