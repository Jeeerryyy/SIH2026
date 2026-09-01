import Dexie, { Table } from "dexie";
import { IPatient, IVitals, IAshaIncentive, ISyncPayload } from "@arogyasetu/shared-types";

export class ArogyaFieldDatabase extends Dexie {
  patients!: Table<IPatient, string>;
  vitals!: Table<IVitals, string>;
  incentives!: Table<IAshaIncentive, string>;
  syncQueue!: Table<ISyncPayload, string>;

  constructor() {
    super("ArogyaSetuFieldDB");
    this.version(1).stores({
      patients: "id, abhaId, fullName, isHighRiskPregnancy, residenceVillage",
      vitals: "id, encounterId, patientId, recordedAt",
      incentives: "id, ashaId, incentiveType, status, claimVoucherNumber",
      syncQueue: "entityId, entityType, timestamp"
    });
  }
}

export const db = new ArogyaFieldDatabase();
