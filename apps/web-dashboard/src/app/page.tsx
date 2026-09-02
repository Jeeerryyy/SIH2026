"use client";

import React, { useState, useEffect } from "react";
import { TriageUrgencyTier } from "@arogyasetu/shared-types";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────
const QUEUE_DATA = [
  {
    id: "pat-ndb-1001",
    tier: "AMBER",
    name: "Sunita Ramesh Padvi",
    age: 28,
    gender: "F",
    abhaId: "91-4521-8890-1123",
    facility: "Toranmal SC-HWC",
    district: "Nandurbar Tribal",
    vitals: { bp: "165/105", hr: 98, spo2: 96, hb: 8.2, fhr: 142 },
    flags: ["HRP", "Sickle Cell"],
    complaint: "Severe headache, visual blurring at 32 weeks gestation. Suspected Impending Pre-Eclampsia.",
    waitMin: 4,
    isHrp: true,
  },
  {
    id: "pat-gad-0044",
    tier: "RED",
    name: "Pooja Gavit",
    age: 22,
    gender: "F",
    abhaId: "91-8899-2233-4455",
    facility: "Bhamragad PHC",
    district: "Gadchiroli",
    vitals: { bp: "90/60", hr: 122, spo2: 86, hb: null, fhr: null },
    flags: ["Snakebite", "ASV-STAT"],
    complaint: "Ptosis, respiratory distress post viper bite 45 min ago. Neurotoxic envenomation.",
    waitMin: 1,
    isHrp: false,
  },
  {
    id: "pat-yav-0078",
    tier: "GREEN",
    name: "Ramu Somu Madavi",
    age: 54,
    gender: "M",
    abhaId: "91-7788-9900-3344",
    facility: "Bhamragad PHC",
    district: "Gadchiroli",
    vitals: { bp: "138/88", hr: 74, spo2: 98, hb: null, fhr: null },
    flags: ["HTN", "DM-2"],
    complaint: "Routine NCD Hypertension follow-up refill. Blood Sugar 142 mg/dL.",
    waitMin: 22,
    isHrp: false,
  },
  {
    id: "pat-ndb-1009",
    tier: "YELLOW",
    name: "Meena Bhagat",
    age: 34,
    gender: "F",
    abhaId: "91-3312-6677-9900",
    facility: "Dhadgaon SC",
    district: "Nandurbar",
    vitals: { bp: "140/92", hr: 88, spo2: 97, hb: 9.8, fhr: 135 },
    flags: ["HRP", "Anaemia"],
    complaint: "28-week ANC with Hb 9.8 g/dL. Requires iron supplementation protocol.",
    waitMin: 11,
    isHrp: true,
  },
];

const TIER_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  RED:    { label: "EMERGENCY RED",   className: "badge-red",    dot: "#C8372D" },
  AMBER:  { label: "URGENT AMBER",    className: "badge-amber",  dot: "#D97706" },
  YELLOW: { label: "WATCH YELLOW",    className: "badge-neutral", dot: "#7C7C18" },
  GREEN:  { label: "ROUTINE GREEN",   className: "badge-green",  dot: "#517C65" },
};

const ROW_CLASS: Record<string, string> = {
  RED: "row-red", AMBER: "row-amber", GREEN: "row-green", YELLOW: "",
};

const NAV_ITEMS = [
  { id: "QUEUE",        label: "Live OPD Queue",          icon: "🏥", badge: 4 },
  { id: "TELECONSULT",  label: "Video Teleconsult",        icon: "📹", badge: null },
  { id: "PRESCRIPTION", label: "NMC e-Prescription",       icon: "💊", badge: null },
  { id: "DHO_ANALYTICS",label: "DHO State Telemetry",      icon: "📊", badge: null },
  { id: "PHARMACY",     label: "e-Aushadhi Inventory",     icon: "🧪", badge: null },
];

const KPI_STATS = [
  { label: "Referral Completion",   value: "88.4%", sub: "Target >85%",        color: "green", icon: "✅", trend: "+47.4% vs baseline" },
  { label: "Mean Time To Care",     value: "3.2h",  sub: "Target <4h",          color: "green", icon: "⏱️", trend: "−34.8h vs baseline" },
  { label: "HRP Early Detection",   value: "92.1%", sub: "PMSMA Protocol",      color: "green", icon: "🤰", trend: "+58.1% vs baseline" },
  { label: "Drug Stockout Rate",    value: "2.1%",  sub: "Target <5%",          color: "blue",  icon: "💉", trend: "−28.9% vs baseline" },
  { label: "Active HRP Patients",   value: "281",   sub: "Across 36 Districts", color: "amber", icon: "👩‍⚕️", trend: "Real-time" },
  { label: "Snakebite Alerts",      value: "23",    sub: "Last 7 Days",         color: "red",   icon: "🐍", trend: "Monsoon Peak" },
  { label: "ASHA Incentives Paid",  value: "₹4.2L", sub: "This Month via PFMS", color: "green", icon: "💰", trend: "+22% MoM" },
  { label: "Teleconsults Today",    value: "148",   sub: "Completed",           color: "blue",  icon: "📱", trend: "94% satisfaction" },
];

const PHARMACY_DATA = [
  { name: "Polyvalent Anti-Snake Venom (ASV) Injection", batch: "SII-ASV-2026-X",   expiry: "Aug 2027", units: "1,200 Vials", priority: "PRIORITY 1", priorityClass: "badge-amber" },
  { name: "Labetalol 100mg Tablets",                     batch: "MSM-LAB-2026A",    expiry: "Mar 2027", units: "8,400 Tabs",  priority: "PRIORITY 2", priorityClass: "badge-amber" },
  { name: "Iron Sucrose 100mg/5ml IV",                   batch: "ZYD-IRN-2026B",    expiry: "May 2028", units: "640 Vials",   priority: "STANDARD",   priorityClass: "badge-green" },
  { name: "Paracetamol 500mg Tablets",                   batch: "MSM-PCM-2026A",    expiry: "Jan 2028", units: "50,000 Tabs", priority: "STANDARD",   priorityClass: "badge-green" },
  { name: "Hydroxyurea 500mg (Sickle Cell)",             batch: "CIP-HU-2026C",     expiry: "Oct 2027", units: "2,100 Caps",  priority: "SPECIALTY",  priorityClass: "badge-blue" },
];

const DISTRICT_DATA = [
  { district: "Nandurbar (Dhadgaon)",   hrp: 42, snakebite: 8,  sickleCrisis: 14, stockout: "100% ASV", alert: "HIGH MONSOON", alertClass: "badge-amber" },
  { district: "Gadchiroli (Bhamragad)", hrp: 29, snakebite: 12, sickleCrisis: 6,  stockout: "98% ASV",  alert: "HIGH FOREST",  alertClass: "badge-amber" },
  { district: "Yavatmal (Ralegaon)",    hrp: 19, snakebite: 3,  sickleCrisis: 2,  stockout: "99%",      alert: "NORMAL",       alertClass: "badge-green" },
  { district: "Amravati (Melghat)",     hrp: 31, snakebite: 5,  sickleCrisis: 9,  stockout: "100%",     alert: "WATCH",        alertClass: "badge-neutral" },
  { district: "Nashik (Peint)",         hrp: 15, snakebite: 1,  sickleCrisis: 3,  stockout: "100%",     alert: "NORMAL",       alertClass: "badge-green" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="7"  x2="19" y2="7" />
          <line x1="3" y1="12" x2="19" y2="12" />
          <line x1="3" y1="17" x2="19" y2="17" />
        </>
      )}
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="5 3 9 7 5 11" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"QUEUE" | "TELECONSULT" | "PRESCRIPTION" | "DHO_ANALYTICS" | "PHARMACY">("QUEUE");
  const [selectedPatient, setSelectedPatient] = useState(QUEUE_DATA[0]);
  const [inCall, setInCall] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [rxMedicines] = useState([
    { name: "Labetalol 100mg", freq: "1-0-1", duration: "7 Days", instructions: "After meals", stock: "In Stock (DDW Nandurbar)" },
    { name: "Iron Sucrose 100mg/5ml IV", freq: "Alternate Days", duration: "3 Doses", instructions: "Infusion under observation", stock: "In Stock (DDW Nandurbar)" },
    { name: "Calcium + Vit D3 Tablet", freq: "0-0-1", duration: "30 Days", instructions: "After dinner", stock: "In Stock (DDW Nandurbar)" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const currentNav = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="app-shell">

      {/* ── Sidebar Overlay (mobile) ── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">A</div>
          <div className="sidebar-logo-text">
            <div className="brand-name">ArogyaSetu Bridge</div>
            <div className="brand-sub">Maharashtra Health Mesh</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Clinical Operations</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${activeTab === item.id ? " active" : ""}`}
              onClick={() => navigateTo(item.id as typeof activeTab)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </button>
          ))}

          <div className="nav-section-label" style={{ marginTop: 16 }}>System</div>
          <button className="nav-item">
            <span className="nav-item-icon">⚙️</span>
            <span>Settings</span>
          </button>
          <button className="nav-item">
            <span className="nav-item-icon">📋</span>
            <span>Audit Logs</span>
          </button>
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">AD</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Dr. Anjali Deshmukh</div>
              <div className="sidebar-user-role">MD OBGYN • MMC-2012/04/1042</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">

        {/* ── Top Bar ── */}
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <HamburgerIcon open={sidebarOpen} />
          </button>

          <div>
            <div className="topbar-title">{currentNav?.label}</div>
            <div className="topbar-meta">{dateStr} • {timeStr}</div>
          </div>

          <div className="topbar-right">
            <div className="status-pill online">
              <span className="pulse-dot" />
              Live
            </div>
            <div className="status-pill" style={{ background: "#F0F6F3", color: "#517C65", border: "1px solid #BBD9CA", fontSize: "12px" }}>
              📶 Sync Active
            </div>
            {/* Notification bell */}
            <button className="btn btn-secondary btn-sm" style={{ padding: "0 12px" }}>
              🔔
            </button>
          </div>
        </header>

        {/* ── Page Body ── */}
        <main className="page-body">

          {/* ===== LIVE OPD QUEUE ===== */}
          {activeTab === "QUEUE" && (
            <div>
              {/* Page Header */}
              <div className="page-header">
                <div className="page-header-left">
                  <h1>Live OPD & Teleconsultation Queue</h1>
                  <p>Real-time 4-Tier CDSS Triage prioritization across Sub-Centres & PHCs</p>
                </div>
                <div className="page-header-actions">
                  <button className="btn btn-secondary btn-sm">🔍 Search Patient</button>
                  <button className="btn btn-secondary btn-sm">🗂 Filter by Taluka</button>
                  <button className="btn btn-primary btn-sm" onClick={() => navigateTo("TELECONSULT")}>
                    Start Priority Consult →
                  </button>
                </div>
              </div>

              {/* KPI Row */}
              <div className="kpi-grid mb-24">
                {KPI_STATS.slice(0, 4).map((k, i) => (
                  <div key={i} className={`kpi-card ${k.color}`}>
                    <div className="kpi-icon">{k.icon}</div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                    <div className={`kpi-trend up`}>↑ {k.trend}</div>
                  </div>
                ))}
              </div>

              {/* Queue Table */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Active Patient Queue</div>
                    <div className="card-subtitle">Sorted by clinical urgency tier — updates every 30 seconds</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="status-pill online">
                      <span className="pulse-dot" />
                      4 Patients Waiting
                    </div>
                  </div>
                </div>
                <div className="card-body no-pad">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Urgency Tier</th>
                          <th>Patient Details</th>
                          <th>Facility</th>
                          <th>Vitals & Red Flags</th>
                          <th>Chief Complaint</th>
                          <th>Wait</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {QUEUE_DATA.map(p => {
                          const tier = TIER_CONFIG[p.tier];
                          return (
                            <tr
                              key={p.id}
                              className={`row-clickable ${ROW_CLASS[p.tier] || ""}`}
                              onClick={() => { setSelectedPatient(p); navigateTo("TELECONSULT"); }}
                            >
                              <td>
                                <span className={`badge ${tier.className}`}>
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.dot, display: "inline-block" }} />
                                  {tier.label}
                                </span>
                              </td>
                              <td>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-small text-muted">
                                  {p.age}y {p.gender} • ABHA: {p.abhaId}
                                </div>
                                <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {p.flags.map(f => (
                                    <span key={f} className="badge badge-blue" style={{ fontSize: 10, padding: "2px 6px" }}>{f}</span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <div className="font-semibold">{p.facility}</div>
                                <div className="text-small text-muted">{p.district}</div>
                              </td>
                              <td>
                                <div className="vitals-hud">
                                  <div className={`vital-chip${p.vitals.bp && parseInt(p.vitals.bp) > 160 ? " text-danger" : ""}`}>
                                    BP <span>{p.vitals.bp} mmHg</span>
                                  </div>
                                  {p.vitals.spo2 && (
                                    <div className={`vital-chip${p.vitals.spo2 < 90 ? " text-danger" : ""}`}>
                                      SpO2 <span>{p.vitals.spo2}%</span>
                                    </div>
                                  )}
                                  {p.vitals.hb && (
                                    <div className={`vital-chip${p.vitals.hb < 10 ? " text-warning" : ""}`}>
                                      Hb <span>{p.vitals.hb}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td style={{ maxWidth: 260, fontSize: "13px" }}>
                                {p.complaint}
                              </td>
                              <td>
                                <div className="text-small font-semibold">{p.waitMin}m</div>
                              </td>
                              <td onClick={e => e.stopPropagation()}>
                                {p.tier === "RED" ? (
                                  <button className="btn btn-danger btn-xs">
                                    🚨 Emergency
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary btn-xs"
                                    onClick={() => { setSelectedPatient(p); navigateTo("TELECONSULT"); setInCall(true); }}
                                  >
                                    📹 Consult
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== VIDEO TELECONSULTATION ===== */}
          {activeTab === "TELECONSULT" && (
            <div>
              <div className="page-header">
                <div className="page-header-left">
                  <h1>Live Teleconsultation Hub</h1>
                  <p>WebRTC encrypted peer-to-peer stream with Toranmal Ayushman Arogya Mandir</p>
                </div>
                <div className="page-header-actions">
                  <span className="badge badge-green">✓ DPDP Consent Verified</span>
                  <button
                    className={`btn ${inCall ? "btn-danger" : "btn-primary"}`}
                    onClick={() => setInCall(v => !v)}
                  >
                    {inCall ? (
                      <><span className="live-dot" /> End Teleconsultation</>
                    ) : (
                      <> Connect Video Stream</>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid-2 mb-24" style={{ gridTemplateColumns: "2fr 1fr" }}>
                {/* Video Canvas */}
                <div>
                  <div className="video-canvas">
                    {inCall ? (
                      <>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 56, marginBottom: 12 }}>📹</div>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>Connected — Toranmal Sub-Centre</div>
                          <div style={{ fontSize: 13, color: "#A3A3A3", marginTop: 6 }}>WebRTC P2P 720p HD • Low-Latency Adaptive Bitrate</div>
                          <div style={{ marginTop: 14 }}>
                            <span className="badge badge-red" style={{ fontSize: 11 }}><span className="live-dot" /> LIVE</span>
                          </div>
                        </div>
                        <div className="video-controls">
                          <button className="btn btn-secondary btn-xs">🔇 Mute</button>
                          <button className="btn btn-secondary btn-xs">📷 Camera</button>
                        </div>
                        <div className="video-hud">
                          <div className="video-hud-item">BP: <span>165/105 mmHg</span></div>
                          <div className="video-hud-item">HR: <span>98 bpm</span></div>
                          <div className="video-hud-item">SpO2: <span>96%</span></div>
                          <div className="video-hud-item">Hb: <span>8.2 g/dL</span></div>
                          <div className="video-hud-item">FHR: <span>142 bpm</span></div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>Encrypted Channel Ready</div>
                        <div style={{ fontSize: 13, color: "#A3A3A3", marginTop: 6 }}>Click "Connect Video Stream" to begin</div>
                        <button
                          className="btn btn-primary"
                          style={{ marginTop: 20 }}
                          onClick={() => setInCall(true)}
                        >
                          Connect Video Stream
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Row */}
                  {inCall && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigateTo("PRESCRIPTION")}>
                        💊 Issue e-Prescription
                      </button>
                      <button className="btn btn-secondary btn-sm">
                        🚑 Request Ambulance 108
                      </button>
                      <button className="btn btn-secondary btn-sm">
                        📋 View Medical History
                      </button>
                      <button className="btn btn-secondary btn-sm">
                        🔬 Order Lab Test
                      </button>
                    </div>
                  )}
                </div>

                {/* Patient 360 Card */}
                <div className="card-alt" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div className="card-title" style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
                      Patient 360° Clinical Profile
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20 }}>
                      {selectedPatient.name[0]}
                    </div>
                    <div>
                      <div className="font-bold" style={{ fontSize: 15 }}>{selectedPatient.name}</div>
                      <div className="text-small text-muted">{selectedPatient.age}y {selectedPatient.gender === "F" ? "Female" : "Male"} • {selectedPatient.village ?? selectedPatient.district}</div>
                    </div>
                  </div>

                  <div className="divider" style={{ margin: "0" }} />

                  {[
                    { label: "ABHA ID",           value: selectedPatient.abhaId },
                    { label: "Facility",           value: selectedPatient.facility },
                    { label: "BP",                 value: `${selectedPatient.vitals.bp} mmHg`, highlight: parseInt(selectedPatient.vitals.bp?.split("/")[0] || "0") > 160 },
                    { label: "SpO2",               value: `${selectedPatient.vitals.spo2}%`, highlight: (selectedPatient.vitals.spo2 || 100) < 90 },
                    { label: "Haemoglobin",        value: selectedPatient.vitals.hb ? `${selectedPatient.vitals.hb} g/dL` : "N/A", highlight: (selectedPatient.vitals.hb || 12) < 10 },
                    { label: "Foetal HR",          value: selectedPatient.vitals.fhr ? `${selectedPatient.vitals.fhr} bpm` : "N/A" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="text-small text-muted">{row.label}</span>
                      <span className={`text-small font-semibold${row.highlight ? " text-danger" : ""}`}>{row.value}</span>
                    </div>
                  ))}

                  <div className="divider" style={{ margin: "0" }} />

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedPatient.flags.map(f => (
                      <span key={f} className="badge badge-red">{f}</span>
                    ))}
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "auto" }}
                    onClick={() => navigateTo("PRESCRIPTION")}
                  >
                    Issue NMC e-Prescription →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== e-PRESCRIPTION ===== */}
          {activeTab === "PRESCRIPTION" && (
            <div>
              <div className="page-header">
                <div className="page-header-left">
                  <h1>NMC Appendix 2 — e-Prescription Generator</h1>
                  <p>Standardised generic drug prescribing with FEFO pharmacy allocation & digital signature</p>
                </div>
                <div className="page-header-actions">
                  <button className="btn btn-secondary btn-sm">🖨 Print Rx</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => alert("NMC e-Prescription digitally signed & synced to Toranmal dispensary. ₹250 ASHA incentive auto-credited.")}
                  >
                    ✍️ Digitally Sign & Issue
                  </button>
                </div>
              </div>

              {/* Prescription Card */}
              <div className="card mb-20">
                <div className="card-header" style={{ background: "var(--primary-lighter)" }}>
                  <div>
                    <div className="card-title">🏥 Government of Maharashtra — ArogyaSetu Bridge</div>
                    <div className="card-subtitle">NMC Appendix 2 Compliant Prescription • Referral ID: MH-NDB-2026-RX-1001</div>
                  </div>
                  <span className="badge badge-green">✓ FEFO Verified</span>
                </div>
                <div className="card-body">
                  {/* Patient + Doctor row */}
                  <div className="grid-2 mb-20">
                    <div className="form-group">
                      <label className="form-label">Patient Name & ABHA ID</label>
                      <input className="form-input" readOnly value={`${selectedPatient.name} (${selectedPatient.abhaId})`} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prescribing Doctor</label>
                      <input className="form-input" readOnly value="Dr. Anjali Deshmukh (MMC-2012/04/1042)" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diagnosis</label>
                      <input className="form-input" readOnly value="Impending Pre-Eclampsia (O14.9) + Sickle Cell Trait (D57.3)" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date & Facility</label>
                      <input className="form-input" readOnly value={`${dateStr} • Toranmal Sub-Centre HWC`} />
                    </div>
                  </div>

                  {/* Medicines Table */}
                  <div className="card-title mb-12">💊 Prescribed Generic Formulations</div>
                  <div className="table-wrap mb-20">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Generic Medicine Name</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                          <th>FEFO Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rxMedicines.map((m, i) => (
                          <tr key={i}>
                            <td className="text-muted">{i + 1}</td>
                            <td className="font-semibold">{m.name}</td>
                            <td>{m.freq}</td>
                            <td>{m.duration}</td>
                            <td className="text-muted">{m.instructions}</td>
                            <td><span className="badge badge-green">✓ {m.stock}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div className="text-small text-muted">
                      Digital Signature Hash: <code>SHA256-MMC-2026-DESHMUKH-884912</code>
                    </div>
                    <span className="badge badge-green">₹250 ASHA Incentive Auto-Credits on Signing</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== DHO STATE TELEMETRY ===== */}
          {activeTab === "DHO_ANALYTICS" && (
            <div>
              <div className="page-header">
                <div className="page-header-left">
                  <h1>DHO State Telemetry Dashboard</h1>
                  <p>Live M&E KPIs across Maharashtra 36 Districts & Tribal Belts</p>
                </div>
                <div className="page-header-actions">
                  <button className="btn btn-secondary btn-sm">📥 Export Report</button>
                  <button className="btn btn-secondary btn-sm">🗺 District Map View</button>
                </div>
              </div>

              {/* Full KPI Grid */}
              <div className="kpi-grid mb-24">
                {KPI_STATS.map((k, i) => (
                  <div key={i} className={`kpi-card ${k.color}`}>
                    <div className="kpi-icon">{k.icon}</div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                    <div className="kpi-trend up">↑ {k.trend}</div>
                  </div>
                ))}
              </div>

              {/* District Heatmap Table */}
              <div className="card mb-20">
                <div className="card-header">
                  <div>
                    <div className="card-title">District Epidemiological Surveillance Heatmap</div>
                    <div className="card-subtitle">Real-time monitoring across high-burden tribal & rural districts</div>
                  </div>
                  <div className="status-pill online"><span className="pulse-dot" />Live Sync</div>
                </div>
                <div className="card-body no-pad">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>District & Taluka</th>
                          <th>Active HRP Pregnancies</th>
                          <th>Snakebite Alerts (7d)</th>
                          <th>Sickle Cell Crises</th>
                          <th>Stockout Status</th>
                          <th>Surveillance Alert</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DISTRICT_DATA.map((d, i) => (
                          <tr key={i}>
                            <td className="font-semibold">{d.district}</td>
                            <td>
                              <span className="font-semibold">{d.hrp}</span>
                              <span className="text-muted text-small"> active</span>
                            </td>
                            <td className={d.snakebite > 8 ? "text-danger font-semibold" : ""}>
                              {d.snakebite} cases
                            </td>
                            <td>{d.sickleCrisis} patients</td>
                            <td className="text-success">{d.stockout}</td>
                            <td>
                              <span className={`badge ${d.alertClass}`}>{d.alert}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Two column: ASHA performance + alerts */}
              <div className="grid-2">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">🏆 Top ASHA Performers — This Month</div>
                  </div>
                  <div className="card-body">
                    {[
                      { name: "Savita Pawar", village: "Toranmal, Nandurbar",   earned: "₹1,850", cases: 7 },
                      { name: "Rekha Gavit",  village: "Bhamragad, Gadchiroli", earned: "₹1,600", cases: 6 },
                      { name: "Durga Meshram",village: "Chimur, Chandrapur",    earned: "₹1,350", cases: 5 },
                    ].map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--hairline)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--primary-active)", fontSize: 13 }}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-small">{a.name}</div>
                            <div className="text-small text-muted">{a.village}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="font-bold" style={{ color: "var(--primary-active)" }}>{a.earned}</div>
                          <div className="text-small text-muted">{a.cases} HRP cases</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <div className="card-title">🚨 Active Outbreak Alerts</div>
                  </div>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { type: "Monsoon Snakebite Surge",      location: "Nandurbar & Gadchiroli",  tier: "HIGH",   tierClass: "badge-red" },
                      { type: "Malaria Vector Density",        location: "Melghat, Amravati",       tier: "WATCH",  tierClass: "badge-amber" },
                      { type: "Sickle Cell Crisis Cluster",   location: "Dhadgaon Taluka",          tier: "MONITOR",tierClass: "badge-neutral" },
                    ].map((a, i) => (
                      <div key={i} className="card-alt" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                        <div>
                          <div className="font-semibold text-small">{a.type}</div>
                          <div className="text-small text-muted">{a.location}</div>
                        </div>
                        <span className={`badge ${a.tierClass}`}>{a.tier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PHARMACY INVENTORY ===== */}
          {activeTab === "PHARMACY" && (
            <div>
              <div className="page-header">
                <div className="page-header-left">
                  <h1>e-Aushadhi DVDMS Warehouse & FEFO Inventory</h1>
                  <p>First-Expired, First-Out batch management with automated re-order indents</p>
                </div>
                <div className="page-header-actions">
                  <button className="btn btn-secondary btn-sm">📥 Export FEFO Report</button>
                  <button className="btn btn-primary btn-sm">+ New Indent</button>
                </div>
              </div>

              {/* Stock KPIs */}
              <div className="kpi-grid mb-24" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {[
                  { label: "Total SKUs Tracked",  value: "284",  color: "blue",  icon: "📦" },
                  { label: "Stockout SKUs",        value: "6",    color: "red",   icon: "❌" },
                  { label: "Expiring in 6 Months", value: "18",   color: "amber", icon: "⏰" },
                  { label: "Pending Indents",      value: "11",   color: "green", icon: "📋" },
                ].map((k, i) => (
                  <div key={i} className={`kpi-card ${k.color}`}>
                    <div className="kpi-icon">{k.icon}</div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.value}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">FEFO Priority Batch Ledger</div>
                    <div className="card-subtitle">District Drug Warehouse (DDW) Nandurbar — Live Stock Position</div>
                  </div>
                  <span className="badge badge-green">✓ FEFO Algorithm Active</span>
                </div>
                <div className="card-body no-pad">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Medicine Formulation</th>
                          <th>Batch Number</th>
                          <th>Expiry Date</th>
                          <th>Available Units</th>
                          <th>FEFO Priority</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PHARMACY_DATA.map((d, i) => (
                          <tr key={i}>
                            <td className="font-semibold">{d.name}</td>
                            <td><code>{d.batch}</code></td>
                            <td className={d.expiry.includes("2027") ? "text-warning font-semibold" : ""}>{d.expiry}</td>
                            <td>{d.units}</td>
                            <td><span className={`badge ${d.priorityClass}`}>{d.priority}</span></td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn-primary btn-xs">Indent</button>
                                <button className="btn btn-secondary btn-xs">Batches</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
