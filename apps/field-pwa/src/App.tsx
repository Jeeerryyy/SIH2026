import React, { useState, useEffect } from "react";
import { TriageUrgencyTier, AshaIncentiveType, AshaIncentiveStatus } from "@arogyasetu/shared-types";
import { CdssEngine } from "@arogyasetu/triage-engine";

// ─────────────────────────────────────────────────────────────────────────────
// Inline Styles — PWA Design Tokens (Hireavilla Sage Mobile)
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  primary:       "#75A68C",
  primaryDark:   "#456B4D",
  primaryLight:  "#E3EDE8",
  primaryLighter:"#F0F6F3",
  danger:        "#C8372D",
  dangerBg:      "#FDF2F2",
  dangerBorder:  "#F5C2C0",
  warning:       "#D97706",
  warningBg:     "#FFFBEB",
  warningBorder: "#FDE68A",
  success:       "#16A34A",
  successBg:     "#F0FDF4",
  ink:           "#1A1A1A",
  inkMuted:      "#737373",
  inkFaint:      "#A3A3A3",
  surface:       "#F8FAF9",
  card:          "#FFFFFF",
  hairline:      "#E5EDE9",
  border:        "#D0DDD8",
};

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_VOUCHERS = [
  { id: "MH-NDB-2026-0089", activity: "High-Risk Pregnancy Early Detection (HRP)", patient: "Sunita Padvi",   amount: 250, status: "APPROVED_BY_MO", statusColor: T.success,   date: "30 Aug 2026" },
  { id: "MH-NDB-2026-0045", activity: "JSY Institutional Delivery Accompaniment",  patient: "Rukmini Gavit", amount: 300, status: "DISBURSED (PFMS)",statusColor: T.primary,   date: "25 Aug 2026" },
  { id: "MH-NDB-2026-0032", activity: "CBAC NCD Community Screening (5 Patients)", patient: "Village Cluster 3", amount: 50,  status: "DISBURSED (PFMS)", statusColor: T.primary, date: "20 Aug 2026" },
];

const SYMPTOMS_LIST = [
  "डोकेदुखी (Severe Headache)",
  "अंधुक दिसणे (Blurred Vision)",
  "पाय सुजणे (Leg Oedema)",
  "ओटीपोटात वेदना (Abdominal Pain)",
  "रक्तस्राव (Vaginal Bleeding)",
  "घाम येणे / अशक्तपणा (Weakness)",
];

const CBAC_QUESTIONS = [
  { q: "आपल्याला धूम्रपानाची सवय आहे का? (Do you smoke/use tobacco?)", field: "tobacco" },
  { q: "आपण दारू पिता का? (Do you consume alcohol?)", field: "alcohol" },
  { q: "तुमच्या कुटुंबात कर्करोग / मधुमेह आहे का? (Family history of cancer/DM?)", field: "familyHistory" },
  { q: "तुम्हाला वारंवार खोकला येतो का? (Frequent cough for >2 weeks?)", field: "cough" },
];

type Lang = "mr" | "gondi" | "en";
type Tab  = "HOME" | "ANC" | "CBAC" | "INCENTIVES" | "PROFILE";

const I18N: Record<Lang, Record<string, string>> = {
  mr: {
    appName:    "आरोग्यसेतू ब्रिज",
    appSub:     "आशा / एएनएम फील्ड ॲप • तोरणमाळ उपकेंद्र",
    home:       "मुख्य",
    anc:        "मातृ सुरक्षा",
    cbac:       "NCD तपासणी",
    incentives: "मानधन",
    profile:    "माझे",
    totalEarned:"एकूण मानधन",
    offline:    "ऑफलाइन तयार",
    evaluate:   "४-स्तरीय ट्रायज तपासा →",
    voicePrompt:"🎙️ आवाज सहाय्यक — बोला व नोंदी थेट भरा...",
  },
  gondi: {
    appName:    "आरोग्यसेतू गोंडी",
    appSub:     "ASHA / ANM Field App • Toranmal SC",
    home:       "होम",
    anc:        "माता ANC",
    cbac:       "CBAC",
    incentives: "मानधन",
    profile:    "प्रोफाइल",
    totalEarned:"मानधन",
    offline:    "ऑफलाइन",
    evaluate:   "ट्रायज तपासा →",
    voicePrompt:"🎙️ आवाज सहाय्यक...",
  },
  en: {
    appName:    "ArogyaSetu Bridge",
    appSub:     "ASHA / ANM Field App • Toranmal SC",
    home:       "Home",
    anc:        "Maternal",
    cbac:       "NCD Screen",
    incentives: "Incentives",
    profile:    "Profile",
    totalEarned:"Total Earned",
    offline:    "Offline Ready",
    evaluate:   "Evaluate 4-Tier Triage →",
    voicePrompt:"🎙️ Voice Assistant — speak to autofill...",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Mini components
// ─────────────────────────────────────────────────────────────────────────────
function NavTab({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "8px 4px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        borderTop: active ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
        transition: "border-color 180ms ease",
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? T.primary : T.inkMuted, fontFamily: "inherit" }}>
        {label}
      </span>
    </button>
  );
}

function FieldInput({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: T.inkMuted, letterSpacing: 0.3 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          height: 44,
          border: `1.5px solid ${T.border}`,
          borderRadius: 10,
          padding: "0 14px",
          fontSize: 15,
          color: T.ink,
          background: T.card,
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
          WebkitAppearance: "none",
        }}
      />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 14, letterSpacing: -0.3 }}>
      {title}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.hairline}`,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang]   = useState<Lang>("mr");
  const [tab, setTab]     = useState<Tab>("HOME");

  // ANC Form
  const [patientName, setPatientName] = useState("सुनीता रमेश पाडवी");
  const [sbp,  setSbp]  = useState("165");
  const [dbp,  setDbp]  = useState("105");
  const [hb,   setHb]   = useState("8.2");
  const [fhr,  setFhr]  = useState("142");
  const [gestWeeks, setGestWeeks] = useState("32");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["डोकेदुखी (Severe Headache)", "अंधुक दिसणे (Blurred Vision)"]);
  const [triageResult, setTriageResult] = useState<any>(null);

  // CBAC
  const [cbacAnswers, setCbacAnswers] = useState<Record<string, boolean>>({});

  // Incentives
  const [earnedInr, setEarnedInr]         = useState(1450);
  const [vouchers,  setVouchers]           = useState(INITIAL_VOUCHERS);
  const [isOffline, setIsOffline]          = useState(false);

  const t = I18N[lang];

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline  = () => setIsOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online",  onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online",  onOnline);
    };
  }, []);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleEvaluate = () => {
    const result = CdssEngine.evaluate({
      patient:  { fullName: patientName, gender: "FEMALE" },
      vitals:   {
        systolicBp:       parseInt(sbp)       || 120,
        diastolicBp:      parseInt(dbp)       || 80,
        hemoglobinGPerDl: parseFloat(hb)      || 11.0,
        fetalHeartRateBpm:parseInt(fhr)       || 140,
      },
      symptoms: selectedSymptoms,
      isPregnant:       true,
      gestationalWeeks: parseInt(gestWeeks) || 32,
    });

    setTriageResult(result);
    setEarnedInr(prev => prev + 250);
    setVouchers(prev => [{
      id:          `MH-NDB-2026-${Math.floor(Math.random() * 8999 + 1000)}`,
      activity:    "High-Risk Pregnancy Identification (Auto-Claim)",
      patient:     patientName,
      amount:      250,
      status:      "RECORDED",
      statusColor: T.warning,
      date:        "आज (Today)",
    }, ...prev]);
  };

  // Triage visual config
  const tierConfig: Record<string, { bg: string; border: string; label: string; color: string }> = {
    EMERGENCY_RED:  { bg: T.dangerBg,  border: T.danger,  label: "🚨 EMERGENCY RED",  color: T.danger },
    URGENT_AMBER:   { bg: T.warningBg, border: T.warning, label: "⚠️ URGENT AMBER",   color: T.warning },
    WATCH_YELLOW:   { bg: "#FEFCE8",   border: "#7C7C18", label: "👁 WATCH YELLOW",    color: "#7C7C18" },
    ROUTINE_GREEN:  { bg: T.primaryLight, border: T.primary, label: "✅ ROUTINE GREEN", color: T.primaryDark },
  };

  const tc = triageResult ? (tierConfig[triageResult.urgencyTier] || tierConfig.ROUTINE_GREEN) : null;

  return (
    <div style={{
      maxWidth: 430,
      margin: "0 auto",
      minHeight: "100dvh",
      background: T.surface,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
    }}>

      {/* ── App Header ── */}
      <header style={{
        background: `linear-gradient(135deg, ${T.primaryDark} 0%, ${T.primary} 100%)`,
        padding: "14px 18px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 8px rgba(69,107,77,0.3)",
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", letterSpacing: -0.3 }}>
            {t.appName}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
            {t.appSub}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Offline badge */}
          <div style={{
            background: isOffline ? "rgba(200,55,45,0.9)" : "rgba(255,255,255,0.18)",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 10.5,
            fontWeight: 700,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: isOffline ? "#fff" : "#4ADE80", display: "inline-block" }} />
            {isOffline ? "Offline" : t.offline}
          </div>

          {/* Language picker */}
          <select
            value={lang}
            onChange={e => setLang(e.target.value as Lang)}
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              borderRadius: 20,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="mr" style={{ color: T.ink, background: T.card }}>मराठी</option>
            <option value="gondi" style={{ color: T.ink, background: T.card }}>गोंडी</option>
            <option value="en" style={{ color: T.ink, background: T.card }}>English</option>
          </select>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px 14px 80px", WebkitOverflowScrolling: "touch" as any }}>

        {/* ══ HOME ══ */}
        {tab === "HOME" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ASHA Profile Card */}
            <Card>
              <div style={{ background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`, padding: "18px 18px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff" }}>
                      क
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>कविता पाडवी</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>ASHA ID: MH-NDB-ASHA-00441</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>तोरणमाळ, धडगाव • नंदुरबार</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 0.5 }}>{t.totalEarned}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1 }}>₹{earnedInr.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>सप्टेंबर 2026</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 18px", display: "flex", gap: 8, background: T.primaryLight }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.primaryDark }}>12</div>
                  <div style={{ fontSize: 10, color: T.inkMuted }}>HRP मरीज</div>
                </div>
                <div style={{ width: 1, background: T.hairline }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.primaryDark }}>8</div>
                  <div style={{ fontSize: 10, color: T.inkMuted }}>CBAC तपासणी</div>
                </div>
                <div style={{ width: 1, background: T.hairline }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.primaryDark }}>3</div>
                  <div style={{ fontSize: 10, color: T.inkMuted }}>प्रलंबित व्हाउचर</div>
                </div>
              </div>
            </Card>

            {/* Voice Assistant */}
            <button
              onClick={() => alert("मराठी / गोंडी आवाज ओळख सक्रिय: \"सुनीता पाडवी यांचे बीपी १६५/१०५ नोंदवले.\"")}
              style={{
                border: `2px dashed ${T.primary}`,
                borderRadius: 14,
                background: T.primaryLighter,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: 28 }}>🎙️</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.primaryDark }}>{t.voicePrompt}</div>
                <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>मराठी • गोंडी • English — supported</div>
              </div>
            </button>

            {/* Quick Actions */}
            <div>
              <SectionHeader title="त्वरित कृती (Quick Actions)" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "🤰", title: "ANC तपासणी", sub: "HRP स्क्रीनिंग", tab: "ANC" as Tab, bg: "#EFF6FF", color: "#2563EB" },
                  { icon: "🧪", title: "CBAC NCD", sub: "समुदाय तपासणी", tab: "CBAC" as Tab, bg: T.primaryLighter, color: T.primaryDark },
                  { icon: "💰", title: "मानधन लेजर", sub: "व्हाउचर तपासा", tab: "INCENTIVES" as Tab, bg: T.successBg, color: T.success },
                  { icon: "🚑", title: "आपत्काल 108", sub: "रुग्णवाहिका", tab: null as any, bg: T.dangerBg, color: T.danger },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={() => a.tab ? setTab(a.tab) : alert("Calling 108 — DISHA Emergency Response...")}
                    style={{
                      background: a.bg,
                      border: `1.5px solid ${a.color}20`,
                      borderRadius: 14,
                      padding: "16px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{a.icon}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: a.color }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Tasks */}
            <div>
              <SectionHeader title="आजचे कार्य (Today's Tasks)" />
              <Card>
                {[
                  { icon: "🤰", task: "सुनीता पाडवी ANC 3rd विजिट",   due: "९:३०", done: true },
                  { icon: "💉", task: "रुक्मिणी गावित Fe-IFA वितरण",  due: "११:00", done: false },
                  { icon: "📋", task: "ग्राम क्लस्टर ३ CBAC स्क्रीनिंग", due: "दुपारी", done: false },
                  { icon: "🏥", task: "PHC साप्ताहिक रिपोर्ट सादर",    due: "संध्याकाळी", done: false },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: i < 3 ? `1px solid ${T.hairline}` : "none",
                    opacity: item.done ? 0.5 : 1,
                  }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: item.done ? T.primaryLight : T.surface,
                      border: `1.5px solid ${item.done ? T.primary : T.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}>
                      {item.done ? "✓" : item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, textDecoration: item.done ? "line-through" : "none" }}>{item.task}</div>
                      <div style={{ fontSize: 11, color: T.inkMuted }}>{item.due}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ══ ANC SCREENING ══ */}
        {tab === "ANC" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionHeader title="गरोदर माता तपासणी — ANC Danger Sign Assessment" />

            <Card>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <FieldInput label="मातेचे नाव (Patient Name)" value={patientName} onChange={setPatientName} />
                <FieldInput label="गर्भधारणेचे आठवडे (Gestational Weeks)" value={gestWeeks} onChange={setGestWeeks} type="number" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <FieldInput label="SBP mmHg" value={sbp} onChange={setSbp} type="number" />
                  <FieldInput label="DBP mmHg" value={dbp} onChange={setDbp} type="number" />
                  <FieldInput label="Hb g/dL" value={hb} onChange={setHb} type="number" />
                  <FieldInput label="FHR bpm" value={fhr} onChange={setFhr} type="number" />
                </div>
              </div>
            </Card>

            {/* Symptoms */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                धोक्याची लक्षणे (Danger Signs)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SYMPTOMS_LIST.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${selectedSymptoms.includes(s) ? T.danger : T.border}`,
                      background: selectedSymptoms.includes(s) ? T.dangerBg : T.card,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `2px solid ${selectedSymptoms.includes(s) ? T.danger : T.border}`,
                      background: selectedSymptoms.includes(s) ? T.danger : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                      transition: "all 180ms ease",
                    }}>
                      {selectedSymptoms.includes(s) ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 13.5, color: T.ink }}>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              style={{
                height: 52,
                background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                fontSize: 15.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(69,107,77,0.3)",
                letterSpacing: -0.2,
              }}
            >
              {t.evaluate}
            </button>

            {/* Triage Result */}
            {triageResult && tc && (
              <div style={{
                background: tc.bg,
                border: `2px solid ${tc.border}`,
                borderRadius: 14,
                padding: 18,
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{
                    background: tc.border,
                    color: "#FFFFFF",
                    borderRadius: 20,
                    padding: "5px 13px",
                    fontSize: 12,
                    fontWeight: 800,
                  }}>
                    {tc.label} (Score: {triageResult.urgencyScore}/100)
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>✓ ₹२५० मानधन जमा</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 6 }}>{triageResult.primaryAlert}</div>
                <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>
                  <strong>शिफारस / Action:</strong> {triageResult.recommendedAction}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    style={{ flex: 1, height: 40, background: tc.border, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    onClick={() => alert("व्हिडिओ टेलिकन्सल्ट अनुरोध डॉ. अंजली देशमुख यांना पाठवले!")}
                  >
                    📹 Video Consult
                  </button>
                  <button
                    style={{ flex: 1, height: 40, background: T.card, color: T.ink, border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    onClick={() => alert("रेफरल स्लिप तयार केली.")}
                  >
                    📋 Referral Slip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CBAC ══ */}
        {tab === "CBAC" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionHeader title="CBAC — NCD Community Screening" />

            <Card>
              <div style={{ padding: 16 }}>
                <FieldInput label="रुग्णाचे नाव (Patient Name)" value="" onChange={() => {}} />
                <div style={{ marginTop: 12 }}>
                  <FieldInput label="वय (Age)" value="" onChange={() => {}} type="number" />
                </div>
              </div>
            </Card>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                जोखीम घटक (Risk Factors)
              </div>
              {CBAC_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setCbacAnswers(prev => ({ ...prev, [q.field]: !prev[q.field] }))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px",
                    background: cbacAnswers[q.field] ? T.dangerBg : T.card,
                    border: `1px solid ${cbacAnswers[q.field] ? T.dangerBorder : T.hairline}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "inherit",
                    marginBottom: 8,
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${cbacAnswers[q.field] ? T.danger : T.border}`,
                    background: cbacAnswers[q.field] ? T.danger : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    flexShrink: 0,
                    transition: "all 150ms ease",
                  }}>
                    {cbacAnswers[q.field] ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.4 }}>{q.q}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const riskCount = Object.values(cbacAnswers).filter(Boolean).length;
                const level = riskCount >= 3 ? "उच्च जोखीम (HIGH RISK)" : riskCount >= 2 ? "मध्यम जोखीम (MODERATE)" : "सामान्य (ROUTINE)";
                alert(`CBAC स्कोर: ${riskCount}/4 जोखीम घटक\nनिष्कर्ष: ${level}\n\nPHC ला पाठविण्याची शिफारस.`);
              }}
              style={{
                height: 52,
                background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                fontSize: 15.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(69,107,77,0.3)",
              }}
            >
              CBAC स्कोर काढा व PHC ला पाठवा →
            </button>
          </div>
        )}

        {/* ══ INCENTIVES ══ */}
        {tab === "INCENTIVES" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Balance Card */}
            <div style={{
              background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
              borderRadius: 16,
              padding: "20px 20px 18px",
              color: "#fff",
            }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.75, marginBottom: 4 }}>
                {t.totalEarned} — सप्टेंबर 2026
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                ₹{earnedInr.toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 6 }}>
                PFMS Direct Benefit Transfer (DBT) खाते: SBIN0014299
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>₹550</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>प्रलंबित (Pending)</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>₹900</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>जमा (Disbursed)</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>3</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>व्हाउचर</div>
                </div>
              </div>
            </div>

            {/* Voucher List */}
            <SectionHeader title="मानधन व्हाउचर (Claim Vouchers)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vouchers.map((v, i) => (
                <Card key={i}>
                  <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, lineHeight: 1.3, marginBottom: 4 }}>{v.activity}</div>
                      <div style={{ fontSize: 11.5, color: T.inkMuted }}>लाभार्थी: {v.patient} • {v.date}</div>
                      <div style={{ fontSize: 10.5, color: T.primary, fontWeight: 700, marginTop: 3 }}>ID: {v.id}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: T.primaryDark }}>+₹{v.amount}</div>
                      <div style={{
                        background: `${v.statusColor}18`,
                        color: v.statusColor,
                        borderRadius: 20,
                        padding: "3px 9px",
                        fontSize: 10,
                        fontWeight: 700,
                        marginTop: 4,
                        border: `1px solid ${v.statusColor}30`,
                        whiteSpace: "nowrap",
                      }}>
                        {v.status}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ══ PROFILE ══ */}
        {tab === "PROFILE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
              borderRadius: 16,
              padding: "24px 20px 20px",
              textAlign: "center",
              color: "#fff",
            }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 30, fontWeight: 700 }}>
                क
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>कविता पाडवी</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>ASHA स्वयंसेविका • MH-NDB-ASHA-00441</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>तोरणमाळ HWC, धडगाव तालुका, नंदुरबार</div>
            </div>

            <Card>
              {[
                { label: "मोबाइल नंबर", value: "+91 98765 43210" },
                { label: "ABHA ID", value: "91-4521-0088-7744" },
                { label: "बँक खाते (PFMS)", value: "SBIN0014299 ••••1234" },
                { label: "NHM Training", value: "प्रशिक्षण पूर्ण (2025)" },
                { label: "ॲप आवृत्ती", value: "v2.4.1 (Offline Ready)" },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "13px 16px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.hairline}` : "none",
                }}>
                  <span style={{ fontSize: 13.5, color: T.inkMuted }}>{row.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{row.value}</span>
                </div>
              ))}
            </Card>

            <button
              style={{
                height: 46,
                background: T.dangerBg,
                color: T.danger,
                border: `1.5px solid ${T.dangerBorder}`,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={() => alert("Logging out...")}
            >
              लॉग आउट (Sign Out)
            </button>
          </div>
        )}

      </main>

      {/* ── Bottom Navigation Bar ── */}
      <nav style={{
        display: "flex",
        borderTop: `1px solid ${T.hairline}`,
        background: T.card,
        position: "sticky",
        bottom: 0,
        zIndex: 50,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}>
        {[
          { id: "HOME" as Tab,       icon: "🏠",  label: t.home },
          { id: "ANC" as Tab,        icon: "🤰",  label: t.anc },
          { id: "CBAC" as Tab,       icon: "🧪",  label: t.cbac },
          { id: "INCENTIVES" as Tab, icon: "💰",  label: t.incentives },
          { id: "PROFILE" as Tab,    icon: "👤",  label: t.profile },
        ].map(n => (
          <NavTab key={n.id} icon={n.icon} label={n.label} active={tab === n.id} onClick={() => setTab(n.id)} />
        ))}
      </nav>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { -webkit-tap-highlight-color: transparent; }
        input { appearance: none; -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
