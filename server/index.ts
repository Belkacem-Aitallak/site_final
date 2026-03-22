console.log("🚀 SERVER START");

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ✅ BODY PARSER
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ✅ CORS
app.use(
  cors({
    origin: "https://69bf51a459f45b4e7e18907a--effulgent-gaufre-970261.netlify.app",
    credentials: true,
  })
);

// ✅ LOG FUNCTION
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// ✅ REQUEST LOGGER
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// 🚀 START SERVER
(async () => {
  try {
    // ✅ CONNECT MONGODB DIRECTEMENT
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connected");

    // ✅ IMPORTANT : définir db global
    const db = mongoose.connection;
    (global as any).db = db;

    // ✅ ROUTES
    await registerRoutes(httpServer, app);

    // ✅ ERROR HANDLER
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });

    const port = parseInt(process.env.PORT || "5000", 10);

    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
      httpServer.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
      });
    } else {
      httpServer.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
      });

      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
      log("Vite ready — app fully started");
    }
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
})();
