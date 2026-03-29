import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ===== ORDERS =====

  app.get("/api/orders", async (_req, res) => {
    const data = await storage.getOrders();
    res.json(data);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const b = req.body;

      const order = await storage.createOrder({
        patientName: b.patientName || b.name,
        phoneNumber: b.phoneNumber || b.phone,
        productName: b.productName || b.product,
        status: "À commander",
      });

      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "order error" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    await storage.deleteOrder(req.params.id);
    res.sendStatus(204);
  });

  // ===== PREPARATIONS =====

  app.get("/api/preparations", async (_req, res) => {
    const data = await storage.getPreparations();
    res.json(data);
  });

  app.post("/api/preparations", async (req, res) => {
    try {
      const b = req.body;

      const prep = await storage.createPreparation({
        type: b.type || b.preparationType,
        description: b.description,
        preparedBy: b.preparedBy || b.user,
        status: b.status || "En attente",
        notes: b.notes || "",
      });

      res.json(prep);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "prep error" });
    }
  });

  app.delete("/api/preparations/:id", async (req, res) => {
    await storage.deletePreparation(req.params.id);
    res.sendStatus(204);
  });

  // ===== PATIENTS =====

  app.post("/api/inbody/patients", async (req, res) => {
  try {
    const b = req.body;

    // ✅ Debug (tu peux laisser)
    console.log("BODY:", b);

    // ✅ Validation simple
    if (!b.patientId || !(b.name || b.fullName)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const patient = await storage.createInbodyPatient({
      patientId: b.patientId,
      name: b.name || b.fullName,

      // ✅ FIX noms de champs
      phoneNumber: b.phone ? b.phone.replace(/\s+/g, '') : null,
      email: b.email || null,

      // ✅ FIX date
      dateOfBirth: b.birthDate ? new Date(b.birthDate).toISOString().split("T")[0] : null,
    });

    res.status(201).json(patient);

  } catch (err) {
    console.error("❌ PATIENT ERROR:", err);

    res.status(500).json({
      message: err.message, // 🔥 maintenant tu verras la vraie erreur
    });
  }
});

  app.delete("/api/inbody/patients/:id", async (req, res) => {
    await storage.deleteInbodyPatient(req.params.id);
    res.sendStatus(204);
  });

  return httpServer;
}
