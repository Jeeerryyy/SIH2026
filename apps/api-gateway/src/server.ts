import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

import authRoutes from "./routes/auth.routes.js";
import patientsRoutes from "./routes/patients.routes.js";
import triageRoutes from "./routes/triage.routes.js";
import encountersRoutes from "./routes/encounters.routes.js";
import prescriptionsRoutes from "./routes/prescriptions.routes.js";
import referralsRoutes from "./routes/referrals.routes.js";
import ashaIncentivesRoutes from "./routes/ashaIncentives.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { auditLogMiddleware } from "./middleware/audit.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(auditLogMiddleware);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientsRoutes);
app.use("/api/v1/triage", triageRoutes);
app.use("/api/v1/encounters", encountersRoutes);
app.use("/api/v1/prescriptions", prescriptionsRoutes);
app.use("/api/v1/referrals", referralsRoutes);
app.use("/api/v1/asha-incentives", ashaIncentivesRoutes);
app.use("/api/v1/pharmacy", pharmacyRoutes);
app.use("/api/v1/sync", syncRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "ArogyaSetu Bridge Central API Gateway",
    version: "1.0.0",
    designSystem: "Hireavilla Luxury Sage",
    abdmMilestones: ["M1_ABHA", "M2_HPR", "M3_PHR_EXCHANGE"],
    timestamp: new Date().toISOString()
  });
});

// HTTP Server & WebSockets WebRTC Teleconsultation Signaling
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/teleconsult" });

const rooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws: WebSocket, req) => {
  let currentRoom: string | null = null;

  ws.on("message", (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "JOIN_ROOM") {
        currentRoom = data.roomId;
        if (!rooms.has(currentRoom!)) {
          rooms.set(currentRoom!, new Set());
        }
        rooms.get(currentRoom!)!.add(ws);
        ws.send(JSON.stringify({ type: "ROOM_JOINED", roomId: currentRoom }));
      } else if (data.type === "SIGNAL" && currentRoom) {
        // Broadcast WebRTC Offer / Answer / ICE Candidates to other peers in room
        const clients = rooms.get(currentRoom);
        if (clients) {
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      }
    } catch (e) {
      console.error("[WS_ERROR] Failed parsing signaling message", e);
    }
  });

  ws.on("close", () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom)!.delete(ws);
      if (rooms.get(currentRoom)!.size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` 🏥 ArogyaSetu Bridge — Central API Gateway`);
  console.log(` 📡 Server running on http://localhost:${PORT}`);
  console.log(` 📹 WebRTC Teleconsultation Signaling at ws://localhost:${PORT}/ws/teleconsult`);
  console.log(` 🎨 Theme: Hireavilla Luxury Sage (#75A68C)`);
  console.log(`================================================================`);
});

export { app, server };
