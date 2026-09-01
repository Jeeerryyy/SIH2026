import { IDrugInventoryBatch } from "@arogyasetu/shared-types";

export interface IFefoDispensePlan {
  medicineId: string;
  totalRequested: number;
  totalAllocated: number;
  batchesToDispense: Array<{
    batchId: string;
    batchNumber: string;
    expiryDate: Date;
    quantityToDeduct: number;
  }>;
  isFullyFulfilled: boolean;
  nearExpiryWarning: boolean;
}

export class FefoManager {
  /**
   * Sorts available stock batches by First-Expired, First-Out (FEFO) principle
   * Minimizes pharmaceutical wastage in rural PHCs / Sub-Centres
   */
  public static planDispense(
    availableBatches: IDrugInventoryBatch[],
    quantityNeeded: number
  ): IFefoDispensePlan {
    const validBatches = availableBatches
      .filter(b => !b.isQuarantined && b.quantityAvailable > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let remainingNeeded = quantityNeeded;
    let allocated = 0;
    const planBatches: IFefoDispensePlan["batchesToDispense"] = [];
    let nearExpiry = false;

    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    for (const batch of validBatches) {
      if (remainingNeeded <= 0) break;

      const batchExpiry = new Date(batch.expiryDate).getTime();
      if (batchExpiry - now < ninetyDaysMs) {
        nearExpiry = true;
      }

      const takeQty = Math.min(batch.quantityAvailable, remainingNeeded);
      allocated += takeQty;
      remainingNeeded -= takeQty;

      planBatches.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: new Date(batch.expiryDate),
        quantityToDeduct: takeQty
      });
    }

    return {
      medicineId: availableBatches[0]?.medicineId || "",
      totalRequested: quantityNeeded,
      totalAllocated: allocated,
      batchesToDispense: planBatches,
      isFullyFulfilled: remainingNeeded === 0,
      nearExpiryWarning: nearExpiry
    };
  }
}
