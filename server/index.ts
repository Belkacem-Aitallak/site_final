console.log("🚀 SERVER START");

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { connectDB } from "./db";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middleware pour le JSON et le rawBody (pour Stripe ou autres webhooks)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ✅ CONFIGURATION CORS CORRIGÉE
// On autorise explicitement ton site Vercel et le localhost pour tes tests
app.use(
  cors({
<<<<<<< HEAD
    origin: "https://69bf51a459f45b4e7e18907a--effulgent-gaufre-970261.netlify.app",
=======
    origin: ["https://site-final-alpha.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
>>>>>>> 3437860 (Correction de l'URL API et du CORS)
    credentials: true,
  }),
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware de log pour suivre les requêtes dans Railway
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
<<<<<<< HEAD
    await connectDB(); // connexion DB
=======
    // 1. Connexion à la base de données MongoDB
    await connectDB();
    
    // 2. Enregistrement des routes API
>>>>>>> 3437860 (Correction de l'URL API et du CORS)
    await registerRoutes(httpServer, app);

    // 3. Gestion globale des erreurs
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });

    // 4. Lancement du serveur sur le port fourni par Railway
    const port = parseInt(process.env.PORT || "5000", 10);

    httpServer.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port} - Backend Ready`);
    });

  } catch (err) {
    console.error("❌ SERVER FAILED TO START:", err);
  }
})();