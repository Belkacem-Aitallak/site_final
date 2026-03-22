import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  STATUS_OPTIONS,
  insertOrderSchema,
  insertPreparationSchema,
  insertInbodyPatientSchema,
  insertInbodyTestSchema,
} from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ---- FIX PATIENTS ROUTE (IMPORTANT 🔥) ----
  app.get("/api/patients", async (_req, res) => {
    const patients = await storage.getInbodyPatients();
    res.json(patients);
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const input = insertInbodyPatientSchema.parse(req.body);
      const existing = await storage.getInbodyPatientByPatientId(input.patientId);
      if (existing) return res.status(400).json({ message: "Patient ID already exists" });
      const patient = await storage.createInbodyPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // ---- ORDERS ----
  app.get("/api/orders", async (req, res) => {
    const status = req.query.status as string | undefined;
    if (status && status !== "Tous" && !STATUS_OPTIONS.includes(status as any)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const orders = await storage.getOrders(status);
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const input = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // ---- PREPARATIONS ----
  app.get("/api/preparations", async (_req, res) => {
    const preps = await storage.getPreparations();
    res.json(preps);
  });

  app.post("/api/preparations", async (req, res) => {
    try {
      const input = insertPreparationSchema.parse(req.body);
      const prep = await storage.createPreparation(input);
      res.status(201).json(prep);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // ---- INBODY PATIENTS ----
  app.get("/api/inbody/patients", async (_req, res) => {
    const patients = await storage.getInbodyPatients();
    res.json(patients);
  });

  // ---- INBODY TESTS ----
  app.get("/api/inbody/tests", async (_req, res) => {
    const tests = await storage.getAllInbodyTests();
    res.json(tests);
  });

  app.post("/api/inbody/tests", async (req, res) => {
    try {
      const input = insertInbodyTestSchema.parse(req.body);
      const patient = await storage.getInbodyPatient(input.patientId);
      if (!patient) return res.status(404).json({ message: "Patient not found" });

      const test = await storage.createInbodyTest(input);
      const updatedPatient = await storage.getInbodyPatient(input.patientId);

      res.status(201).json({ test, patient: updatedPatient });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getOrders();
  if (existing.length === 0) {
    await storage.createOrder({
      patientName: "Alice Dupont",
      phoneNumber: "0612345678",
      productName: "Doliprane 1000mg",
      status: "À commander",
    });
  }
}
