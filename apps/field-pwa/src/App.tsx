import React, { useState } from "react";
import { TriageUrgencyTier, AshaIncentiveType, AshaIncentiveStatus } from "@arogyasetu/shared-types";
import { CdssEngine } from "@arogyasetu/triage-engine";

export default function App() {
  const [lang, setLang] = useState<"mr" | "gondi" | "en">("mr");
  const [activeTab, setActiveTab] = useState<"HOME" | "ANC" | "CBAC" | "INCENTIVES">("HOME");

  // Form states for ANC screening
  const [patientName, setPatientName] = useState("सुनीता रमेश पाडवी");
  const [sbp, setSbp] = useState("165");
  const [dbp, setDbp] = useState("105");
  const [hb, setHb] = useState("8.2");
  const [fhr, setFhr] = useState("142");
  const [symptoms, setSymptoms] = useState<string[]>(["डोकेदुखी (Severe Headache)", "अंधुक दिसणे (Blurred Vision)"]);
  const [triageOutput, setTriageOutput] = useState<any>(null);

  // Live ASHA Incentive Ledger Balance
  const [earnedInr, setEarnedInr] = useState(1450);
  const [incentiveVouchers, setIncentiveVouchers] = useState([
    {
      id: "MH-NDB-2026-0089",
      activity: "High-Risk Pregnancy Early Detection (HRP)",
      patient: "Sunita Padvi",
      amount: 250,
      status: "APPROVED_BY_MO",
      date: "30 Aug 2026"
    },
    {
      id: "MH-NDB-2026-0045",
      activity: "JSY Institutional Delivery Accompaniment",
      patient: "Rukmini Gavit",
      amount: 300,
      status: "DISBURSED (PFMS)",
      date: "25 Aug 2026"
    },
    {
      id: "MH-NDB-2026-0032",
      activity: "CBAC NCD Community Screening (5 Patients)",
      patient: "Village Cluster 3",
      amount: 50,
      status: "DISBURSED (PFMS)",
      date: "20 Aug 2026"
    }
  ]);

  const handleEvaluateTriage = () => {
    const result = CdssEngine.evaluate({
      patient: { fullName: patientName, gender: "FEMALE" },
      vitals: {
        systolicBp: parseInt(sbp) || 120,
        diastolicBp: parseInt(dbp) || 80,
        hemoglobinGPerDl: parseFloat(hb) || 11.0,
        fetalHeartRateBpm: parseInt(fhr) || 140
      },
      symptoms,
      isPregnant: true,
      gestationalWeeks: 32
    });

    setTriageOutput(result);

    // Auto-credit ₹250 HRP incentive to ledger
    setEarnedInr(prev => prev + 250);
    setIncentiveVouchers(prev => [
      {
        id: `MH-NDB-2026-${Math.floor(Math.random() * 8999 + 1000)}`,
        activity: "High-Risk Pregnancy Identification (Auto-Claim)",
        patient: patientName,
        amount: 250,
        status: "RECORDED",
        date: "Today"
      },
      ...prev
    ]);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      {/* App Header */}
      <header
        style={{
          backgroundColor: "#75A68C",
          color: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.2px" }}>
            {lang === "mr" ? "आरोग्यसेतू ब्रिज" : lang === "gondi" ? "आरोग्यसेतू गोंडी" : "ArogyaSetu Bridge"}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>
            {lang === "mr" ? "आशा / एएनएम फील्ड ॲप • तोरणमाळ उपकेंद्र" : "ASHA / ANM Field App • Toranmal SC"}
          </div>
        </div>

        {/* Offline Indicator & Lang Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "4px 8px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 600
            }}
          >
            ⚡ 100% Offline Ready
          </span>
          <select
            value={lang}
            onChange={e => setLang(e.target.value as any)}
            style={{
              backgroundColor: "#FFFFFF",
              color: "#2D2D2E",
              border: "none",
              borderRadius: "9999px",
              padding: "4px 8px",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            <option value="mr">मराठी</option>
            <option value="gondi">गोंडी</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
        {/* Welcome ASHA Card */}
        <div
          style={{
            backgroundColor: "#E3EDE8",
            border: "1px solid #D6D6D6",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>कविता पाडवी (आशा स्वयंसेविका)</div>
            <div style={{ fontSize: "12px", color: "#737373" }}>तोरणमाळ, धडगाव (नंदुरबार)</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#737373", textTransform: "uppercase" }}>एकूण मानधन</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#517C65" }}>₹{earnedInr}</div>
          </div>
        </div>

        {/* Voice Input Prompt */}
        <div
          style={{
            border: "1px dashed #75A68C",
            backgroundColor: "#F9FBFA",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer"
          }}
          onClick={() => alert("मराठी / गोंडी आवाज ओळख सक्रिय: 'सुनीता पाडवी यांचे बीपी १६५/१०५ नोंदवले.'")}
        >
          <div style={{ fontSize: "24px" }}>🎙️</div>
          <div style={{ fontSize: "13px", color: "#517C65", fontWeight: 500 }}>
            {lang === "mr" ? "आवाज सहाय्यक (Voice): बोला व नोंदी थेट भरा..." : "Voice Assistant: Speak to autofill..."}
          </div>
        </div>

        {/* Action Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("ANC")}
            style={{
              padding: "14px",
              backgroundColor: activeTab === "ANC" ? "#75A68C" : "#FFFFFF",
              color: activeTab === "ANC" ? "#FFFFFF" : "#2D2D2E",
              border: "1px solid #D6D6D6",
              borderRadius: "0px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            🤰 मातृ सुरक्षा (ANC / HRP)
          </button>
          <button
            onClick={() => setActiveTab("INCENTIVES")}
            style={{
              padding: "14px",
              backgroundColor: activeTab === "INCENTIVES" ? "#75A68C" : "#FFFFFF",
              color: activeTab === "INCENTIVES" ? "#FFFFFF" : "#2D2D2E",
              border: "1px solid #D6D6D6",
              borderRadius: "0px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            💰 माझे मानधन (Incentives)
          </button>
        </div>

        {/* ANC / HRP Screening View */}
        {activeTab === "ANC" && (
          <div>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "12px" }}>
              {lang === "mr" ? "गरोदर माता तपासणी (ANC Danger Sign Assessment)" : "Maternal Health Screening"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#737373" }}>मातेचे नाव (Patient Name)</label>
                <input
                  style={{ width: "100%", height: "42px", border: "1px solid #D6D6D6", padding: "0 12px", fontSize: "14px", marginTop: "4px" }}
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#737373" }}>सिस्टॉलिक बीपी (SBP mmHg)</label>
                  <input
                    style={{ width: "100%", height: "42px", border: "1px solid #D6D6D6", padding: "0 12px", fontSize: "14px", marginTop: "4px" }}
                    value={sbp}
                    onChange={e => setSbp(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#737373" }}>डायस्टॉलिक बीपी (DBP mmHg)</label>
                  <input
                    style={{ width: "100%", height: "42px", border: "1px solid #D6D6D6", padding: "0 12px", fontSize: "14px", marginTop: "4px" }}
                    value={dbp}
                    onChange={e => setDbp(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#737373" }}>हिमोग्लोबिन (Hb g/dL)</label>
                  <input
                    style={{ width: "100%", height: "42px", border: "1px solid #D6D6D6", padding: "0 12px", fontSize: "14px", marginTop: "4px" }}
                    value={hb}
                    onChange={e => setHb(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#737373" }}>गर्भ ठोके (FHR bpm)</label>
                  <input
                    style={{ width: "100%", height: "42px", border: "1px solid #D6D6D6", padding: "0 12px", fontSize: "14px", marginTop: "4px" }}
                    value={fhr}
                    onChange={e => setFhr(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleEvaluateTriage}
                style={{
                  height: "46px",
                  backgroundColor: "#75A68C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "9999px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "8px"
                }}
              >
                {lang === "mr" ? "४-स्तरीय तात्काळ ट्रायज तपासा (Evaluate CDSS) →" : "Evaluate 4-Tier Triage →"}
              </button>
            </div>

            {/* Triage Output Alert Card */}
            {triageOutput && (
              <div
                style={{
                  backgroundColor: triageOutput.urgencyTier === "EMERGENCY_RED" ? "#FDF2F2" : "#FEF9C3",
                  border: `1.5px solid ${triageOutput.urgencyTier === "EMERGENCY_RED" ? "#C8372D" : "#D97706"}`,
                  padding: "16px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span
                    style={{
                      backgroundColor: triageOutput.urgencyTier === "EMERGENCY_RED" ? "#C8372D" : "#D97706",
                      color: "#FFFFFF",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 700
                    }}
                  >
                    {triageOutput.urgencyTier} (स्कोर: {triageOutput.urgencyScore}/100)
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#517C65" }}>✓ ₹२५० मानधन जमा</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: "14px", color: "#2D2D2E", marginBottom: "6px" }}>
                  {triageOutput.primaryAlert}
                </div>

                <div style={{ fontSize: "13px", color: "#2D2D2E", lineHeight: 1.4 }}>
                  <strong>शिफारस:</strong> {triageOutput.recommendedAction}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASHA Incentive Ledger View */}
        {activeTab === "INCENTIVES" && (
          <div>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "14px" }}>
              {lang === "mr" ? "राष्ट्रीय आरोग्य अभियान (NHM) मानधन लेजर" : "ASHA Incentive Claim Vouchers"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {incentiveVouchers.map((voucher, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D6D6D6",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{voucher.activity}</div>
                    <div style={{ fontSize: "12px", color: "#737373" }}>
                      लाभार्थी: {voucher.patient} • {voucher.date}
                    </div>
                    <div style={{ fontSize: "11px", color: "#517C65", fontWeight: 600, marginTop: "2px" }}>
                      व्हाउचर: {voucher.id}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#517C65" }}>+₹{voucher.amount}</div>
                    <span
                      style={{
                        backgroundColor: "#E3EDE8",
                        color: "#517C65",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "10px",
                        fontWeight: 600
                      }}
                    >
                      {voucher.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Footer Navigation */}
      <footer
        style={{
          borderTop: "1px solid #D6D6D6",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: "#FFFFFF"
        }}
      >
        <button
          onClick={() => setActiveTab("HOME")}
          style={{ border: "none", backgroundColor: "transparent", fontSize: "12px", color: "#737373", cursor: "pointer" }}
        >
          🏠 मुख्य (Home)
        </button>
        <button
          onClick={() => setActiveTab("ANC")}
          style={{ border: "none", backgroundColor: "transparent", fontSize: "12px", color: activeTab === "ANC" ? "#75A68C" : "#737373", fontWeight: 600, cursor: "pointer" }}
        >
          🤰 मातृ सुरक्षा
        </button>
        <button
          onClick={() => setActiveTab("INCENTIVES")}
          style={{ border: "none", backgroundColor: "transparent", fontSize: "12px", color: activeTab === "INCENTIVES" ? "#75A68C" : "#737373", fontWeight: 600, cursor: "pointer" }}
        >
          💰 मानधन लेजर
        </button>
      </footer>
    </div>
  );
}
