"use client";

import React, { useState } from "react";
import { TriageUrgencyTier } from "@arogyasetu/shared-types";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"QUEUE" | "TELECONSULT" | "PRESCRIPTION" | "DHO_ANALYTICS" | "PHARMACY">("QUEUE");
  const [selectedPatient, setSelectedPatient] = useState<any>({
    id: "pat-ndb-1001",
    name: "Sunita Ramesh Padvi",
    age: 28,
    gender: "Female",
    abhaId: "91-4521-8890-1123",
    village: "Toranmal, Dhadgaon (Nandurbar)",
    isHrp: true,
    isSickleCell: true,
    vitals: { bp: "165/105", hr: 98, spo2: 96, hb: 8.2, fhr: 142 },
    tier: TriageUrgencyTier.URGENT_AMBER,
    chiefComplaint: "Severe headache, visual blurring at 32 weeks gestation. Suspected Impending Pre-Eclampsia."
  });

  const [inCall, setInCall] = useState(false);
  const [rxMedicines, setRxMedicines] = useState([
    { name: "Labetalol 100mg", freq: "1-0-1", duration: "7 Days", instructions: "After meals" },
    { name: "Iron Sucrose 100mg/5ml IV", freq: "Alternate Days", duration: "3 Doses", instructions: "Infusion under observation" }
  ]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", color: "#2D2D2E" }}>
      {/* Top Navigation Bar with Hireavilla Sage Green Accent */}
      <header
        style={{
          borderBottom: "1px solid #D6D6D6",
          padding: "0 32px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9999px",
              backgroundColor: "#75A68C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "18px"
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "17px", letterSpacing: "-0.2px" }}>
              ArogyaSetu Bridge
            </div>
            <div style={{ fontSize: "12px", color: "#737373" }}>
              Government of Maharashtra • Provider Command Center
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: "flex", gap: "6px" }}>
          {[
            { id: "QUEUE", label: "Live OPD Queue" },
            { id: "TELECONSULT", label: "Video Teleconsultation" },
            { id: "PRESCRIPTION", label: "NMC e-Prescription" },
            { id: "DHO_ANALYTICS", label: "DHO State Telemetry" },
            { id: "PHARMACY", label: "e-Aushadhi FEFO Stock" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                border: "none",
                backgroundColor: activeTab === tab.id ? "#E3EDE8" : "transparent",
                color: activeTab === tab.id ? "#2D2D2E" : "#737373",
                fontWeight: activeTab === tab.id ? 600 : 400,
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 180ms ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Doctor Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              backgroundColor: "#E3EDE8",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#517C65"
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#75A68C" }}></span>
            Dr. Anjali Deshmukh (MD OBGYN)
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "QUEUE" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
              <div>
                <h1 className="serif-heading">Live OPD & Teleconsultation Queue</h1>
                <div style={{ color: "#737373", fontSize: "14px" }}>
                  Real-time 4-Tier Clinical Decision Support (CDSS) prioritization across Sub-Centres & PHCs
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-pill btn-pill-secondary">Filter by Taluka</button>
                <button className="btn-pill" onClick={() => setActiveTab("TELECONSULT")}>
                  Start Priority Consult →
                </button>
              </div>
            </div>

            {/* Queue Data Table */}
            <div className="table-container hireavilla-card" style={{ padding: 0 }}>
              <table className="hireavilla-table">
                <thead>
                  <tr>
                    <th>Urgency Tier</th>
                    <th>Patient Details</th>
                    <th>Sub-Centre Facility</th>
                    <th>Vitals & Red Flags</th>
                    <th>Chief Complaint</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: "#FEF9C3" }}>
                    <td>
                      <span
                        style={{
                          backgroundColor: "#D97706",
                          color: "#FFFFFF",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        URGENT AMBER
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>ABHA: {selectedPatient.abhaId}</div>
                    </td>
                    <td>
                      <div>Toranmal SC-HWC</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>Nandurbar Tribal District</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#C8372D" }}>BP: 165/105 mmHg</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>Hb: 8.2 g/dL • FHR: 142 bpm</div>
                    </td>
                    <td style={{ maxWidth: "280px" }}>{selectedPatient.chiefComplaint}</td>
                    <td>
                      <button
                        className="btn-pill"
                        style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}
                        onClick={() => {
                          setActiveTab("TELECONSULT");
                          setInCall(true);
                        }}
                      >
                        Accept Call
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span
                        style={{
                          backgroundColor: "#C8372D",
                          color: "#FFFFFF",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        EMERGENCY RED
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>Pooja Gavit (Age 22)</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>ABHA: 91-8899-2233-4455</div>
                    </td>
                    <td>
                      <div>Bhamragad PHC</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>Gadchiroli</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#C8372D" }}>SpO2: 86% • ASV Alert</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>Snakebite Envenomation</div>
                    </td>
                    <td style={{ maxWidth: "280px" }}>Ptosis, respiratory distress post viper bite 45 min ago.</td>
                    <td>
                      <button
                        className="btn-pill"
                        style={{ height: "36px", padding: "0 16px", fontSize: "13px", backgroundColor: "#C8372D" }}
                      >
                        Emergency 108
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span
                        style={{
                          backgroundColor: "#517C65",
                          color: "#FFFFFF",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        ROUTINE GREEN
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>Ramu Somu Madavi</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>ABHA: 91-7788-9900-3344</div>
                    </td>
                    <td>
                      <div>Bhamragad PHC</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>Gadchiroli</div>
                    </td>
                    <td>
                      <div>BP: 138/88 mmHg</div>
                      <div style={{ fontSize: "12px", color: "#737373" }}>Blood Sugar: 142 mg/dL</div>
                    </td>
                    <td style={{ maxWidth: "280px" }}>Routine NCD Hypertension follow-up refill.</td>
                    <td>
                      <button
                        className="btn-pill btn-pill-secondary"
                        style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}
                        onClick={() => setActiveTab("PRESCRIPTION")}
                      >
                        Refill Rx
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Video Teleconsultation View */}
        {activeTab === "TELECONSULT" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h1 className="serif-heading">Live Teleconsultation Hub</h1>
                <div style={{ color: "#737373", fontSize: "14px" }}>
                  Direct WebRTC encrypted stream with Toranmal Ayushman Arogya Mandir (CHO Snehal Gaikwad & Patient Sunita Padvi)
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span
                  style={{
                    backgroundColor: "#E3EDE8",
                    color: "#517C65",
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    fontSize: "13px",
                    fontWeight: 600
                  }}
                >
                  ✓ DPDP Act Audio Consent Verified
                </span>
                <button
                  className="btn-pill"
                  onClick={() => setInCall(!inCall)}
                  style={{ backgroundColor: inCall ? "#C8372D" : "#75A68C" }}
                >
                  {inCall ? "End Teleconsultation" : "Connect Video Stream"}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              {/* Video Player Canvas */}
              <div
                style={{
                  backgroundColor: "#2D2D2E",
                  height: "440px",
                  borderRadius: "0px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF"
                }}
              >
                {inCall ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "64px", marginBottom: "16px" }}>📹</div>
                    <div style={{ fontSize: "18px", fontWeight: 600 }}>Connected to Toranmal Sub-Centre Stream</div>
                    <div style={{ fontSize: "13px", color: "#D6D6D6" }}>WebRTC Peer-to-Peer 720p HD (Low-Latency Adaptive Bitrate)</div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
                    <div>Click "Connect Video Stream" to start teleconsultation</div>
                  </div>
                )}

                {/* Vitals Overlay HUD */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    right: "16px",
                    backgroundColor: "rgba(45, 45, 46, 0.85)",
                    backdropFilter: "blur(10px)",
                    padding: "12px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px"
                  }}
                >
                  <div>
                    <span style={{ color: "#75A68C", fontWeight: 600 }}>BP:</span> 165/105 mmHg
                  </div>
                  <div>
                    <span style={{ color: "#75A68C", fontWeight: 600 }}>Heart Rate:</span> 98 bpm
                  </div>
                  <div>
                    <span style={{ color: "#75A68C", fontWeight: 600 }}>SpO2:</span> 96%
                  </div>
                  <div>
                    <span style={{ color: "#75A68C", fontWeight: 600 }}>Hb:</span> 8.2 g/dL
                  </div>
                  <div>
                    <span style={{ color: "#75A68C", fontWeight: 600 }}>FHR:</span> 142 bpm
                  </div>
                </div>
              </div>

              {/* Patient 360 Longitudinal Card */}
              <div className="hireavilla-card-alt">
                <h3 className="serif-heading">Patient 360° Clinical Profile</h3>
                <div style={{ fontSize: "14px", marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <strong>Full Name:</strong> {selectedPatient.name}
                  </div>
                  <div>
                    <strong>ABHA ID:</strong> {selectedPatient.abhaId}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedPatient.village}
                  </div>
                  <div>
                    <strong>Risk Category:</strong>{" "}
                    <span style={{ color: "#D97706", fontWeight: 600 }}>High-Risk Pregnancy (32 Weeks)</span>
                  </div>
                  <div>
                    <strong>Genetic Profile:</strong>{" "}
                    <span style={{ color: "#C8372D", fontWeight: 600 }}>Sickle Cell Trait (HbAS)</span>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <button
                      className="btn-pill"
                      style={{ width: "100%" }}
                      onClick={() => setActiveTab("PRESCRIPTION")}
                    >
                      Issue NMC e-Prescription →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NMC e-Prescription Generator */}
        {activeTab === "PRESCRIPTION" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 className="serif-heading">NMC Appendix 2 Compliant e-Prescription Generator</h1>
              <div style={{ color: "#737373", fontSize: "14px" }}>
                Standardized Generic Drug Prescribing with FEFO Pharmacy Inventory Allocation & Digital Signature
              </div>
            </div>

            <div className="hireavilla-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Patient Name & ABHA ID</label>
                  <input className="hireavilla-input" readOnly value={`${selectedPatient.name} (${selectedPatient.abhaId})`} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Doctor Registration Number</label>
                  <input className="hireavilla-input" readOnly value="Dr. Anjali Deshmukh (MMC-2012/04/1042)" />
                </div>
              </div>

              <h3 className="serif-heading" style={{ fontSize: "18px", marginBottom: "12px" }}>
                Prescribed Generic Formulations (FEFO Verified)
              </h3>
              <div className="table-container" style={{ marginBottom: "20px" }}>
                <table className="hireavilla-table">
                  <thead>
                    <tr>
                      <th>Generic Medicine Name</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rxMedicines.map((med, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{med.name}</td>
                        <td>{med.freq}</td>
                        <td>{med.duration}</td>
                        <td>{med.instructions}</td>
                        <td>
                          <span style={{ color: "#517C65", fontWeight: 600 }}>✓ In Stock (DDW Nandurbar)</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "12px", color: "#737373" }}>
                  Digital Signature Hash: <code>SHA256-MMC-2026-DESHMUKH-884912</code>
                </div>
                <button
                  className="btn-pill"
                  onClick={() => alert("NMC e-Prescription Digitally Signed and Synced to Toranmal Sub-Centre Dispensary!")}
                >
                  Digitally Sign & Issue e-Prescription (₹250 ASHA Incentive Auto-Credited)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DHO State Telemetry View */}
        {activeTab === "DHO_ANALYTICS" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 className="serif-heading">District Health Officer (DHO) State Telemetry</h1>
              <div style={{ color: "#737373", fontSize: "14px" }}>
                Live Monitoring & Evaluation (M&E) KPIs across Maharashtra 36 Districts & Tribal Belts
              </div>
            </div>

            {/* 7 KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
              <div className="hireavilla-card-alt">
                <div style={{ fontSize: "12px", color: "#737373", fontWeight: 600 }}>REFERRAL COMPLETION RATE</div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#517C65", margin: "6px 0" }}>88.4%</div>
                <div style={{ fontSize: "12px", color: "#737373" }}>Target >85% (Baseline 41%)</div>
              </div>
              <div className="hireavilla-card-alt">
                <div style={{ fontSize: "12px", color: "#737373", fontWeight: 600 }}>MEAN TIME TO CARE</div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#517C65", margin: "6px 0" }}>3.2 hrs</div>
                <div style={{ fontSize: "12px", color: "#737373" }}>Target &lt;4 hrs (Baseline 38h)</div>
              </div>
              <div className="hireavilla-card-alt">
                <div style={{ fontSize: "12px", color: "#737373", fontWeight: 600 }}>HRP EARLY DETECTION</div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#517C65", margin: "6px 0" }}>92.1%</div>
                <div style={{ fontSize: "12px", color: "#737373" }}>PMSMA Protocol (Baseline 34%)</div>
              </div>
              <div className="hireavilla-card-alt">
                <div style={{ fontSize: "12px", color: "#737373", fontWeight: 600 }}>IPHS DRUG STOCKOUTS</div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#517C65", margin: "6px 0" }}>2.1%</div>
                <div style={{ fontSize: "12px", color: "#737373" }}>Target &lt;5% (Baseline 31%)</div>
              </div>
            </div>

            {/* Epidemiological Heatmap */}
            <div className="hireavilla-card">
              <h3 className="serif-heading" style={{ marginBottom: "16px" }}>
                District Epidemiological Surveillance Heatmap
              </h3>
              <div className="table-container">
                <table className="hireavilla-table">
                  <thead>
                    <tr>
                      <th>District & Taluka</th>
                      <th>Active HRP Pregnancies</th>
                      <th>Snakebite Alerts (7 Days)</th>
                      <th>Sickle Cell Crises</th>
                      <th>Stockout Status</th>
                      <th>Surveillance Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Nandurbar (Dhadgaon)</td>
                      <td>42 Active</td>
                      <td style={{ color: "#C8372D", fontWeight: 600 }}>8 Cases (Viper Peak)</td>
                      <td>14 Patients</td>
                      <td>100% ASV Ready</td>
                      <td>
                        <span style={{ backgroundColor: "#FEF9C3", color: "#D97706", padding: "4px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>
                          HIGH MONSOON ALERT
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Gadchiroli (Bhamragad)</td>
                      <td>29 Active</td>
                      <td style={{ color: "#C8372D", fontWeight: 600 }}>12 Cases</td>
                      <td>6 Patients</td>
                      <td>98% ASV Ready</td>
                      <td>
                        <span style={{ backgroundColor: "#FEF9C3", color: "#D97706", padding: "4px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>
                          HIGH FOREST ALERT
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Yavatmal (Ralegaon)</td>
                      <td>19 Active</td>
                      <td>3 Cases</td>
                      <td>2 Patients</td>
                      <td>99% Stocked</td>
                      <td>
                        <span style={{ backgroundColor: "#E3EDE8", color: "#517C65", padding: "4px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>
                          NORMAL
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pharmacy & FEFO Stock */}
        {activeTab === "PHARMACY" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 className="serif-heading">e-Aushadhi DVDMS Warehouse & FEFO Inventory</h1>
              <div style={{ color: "#737373", fontSize: "14px" }}>
                First-Expired, First-Out Batch Management with Automated Re-order Indents
              </div>
            </div>

            <div className="hireavilla-card">
              <table className="hireavilla-table">
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
                  <tr>
                    <td style={{ fontWeight: 600 }}>Polyvalent Anti-Snake Venom (ASV) Injection</td>
                    <td>SII-ASV-2026-X</td>
                    <td style={{ color: "#D97706", fontWeight: 600 }}>August 2027 (11 Months)</td>
                    <td>1,200 Vials</td>
                    <td>
                      <span style={{ backgroundColor: "#FEF9C3", color: "#D97706", padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>
                        PRIORITY 1 DISPENSE
                      </span>
                    </td>
                    <td>
                      <button className="btn-pill" style={{ height: "34px", padding: "0 14px", fontSize: "12px" }}>
                        Indent Restock
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Paracetamol 500mg Tablets</td>
                    <td>MSM-PCM-2026A</td>
                    <td>January 2028</td>
                    <td>50,000 Tablets</td>
                    <td>
                      <span style={{ backgroundColor: "#E3EDE8", color: "#517C65", padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>
                        STANDARD
                      </span>
                    </td>
                    <td>
                      <button className="btn-pill btn-pill-secondary" style={{ height: "34px", padding: "0 14px", fontSize: "12px" }}>
                        View Batches
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
