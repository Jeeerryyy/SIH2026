import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth.js";
import { CdssEngine } from "@arogyasetu/triage-engine";
import { ICdssEvaluationInput } from "@arogyasetu/shared-types";

const router = Router();

router.post("/evaluate", authenticateToken, (req: AuthRequest, res: Response) => {
  const input: ICdssEvaluationInput = req.body;
  const result = CdssEngine.evaluate(input);

  res.json({
    success: true,
    data: result
  });
});

export default router;
