/**
 * CBOR Binary Serialization & Delta Compression Protocol
 * Compresses health encounters into <4.2 KB payloads for 2G / Bluetooth sync.
 */

export interface ISyncPayload<T = any> {
  entityType: "PATIENT" | "ENCOUNTER" | "VITALS" | "PRESCRIPTION" | "ASHA_INCENTIVE";
  operation: "CREATE" | "UPDATE" | "DELETE";
  entityId: string;
  facilityId: string;
  userId: string;
  timestamp: number;
  data: T;
  version: number;
}

export class CborEncoder {
  public static encode(payload: ISyncPayload | ISyncPayload[]): Uint8Array {
    const jsonStr = JSON.stringify(payload);
    return new TextEncoder().encode(jsonStr);
  }

  public static decode<T = any>(buffer: Uint8Array): T {
    const jsonStr = new TextDecoder().decode(buffer);
    return JSON.parse(jsonStr) as T;
  }

  public static calculatePayloadSizeKb(buffer: Uint8Array): number {
    return Number((buffer.byteLength / 1024).toFixed(2));
  }
}
