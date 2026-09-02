import React, { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// INLINED CDSS ENGINE — Full 4-Tier Clinical Decision Support System
// ═══════════════════════════════════════════════════════════════════════════════
interface VitalsInput {
  systolicBp?: number;
  diastolicBp?: number;
  hemoglobinGPerDl?: number;
  fetalHeartRateBpm?: number;
  spo2Percent?: number;
  pulseRateBpm?: number;
  respiratoryRate?: number;
  tempCelsius?: number;
  randomBloodSugarMgDl?: number;
}

interface TriageResult {
  urgencyTier: "EMERGENCY_RED" | "URGENT_AMBER" | "WATCH_YELLOW" | "ROUTINE_GREEN";
  urgencyScore: number;
  primaryAlert: string;
  recommendedAction: string;
  redFlags: string[];
  cdssRules: string[];
  ashaIncentiveEligible: boolean;
  referToPhc: boolean;
  callAmbulance: boolean;
}

function evaluateCdss(params: {
  vitals: VitalsInput;
  symptoms: string[];
  isPregnant: boolean;
  gestationalWeeks?: number;
}): TriageResult {
  const { vitals, symptoms, isPregnant, gestationalWeeks = 0 } = params;
  const redFlags: string[] = [];
  const cdssRules: string[] = [];
  let score = 0;

  // ── Blood Pressure Rules ──────────────────────────────────────────────────
  const sbp = vitals.systolicBp ?? 0;
  const dbp = vitals.diastolicBp ?? 0;
  if (sbp >= 160 || dbp >= 110) {
    score += 40; redFlags.push("Severe Hypertension (BP ≥160/110)");
    cdssRules.push("WHO MgSO4 protocol for eclampsia prevention");
  } else if (sbp >= 140 || dbp >= 90) {
    score += 25; redFlags.push("Gestational Hypertension (BP ≥140/90)");
    cdssRules.push("Labetalol 100mg stat + specialist review");
  } else if (sbp < 90) {
    score += 35; redFlags.push("Hypotensive Shock (BP <90 systolic)");
    cdssRules.push("IV fluid resuscitation + emergency referral");
  }

  // ── Haemoglobin Rules ─────────────────────────────────────────────────────
  const hb = vitals.hemoglobinGPerDl ?? 12;
  if (hb < 7) {
    score += 35; redFlags.push("Severe Anaemia (Hb <7 g/dL)");
    cdssRules.push("Emergency IV Iron Sucrose + blood transfusion evaluation");
  } else if (hb < 10) {
    score += 20; redFlags.push("Moderate Anaemia (Hb <10 g/dL)");
    cdssRules.push("Fe-IFA supplement + PMMVY dietary counselling");
  } else if (hb < 11) {
    score += 8; cdssRules.push("Mild anaemia — monitor Hb monthly");
  }

  // ── Foetal Heart Rate Rules ───────────────────────────────────────────────
  const fhr = vitals.fetalHeartRateBpm ?? 140;
  if (isPregnant && gestationalWeeks >= 24 && (fhr < 110 || fhr > 160)) {
    score += 30; redFlags.push(`Foetal Distress (FHR ${fhr} bpm)`);
    cdssRules.push("Emergency obstetric referral — LSCS evaluation");
  }

  // ── SpO2 Rules ────────────────────────────────────────────────────────────
  const spo2 = vitals.spo2Percent ?? 98;
  if (spo2 < 85) {
    score += 45; redFlags.push(`Critical Hypoxia (SpO2 ${spo2}%)`);
    cdssRules.push("Emergency 108 ambulance — airway management");
  } else if (spo2 < 92) {
    score += 25; redFlags.push(`Hypoxia (SpO2 ${spo2}%)`);
    cdssRules.push("Supplemental O2 + urgent referral");
  }

  // ── Blood Sugar Rules ─────────────────────────────────────────────────────
  const rbs = vitals.randomBloodSugarMgDl ?? 0;
  if (rbs > 0 && rbs > 200) {
    score += 15; redFlags.push(`Hyperglycaemia (RBS ${rbs} mg/dL)`);
    cdssRules.push("GDM screening + OGTT + dietary counselling");
  } else if (rbs > 0 && rbs < 60) {
    score += 30; redFlags.push(`Hypoglycaemia (RBS ${rbs} mg/dL)`);
    cdssRules.push("Immediate oral glucose + IV dextrose if unconscious");
  }

  // ── Symptom Scoring ───────────────────────────────────────────────────────
  const dangerSymptoms: Record<string, number> = {
    "headache": 15, "डोकेदुखी": 15, "blurred vision": 20, "अंधुक दिसणे": 20,
    "convulsion": 40, "आकडी": 40, "bleeding": 35, "रक्तस्राव": 35,
    "breathlessness": 25, "श्वास": 25, "oedema": 10, "सुजणे": 10,
    "fever": 12, "ताप": 12, "vomiting": 8, "उलटी": 8,
    "unconscious": 50, "बेशुद्ध": 50, "snakebite": 45, "सर्पदंश": 45,
    "chest pain": 30, "छातीत दुखणे": 30, "weakness": 8, "अशक्तपणा": 8,
  };
  let symptomScore = 0;
  for (const sym of symptoms) {
    const symLower = sym.toLowerCase();
    for (const [key, val] of Object.entries(dangerSymptoms)) {
      if (symLower.includes(key)) { symptomScore += val; break; }
    }
  }
  score += Math.min(symptomScore, 50);

  // ── HRP Gestational Context ───────────────────────────────────────────────
  if (isPregnant && gestationalWeeks >= 36 && score > 15) {
    score += 10; cdssRules.push("Term pregnancy + risk factors → arrange institutional delivery");
  }

  // ── Determine Tier ────────────────────────────────────────────────────────
  let tier: TriageResult["urgencyTier"];
  let primaryAlert: string;
  let recommendedAction: string;
  let callAmbulance = false;
  let referToPhc = false;

  if (score >= 40 || redFlags.some(f => f.includes("Shock") || f.includes("Hypoxia") || f.includes("Distress") || f.includes("Eclampsia") || f.includes("snakebite") || f.includes("unconscious"))) {
    tier = "EMERGENCY_RED";
    primaryAlert = `🚨 EMERGENCY: ${redFlags[0] || "Critical clinical condition"}`;
    recommendedAction = "Call 108 Ambulance IMMEDIATELY. Stabilise patient. Do not delay referral. Administer first-line protocol as per CDSS.";
    callAmbulance = true; referToPhc = true;
  } else if (score >= 20) {
    tier = "URGENT_AMBER";
    primaryAlert = `⚠️ URGENT: ${redFlags[0] || "Significant clinical risk detected"}`;
    recommendedAction = "Arrange Video Teleconsultation with MO within 30 minutes. Administer indicated medications. Monitor vitals every 15 minutes.";
    referToPhc = true;
  } else if (score >= 10) {
    tier = "WATCH_YELLOW";
    primaryAlert = `👁️ WATCH: Borderline clinical parameters detected`;
    recommendedAction = "PHC visit within 24 hours. Record in ANC card. Provide counselling on danger signs. Follow-up in 7 days.";
  } else {
    tier = "ROUTINE_GREEN";
    primaryAlert = `✅ ROUTINE: Clinical parameters within acceptable range`;
    recommendedAction = "Continue regular ANC schedule. Provide Fe-IFA and calcium supplements. Next visit in 4 weeks.";
  }

  return {
    urgencyTier: tier,
    urgencyScore: Math.min(score, 100),
    primaryAlert,
    recommendedAction,
    redFlags,
    cdssRules: cdssRules.length ? cdssRules : ["Continue standard ANC protocol"],
    ashaIncentiveEligible: score >= 20 || isPregnant,
    referToPhc,
    callAmbulance,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  primary: "#75A68C", primaryDark: "#456B4D", primaryLight: "#E3EDE8",
  primaryLighter: "#F0F6F3", danger: "#C8372D", dangerBg: "#FDF2F2",
  dangerBorder: "#F5C2C0", warning: "#D97706", warningBg: "#FFFBEB",
  warningBorder: "#FDE68A", success: "#16A34A", successBg: "#F0FDF4",
  ink: "#1A1A1A", inkMuted: "#737373", surface: "#F8FAF9", card: "#FFFFFF",
  hairline: "#E5EDE9", border: "#D0DDD8", info: "#2563EB", infoBg: "#EFF6FF",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
type Lang = "mr" | "gondi" | "en";
type Tab  = "HOME" | "ANC" | "CBAC" | "INCENTIVES" | "PATIENTS" | "PROFILE";

const I18N: Record<Lang, Record<string, string>> = {
  mr: {
    appName: "आरोग्यसेतू ब्रिज", appSub: "आशा फील्ड ॲप • तोरणमाळ HWC",
    home: "मुख्य", anc: "माता ANC", cbac: "NCD स्क्रीन",
    incentives: "मानधन", patients: "रुग्ण", profile: "माझे",
    totalEarned: "एकूण मानधन", offline: "ऑफलाइन तयार",
    evaluate: "CDSS ट्रायज तपासा →",
    voicePrompt: "🎙️ आवाज ओळख — बोला...",
    submit: "सादर करा",
  },
  gondi: {
    appName: "ArogyaSetu Gondi", appSub: "ASHA App • Toranmal HWC",
    home: "होम", anc: "ANC", cbac: "CBAC",
    incentives: "मानधन", patients: "रुग्ण", profile: "प्रोफाइल",
    totalEarned: "मानधन", offline: "ऑफलाइन",
    evaluate: "ट्रायज काढ →",
    voicePrompt: "🎙️ आवाज...",
    submit: "सादर",
  },
  en: {
    appName: "ArogyaSetu Bridge", appSub: "ASHA Field App • Toranmal HWC",
    home: "Home", anc: "Maternal", cbac: "NCD Screen",
    incentives: "Incentives", patients: "Patients", profile: "Profile",
    totalEarned: "Total Earned", offline: "Offline Ready",
    evaluate: "Evaluate CDSS Triage →",
    voicePrompt: "🎙️ Voice Assistant — speak to autofill...",
    submit: "Submit",
  },
};

const SYMPTOM_LIST = [
  "डोकेदुखी / Severe Headache", "अंधुक दिसणे / Blurred Vision",
  "पाय सुजणे / Leg Oedema", "ओटीपोटात वेदना / Abdominal Pain",
  "रक्तस्राव / Vaginal Bleeding", "आकडी / Convulsions",
  "श्वास लागणे / Breathlessness", "अशक्तपणा / Weakness/Fatigue",
  "ताप / Fever >38°C", "उलटी / Persistent Vomiting",
];

const CBAC_QUESTIONS = [
  { q: "तुम्ही धूम्रपान/तंबाखू वापरता का? (Smoke/Tobacco?)", risk: "Tobacco Use", score: 2 },
  { q: "तुम्ही दारू पिता का? (Consume alcohol?)", risk: "Alcohol", score: 1 },
  { q: "कुटुंबात कर्करोग/मधुमेह आहे का? (Family history cancer/DM?)", risk: "Family History", score: 2 },
  { q: "२ आठवड्यांपेक्षा जास्त खोकला? (Cough >2 weeks?)", risk: "Chronic Cough", score: 2 },
  { q: "तोंडात घाव आहेत का? (Oral ulcers/patches?)", risk: "Oral Lesions", score: 3 },
  { q: "वारंवार लघवी होते का? (Frequent urination?)", risk: "Polyuria", score: 2 },
  { q: "वजन अचानक कमी झाले? (Sudden weight loss?)", risk: "Weight Loss", score: 2 },
  { q: "१०+ वर्षांपासून उच्चरक्तदाब? (HTN >10 years?)", risk: "Chronic HTN", score: 2 },
];

interface Patient {
  id: string; name: string; age: number; gender: "F" | "M";
  village: string; abhaId: string; lastVisit: string;
  isHrp: boolean; isSickleCell: boolean; gestWeeks?: number;
  vitals?: VitalsInput; phone?: string;
}

const PATIENTS: Patient[] = [
  { id: "P001", name: "सुनीता रमेश पाडवी", age: 28, gender: "F", village: "तोरणमाळ", abhaId: "91-4521-8890-1123", lastVisit: "30 Aug 2026", isHrp: true, isSickleCell: true, gestWeeks: 32, vitals: { systolicBp: 165, diastolicBp: 105, hemoglobinGPerDl: 8.2, fetalHeartRateBpm: 142, spo2Percent: 96 }, phone: "9876543210" },
  { id: "P002", name: "रुक्मिणी गावित", age: 24, gender: "F", village: "धडगाव", abhaId: "91-8899-2233-4455", lastVisit: "25 Aug 2026", isHrp: false, isSickleCell: false, gestWeeks: 20, vitals: { systolicBp: 118, diastolicBp: 76, hemoglobinGPerDl: 10.5, fetalHeartRateBpm: 138, spo2Percent: 99 }, phone: "9765432109" },
  { id: "P003", name: "मीना भगत", age: 34, gender: "F", village: "दहाणू SC", abhaId: "91-3312-6677-9900", lastVisit: "20 Aug 2026", isHrp: true, isSickleCell: false, gestWeeks: 28, vitals: { systolicBp: 140, diastolicBp: 92, hemoglobinGPerDl: 9.8, fetalHeartRateBpm: 135, spo2Percent: 97 }, phone: "9654321098" },
  { id: "P004", name: "कमल राठोड", age: 52, gender: "M", village: "तोरणमाळ", abhaId: "91-7788-9900-3344", lastVisit: "15 Aug 2026", isHrp: false, isSickleCell: false, vitals: { systolicBp: 148, diastolicBp: 94, randomBloodSugarMgDl: 178, spo2Percent: 97 }, phone: "9543210987" },
  { id: "P005", name: "गीता वसावे", age: 19, gender: "F", village: "कोसमाडी", abhaId: "91-1122-3344-5566", lastVisit: "10 Aug 2026", isHrp: false, isSickleCell: true, gestWeeks: 10, vitals: { systolicBp: 110, diastolicBp: 72, hemoglobinGPerDl: 11.2, fetalHeartRateBpm: 145, spo2Percent: 98 }, phone: "9432109876" },
];

const INITIAL_VOUCHERS = [
  { id: "MH-NDB-2026-0089", activity: "High-Risk Pregnancy Early Detection", patient: "Sunita Padvi", amount: 250, status: "APPROVED_BY_MO", statusColor: T.success, date: "30 Aug" },
  { id: "MH-NDB-2026-0045", activity: "JSY Institutional Delivery Accompany", patient: "Rukmini Gavit", amount: 300, status: "DISBURSED (PFMS)", statusColor: T.primary, date: "25 Aug" },
  { id: "MH-NDB-2026-0032", activity: "CBAC NCD Screening — 5 Patients", patient: "Village Cluster 3", amount: 50, status: "DISBURSED (PFMS)", statusColor: T.primary, date: "20 Aug" },
  { id: "MH-NDB-2026-0011", activity: "PMMVY 1st Installment Facilitation", patient: "Meena Bhagat", amount: 150, status: "PENDING_VERIFICATION", statusColor: T.warning, date: "15 Aug" },
];

const TASKS_INITIAL = [
  { id: 1, icon: "🤰", task: "सुनीता पाडवी — ANC 3rd Visit", due: "९:३०", done: true, priority: "HIGH" },
  { id: 2, icon: "💉", task: "रुक्मिणी गावित — Fe-IFA वितरण", due: "११:००", done: false, priority: "HIGH" },
  { id: 3, icon: "📋", task: "ग्राम क्लस्टर ३ — CBAC स्क्रीनिंग", due: "दुपारी", done: false, priority: "MED" },
  { id: 4, icon: "🏥", task: "PHC साप्ताहिक रिपोर्ट", due: "संध्याकाळी", done: false, priority: "LOW" },
  { id: 5, icon: "💊", task: "गीता वसावे — IFA सप्लीमेंट", due: "दुपारी", done: false, priority: "MED" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.hairline}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", readOnly = false }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: T.inkMuted, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder} readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        style={{ height: 44, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "0 14px", fontSize: 14, color: T.ink, background: readOnly ? T.surface : T.card, fontFamily: "inherit", outline: "none", width: "100%" }}
      />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", full = false, small = false, style = {} }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "danger" | "secondary" | "ghost" | "success";
  full?: boolean; small?: boolean; style?: React.CSSProperties;
}) {
  const bg: Record<string, string> = {
    primary: T.primary, danger: T.danger, secondary: T.card, ghost: "transparent", success: T.success,
  };
  const color: Record<string, string> = {
    primary: "#fff", danger: "#fff", secondary: T.ink, ghost: T.inkMuted, success: "#fff",
  };
  return (
    <button
      onClick={onClick}
      style={{
        height: small ? 34 : 46,
        padding: small ? "0 14px" : "0 22px",
        background: bg[variant],
        color: color[variant],
        border: variant === "secondary" ? `1.5px solid ${T.border}` : "none",
        borderRadius: 50,
        fontFamily: "inherit",
        fontWeight: 700,
        fontSize: small ? 13 : 14.5,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        width: full ? "100%" : "auto",
        transition: "opacity 0.18s, transform 0.1s",
        boxShadow: variant === "primary" ? "0 3px 12px rgba(69,107,77,0.25)" : variant === "danger" ? "0 3px 12px rgba(200,55,45,0.25)" : "none",
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function Badge({ text, color = T.primary, bg = T.primaryLight }: { text: string; color?: string; bg?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, background: bg, color, border: `1px solid ${color}25` }}>
      {text}
    </span>
  );
}

function NavTab({ icon, label, active, onClick, badge }: {
  icon: string; label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px 6px", border: "none", background: "transparent", cursor: "pointer", position: "relative", borderTop: active ? `2.5px solid ${T.primary}` : "2.5px solid transparent", transition: "border-color 150ms ease" }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? T.primary : T.inkMuted, fontFamily: "inherit" }}>{label}</span>
      {badge ? (
        <span style={{ position: "absolute", top: 4, right: "calc(50% - 18px)", background: T.danger, color: "#fff", borderRadius: 50, fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{badge}</span>
      ) : null}
    </button>
  );
}

function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>{title}</div>
      {action && <button onClick={onAction} style={{ fontSize: 12, color: T.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>{action}</button>}
    </div>
  );
}

// Triage tier config
const TIER: Record<string, { bg: string; border: string; icon: string; label: string; color: string }> = {
  EMERGENCY_RED: { bg: "#FDF2F2", border: T.danger, icon: "🚨", label: "EMERGENCY RED", color: T.danger },
  URGENT_AMBER:  { bg: "#FFFBEB", border: T.warning, icon: "⚠️", label: "URGENT AMBER", color: T.warning },
  WATCH_YELLOW:  { bg: "#FEFCE8", border: "#7C7C18", icon: "👁️", label: "WATCH YELLOW", color: "#7C7C18" },
  ROUTINE_GREEN: { bg: T.primaryLighter, border: T.primary, icon: "✅", label: "ROUTINE GREEN", color: T.primaryDark },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: T.card, borderRadius: "20px 20px 0 0", padding: "0 0 32px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 16px", borderBottom: `1px solid ${T.hairline}`, position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{title}</div>
          <button onClick={onClose} style={{ background: T.surface, border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ earnedInr, vouchers, tasks, setTasks, setTab, lang }: {
  earnedInr: number; vouchers: any[]; tasks: typeof TASKS_INITIAL;
  setTasks: (t: typeof TASKS_INITIAL) => void; setTab: (t: Tab) => void; lang: Lang;
}) {
  const pending = tasks.filter(t => !t.done).length;
  const t = I18N[lang];

  const toggleTask = (id: number) => {
    setTasks(tasks.map(tk => tk.id === id ? { ...tk, done: !tk.done } : tk));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ASHA Profile Card */}
      <Card>
        <div style={{ background: `linear-gradient(135deg, ${T.primaryDark} 0%, ${T.primary} 100%)`, padding: "20px 18px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 800 }}>क</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>कविता पाडवी</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>ASHA ID: MH-NDB-ASHA-00441</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>तोरणमाळ HWC • नंदुरबार</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 0.5 }}>{t.totalEarned}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>₹{earnedInr.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Sep 2026</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 18px", background: T.primaryLight, display: "flex", gap: 8 }}>
          {[
            { v: PATIENTS.filter(p => p.isHrp).length.toString(), l: "HRP रुग्ण" },
            { v: vouchers.length.toString(), l: "व्हाउचर" },
            { v: pending.toString(), l: "प्रलंबित" },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, background: T.hairline }} />}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.primaryDark }}>{s.v}</div>
                <div style={{ fontSize: 10, color: T.inkMuted }}>{s.l}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Voice Assistant */}
      <button
        onClick={() => alert("🎙️ मराठी / गोंडी आवाज ओळख सक्रिय!\n\nबोला: \"सुनीता पाडवी यांचे बीपी एकशे पासष्ट बाय एकशे पाच\"\n\nनोंद आपोआप भरली जाईल.")}
        style={{ border: `2px dashed ${T.primary}`, borderRadius: 14, background: T.primaryLighter, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "inherit" }}
      >
        <div style={{ fontSize: 30 }}>🎙️</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.primaryDark }}>{t.voicePrompt}</div>
          <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>मराठी • गोंडी • English supported</div>
        </div>
      </button>

      {/* Quick Actions */}
      <div>
        <SectionHead title="⚡ Quick Actions" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "🤰", title: "ANC तपासणी", sub: "HRP Screening", tab: "ANC" as Tab, bg: T.infoBg, color: T.info },
            { icon: "🧪", title: "CBAC NCD", sub: "NCD Screening", tab: "CBAC" as Tab, bg: T.primaryLighter, color: T.primaryDark },
            { icon: "👥", title: "माझे रुग्ण", sub: "Patient List", tab: "PATIENTS" as Tab, bg: T.successBg, color: T.success },
            { icon: "🚑", title: "Emergency 108", sub: "Ambulance", tab: null as any, bg: T.dangerBg, color: T.danger },
          ].map((a, i) => (
            <button key={i}
              onClick={() => a.tab ? setTab(a.tab) : (window.confirm("108 Ambulance DISHA Emergency को Call करें?") && alert("📞 108 पर कनेक्ट हो रहा है..."))}
              style={{ background: a.bg, border: `1.5px solid ${a.color}20`, borderRadius: 14, padding: "16px 14px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", transition: "transform 0.15s" }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: a.color }}>{a.title}</div>
              <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>{a.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <SectionHead title={`📋 Today's Tasks (${tasks.filter(t => t.done).length}/${tasks.length})`} />
        <Card>
          {tasks.map((item, i) => (
            <div key={item.id}
              onClick={() => toggleTask(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < tasks.length - 1 ? `1px solid ${T.hairline}` : "none", cursor: "pointer", opacity: item.done ? 0.55 : 1, transition: "opacity 0.2s" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.done ? T.primaryLight : T.surface, border: `2px solid ${item.done ? T.primary : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: item.done ? 14 : 16, color: item.done ? T.primary : "inherit", fontWeight: 700, transition: "all 0.2s" }}>
                {item.done ? "✓" : item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, textDecoration: item.done ? "line-through" : "none" }}>{item.task}</div>
                <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 1 }}>
                  ⏰ {item.due}
                  {item.priority === "HIGH" && <span style={{ marginLeft: 6, color: T.danger, fontWeight: 700 }}>HIGH</span>}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Alerts */}
      <div>
        <SectionHead title="🔴 Active Alerts" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { icon: "🐍", msg: "Snakebite monsoon peak alert — तोरणमाळ तालुका", color: T.danger, bg: T.dangerBg },
            { icon: "💊", msg: "ASV stock replenishment pending — PHC तोरणमाळ", color: T.warning, bg: T.warningBg },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: a.bg, border: `1.5px solid ${a.color}40` }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ANC Screening Screen ──────────────────────────────────────────────────────
function AncScreen({ earnedInr, setEarnedInr, addVoucher, lang }: {
  earnedInr: number; setEarnedInr: (v: number) => void;
  addVoucher: (v: any) => void; lang: Lang;
}) {
  const [name, setName] = useState("सुनीता रमेश पाडवी");
  const [abha, setAbha] = useState("91-4521-8890-1123");
  const [age, setAge] = useState("28");
  const [sbp, setSbp] = useState("165");
  const [dbp, setDbp] = useState("105");
  const [hb, setHb] = useState("8.2");
  const [fhr, setFhr] = useState("142");
  const [spo2, setSpo2] = useState("96");
  const [rbs, setRbs] = useState("");
  const [gestWeeks, setGestWeeks] = useState("32");
  const [isPregnant, setIsPregnant] = useState(true);
  const [symptoms, setSymptoms] = useState<string[]>(["डोकेदुखी / Severe Headache", "अंधुक दिसणे / Blurred Vision"]);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [saved, setSaved] = useState(false);
  const t = I18N[lang];

  const toggleSymptom = (s: string) => setSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleEvaluate = useCallback(() => {
    const res = evaluateCdss({
      vitals: {
        systolicBp: parseInt(sbp) || 0, diastolicBp: parseInt(dbp) || 0,
        hemoglobinGPerDl: parseFloat(hb) || 0, fetalHeartRateBpm: parseInt(fhr) || 0,
        spo2Percent: parseInt(spo2) || 0, randomBloodSugarMgDl: parseInt(rbs) || 0,
      },
      symptoms, isPregnant, gestationalWeeks: parseInt(gestWeeks) || 0,
    });
    setResult(res);
  }, [sbp, dbp, hb, fhr, spo2, rbs, symptoms, isPregnant, gestWeeks]);

  const handleSave = () => {
    if (!result) return;
    const incentive = result.ashaIncentiveEligible ? 250 : 0;
    if (incentive > 0) {
      setEarnedInr(earnedInr + incentive);
      addVoucher({ id: `MH-NDB-${Date.now()}`, activity: "ANC HRP Screening (Auto-Claim)", patient: name, amount: incentive, status: "RECORDED", statusColor: T.warning, date: "Today" });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tc = result ? TIER[result.urgencyTier] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>🤰 ANC Danger Sign Assessment</div>

      {/* Patient Details */}
      <Card>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Patient Information</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input label="Patient Name" value={name} onChange={setName} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="ABHA ID" value={abha} onChange={setAbha} />
              <Input label="Age (Years)" value={age} onChange={setAge} type="number" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: T.inkMuted }}>गर्भधारणा (Pregnant)?</label>
              <button
                onClick={() => setIsPregnant(p => !p)}
                style={{ padding: "6px 16px", background: isPregnant ? T.primary : T.surface, color: isPregnant ? "#fff" : T.ink, border: `1.5px solid ${isPregnant ? T.primary : T.border}`, borderRadius: 50, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                {isPregnant ? "✓ होय (Yes)" : "नाही (No)"}
              </button>
              {isPregnant && <Input label="Gestation (Weeks)" value={gestWeeks} onChange={setGestWeeks} type="number" />}
            </div>
          </div>
        </div>
      </Card>

      {/* Vitals */}
      <Card>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>📊 Vitals Recording</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="SBP (mmHg)" value={sbp} onChange={setSbp} type="number" placeholder="120" />
            <Input label="DBP (mmHg)" value={dbp} onChange={setDbp} type="number" placeholder="80" />
            <Input label="Hb (g/dL)" value={hb} onChange={setHb} type="number" placeholder="11" />
            <Input label="FHR (bpm)" value={fhr} onChange={setFhr} type="number" placeholder="140" />
            <Input label="SpO2 (%)" value={spo2} onChange={setSpo2} type="number" placeholder="98" />
            <Input label="RBS (mg/dL)" value={rbs} onChange={setRbs} type="number" placeholder="—" />
          </div>
        </div>
      </Card>

      {/* Symptom Checklist */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>⚠️ Danger Signs Checklist</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {SYMPTOM_LIST.map(s => (
            <button key={s} onClick={() => toggleSymptom(s)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${symptoms.includes(s) ? T.danger : T.border}`, background: symptoms.includes(s) ? T.dangerBg : T.card, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s" }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${symptoms.includes(s) ? T.danger : T.border}`, background: symptoms.includes(s) ? T.danger : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0, transition: "all 0.15s" }}>
                {symptoms.includes(s) ? "✓" : ""}
              </div>
              <span style={{ fontSize: 13.5, color: T.ink }}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Evaluate Button */}
      <Btn full onClick={handleEvaluate}>{t.evaluate}</Btn>

      {/* Triage Result */}
      {result && tc && (
        <div style={{ background: tc.bg, border: `2px solid ${tc.border}`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: tc.border, color: "#fff", borderRadius: 50, padding: "6px 14px" }}>
              <span>{tc.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{tc.label} ({result.urgencyScore}/100)</span>
            </div>
            {result.ashaIncentiveEligible && <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>✓ ₹250 Incentive Eligible</span>}
          </div>

          <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 8 }}>{result.primaryAlert}</div>
          <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6, marginBottom: 12 }}>
            <strong>Recommended Action:</strong> {result.recommendedAction}
          </div>

          {result.redFlags.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: T.inkMuted, marginBottom: 6 }}>Red Flags Detected</div>
              {result.redFlags.map((f, i) => (
                <div key={i} style={{ fontSize: 12.5, color: T.danger, fontWeight: 600, padding: "3px 0" }}>⚡ {f}</div>
              ))}
            </div>
          )}

          {result.cdssRules.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: T.inkMuted, marginBottom: 6 }}>CDSS Protocols</div>
              {result.cdssRules.map((r, i) => (
                <div key={i} style={{ fontSize: 12.5, color: T.inkMuted, padding: "2px 0" }}>→ {r}</div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {result.callAmbulance && (
              <Btn variant="danger" small onClick={() => alert("📞 Connecting to 108 DISHA Emergency Response...\n\nLocation shared: Toranmal HWC, Nandurbar\nPatient: " + name)}>
                🚑 Call 108
              </Btn>
            )}
            <Btn small onClick={() => alert("📹 Video teleconsult request sent to Dr. Anjali Deshmukh (MD OBGYN)\nExpected response: 5-10 minutes")}>
              📹 Video Consult
            </Btn>
            <Btn variant="secondary" small onClick={() => alert("📋 Referral slip generated!\nRef ID: MH-NDB-REF-" + Date.now() + "\nPatient: " + name + "\nSend to: PHC Toranmal")}>
              📋 Referral Slip
            </Btn>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${tc.border}30` }}>
            {saved ? (
              <div style={{ textAlign: "center", color: T.success, fontWeight: 700, fontSize: 14 }}>✓ Saved to Patient Record!</div>
            ) : (
              <Btn full variant="success" onClick={handleSave}>
                💾 Save Record {result.ashaIncentiveEligible ? "+ Claim ₹250 Incentive" : ""}
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CBAC NCD Screening ────────────────────────────────────────────────────────
function CbacScreen({ addVoucher, lang }: { addVoucher: (v: any) => void; lang: Lang }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [answers, setAnswers] = useState<boolean[]>(new Array(CBAC_QUESTIONS.length).fill(false));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const t = I18N[lang];

  const toggle = (i: number) => setAnswers(p => { const a = [...p]; a[i] = !a[i]; return a; });

  const handleSubmit = () => {
    if (!name || !age) { alert("कृपया रुग्णाचे नाव आणि वय भरा."); return; }
    const total = CBAC_QUESTIONS.reduce((s, q, i) => s + (answers[i] ? q.score : 0), 0);
    setScore(total);
    setSubmitted(true);
    addVoucher({ id: `MH-NDB-CBAC-${Date.now()}`, activity: "CBAC NCD Community Screening", patient: name, amount: 10, status: "RECORDED", statusColor: T.warning, date: "Today" });
  };

  const level = score >= 8 ? { label: "उच्च जोखीम — HIGH RISK", color: T.danger, bg: T.dangerBg, action: "PHC रेफरल ताबडतोब आवश्यक" } : score >= 5 ? { label: "मध्यम जोखीम — MODERATE", color: T.warning, bg: T.warningBg, action: "PHC visit within 7 days" } : { label: "सामान्य जोखीम — NORMAL", color: T.primaryDark, bg: T.primaryLighter, action: "Annual screening recommended" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>🧪 CBAC — NCD Community Screening</div>

      <Card>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Patient Details</div>
          <Input label="Patient Name" value={name} onChange={setName} placeholder="रुग्णाचे नाव" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Age" value={age} onChange={setAge} type="number" placeholder="वय" />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.inkMuted, letterSpacing: 0.3, textTransform: "uppercase" }}>Gender</label>
              <div style={{ display: "flex", gap: 6 }}>
                {(["F", "M"] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: `1.5px solid ${gender === g ? T.primary : T.border}`, background: gender === g ? T.primary : T.card, color: gender === g ? "#fff" : T.ink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {g === "F" ? "महिला / F" : "पुरुष / M"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Risk Factor Checklist</div>
      {CBAC_QUESTIONS.map((q, i) => (
        <button key={i} onClick={() => toggle(i)}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px", borderRadius: 12, border: `1.5px solid ${answers[i] ? T.dangerBorder : T.hairline}`, background: answers[i] ? T.dangerBg : T.card, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s", width: "100%" }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${answers[i] ? T.danger : T.border}`, background: answers[i] ? T.danger : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
            {answers[i] ? "✓" : ""}
          </div>
          <div>
            <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.4 }}>{q.q}</div>
            <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>Risk Score: +{q.score} pts</div>
          </div>
        </button>
      ))}

      {!submitted ? (
        <Btn full onClick={handleSubmit}>CBAC Score काढा व PHC ला पाठवा →</Btn>
      ) : (
        <div style={{ background: level.bg, border: `2px solid ${level.color}`, borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: level.color, marginBottom: 8 }}>{level.label}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, marginBottom: 6 }}>Score: {score}/{CBAC_QUESTIONS.reduce((s, q) => s + q.score, 0)}</div>
          <div style={{ fontSize: 13.5, color: T.ink, marginBottom: 12 }}>
            <strong>Action Required:</strong> {level.action}
          </div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 14 }}>
            ✓ Patient: {name} ({age}y {gender}) — CBAC Record Saved
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn small variant={score >= 8 ? "danger" : "primary"} onClick={() => alert(`PHC Referral generated for ${name}\nRef: MH-NDB-CBAC-REF-${Date.now()}`)}>
              {score >= 8 ? "🚨 Emergency Referral" : "📋 PHC Referral"}
            </Btn>
            <Btn small variant="secondary" onClick={() => { setSubmitted(false); setAnswers(new Array(CBAC_QUESTIONS.length).fill(false)); setName(""); setAge(""); }}>
              + New Screening
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Patients Screen ───────────────────────────────────────────────────────────
function PatientsScreen({ setTab }: { setTab: (t: Tab) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.village.toLowerCase().includes(search.toLowerCase()) ||
    p.abhaId.includes(search)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>👥 माझे रुग्ण — My Patients</div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "0 14px", height: 46 }}>
        <span style={{ fontSize: 18 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, village, ABHA ID..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", background: "transparent", color: T.ink }} />
      </div>

      {/* Patient Cards */}
      {filtered.map(p => (
        <Card key={p.id} style={{ cursor: "pointer" }}>
          <div onClick={() => { setSelected(p); setShowModal(true); }}
            style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: p.isHrp ? T.dangerBg : T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: p.isHrp ? T.danger : T.primaryDark, flexShrink: 0 }}>
                {p.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: T.inkMuted }}>{p.age}y {p.gender === "F" ? "Female" : "Male"} • {p.village}</div>
                <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 1 }}>ABHA: {p.abhaId}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              {p.isHrp && <Badge text="HRP" color={T.danger} bg={T.dangerBg} />}
              {p.isSickleCell && <Badge text="SC Trait" color="#7C3AED" bg="#F5F3FF" />}
              {p.gestWeeks && <div style={{ fontSize: 11, color: T.inkMuted }}>{p.gestWeeks}w</div>}
            </div>
          </div>
          {/* Vitals strip */}
          {p.vitals && (
            <div style={{ display: "flex", gap: 6, padding: "8px 16px 12px", flexWrap: "wrap" }}>
              {p.vitals.systolicBp && <span style={{ fontSize: 11.5, background: (p.vitals.systolicBp ?? 0) > 140 ? T.dangerBg : T.surface, color: (p.vitals.systolicBp ?? 0) > 140 ? T.danger : T.inkMuted, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>BP {p.vitals.systolicBp}/{p.vitals.diastolicBp}</span>}
              {p.vitals.hemoglobinGPerDl && <span style={{ fontSize: 11.5, background: (p.vitals.hemoglobinGPerDl ?? 12) < 10 ? T.warningBg : T.surface, color: (p.vitals.hemoglobinGPerDl ?? 12) < 10 ? T.warning : T.inkMuted, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>Hb {p.vitals.hemoglobinGPerDl}</span>}
              {p.vitals.spo2Percent && <span style={{ fontSize: 11.5, background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "3px 8px", color: T.inkMuted, fontWeight: 600 }}>SpO2 {p.vitals.spo2Percent}%</span>}
            </div>
          )}
        </Card>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.inkMuted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div style={{ fontWeight: 600 }}>No patients found</div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {showModal && selected && (
        <Modal title={selected.name} onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.isHrp && <Badge text="High Risk Pregnancy" color={T.danger} bg={T.dangerBg} />}
              {selected.isSickleCell && <Badge text="Sickle Cell Trait" color="#7C3AED" bg="#F5F3FF" />}
              {selected.gestWeeks && <Badge text={`${selected.gestWeeks} Weeks Gestation`} color={T.primary} bg={T.primaryLight} />}
            </div>
            {[
              { label: "ABHA ID", value: selected.abhaId },
              { label: "Village", value: selected.village },
              { label: "Last Visit", value: selected.lastVisit },
              { label: "Phone", value: selected.phone || "—" },
              { label: "Blood Pressure", value: selected.vitals?.systolicBp ? `${selected.vitals.systolicBp}/${selected.vitals.diastolicBp} mmHg` : "—" },
              { label: "Haemoglobin", value: selected.vitals?.hemoglobinGPerDl ? `${selected.vitals.hemoglobinGPerDl} g/dL` : "—" },
              { label: "SpO2", value: selected.vitals?.spo2Percent ? `${selected.vitals.spo2Percent}%` : "—" },
              { label: "Foetal HR", value: selected.vitals?.fetalHeartRateBpm ? `${selected.vitals.fetalHeartRateBpm} bpm` : "—" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.hairline}` }}>
                <span style={{ fontSize: 13, color: T.inkMuted }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Btn full onClick={() => { setShowModal(false); setTab("ANC"); }}>📋 New ANC Screening</Btn>
              <Btn full variant="secondary" onClick={() => alert(`📞 Calling ${selected.phone || "N/A"}...`)}>📞 Call Patient</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Incentives Screen ─────────────────────────────────────────────────────────
function IncentivesScreen({ earnedInr, vouchers, lang }: { earnedInr: number; vouchers: any[]; lang: Lang }) {
  const t = I18N[lang];
  const disbursed = vouchers.filter(v => v.status.includes("DISBURSED")).reduce((s, v) => s + v.amount, 0);
  const pending = vouchers.filter(v => !v.status.includes("DISBURSED")).reduce((s, v) => s + v.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Balance Card */}
      <div style={{ background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`, borderRadius: 18, padding: "22px 20px 20px", color: "#fff" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.75, marginBottom: 4 }}>NHM {t.totalEarned} — Sep 2026</div>
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>₹{earnedInr.toLocaleString()}</div>
        <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 6 }}>PFMS DBT → SBIN0014299 ••••1234</div>
        <div style={{ display: "flex", gap: 0, marginTop: 16, background: "rgba(0,0,0,0.15)", borderRadius: 12, overflow: "hidden" }}>
          {[
            { label: "Disbursed", value: `₹${disbursed}` },
            { label: "Pending", value: `₹${pending}` },
            { label: "Vouchers", value: vouchers.length.toString() },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div>
        <SectionHead title="📊 Incentive Breakdown" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "HRP Identification", amount: 250, count: 3, color: T.danger },
            { label: "ANC Facilitation", amount: 50, count: 8, color: T.primary },
            { label: "JSY Delivery", amount: 300, count: 1, color: T.success },
            { label: "CBAC Screening", amount: 10, count: 5, color: T.info },
          ].map((a, i) => (
            <div key={i} style={{ background: T.card, borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.hairline}` }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{a.label}</div>
                <div style={{ fontSize: 11.5, color: T.inkMuted }}>{a.count} activities × ₹{a.amount}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: a.color }}>₹{a.amount * a.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voucher List */}
      <div>
        <SectionHead title="🧾 Claim Vouchers" />
        {vouchers.map((v, i) => (
          <Card key={i} style={{ marginBottom: 10 }}>
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, lineHeight: 1.3 }}>{v.activity}</div>
                <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 3 }}>👤 {v.patient} • {v.date}</div>
                <div style={{ fontSize: 10.5, color: T.primary, fontWeight: 700, marginTop: 2 }}>ID: {v.id}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: T.primaryDark }}>+₹{v.amount}</div>
                <div style={{ background: `${v.statusColor}18`, color: v.statusColor, borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700, marginTop: 4, border: `1px solid ${v.statusColor}30`, whiteSpace: "nowrap" }}>
                  {v.status}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [village, setVillage] = useState("तोरणमाळ, धडगाव तालुका");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Profile Hero */}
      <div style={{ background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`, borderRadius: 18, padding: "24px 20px 20px", textAlign: "center", color: "#fff" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 32, fontWeight: 800 }}>क</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>कविता पाडवी</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>ASHA स्वयंसेविका • MH-NDB-ASHA-00441</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{village} • नंदुरबार</div>
      </div>

      {/* Language Selector */}
      <Card>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>🌐 Language / भाषा</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["mr", "gondi", "en"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ flex: 1, height: 40, borderRadius: 10, border: `1.5px solid ${lang === l ? T.primary : T.border}`, background: lang === l ? T.primary : T.card, color: lang === l ? "#fff" : T.ink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              >
                {l === "mr" ? "मराठी" : l === "gondi" ? "गोंडी" : "English"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Profile Information</div>
            <button onClick={() => setEditMode(e => !e)} style={{ fontSize: 12, color: T.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {editMode ? "💾 Save" : "✏️ Edit"}
            </button>
          </div>
          {editMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Input label="Mobile Number" value={phone} onChange={setPhone} type="tel" />
              <Input label="Village / Gram Panchayat" value={village} onChange={setVillage} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "ASHA ID", value: "MH-NDB-ASHA-00441" },
                { label: "ABHA ID", value: "91-4521-0088-7744" },
                { label: "Mobile", value: phone },
                { label: "Village", value: village },
                { label: "Block PHC", value: "PHC Toranmal" },
                { label: "Bank (PFMS)", value: "SBIN0014299 ••••1234" },
                { label: "Training Status", value: "✓ ASHA Training 2025" },
                { label: "App Version", value: "v2.5.0 (Offline-First)" },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.hairline}` : "none" }}>
                  <span style={{ fontSize: 13.5, color: T.inkMuted }}>{r.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn full variant="secondary" onClick={() => alert("📞 Calling PHC Toranmal MO...\nDr. Anjali Deshmukh: +91 99887 76655")}>📞 Contact PHC Officer</Btn>
        <Btn full variant="secondary" onClick={() => alert("📥 Downloading offline data for next 7 days...")}>📥 Sync Offline Data</Btn>
        <Btn full variant="danger" onClick={() => { if (window.confirm("Confirm logout?")) alert("Logged out."); }}>🔒 Logout</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [lang, setLang]         = useState<Lang>("mr");
  const [tab, setTab]           = useState<Tab>("HOME");
  const [earnedInr, setEarnedInr] = useState(1450);
  const [vouchers, setVouchers] = useState<any[]>(INITIAL_VOUCHERS);
  const [tasks, setTasks]       = useState(TASKS_INITIAL);
  const [isOffline, setIsOffline] = useState(false);

  const t = I18N[lang];

  useEffect(() => {
    const onOff = () => setIsOffline(true);
    const onOn  = () => setIsOffline(false);
    window.addEventListener("offline", onOff);
    window.addEventListener("online",  onOn);
    return () => { window.removeEventListener("offline", onOff); window.removeEventListener("online", onOn); };
  }, []);

  const addVoucher = useCallback((v: any) => setVouchers(p => [v, ...p]), []);

  const pending = tasks.filter(t => !t.done).length;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: T.surface, display: "flex", flexDirection: "column", fontFamily: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif", position: "relative" }}>

      {/* ── Header ── */}
      <header style={{ background: `linear-gradient(135deg, ${T.primaryDark} 0%, ${T.primary} 100%)`, padding: "13px 16px 11px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 10px rgba(69,107,77,0.3)" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{t.appName}</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.72)", marginTop: 1 }}>{t.appSub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: isOffline ? "rgba(200,55,45,0.85)" : "rgba(255,255,255,0.18)", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: isOffline ? "#fff" : "#4ADE80", display: "inline-block" }} />
            {isOffline ? "Offline" : t.offline}
          </div>
          <select value={lang} onChange={e => setLang(e.target.value as Lang)}
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 20, padding: "4px 8px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "inherit" }}
          >
            <option value="mr" style={{ color: T.ink, background: T.card }}>मराठी</option>
            <option value="gondi" style={{ color: T.ink, background: T.card }}>गोंडी</option>
            <option value="en" style={{ color: T.ink, background: T.card }}>EN</option>
          </select>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "14px 13px 80px", WebkitOverflowScrolling: "touch" as any }}>
        {tab === "HOME"       && <HomeScreen earnedInr={earnedInr} vouchers={vouchers} tasks={tasks} setTasks={setTasks} setTab={setTab} lang={lang} />}
        {tab === "ANC"        && <AncScreen earnedInr={earnedInr} setEarnedInr={setEarnedInr} addVoucher={addVoucher} lang={lang} />}
        {tab === "CBAC"       && <CbacScreen addVoucher={addVoucher} lang={lang} />}
        {tab === "PATIENTS"   && <PatientsScreen setTab={setTab} />}
        {tab === "INCENTIVES" && <IncentivesScreen earnedInr={earnedInr} vouchers={vouchers} lang={lang} />}
        {tab === "PROFILE"    && <ProfileScreen lang={lang} setLang={setLang} />}
      </main>

      {/* ── Bottom Nav ── */}
      <nav style={{ display: "flex", borderTop: `1px solid ${T.hairline}`, background: T.card, position: "sticky", bottom: 0, zIndex: 50, boxShadow: "0 -2px 14px rgba(0,0,0,0.07)" }}>
        <NavTab icon="🏠" label={t.home}       active={tab === "HOME"}       onClick={() => setTab("HOME")} />
        <NavTab icon="🤰" label={t.anc}        active={tab === "ANC"}        onClick={() => setTab("ANC")} />
        <NavTab icon="🧪" label={t.cbac}       active={tab === "CBAC"}       onClick={() => setTab("CBAC")} />
        <NavTab icon="👥" label={t.patients}   active={tab === "PATIENTS"}   onClick={() => setTab("PATIENTS")} badge={PATIENTS.filter(p => p.isHrp).length} />
        <NavTab icon="💰" label={t.incentives} active={tab === "INCENTIVES"} onClick={() => setTab("INCENTIVES")} />
        <NavTab icon="👤" label={t.profile}    active={tab === "PROFILE"}    onClick={() => setTab("PROFILE")} />
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: ${T.surface}; }
        input, select, button { font-family: 'Hanken Grotesk', -apple-system, sans-serif; }
        input { -webkit-appearance: none; appearance: none; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
