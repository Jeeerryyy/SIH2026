import { Router, Request, Response } from "express";
import { CborEncoder, SyncManager, ISyncPayload } from "@arogyasetu/sync-engine";

const router = Router();

const SERVER_VERSION_MAP = new Map<string, number>();

router.post("/delta", (req: Request, res: Response) => {
  try {
    const rawPayloads: ISyncPayload[] = req.body.payloads || [];
    const result = SyncManager.reconcile(rawPayloads, SERVER_VERSION_MAP);

    res.json({
      success: true,
      acceptedCount: result.accepted.length,
      conflictedCount: result.conflicted.length,
      skippedCount: result.skipped.length,
      serverTimestamp: Date.now()
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
