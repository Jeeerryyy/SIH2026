"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// INLINED CDSS ENGINE (no external package dependency)
// ═══════════════════════════════════════════════════════════════════════════════
function evaluateCdss(vitals: { bp?: string; hb?: number | null; spo2?: number; fhr?: number | null }, flags: string[], complaint: string) {
  const parts = (vitals.bp || "120/80").split("/");
  const sbp = parseInt(parts[0]) || 120;
  const dbp = parseInt(parts[1]) || 80;
  let score = 0;
  const rules: string[] = [];

  if (sbp >= 160 || dbp >= 110) { score += 40; rules.push("MgSO4 eclampsia protocol"); }
  else if (sbp >= 140 || dbp >= 90) { score += 25; rules.push("Labetalol 100mg stat"); }
  else if (sbp < 90) { score += 40; rules.push("IV fluid resuscitation stat"); }

  if (vitals.hb && vitals.hb < 7) { score += 35; rules.push("Emergency IV Iron Sucrose"); }
  else if (vitals.hb && vitals.hb < 10) { score += 20; rules.push("Fe-IFA daily + monitor"); }

  if (vitals.spo2 && vitals.spo2 < 88) { score += 45; rules.push("Emergency O2 + airway management"); }
  else if (vitals.spo2 && vitals.spo2 < 93) { score += 25; rules.push("Supplemental O2 4L/min"); }

  if (flags.includes("Snakebite")) { score += 50; rules.push("Polyvalent ASV 10 vials IV stat; anti-tetanus"); }
  if (flags.includes("HRP")) { score += 10; rules.push("HRP protocol — institutional delivery"); }

  if (complaint.toLowerCase().includes("headache") || complaint.toLowerCase().includes("visual")) { score += 15; }
  if (complaint.toLowerCase().includes("convulsion") || complaint.toLowerCase().includes("distress")) { score += 25; }

  const tier = score >= 45 ? "RED" : score >= 25 ? "AMBER" : score >= 12 ? "YELLOW" : "GREEN";
  const protocol = rules.length ? rules.join("; ") : "Standard protocol";
  return { score: Math.min(score, 100), tier, protocol };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
const QUEUE_DATA = [
  { id: "pat-ndb-1001", tier: "AMBER",  name: "Sunita Ramesh Padvi", age: 28, gender: "F", abhaId: "91-4521-8890-1123", facility: "Toranmal SC-HWC", district: "Nandurbar", vitals: { bp: "165/105", hr: 98,  spo2: 96, hb: 8.2, fhr: 142 }, flags: ["HRP", "Sickle Cell"], complaint: "Severe headache, visual blurring at 32 weeks gestation. Suspected Impending Pre-Eclampsia.", waitMin: 4,  isHrp: true  },
  { id: "pat-gad-0044", tier: "RED",    name: "Pooja Gavit",         age: 22, gender: "F", abhaId: "91-8899-2233-4455", facility: "Bhamragad PHC",   district: "Gadchiroli", vitals: { bp: "90/60",  hr: 122, spo2: 86, hb: null, fhr: null }, flags: ["Snakebite", "ASV-STAT"], complaint: "Ptosis, respiratory distress post viper bite 45 min ago. Neurotoxic envenomation.", waitMin: 1,  isHrp: false },
  { id: "pat-yav-0078", tier: "GREEN",  name: "Ramu Somu Madavi",    age: 54, gender: "M", abhaId: "91-7788-9900-3344", facility: "Bhamragad PHC",   district: "Gadchiroli", vitals: { bp: "138/88", hr: 74,  spo2: 98, hb: null, fhr: null }, flags: ["HTN", "DM-2"], complaint: "Routine NCD Hypertension follow-up. BP 138/88. Blood Sugar 142 mg/dL.", waitMin: 22, isHrp: false },
  { id: "pat-ndb-1009", tier: "YELLOW", name: "Meena Bhagat",        age: 34, gender: "F", abhaId: "91-3312-6677-9900", facility: "Dhadgaon SC",     district: "Nandurbar", vitals: { bp: "140/92", hr: 88,  spo2: 97, hb: 9.8, fhr: 135 }, flags: ["HRP", "Anaemia"], complaint: "28-week ANC with Hb 9.8 g/dL. Moderate anaemia, requires IV iron protocol.", waitMin: 11, isHrp: true  },
  { id: "pat-ama-0031", tier: "AMBER",  name: "Savitri Rathod",      age: 26, gender: "F", abhaId: "91-5544-3322-1100", facility: "Melghat HWC",     district: "Amravati", vitals: { bp: "150/98", hr: 92,  spo2: 95, hb: 7.1, fhr: 148 }, flags: ["HRP", "Sickle Cell", "Anaemia"], complaint: "30 weeks gestation. Sickle cell crisis + anaemia. HU therapy review.", waitMin: 8,  isHrp: true  },
];

const ASHA_LEADERBOARD = [
  { name: "कविता पाडवी",    id: "MH-NDB-ASHA-00441", hrp: 12, cbac: 8,  incentive: "₹3,450", score: 98 },
  { name: "प्रिया वसावे",   id: "MH-NDB-ASHA-00228", hrp: 10, cbac: 11, incentive: "₹3,100", score: 94 },
  { name: "सरिता भगत",     id: "MH-GAD-ASHA-00389", hrp: 9,  cbac: 7,  incentive: "₹2,900", score: 91 },
  { name: "मीना राठोड",     id: "MH-AMA-ASHA-00156", hrp: 8,  cbac: 9,  incentive: "₹2,650", score: 88 },
  { name: "लता वसाळे",     id: "MH-NDB-ASHA-00573", hrp: 7,  cbac: 6,  incentive: "₹2,200", score: 85 },
];

const DISTRICT_DATA = [
  { district: "Nandurbar (Dhadgaon)",   hrp: 42, snakebite: 8,  sickleCrisis: 14, stockout: "100% ASV", alert: "HIGH MONSOON", alertColor: "#D97706" },
  { district: "Gadchiroli (Bhamragad)", hrp: 29, snakebite: 12, sickleCrisis: 6,  stockout: "98% ASV",  alert: "HIGH FOREST",  alertColor: "#D97706" },
  { district: "Yavatmal (Ralegaon)",    hrp: 19, snakebite: 3,  sickleCrisis: 2,  stockout: "99%",      alert: "NORMAL",       alertColor: "#16A34A" },
  { district: "Amravati (Melghat)",     hrp: 31, snakebite: 5,  sickleCrisis: 9,  stockout: "100%",     alert: "WATCH",        alertColor: "#2563EB" },
  { district: "Nashik (Peint)",         hrp: 15, snakebite: 1,  sickleCrisis: 3,  stockout: "100%",     alert: "NORMAL",       alertColor: "#16A34A" },
];

const PHARMACY_DATA = [
  { name: "Polyvalent Anti-Snake Venom (ASV) Injection", batch: "SII-ASV-2026-X",  expiry: "Aug 2027", units: "1,200 Vials", stock: 1200, max: 2000, priority: "PRIORITY 1", priorityColor: "#D97706" },
  { name: "Labetalol 100mg Tablets",                     batch: "MSM-LAB-2026A",   expiry: "Mar 2027", units: "8,400 Tabs",  stock: 8400, max: 12000, priority: "PRIORITY 2", priorityColor: "#D97706" },
  { name: "Iron Sucrose 100mg/5ml IV",                   batch: "ZYD-IRN-2026B",   expiry: "May 2028", units: "640 Vials",   stock: 640,  max: 1000,  priority: "STANDARD",   priorityColor: "#16A34A" },
  { name: "Magnesium Sulphate 2gm/10ml IV",              batch: "CIP-MGS-2026A",   expiry: "Jan 2028", units: "920 Amps",    stock: 920,  max: 1500,  priority: "PRIORITY 1", priorityColor: "#D97706" },
  { name: "Hydroxyurea 500mg (Sickle Cell)",             batch: "CIP-HU-2026C",    expiry: "Oct 2027", units: "2,100 Caps",  stock: 2100, max: 3000,  priority: "SPECIALTY",  priorityColor: "#2563EB" },
  { name: "Paracetamol 500mg Tablets",                   batch: "MSM-PCM-2026A",   expiry: "Jan 2028", units: "50,000 Tabs", stock: 50000,max: 60000, priority: "STANDARD",   priorityColor: "#16A34A" },
  { name: "ORS Sachets (Plain)",                         batch: "MSM-ORS-2026B",   expiry: "Dec 2027", units: "12,000 Pkts", stock: 12000,max: 15000, priority: "STANDARD",   priorityColor: "#16A34A" },
];

const RX_MEDICINES_DEFAULT = [
  { name: "Labetalol 100mg",         freq: "1-0-1",        duration: "7 Days",  instructions: "After meals; BP monitoring", stock: "In Stock (DDW Nandurbar)" },
  { name: "Iron Sucrose 100mg/5ml IV", freq: "Alternate Days", duration: "3 Doses", instructions: "IV infusion under observation", stock: "In Stock (DDW Nandurbar)" },
  { name: "Calcium + Vit D3",        freq: "0-0-1",        duration: "30 Days", instructions: "After dinner",               stock: "In Stock (DDW Nandurbar)" },
  { name: "Aspirin 75mg",            freq: "1-0-0",        duration: "30 Days", instructions: "With food; HRP protocol",    stock: "In Stock (DDW Nandurbar)" },
];

const ALL_DRUGS = [
  "Labetalol 100mg", "Iron Sucrose 100mg/5ml IV", "Calcium + Vit D3", "Aspirin 75mg",
  "MgSO4 2g/10ml IV", "Nifedipine 10mg SL", "Hydroxyurea 500mg", "Paracetamol 500mg",
  "Amoxicillin 500mg", "Metformin 500mg", "ASV Polyvalent 10 Vials IV", "ORS Oral",
  "Fe-IFA Tablets", "Folic Acid 5mg", "Betamethasone 12mg IM",
];

const NAV_ITEMS = [
  { id: "QUEUE",         label: "Live OPD Queue",       icon: "🏥", badge: QUEUE_DATA.length },
  { id: "TELECONSULT",   label: "Video Teleconsult",     icon: "📹", badge: null },
  { id: "PRESCRIPTION",  label: "NMC e-Prescription",    icon: "💊", badge: null },
  { id: "DHO_ANALYTICS", label: "DHO State Telemetry",   icon: "📊", badge: null },
  { id: "PHARMACY",      label: "e-Aushadhi Inventory",  icon: "🧪", badge: null },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const C = {
  primary: "#75A68C", primaryDark: "#456B4D", primaryLight: "#E3EDE8",
  primaryLighter: "#F0F6F3", danger: "#C8372D", dangerBg: "#FDF2F2",
  warning: "#D97706", warningBg: "#FFFBEB", success: "#16A34A", successBg: "#F0FDF4",
  ink: "#1A1A1A", inkMuted: "#6B7280", surface: "#F3F6F4", card: "#FFFFFF",
  hairline: "#E5EDE9", border: "#D1D5DB", sidebar: "#0F2419", sidebarText: "rgba(255,255,255,0.75)",
  info: "#2563EB", infoBg: "#EFF6FF",
};

const TIER_STYLE: Record<string, { bg: string; border: string; color: string; label: string; dot: string }> = {
  RED:    { bg: "#FDF2F2", border: C.danger,  color: C.danger,      label: "🚨 EMERGENCY RED",  dot: C.danger },
  AMBER:  { bg: "#FFFBEB", border: C.warning, color: C.warning,     label: "⚠️ URGENT AMBER",   dot: C.warning },
  YELLOW: { bg: "#FEFCE8", border: "#7C7C18", color: "#7C7C18",     label: "👁️ WATCH YELLOW",   dot: "#7C7C18" },
  GREEN:  { bg: C.primaryLighter, border: C.primary, color: C.primaryDark, label: "✅ ROUTINE GREEN", dot: C.primary },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: C.card, borderRadius: 18, width: "100%", maxWidth: wide ? 780 : 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px 18px", borderBottom: `1px solid ${C.hairline}`, position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{title}</div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: C.surface, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small = false, full = false, disabled = false, style = {} }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "danger" | "secondary" | "ghost" | "success" | "warning";
  small?: boolean; full?: boolean; disabled?: boolean; style?: React.CSSProperties;
}) {
  const bg: Record<string, string> = { primary: C.primary, danger: C.danger, secondary: C.card, ghost: "transparent", success: C.success, warning: C.warning };
  const color: Record<string, string> = { primary: "#fff", danger: "#fff", secondary: C.ink, ghost: C.inkMuted, success: "#fff", warning: "#fff" };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ height: small ? 32 : 40, padding: small ? "0 14px" : "0 20px", background: disabled ? "#E5E7EB" : bg[variant], color: disabled ? C.inkMuted : color[variant], border: variant === "secondary" ? `1.5px solid ${C.border}` : "none", borderRadius: 50, fontFamily: "inherit", fontWeight: 700, fontSize: small ? 12 : 13.5, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: full ? "100%" : "auto", transition: "opacity 0.15s", ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

function KpiCard({ icon, label, value, sub, trend, color }: { icon: string; label: string; value: string; sub: string; trend: string; color: string }) {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    green: { border: C.success, bg: C.successBg, text: C.success },
    red:   { border: C.danger,  bg: C.dangerBg,  text: C.danger  },
    amber: { border: C.warning, bg: C.warningBg, text: C.warning },
    blue:  { border: C.info,    bg: C.infoBg,    text: C.info    },
  };
  const col = colorMap[color] || colorMap.green;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "18px 20px", borderLeft: `4px solid ${col.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, letterSpacing: -1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: C.inkMuted }}>{sub}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: col.text, background: col.bg, padding: "2px 8px", borderRadius: 10, display: "inline-block", alignSelf: "flex-start" }}>{trend}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: OPD QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
function QueueScreen({ onPatientSelect, setActiveTab }: {
  onPatientSelect: (p: typeof QUEUE_DATA[0]) => void;
  setActiveTab: (t: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("ALL");
  const [selectedId, setSelectedId] = useState(QUEUE_DATA[0].id);
  const [modalPatient, setModalPatient] = useState<typeof QUEUE_DATA[0] | null>(null);

  const filtered = QUEUE_DATA.filter(p => {
    const matchTier = filterTier === "ALL" || p.tier === filterTier;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.district.toLowerCase().includes(searchTerm.toLowerCase()) || p.abhaId.includes(searchTerm);
    return matchTier && matchSearch;
  });

  const handleSelect = (p: typeof QUEUE_DATA[0]) => {
    setSelectedId(p.id);
    onPatientSelect(p);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "0 14px", height: 40 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search patient, district, ABHA..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", background: "transparent", color: C.ink }} />
          {searchTerm && <button onClick={() => setSearchTerm("")} style={{ border: "none", background: "none", cursor: "pointer", color: C.inkMuted, fontSize: 16 }}>×</button>}
        </div>
        {["ALL", "RED", "AMBER", "YELLOW", "GREEN"].map(tier => (
          <button key={tier} onClick={() => setFilterTier(tier)}
            style={{ height: 36, padding: "0 14px", borderRadius: 50, border: `1.5px solid ${filterTier === tier ? TIER_STYLE[tier]?.dot ?? C.primary : C.border}`, background: filterTier === tier ? (TIER_STYLE[tier]?.bg ?? C.primaryLight) : C.card, fontWeight: 700, fontSize: 12, color: filterTier === tier ? (TIER_STYLE[tier]?.color ?? C.primaryDark) : C.inkMuted, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
          >
            {tier === "ALL" ? `All (${QUEUE_DATA.length})` : tier}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, color: C.ink, fontSize: 15 }}>🏥 Live OPD Queue — Toranmal DHO Command</div>
          <div style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22C55E", marginRight: 5, animation: "pulse 2s infinite" }} />
            LIVE • Auto-refresh 60s
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["Triage", "Patient", "Age/Sex", "Vitals", "Facility", "Flags", "Wait", "Action"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const ts = TIER_STYLE[p.tier];
                return (
                  <tr key={p.id}
                    onClick={() => handleSelect(p)}
                    style={{ cursor: "pointer", background: selectedId === p.id ? C.primaryLighter : i % 2 === 0 ? C.card : "#FAFAFA", borderBottom: `1px solid ${C.hairline}`, transition: "background 0.15s", borderLeft: `3px solid ${ts.dot}` }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, borderRadius: 50, padding: "4px 10px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ts.dot, display: "inline-block" }} />
                        {p.tier}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: C.inkMuted }}>ABHA: {p.abhaId}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13.5, color: C.inkMuted, whiteSpace: "nowrap" }}>{p.age}y / {p.gender}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                        {[
                          { k: "BP", v: p.vitals.bp },
                          { k: "SpO2", v: p.vitals.spo2 ? `${p.vitals.spo2}%` : null },
                          { k: "Hb", v: p.vitals.hb ? `${p.vitals.hb}` : null },
                        ].filter(x => x.v).map(x => (
                          <span key={x.k} style={{ display: "inline-block", marginRight: 6, marginBottom: 2, background: C.surface, padding: "1px 7px", borderRadius: 5, border: `1px solid ${C.hairline}`, fontWeight: 600, fontSize: 11.5, color: C.ink }}>
                            {x.k}: {x.v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12.5, color: C.inkMuted }}>{p.facility}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.flags.map(f => (
                          <span key={f} style={{ background: f.includes("Snakebite") || f.includes("HRP") ? C.dangerBg : C.primaryLight, color: f.includes("Snakebite") || f.includes("HRP") ? C.danger : C.primaryDark, border: `1px solid ${f.includes("Snakebite") || f.includes("HRP") ? C.danger : C.primary}25`, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{f}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: p.waitMin <= 5 ? C.danger : p.waitMin <= 15 ? C.warning : C.inkMuted, whiteSpace: "nowrap" }}>{p.waitMin}m</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small onClick={e => { e.stopPropagation(); setModalPatient(p); }}>
                          View
                        </Btn>
                        <Btn small variant="secondary" onClick={e => { e.stopPropagation(); handleSelect(p); setActiveTab("TELECONSULT"); }}>
                          📹
                        </Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {modalPatient && (
        <Modal title={`Patient File — ${modalPatient.name}`} onClose={() => setModalPatient(null)} wide>
          {(() => {
            const ts = TIER_STYLE[modalPatient.tier];
            const cdss = evaluateCdss(modalPatient.vitals, modalPatient.flags, modalPatient.complaint);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ background: ts.bg, color: ts.color, border: `1.5px solid ${ts.border}`, borderRadius: 50, padding: "6px 16px", fontWeight: 800, fontSize: 13 }}>{ts.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.inkMuted }}>Score: {cdss.score}/100</span>
                  {modalPatient.flags.map(f => (
                    <span key={f} style={{ background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}25`, borderRadius: 4, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{f}</span>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Patient Details</div>
                    {[["ABHA ID", modalPatient.abhaId], ["Age/Gender", `${modalPatient.age}y / ${modalPatient.gender}`], ["Facility", modalPatient.facility], ["District", modalPatient.district], ["Wait Time", `${modalPatient.waitMin} minutes`]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.hairline}` }}>
                        <span style={{ fontSize: 13, color: C.inkMuted }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Vitals</div>
                    {[["Blood Pressure", modalPatient.vitals.bp], ["Heart Rate", `${modalPatient.vitals.hr} bpm`], ["SpO2", `${modalPatient.vitals.spo2}%`], ["Haemoglobin", modalPatient.vitals.hb ? `${modalPatient.vitals.hb} g/dL` : "—"], ["Foetal HR", modalPatient.vitals.fhr ? `${modalPatient.vitals.fhr} bpm` : "—"]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.hairline}` }}>
                        <span style={{ fontSize: 13, color: C.inkMuted }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: ts.bg, border: `1.5px solid ${ts.border}`, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: ts.color, marginBottom: 6 }}>CDSS Clinical Protocol</div>
                  <div style={{ fontSize: 13.5, color: C.ink }}>{cdss.protocol}</div>
                </div>

                <div style={{ background: C.surface, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 6 }}>Chief Complaint</div>
                  <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{modalPatient.complaint}</div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Btn onClick={() => { setModalPatient(null); onPatientSelect(modalPatient); setActiveTab("TELECONSULT"); }}>📹 Start Teleconsult</Btn>
                  <Btn onClick={() => { setModalPatient(null); onPatientSelect(modalPatient); setActiveTab("PRESCRIPTION"); }} variant="secondary">💊 Write Prescription</Btn>
                  <Btn variant="danger" onClick={() => alert(`🚑 108 Ambulance dispatched for ${modalPatient.name}\nLocation: ${modalPatient.facility}\nRef: AMB-MH-${Date.now()}`)}>🚑 Dispatch 108</Btn>
                  <Btn variant="ghost" onClick={() => alert(`Patient file printed for ${modalPatient.name}`)}>🖨️ Print File</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: VIDEO TELECONSULT
// ═══════════════════════════════════════════════════════════════════════════════
function TeleconsultScreen({ patient, setActiveTab }: { patient: typeof QUEUE_DATA[0]; setActiveTab: (t: string) => void }) {
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { from: "ASHA Kavita Padvi", msg: "डॉक्टरसाहेब, मरीज खूप अस्वस्थ आहे. बीपी 165/105.", time: "10:32 AM" },
    { from: "System", msg: "Patient joined teleconsult. Vitals auto-synced from CDSS.", time: "10:32 AM" },
  ]);
  const [notes, setNotes] = useState(`Clinical Notes — ${patient.name}\n\nPrimary: ${patient.complaint}\n\nVitals:\n• BP: ${patient.vitals.bp}\n• SpO2: ${patient.vitals.spo2}%\n• Hb: ${patient.vitals.hb ?? "N/A"} g/dL\n• FHR: ${patient.vitals.fhr ?? "N/A"} bpm\n\nCDSS Decision: ${evaluateCdss(patient.vitals, patient.flags, patient.complaint).protocol}\n\nPlan:\n`);
  const [showClinicalNotes, setShowClinicalNotes] = useState(false);
  const ts = TIER_STYLE[patient.tier];

  useEffect(() => {
    if (!inCall) { setCallDuration(0); return; }
    const t = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [inCall]);

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(p => [...p, { from: "Dr. Anjali Deshmukh (MO)", msg: chatMsg, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatMsg("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Patient header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "16px 20px", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: ts.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: ts.color, border: `2px solid ${ts.border}` }}>
            {patient.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{patient.name}</div>
            <div style={{ fontSize: 12.5, color: C.inkMuted }}>ABHA: {patient.abhaId} • {patient.age}y {patient.gender} • {patient.facility}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              <span style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, padding: "2px 10px", borderRadius: 50, fontSize: 11, fontWeight: 800 }}>{ts.label}</span>
              {patient.flags.map(f => <span key={f} style={{ background: C.dangerBg, color: C.danger, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{f}</span>)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small variant="secondary" onClick={() => setActiveTab("PRESCRIPTION")}>💊 Prescribe</Btn>
          <Btn small variant="ghost" onClick={() => setShowClinicalNotes(true)}>📝 Clinical Notes</Btn>
        </div>
      </div>

      {/* Video + Chat layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Video Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#0F1117", borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {inCall ? (
              <>
                {/* Simulated video */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0F1A0F 0%, #1A2D1A 50%, #0F1A0F 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
                    <div style={{ fontSize: 60, marginBottom: 12 }}>👩‍⚕️</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>कविता पाडवी — ASHA</div>
                    <div style={{ fontSize: 12 }}>Toranmal HWC • Camera Active</div>
                  </div>
                </div>

                {/* Patient vitals overlay */}
                <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.75)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)" }}>
                  <div style={{ color: ts.color, fontWeight: 800, fontSize: 11, marginBottom: 6 }}>{ts.label}</div>
                  {[["BP", patient.vitals.bp], ["SpO2", `${patient.vitals.spo2}%`], ["HR", `${patient.vitals.hr} bpm`], ...(patient.vitals.hb ? [["Hb", `${patient.vitals.hb} g/dL`]] : [])].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 20, color: "#fff", fontSize: 12, lineHeight: 1.8 }}>
                      <span style={{ opacity: 0.7 }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Duration */}
                <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(200,55,45,0.85)", borderRadius: 50, padding: "5px 14px", color: "#fff", fontSize: 13, fontWeight: 800 }}>
                  🔴 {formatDuration(callDuration)}
                </div>

                {/* Doctor pip */}
                <div style={{ position: "absolute", bottom: 16, right: 16, width: 140, height: 100, background: "rgba(20,30,20,0.9)", borderRadius: 10, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 28 }}>{videoOff ? "🚫" : "👨‍⚕️"}</div>
                  <div style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>Dr. Anjali Deshmukh</div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📹</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "rgba(255,255,255,0.7)" }}>Secure Teleconsult Ready</div>
                <div style={{ fontSize: 13 }}>Patient & ASHA connected<br />Click Start Consultation below</div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", background: C.card, padding: "14px", borderRadius: 12, border: `1px solid ${C.hairline}` }}>
            {inCall ? (
              <>
                <button onClick={() => setMicMuted(m => !m)} style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${micMuted ? C.danger : C.border}`, background: micMuted ? C.dangerBg : C.surface, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }} title={micMuted ? "Unmute" : "Mute"}>
                  {micMuted ? "🔇" : "🎙️"}
                </button>
                <button onClick={() => setVideoOff(v => !v)} style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${videoOff ? C.danger : C.border}`, background: videoOff ? C.dangerBg : C.surface, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }} title={videoOff ? "Start Video" : "Stop Video"}>
                  {videoOff ? "📵" : "📹"}
                </button>
                <button onClick={() => alert("Screen sharing initiated")} style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }} title="Share Screen">🖥️</button>
                <button onClick={() => alert("Snapshot saved to patient file")} style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }} title="Snapshot">📸</button>
                <Btn variant="danger" onClick={() => setInCall(false)} style={{ borderRadius: 50, padding: "0 28px" }}>📵 End Call</Btn>
              </>
            ) : (
              <Btn onClick={() => setInCall(true)} style={{ padding: "0 40px", height: 48, fontSize: 15 }}>📹 Start Consultation</Btn>
            )}
          </div>

          {/* CDSS Alert */}
          <div style={{ background: ts.bg, border: `1.5px solid ${ts.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: ts.color, marginBottom: 6 }}>⚡ CDSS Protocol</div>
            <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{evaluateCdss(patient.vitals, patient.flags, patient.complaint).protocol}</div>
          </div>
        </div>

        {/* Chat Panel */}
        <div style={{ display: "flex", flexDirection: "column", background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.hairline}`, fontWeight: 800, color: C.ink, fontSize: 14 }}>💬 Secure Telechat</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 300, maxHeight: 380 }}>
            {chatHistory.map((msg, i) => (
              <div key={i}>
                <div style={{ fontSize: 10.5, color: C.inkMuted, marginBottom: 3 }}>{msg.from} • {msg.time}</div>
                <div style={{ fontSize: 13, color: C.ink, background: msg.from.includes("Dr.") ? C.primaryLighter : C.surface, padding: "8px 12px", borderRadius: 10, lineHeight: 1.5 }}>{msg.msg}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.hairline}`, display: "flex", gap: 8 }}>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Type clinical message..."
              style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink }} />
            <Btn small onClick={sendChat}>Send</Btn>
          </div>
        </div>
      </div>

      {/* Clinical Notes Modal */}
      {showClinicalNotes && (
        <Modal title="📝 Clinical Notes" onClose={() => setShowClinicalNotes(false)}>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            style={{ width: "100%", minHeight: 280, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 14, fontSize: 13.5, fontFamily: "monospace", outline: "none", resize: "vertical", color: C.ink }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowClinicalNotes(false)}>Cancel</Btn>
            <Btn onClick={() => { setShowClinicalNotes(false); alert("Clinical notes saved to patient EHR"); }}>💾 Save to EHR</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: e-PRESCRIPTION
// ═══════════════════════════════════════════════════════════════════════════════
function PrescriptionScreen({ patient }: { patient: typeof QUEUE_DATA[0] }) {
  const [medicines, setMedicines] = useState(RX_MEDICINES_DEFAULT);
  const [searchDrug, setSearchDrug] = useState("");
  const [showDrugSearch, setShowDrugSearch] = useState(false);
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [diagnosis, setDiagnosis] = useState("Gestational Hypertension with Moderate Anaemia (G3P2L2 at 32 weeks)");
  const [followUp, setFollowUp] = useState("7 Days");
  const [newMed, setNewMed] = useState({ name: "", freq: "1-0-1", duration: "7 Days", instructions: "" });

  const removeMed = (i: number) => setMedicines(m => m.filter((_, idx) => idx !== i));

  const addDrug = (name: string) => {
    setMedicines(m => [...m, { name, freq: "1-0-1", duration: "7 Days", instructions: "", stock: "Check DDW" }]);
    setShowDrugSearch(false);
    setSearchDrug("");
  };

  const rxId = `RX-MH-NDB-${Date.now().toString().slice(-8)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {submitted ? (
        <div style={{ textAlign: "center", padding: 60, background: C.card, borderRadius: 18, border: `1px solid ${C.hairline}` }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.primaryDark, marginBottom: 8 }}>Prescription Submitted!</div>
          <div style={{ fontSize: 14, color: C.inkMuted, marginBottom: 20 }}>Rx ID: {rxId}<br />Sent to e-Aushadhi portal • DDW Nandurbar • ASHA Kavita Padvi notified</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn onClick={() => { setSubmitted(false); setSigned(false); }}>+ New Prescription</Btn>
            <Btn variant="secondary" onClick={() => alert(`Printing ${rxId}...`)}>🖨️ Print</Btn>
          </div>
        </div>
      ) : (
        <>
          {/* Prescription Header */}
          <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>ArogyaSetu Bridge — NMC e-Prescription</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Maharashtra Tribal Health Mesh • NMC Compliant Digital Prescription</div>
              </div>
              <div style={{ textAlign: "right", color: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Rx ID: {rxId}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Patient</div>
                {[["Name", patient.name], ["ABHA ID", patient.abhaId], ["Age/Gender", `${patient.age}y / ${patient.gender}`], ["Facility", patient.facility]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 13 }}>
                    <span style={{ color: C.inkMuted, minWidth: 90 }}>{k}:</span>
                    <span style={{ fontWeight: 700, color: C.ink }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Prescriber</div>
                {[["Name", "Dr. Anjali Deshmukh"], ["Qualification", "MBBS, MD (OBGYN)"], ["Reg No.", "MH-MCI-2019-00741"], ["Facility", "DHO Nandurbar Tele-Hub"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 13 }}>
                    <span style={{ color: C.inkMuted, minWidth: 90 }}>{k}:</span>
                    <span style={{ fontWeight: 700, color: C.ink }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Diagnosis / Clinical Impression</div>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: C.ink }} />
          </div>

          {/* Medicines */}
          <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800, color: C.ink, fontSize: 15 }}>💊 Medications ({medicines.length})</div>
              <Btn small onClick={() => setShowDrugSearch(true)}>+ Add Drug</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {["#", "Drug / Dose", "Frequency", "Duration", "Instructions", "Stock", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                    <td style={{ padding: "12px 16px", color: C.inkMuted, fontSize: 13, fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: C.ink }}>{m.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <input defaultValue={m.freq} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", fontSize: 12, fontFamily: "inherit", width: 80, outline: "none", color: C.ink }} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <input defaultValue={m.duration} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", fontSize: 12, fontFamily: "inherit", width: 80, outline: "none", color: C.ink }} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12.5, color: C.inkMuted }}>{m.instructions}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: C.successBg, color: C.success, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>✓ {m.stock || "In Stock"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => removeMed(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 16 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Drug Search Modal */}
            {showDrugSearch && (
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.hairline}`, background: C.primaryLighter }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.inkMuted, marginBottom: 10 }}>🔍 Search & Add Drug from e-Aushadhi Formulary</div>
                <input value={searchDrug} onChange={e => setSearchDrug(e.target.value)} placeholder="Type drug name..."
                  style={{ width: "100%", border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10, color: C.ink }} autoFocus />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALL_DRUGS.filter(d => d.toLowerCase().includes(searchDrug.toLowerCase())).map(d => (
                    <button key={d} onClick={() => addDrug(d)}
                      style={{ padding: "6px 14px", background: C.card, border: `1.5px solid ${C.primary}`, borderRadius: 50, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", color: C.primaryDark, fontWeight: 600 }}
                    >{d}</button>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Btn small variant="secondary" onClick={() => setShowDrugSearch(false)}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>

          {/* Follow Up + Notes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Follow-Up Interval</div>
              <select value={followUp} onChange={e => setFollowUp(e.target.value)}
                style={{ width: "100%", height: 42, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "0 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: C.ink }}>
                {["3 Days", "7 Days", "14 Days", "1 Month", "As Needed"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.inkMuted, marginBottom: 8 }}>Patient Instructions</div>
              <input placeholder="Rest, diet, danger signs to watch..." style={{ width: "100%", height: 42, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "0 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: C.ink }} />
            </div>
          </div>

          {/* Sign & Submit */}
          <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "18px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Dr. Anjali Deshmukh — MBBS, MD (OBGYN)</div>
                <div style={{ fontSize: 12, color: C.inkMuted }}>MH-MCI-2019-00741 • DHO Nandurbar • Digital Signature via Aadhaar OTP</div>
                {signed && <div style={{ marginTop: 6, fontSize: 12, color: C.success, fontWeight: 700 }}>✓ Digitally signed at {new Date().toLocaleTimeString()}</div>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {!signed ? (
                  <Btn onClick={() => { setSigned(true); alert("OTP sent to +91 99887 XXXXX\nEnter OTP: 456321 (demo)"); }}>🔐 Sign (Aadhaar OTP)</Btn>
                ) : (
                  <>
                    <Btn variant="secondary" onClick={() => alert("Preview:\n" + medicines.map((m, i) => `${i + 1}. ${m.name} — ${m.freq} × ${m.duration}`).join("\n"))}>👁️ Preview</Btn>
                    <Btn variant="success" onClick={() => setSubmitted(true)}>✅ Submit to e-Aushadhi</Btn>
                    <Btn variant="ghost" onClick={() => alert("Printing via PrintNode API...")}>🖨️ Print</Btn>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: DHO ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function DhoAnalyticsScreen() {
  const [dateRange, setDateRange] = useState("MONTH");

  const kpis = [
    { icon: "✅", label: "Referral Completion",  value: "88.4%", sub: "Target >85%",          color: "green", trend: "+47.4% vs baseline" },
    { icon: "⏱️", label: "Mean Time to Care",    value: "3.2h",  sub: "Target <4h",            color: "green", trend: "−34.8h vs baseline" },
    { icon: "🤰", label: "HRP Early Detection",  value: "92.1%", sub: "PMSMA Protocol",        color: "green", trend: "+58.1% vs baseline" },
    { icon: "💉", label: "Drug Stockout Rate",    value: "2.1%",  sub: "Target <5%",            color: "blue",  trend: "−28.9% vs baseline" },
    { icon: "👩‍⚕️", label: "Active HRP Patients", value: "281",   sub: "Across 36 Districts",   color: "amber", trend: "Real-time sync" },
    { icon: "🐍", label: "Snakebite Alerts",      value: "23",    sub: "Last 7 Days",           color: "red",   trend: "Monsoon Peak" },
    { icon: "💰", label: "ASHA Incentives Paid",  value: "₹4.2L", sub: "This Month via PFMS",  color: "green", trend: "+22% MoM" },
    { icon: "📱", label: "Teleconsults Today",    value: "148",   sub: "94% satisfaction",      color: "blue",  trend: "Live count" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>📊 DHO State Telemetry — Tribal Regions</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["WEEK", "MONTH", "QUARTER"].map(r => (
            <button key={r} onClick={() => setDateRange(r)}
              style={{ height: 34, padding: "0 14px", borderRadius: 50, border: `1.5px solid ${dateRange === r ? C.primary : C.border}`, background: dateRange === r ? C.primary : C.card, color: dateRange === r ? "#fff" : C.inkMuted, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >{r}</button>
          ))}
          <Btn small variant="secondary" onClick={() => alert("Exporting report as PDF...")}> 📥 Export</Btn>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* District Heatmap */}
      <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, color: C.ink, fontSize: 15 }}>📍 District-Level Health Index</div>
          <Btn small variant="secondary" onClick={() => alert("Full district report downloaded")}>📊 Full Report</Btn>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["District", "HRP Cases", "Snakebite", "Sickle Cell Crisis", "Drug Stockout", "Alert Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DISTRICT_DATA.map((d, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.hairline}`, cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.background = C.surface)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: C.ink, fontSize: 13.5 }}>{d.district}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: d.hrp > 35 ? C.danger : C.ink, fontWeight: d.hrp > 35 ? 800 : 400 }}>{d.hrp}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: d.snakebite > 8 ? C.warning : C.ink, fontWeight: d.snakebite > 8 ? 800 : 400 }}>{d.snakebite}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{d.sickleCrisis}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.success, fontWeight: 700 }}>{d.stockout}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: d.alertColor + "18", color: d.alertColor, border: `1px solid ${d.alertColor}30`, borderRadius: 50, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>{d.alert}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASHA Leaderboard + Outbreak Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ASHA Leaderboard */}
        <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.hairline}`, fontWeight: 800, color: C.ink, fontSize: 15 }}>🏆 Top ASHAs — {dateRange}</div>
          {ASHA_LEADERBOARD.map((a, i) => (
            <div key={i} style={{ padding: "12px 20px", borderBottom: i < ASHA_LEADERBOARD.length - 1 ? `1px solid ${C.hairline}` : "none", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surface)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => alert(`ASHA Profile: ${a.name}\nID: ${a.id}\nHRP: ${a.hrp} | CBAC: ${a.cbac}\nIncentive: ${a.incentive}\nPerformance Score: ${a.score}/100`)}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : i === 2 ? "#FEF3C7" : C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: i === 0 ? "#D97706" : C.inkMuted, flexShrink: 0 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: C.inkMuted }}>HRP: {a.hrp} • CBAC: {a.cbac}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: C.primaryDark, fontSize: 13 }}>{a.incentive}</div>
                <div style={{ fontSize: 11, color: C.inkMuted }}>Score: {a.score}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 14 }}>🔴 Outbreak & Alerts</div>
            {[
              { icon: "🐍", msg: "Snakebite Season Peak — Nandurbar Gadchiroli", sub: "ASV stock 98-100% ready", color: C.danger },
              { icon: "🤰", msg: "HRP Surge +12% in Melghat block", sub: "PMSMA camp scheduled", color: C.warning },
              { icon: "💊", msg: "MgSO4 indent raise request pending", sub: "DDW Nandurbar — approve required", color: C.info },
              { icon: "✅", msg: "CBAC Target 85% reached Nashik", sub: "Monthly target hit 3 days early", color: C.success },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.hairline}` : "none", cursor: "pointer" }}
                onClick={() => alert(`Alert Detail:\n${a.msg}\n${a.sub}`)}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: a.color }}>{a.msg}</div>
                  <div style={{ fontSize: 12, color: C.inkMuted }}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sickle Cell Stats */}
          <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 12 }}>🔴 Sickle Cell Mission Stats</div>
            {[
              { label: "Tested This Month", value: "1,248", bar: 62 },
              { label: "Trait Carriers", value: "387 (31%)", bar: 31 },
              { label: "On Hydroxyurea", value: "203", bar: 52 },
              { label: "Crisis Cases", value: "34", bar: 17 },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, color: C.inkMuted }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{s.value}</span>
                </div>
                <div style={{ height: 5, background: C.hairline, borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: C.primary, borderRadius: 5, width: `${s.bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: PHARMACY INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════
function PharmacyScreen() {
  const [indentModal, setIndentModal] = useState(false);
  const [indentDrug, setIndentDrug] = useState<typeof PHARMACY_DATA[0] | null>(null);
  const [indentQty, setIndentQty] = useState("");
  const [indentReason, setIndentReason] = useState("");
  const [indents, setIndents] = useState<{ drug: string; qty: string; status: string; date: string }[]>([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const filtered = PHARMACY_DATA.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "ALL" || d.priority.includes(filterPriority);
    return matchSearch && matchPriority;
  });

  const openIndent = (drug: typeof PHARMACY_DATA[0]) => {
    setIndentDrug(drug);
    setIndentQty("");
    setIndentReason("");
    setIndentModal(true);
  };

  const submitIndent = () => {
    if (!indentQty) { alert("Please enter quantity"); return; }
    setIndents(p => [...p, { drug: indentDrug!.name, qty: indentQty, status: "PENDING_DHO_APPROVAL", date: new Date().toLocaleDateString() }]);
    setIndentModal(false);
    alert(`Indent submitted!\nDrug: ${indentDrug!.name}\nQty: ${indentQty}\nStatus: Pending DHO Approval\nRef: INDENT-MH-${Date.now().toString().slice(-6)}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stock KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { icon: "📦", label: "Total SKUs", value: PHARMACY_DATA.length.toString(), sub: "e-Aushadhi items", color: "blue", trend: "FEFO managed" },
          { icon: "⚠️", label: "Priority Indents", value: PHARMACY_DATA.filter(d => d.priority.includes("PRIORITY")).length.toString(), sub: "Need action", color: "amber", trend: "Review today" },
          { icon: "✅", label: "In-Stock Rate", value: "97.4%", sub: "Across 36 DDWs", color: "green", trend: "FEFO compliant" },
          { icon: "🔄", label: "Pending Indents", value: indents.filter(i => i.status.includes("PENDING")).length.toString(), sub: "Awaiting DHO", color: "amber", trend: "Click to review" },
        ].map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "0 14px", height: 40 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drug name..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", background: "transparent", color: C.ink }} />
        </div>
        {["ALL", "PRIORITY 1", "PRIORITY 2", "STANDARD", "SPECIALTY"].map(p => (
          <button key={p} onClick={() => setFilterPriority(p)}
            style={{ height: 36, padding: "0 14px", borderRadius: 50, border: `1.5px solid ${filterPriority === p ? C.primary : C.border}`, background: filterPriority === p ? C.primary : C.card, color: filterPriority === p ? "#fff" : C.inkMuted, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >{p}</button>
        ))}
      </div>

      {/* Inventory Table */}
      <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.hairline}`, fontWeight: 800, color: C.ink, fontSize: 15 }}>🧪 e-Aushadhi — FEFO Drug Inventory (DDW Nandurbar)</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["Drug Name", "Batch", "Expiry", "Stock Level", "Units", "Priority", "Action"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const pct = Math.round((d.stock / d.max) * 100);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.hairline}`, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: C.ink }}>{d.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12.5, color: C.inkMuted, fontFamily: "monospace" }}>{d.batch}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12.5, color: C.inkMuted }}>{d.expiry}</td>
                    <td style={{ padding: "12px 16px", minWidth: 120 }}>
                      <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: pct < 30 ? C.danger : pct < 60 ? C.warning : C.success }}>{pct}%</span>
                        <span style={{ fontSize: 10.5, color: C.inkMuted }}>{d.units}</span>
                      </div>
                      <div style={{ height: 5, background: C.hairline, borderRadius: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: pct < 30 ? C.danger : pct < 60 ? C.warning : C.success, borderRadius: 5, width: `${pct}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.inkMuted }}>{d.units}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: d.priorityColor + "18", color: d.priorityColor, border: `1px solid ${d.priorityColor}30`, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>{d.priority}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small onClick={() => openIndent(d)}>+ Indent</Btn>
                        <Btn small variant="ghost" onClick={() => alert(`Batch Details:\nBatch: ${d.batch}\nExpiry: ${d.expiry}\nUnits: ${d.units}\nStorage: Cold chain maintained\nFEFO Status: Compliant`)}>🔍</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indent History */}
      {indents.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.hairline}`, fontWeight: 800, color: C.ink, fontSize: 15 }}>📋 My Pending Indents</div>
          {indents.map((ind, i) => (
            <div key={i} style={{ padding: "12px 20px", borderBottom: i < indents.length - 1 ? `1px solid ${C.hairline}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5 }}>{ind.drug}</div>
                <div style={{ fontSize: 12, color: C.inkMuted }}>Qty: {ind.qty} • {ind.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: C.warningBg, color: C.warning, border: `1px solid ${C.warning}30`, borderRadius: 50, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>{ind.status}</span>
                <Btn small variant="danger" onClick={() => setIndents(p => p.filter((_, idx) => idx !== i))}>Cancel</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indent Modal */}
      {indentModal && indentDrug && (
        <Modal title={`📦 Raise Indent — ${indentDrug.name}`} onClose={() => setIndentModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: C.surface, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 13, color: C.inkMuted }}>Current Stock: <strong style={{ color: C.ink }}>{indentDrug.units}</strong></div>
              <div style={{ fontSize: 13, color: C.inkMuted }}>Batch: <strong style={{ color: C.ink }}>{indentDrug.batch}</strong></div>
              <div style={{ fontSize: 13, color: C.inkMuted }}>Expiry: <strong style={{ color: C.ink }}>{indentDrug.expiry}</strong></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase" }}>Quantity Required</label>
              <input value={indentQty} onChange={e => setIndentQty(e.target.value)} type="number" placeholder="Enter quantity..."
                style={{ height: 44, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "0 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: C.ink }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase" }}>Justification / Reason</label>
              <textarea value={indentReason} onChange={e => setIndentReason(e.target.value)} placeholder="Clinical justification for indent..."
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 80, color: C.ink }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setIndentModal(false)}>Cancel</Btn>
              <Btn onClick={submitIndent}>✅ Submit Indent</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("QUEUE");
  const [selectedPatient, setSelectedPatient] = useState(QUEUE_DATA[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, msg: "🚨 Pooja Gavit — Snakebite EMERGENCY needs immediate attention", read: false, time: "10:32 AM" },
    { id: 2, msg: "🤰 Sunita Padvi BP 165/105 — CDSS flagged for teleconsult", read: false, time: "10:28 AM" },
    { id: 3, msg: "💊 MgSO4 indent approved by DHO", read: true, time: "09:45 AM" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (tab: string) => { setActiveTab(tab); setSidebarOpen(false); };
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Hanken Grotesk', -apple-system, sans-serif; background: ${C.surface}; color: ${C.ink}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 6px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} onClick={() => setSidebarOpen(false)} />
        )}
        <aside style={{
          width: 240, flexShrink: 0, background: C.sidebar, display: "flex", flexDirection: "column", height: "100%",
          position: "sticky", top: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff" }}>A</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>ArogyaSetu</div>
                <div style={{ fontSize: 10.5, color: C.sidebarText }}>Bridge — MH Health Mesh</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.35)", padding: "6px 10px 8px" }}>Clinical</div>
            {NAV_ITEMS.map(n => (
              <button key={n.id} onClick={() => navigateTo(n.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: activeTab === n.id ? C.primary : "transparent", color: activeTab === n.id ? "#fff" : C.sidebarText, fontFamily: "inherit", fontWeight: activeTab === n.id ? 700 : 500, fontSize: 13.5, cursor: "pointer", marginBottom: 2, transition: "all 0.15s", textAlign: "left" }}
                onMouseEnter={e => { if (activeTab !== n.id) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (activeTab !== n.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge && (
                  <span style={{ background: activeTab === n.id ? "rgba(255,255,255,0.25)" : C.danger, color: "#fff", borderRadius: 50, fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{n.badge}</span>
                )}
              </button>
            ))}

            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.35)", padding: "14px 10px 8px" }}>Admin</div>
            {[
              { id: "USERS", icon: "👥", label: "ASHA Management" },
              { id: "REPORTS", icon: "📄", label: "MIS Reports" },
              { id: "SETTINGS", icon: "⚙️", label: "Settings" },
            ].map(n => (
              <button key={n.id} onClick={() => alert(`Opening ${n.label}...`)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: C.sidebarText, fontFamily: "inherit", fontWeight: 500, fontSize: 13.5, cursor: "pointer", marginBottom: 2, transition: "all 0.15s", textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          {/* User Footer */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#fff" }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Dr. Anjali Deshmukh</div>
                <div style={{ fontSize: 10.5, color: C.sidebarText }}>MO • DHO Nandurbar</div>
              </div>
              <button onClick={() => { if (confirm("Logout?")) alert("Logging out..."); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 32, height: 32, color: C.sidebarText, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }} title="Logout">↩</button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Topbar */}
          <header style={{ background: C.card, borderBottom: `1px solid ${C.hairline}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0, zIndex: 10 }}>
            <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: C.ink }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.icon} {NAV_ITEMS.find(n => n.id === activeTab)?.label || "Dashboard"}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 13, color: C.inkMuted, fontWeight: 500 }}>
                {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • {time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>

              {/* Notification Bell */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowNotifications(v => !v)}
                  style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: C.card, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  🔔
                  {unreadCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 10, height: 10, background: C.danger, borderRadius: "50%", border: `2px solid ${C.card}` }} />}
                </button>
                {showNotifications && (
                  <div style={{ position: "absolute", right: 0, top: 50, width: 340, background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 100, animation: "slideIn 0.2s ease" }}>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>Notifications ({unreadCount} new)</div>
                      <button onClick={() => { setNotifications(n => n.map(x => ({ ...x, read: true }))); setShowNotifications(false); }} style={{ fontSize: 12, color: C.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Mark all read</button>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        style={{ padding: "12px 16px", borderBottom: `1px solid ${C.hairline}`, background: n.read ? "transparent" : C.primaryLighter, cursor: "pointer" }}>
                        <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.4 }}>{n.msg}</div>
                        <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.successBg, border: `1px solid ${C.success}30`, borderRadius: 50, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: C.success }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block", animation: "pulse 2s infinite" }} />
                LIVE
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: C.surface }}>
            {activeTab === "QUEUE"         && <QueueScreen onPatientSelect={p => { setSelectedPatient(p); }} setActiveTab={setActiveTab} />}
            {activeTab === "TELECONSULT"   && <TeleconsultScreen patient={selectedPatient} setActiveTab={setActiveTab} />}
            {activeTab === "PRESCRIPTION"  && <PrescriptionScreen patient={selectedPatient} />}
            {activeTab === "DHO_ANALYTICS" && <DhoAnalyticsScreen />}
            {activeTab === "PHARMACY"      && <PharmacyScreen />}
          </main>
        </div>
      </div>
    </>
  );
}
