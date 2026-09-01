/**
 * FHIR R4 Bundle & ABDM Milestone M1/M2/M3 Interoperability Interfaces
 */

export interface IFhirCoding {
  system: string;
  code: string;
  display: string;
}

export interface IFhirCodeableConcept {
  coding: IFhirCoding[];
  text?: string;
}

export interface IFhirIdentifier {
  system: string;
  value: string;
}

export interface IFhirPatientResource {
  resourceType: "Patient";
  id: string;
  identifier: IFhirIdentifier[];
  name: Array<{
    use: "official";
    text: string;
  }>;
  gender: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Array<{
    district: string;
    state: "Maharashtra";
    country: "IND";
  }>;
}

export interface IFhirObservationResource {
  resourceType: "Observation";
  id: string;
  status: "final";
  category: IFhirCodeableConcept[];
  code: IFhirCodeableConcept;
  subject: { reference: string };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
}

export interface IFhirBundle {
  resourceType: "Bundle";
  type: "document" | "transaction";
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}
