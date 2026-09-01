import { IDrugInventoryBatch } from "@arogyasetu/shared-types";

export interface IDvdmsWarehouseIndent {
  indentId: string;
  facilityId: string;
  facilityNinCode: string;
  requestedMedicines: Array<{
    medicineId: string;
    genericName: string;
    requestedQuantity: number;
    currentStock: number;
  }>;
  status: "SUBMITTED" | "APPROVED" | "DISPATCHED" | "DELIVERED";
  createdAt: Date;
}

export class DvdmsClient {
  /**
   * Mock / Live integration with Maharashtra State Medical Services Corporation (MSMSPA) e-Aushadhi DVDMS API
   */
  public static async fetchWarehouseStock(warehouseId: string): Promise<IDrugInventoryBatch[]> {
    // Returns active certified batches from District Drug Warehouse (DDW)
    return [
      {
        id: "batch-101",
        facilityId: warehouseId,
        medicineId: "med-paracetamol-500",
        batchNumber: "MSM-PCM-2026A",
        mfgDate: new Date("2026-01-10"),
        expiryDate: new Date("2028-01-10"),
        quantityAvailable: 50000,
        dvdmsSourceWarehouseId: warehouseId,
        isFefoPriority: true,
        isQuarantined: false
      },
      {
        id: "batch-102",
        facilityId: warehouseId,
        medicineId: "med-asv-polyvalent",
        batchNumber: "SII-ASV-2026-X",
        mfgDate: new Date("2026-02-15"),
        expiryDate: new Date("2027-08-15"),
        quantityAvailable: 1200,
        dvdmsSourceWarehouseId: warehouseId,
        isFefoPriority: true,
        isQuarantined: false
      }
    ];
  }
}
