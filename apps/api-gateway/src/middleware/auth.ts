import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@arogyasetu/shared-types";

const JWT_SECRET = process.env.JWT_SECRET || "arogya_state_scale_secret_sih2026";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
    facilityId?: string;
    district: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Development fallback mock session
    req.user = {
      id: "usr-spec-anjali-deshmukh",
      username: "dr.anjali",
      role: UserRole.SPECIALIST,
      facilityId: "fac-pne-dh-aupne",
      district: "Pune"
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired authorization token" });
    req.user = user as AuthRequest["user"];
    next();
  });
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access Forbidden: Insufficient role permissions under National Health Mission RBAC"
      });
    }
    next();
  };
}
