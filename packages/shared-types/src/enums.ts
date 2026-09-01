/**
 * ArogyaSetu Bridge — Master System Enums
 * Grounded in Maharashtra Health Ecosystem & ABDM Standards
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  STATE_ADMIN = "STATE_ADMIN",
  DHO = "DHO",                       // District Health Officer
  THO = "THO",                       // Taluka Health Officer
  SPECIALIST = "SPECIALIST",         // MD / MS Doctor at District Hospital / Medical College
  MO = "MO",                         // Medical Officer at PHC / CHC
  CHO = "CHO",                       // Community Health Officer at Ayushman Arogya Mandir (Sub-Centre)
  PHARMACIST = "PHARMACIST",
  LAB_TECHNICIAN = "LAB_TECHNICIAN",
  ANM = "ANM",                       // Auxiliary Nurse Midwife
  ASHA = "ASHA",                     // Accredited Social Health Activist
  PATIENT = "PATIENT"
}

export enum FacilityType {
  SC_HWC = "SC_HWC",                 // Ayushman Arogya Mandir (Sub-Centre)
  PHC = "PHC",                       // Primary Health Centre
  RH_SDH = "RH_SDH",                 // Rural Hospital / Sub-District Hospital
  DH = "DH",                         // District Hospital
  GMC = "GMC"                        // Government Medical College & Hospital
}

export enum TriageUrgencyTier {
  EMERGENCY_RED = "EMERGENCY_RED",       // Immediate resuscitation / Red alert (<15 min)
  URGENT_AMBER = "URGENT_AMBER",         // Priority teleconsultation / urgent referral (<2 hrs)
  SEMI_URGENT_YELLOW = "SEMI_URGENT_YELLOW", // Same-day Medical Officer review (<6 hrs)
  ROUTINE_GREEN = "ROUTINE_GREEN"        // Local protocol-based treatment / routine follow-up
}

export enum EncounterType {
  FIELD_SCREENING = "FIELD_SCREENING",
  OPD_CONSULTATION = "OPD_CONSULTATION",
  TELECONSULTATION = "TELECONSULTATION",
  ANC_CHECKUP = "ANC_CHECKUP",
  IMMUNIZATION = "IMMUNIZATION",
  NCD_SCREENING = "NCD_SCREENING",
  EMERGENCY = "EMERGENCY"
}

export enum EncounterStatus {
  TRIAGED = "TRIAGED",
  IN_QUEUE = "IN_QUEUE",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REFERRED = "REFERRED",
  CANCELLED = "CANCELLED"
}

export enum ReferralUrgency {
  ROUTINE = "ROUTINE",
  PRIORITY = "PRIORITY",
  EMERGENCY = "EMERGENCY"
}

export enum ReferralStatus {
  INITIATED = "INITIATED",
  TRANSPORT_DISPATCHED = "TRANSPORT_DISPATCHED",
  EN_ROUTE = "EN_ROUTE",
  RECEIVED_AT_FACILITY = "RECEIVED_AT_FACILITY",
  SPECIALIST_ATTENDED = "SPECIALIST_ATTENDED",
  DISCHARGED = "DISCHARGED",
  CLOSED = "CLOSED"
}

export enum AshaIncentiveType {
  JSY_INSTITUTIONAL_DELIVERY = "JSY_INSTITUTIONAL_DELIVERY", // ₹300
  HRP_IDENTIFICATION = "HRP_IDENTIFICATION",                 // ₹250
  FULL_IMMUNIZATION_YEAR_1 = "FULL_IMMUNIZATION_YEAR_1",     // ₹100
  CBAC_NCD_SCREENING = "CBAC_NCD_SCREENING",                 // ₹10
  VHSND_ATTENDANCE = "VHSND_ATTENDANCE",                     // ₹100
  TB_NOTIFICATION_SUPPORT = "TB_NOTIFICATION_SUPPORT",       // ₹500
  SICKLE_CELL_SCREENING = "SICKLE_CELL_SCREENING"            // ₹50
}

export enum AshaIncentiveStatus {
  RECORDED = "RECORDED",
  VERIFIED_BY_ANM = "VERIFIED_BY_ANM",
  APPROVED_BY_MO = "APPROVED_BY_MO",
  PFMS_PROCESSED = "PFMS_PROCESSED",
  DISBURSED = "DISBURSED",
  REJECTED = "REJECTED"
}

export enum DrugCategory {
  ESSENTIAL_IPHS = "ESSENTIAL_IPHS",
  SCHEDULE_H = "SCHEDULE_H",
  SCHEDULE_X = "SCHEDULE_X",
  EMERGENCY_ANTIDOTE = "EMERGENCY_ANTIDOTE",
  MATERNAL_CHILD = "MATERNAL_CHILD",
  NCD_CHRONIC = "NCD_CHRONIC"
}

export enum StockTransactionType {
  RECEIPT_FROM_DVDMS = "RECEIPT_FROM_DVDMS",
  DISPENSE_TO_PATIENT = "DISPENSE_TO_PATIENT",
  TRANSFER_TO_SC = "TRANSFER_TO_SC",
  RETURN_EXPIRED = "RETURN_EXPIRED",
  ADJUSTMENT_AUDIT = "ADJUSTMENT_AUDIT"
}

export enum SyncState {
  PENDING = "PENDING",
  SYNCING = "SYNCING",
  SYNCED = "SYNCED",
  CONFLICT = "CONFLICT",
  FAILED = "FAILED"
}
