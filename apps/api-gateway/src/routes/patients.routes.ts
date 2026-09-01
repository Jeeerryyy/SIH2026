import { Router, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth.js";
import { IPatient } from "@arogyasetu/shared-types";

const router = Router();

// In-Memory state-scale mockup cache
const MOCK_PATIENTS: IPatient[] = [
  {
    id: "pat-ndb-1001",
    abhaId: "91-4521-8890-1123",
    abhaAddress: "sunita.padvi@abdm",
    fullName: "Sunita Ramesh Padvi",
    gender: "FEMALE",
    dateOfBirth: new Date("1998-05-14"),
    ageYears: 28,
    phoneNumber: "9422019988",
    residenceVillage: "Toranmal",
    residenceTaluka: "Dhadgaon",
    residenceDistrict: "Nandurbar",
    assignedAshaId: "usr-asha-kavita-padvi",
    assignedFacilityId: "fac-ndb-sc-toranmal",
    bloodGroup: "O_POSITIVE",
    isHighRiskPregnancy: true,
    isSickleCellTraitOrDiseased: true,
    isUnderMjpjay: true,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-08-28")
  },
  {
    id: "pat-gdc-2004",
    abhaId: "91-7788-9900-3344",
    abhaAddress: "ramu.madavi@abdm",
    fullName: "Ramu Somu Madavi",
    gender: "MALE",
    dateOfBirth: new Date("1982-11-20"),
    ageYears: 43,
    phoneNumber: "9404011223",
    residenceVillage: "Bhamragad",
    residenceTaluka: "Bhamragad",
    residenceDistrict: "Gadchiroli",
    assignedFacilityId: "fac-gdc-phc-bhamragad",
    bloodGroup: "B_POSITIVE",
    isHypertensive: true,
    isSickleCellTraitOrDiseased: false,
    isUnderMjpjay: true,
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-08-30")
  }
];

router.get("/", authenticateToken, (req: AuthRequest, res: Response) => {
  const { query, district } = req.query;
  let filtered = MOCK_PATIENTS;

  if (district) {
    filtered = filtered.filter(p => p.residenceDistrict.toLowerCase() === String(district).toLowerCase());
  }

  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter(
      p =>
        p.fullName.toLowerCase().includes(q) ||
        (p.abhaId && p.abhaId.includes(q)) ||
        (p.phoneNumber && p.phoneNumber.includes(q))
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

router.get("/:id", authenticateToken, (req: AuthRequest, res: Response) => {
  const patient = MOCK_PATIENTS.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
  res.json({ success: true, data: patient });
});

router.post("/", authenticateToken, (req: AuthRequest, res: Response) => {
  const newPatient: IPatient = {
    id: `pat-${Date.now()}`,
    fullName: req.body.fullName,
    gender: req.body.gender || "FEMALE",
    dateOfBirth: new Date(req.body.dateOfBirth || "2000-01-01"),
    phoneNumber: req.body.phoneNumber,
    residenceVillage: req.body.residenceVillage || "Rural Village",
    residenceTaluka: req.body.residenceTaluka || "Taluka",
    residenceDistrict: req.body.residenceDistrict || "Nandurbar",
    isHighRiskPregnancy: req.body.isHighRiskPregnancy || false,
    isSickleCellTraitOrDiseased: req.body.isSickleCellTraitOrDiseased || false,
    isUnderMjpjay: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  MOCK_PATIENTS.push(newPatient);
  res.status(201).json({ success: true, data: newPatient });
});

export default router;
