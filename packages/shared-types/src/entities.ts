import {
  UserRole,
  FacilityType,
  TriageUrgencyTier,
  EncounterType,
  EncounterStatus,
  ReferralUrgency,
  ReferralStatus,
  AshaIncentiveType,
  AshaIncentiveStatus,
  SyncState
} from "./enums.js";

export interface IUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  registrationNumber?: string;
  facilityId?: string;
  district: string;
  taluka?: string;
  isActive: boolean;
  preferredLanguage: "mr" | "en" | "gondi" | "ahirani";
  createdAt: Date;
  updatedAt: Date;
}

export interface IFacility {
  id: string;
  ninCode: string; // National Health Facility Registry (HFR) ID
  name: string;
  facilityType: FacilityType;
  district: string;
  taluka: string;
  village?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  hasTelemedicineHub: boolean;
  hasFunctionalColdChain: boolean;
  parentFacilityId?: string;
  activeIphsDrugCount: number;
}

export interface IPatient {
  id: string;
  abhaId?: string; // 14-digit ABHA ID (e.g., 91-XXXX-XXXX-XXXX)
  abhaAddress?: string; // e.g., name@abdm
  aadhaarVaultRef?: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: Date;
  ageYears?: number;
  phoneNumber?: string;
  caregiverPhone?: string;
  residenceVillage: string;
  residenceTaluka: string;
  residenceDistrict: string;
  assignedAshaId?: string;
  assignedFacilityId?: string;
  bloodGroup?: string;
  isSickleCellTraitOrDiseased?: boolean;
  isHighRiskPregnancy?: boolean;
  isHypertensive?: boolean;
  isDiabetic?: boolean;
  isUnderMjpjay?: boolean; // Mahatma Jyotirao Phule Jan Arogya Yojana
  createdAt: Date;
  updatedAt: Date;
}

export interface IVitals {
  id: string;
  encounterId: string;
  patientId: string;
  recordedById: string;
  recordedAt: Date;
  systolicBp?: number;   // mmHg
  diastolicBp?: number;  // mmHg
  heartRate?: number;    // bpm
  respiratoryRate?: number; // breaths/min
  spo2?: number;         // % (Critical in pneumonia / ARDS)
  temperatureCelsius?: number; // °C
  randomBloodGlucoseMgDl?: number; // mg/dL
  hemoglobinGPerDl?: number;       // g/dL (Critical in ANC anemia)
  fetalHeartRateBpm?: number;      // bpm
  fundalHeightCm?: number;         // cm
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
}

export interface ITriageAssessment {
  id: string;
  encounterId: string;
  patientId: string;
  assessedById: string;
  assessedAt: Date;
  urgencyTier: TriageUrgencyTier;
  cdssScore: number;
  primaryRedFlag?: string;
  recommendedAction: string;
  suggestedFacilityType: FacilityType;
  isAutoEscalated: boolean;
  syndromicTags: string[];
}

export interface IEncounter {
  id: string;
  patientId: string;
  facilityId: string;
  providerId: string;
  encounterType: EncounterType;
  status: EncounterStatus;
  startedAt: Date;
  completedAt?: Date;
  chiefComplaint: string;
  clinicalNotes?: string;
  diagnosisIcd10Code?: string;
  diagnosisName?: string;
  vitals?: IVitals;
  triage?: ITriageAssessment;
  syncState: SyncState;
  offlineSyncId?: string;
}

export interface IPrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string;
  medicineGenericName: string;
  dosage: string;         // e.g., 500mg
  frequency: string;      // e.g., 1-0-1 (BID)
  durationDays: number;
  instructions: string;   // e.g., After meals
  quantityPrescribed: number;
  quantityDispensed: number;
  isGenericAvailable: boolean;
}

export interface IPrescription {
  id: string;
  encounterId: string;
  patientId: string;
  doctorId: string;
  doctorRegistrationNumber: string;
  prescribedAt: Date;
  nmcAppendix2Compliant: boolean;
  digitalSignatureHash?: string;
  items: IPrescriptionItem[];
  isDispensed: boolean;
  dispensedAt?: Date;
  dispensingPharmacistId?: string;
}

export interface IReferral {
  id: string;
  encounterId: string;
  patientId: string;
  referringFacilityId: string;
  referringProviderId: string;
  receivingFacilityId: string;
  specialistSpecialtyNeeded: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  clinicalReason: string;
  transportRequired: boolean;
  transportVehicleNumber?: string;
  mjpjayPreAuthNumber?: string;
  initiatedAt: Date;
  arrivedAt?: Date;
  closedAt?: Date;
}

export interface IAshaIncentive {
  id: string;
  ashaId: string;
  patientId: string;
  encounterId?: string;
  incentiveType: AshaIncentiveType;
  amountInr: number;
  activityDate: Date;
  status: AshaIncentiveStatus;
  claimVoucherNumber?: string;
  pfmsTransactionId?: string;
  approvedById?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface IDrugInventoryBatch {
  id: string;
  facilityId: string;
  medicineId: string;
  batchNumber: string;
  mfgDate: Date;
  expiryDate: Date;
  quantityAvailable: number;
  dvdmsSourceWarehouseId?: string;
  isFefoPriority: boolean;
  isQuarantined: boolean;
}

export interface ITeleconsultConsent {
  id: string;
  encounterId: string;
  patientId: string;
  doctorId: string;
  consentedAt: Date;
  consentType: "VERBAL_AUDIO_RECORDED" | "DIGITAL_OTP_ABHA" | "WRITTEN_ASHA_ATTESTED";
  audioRecordingUrl?: string;
  isVerified: boolean;
}
