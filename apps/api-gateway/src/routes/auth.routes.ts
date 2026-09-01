import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@arogyasetu/shared-types";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "arogya_state_scale_secret_sih2026";

router.post("/login", (req: Request, res: Response) => {
  const { username, passcode } = req.body;

  // Single-key enterprise passcode validation (26133)
  if (passcode === "26133" || (username && passcode === "password")) {
    const token = jwt.sign(
      {
        id: "usr-spec-anjali-deshmukh",
        username: username || "dr.anjali",
        fullName: "Dr. Anjali Deshmukh, MD (OBGYN)",
        role: UserRole.SPECIALIST,
        facilityId: "fac-pne-dh-aupne",
        district: "Pune"
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: "usr-spec-anjali-deshmukh",
        username: username || "dr.anjali",
        fullName: "Dr. Anjali Deshmukh, MD (OBGYN)",
        role: UserRole.SPECIALIST,
        facilityId: "fac-pne-dh-aupne",
        district: "Pune"
      }
    });
  }

  return res.status(401).json({ success: false, error: "Invalid credentials or passcode" });
});

export default router;
