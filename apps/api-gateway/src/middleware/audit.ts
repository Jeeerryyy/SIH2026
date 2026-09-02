import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function auditLogMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      userId: req.user?.id || "ANONYMOUS",
      userRole: req.user?.role || "GUEST",
      ip: req.ip || req.socket.remoteAddress,
      durationMs: duration,
      dpdpActCompliant: true
    };

    if (res.statusCode >= 400 || req.method !== "GET") {
      console.log(`[AUDIT_LOG] ${JSON.stringify(logEntry)}`);
    }
  });

  next();
}
