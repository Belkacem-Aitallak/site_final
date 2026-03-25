console.log("🚀 SERVER START");

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { connectDB } from "./db";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

// ✅ FIX CORS (IMPORTANT)
app.use(cors());

// ✅ BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOG
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

// LOGGER REQUEST
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });

  next();
});

// START SERVER
(async () => {
  try {
    await connectDB();
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("❌ ERROR:", err);
      res.status(500).json({ message: err.message || "Server error" });
    });

    const port = Number(process.env.PORT || 5000);

    httpServer.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
    });

  } catch (err) {
    console.error("❌ SERVER FAILED:", err);
  }
})();