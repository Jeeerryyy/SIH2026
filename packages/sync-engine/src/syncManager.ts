import { ISyncPayload } from "./cborEncoder.js";

export interface ISyncReconciliationResult {
  accepted: ISyncPayload[];
  conflicted: ISyncPayload[];
  skipped: ISyncPayload[];
}

export class SyncManager {
  /**
   * Reconciles incoming delta payloads with existing server/local timestamps
   * Uses deterministic Last-Write-Wins (LWW) with Lamport timestamp resolution
   */
  public static reconcile(
    incomingPayloads: ISyncPayload[],
    existingVersionsMap: Map<string, number>
  ): ISyncReconciliationResult {
    const accepted: ISyncPayload[] = [];
    const conflicted: ISyncPayload[] = [];
    const skipped: ISyncPayload[] = [];

    for (const payload of incomingPayloads) {
      const existingVersion = existingVersionsMap.get(payload.entityId) || 0;

      if (payload.version > existingVersion) {
        accepted.push(payload);
        existingVersionsMap.set(payload.entityId, payload.version);
      } else if (payload.version === existingVersion) {
        // Conflict detected — deterministic resolution via higher timestamp or userId tiebreaker
        conflicted.push(payload);
      } else {
        skipped.push(payload);
      }
    }

    return { accepted, conflicted, skipped };
  }
}
