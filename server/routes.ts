import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { STATUS_OPTIONS, insertOrderSchema, insertPreparationSchema, insertInbodyPatientSchema, insertInbodyTestSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ---- ORDERS ----
  app.get("/api/orders", async (req, res) => {
    const status = req.query.status as string | undefined;
    if (status && status !== "Tous" && !STATUS_OPTIONS.includes(status as any)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const orders = await storage.getOrders(status);
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const input = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertOrderSchema.partial().parse(req.body);
      const exists = await storage.getOrder(id);
      if (!exists) return res.status(404).json({ message: "Order not found" });
      const updated = await storage.updateOrder(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = Number(req.params.id);
    const exists = await storage.getOrder(id);
    if (!exists) return res.status(404).json({ message: "Order not found" });
    await storage.deleteOrder(id);
    res.status(204).send();
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
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch("/api/preparations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertPreparationSchema.partial().parse(req.body);
      const exists = await storage.getPreparation(id);
      if (!exists) return res.status(404).json({ message: "Preparation not found" });
      const updated = await storage.updatePreparation(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/preparations/:id", async (req, res) => {
    const id = Number(req.params.id);
    const exists = await storage.getPreparation(id);
    if (!exists) return res.status(404).json({ message: "Preparation not found" });
    await storage.deletePreparation(id);
    res.status(204).send();
  });

  // ---- INBODY PATIENTS ----
  app.get("/api/inbody/patients", async (_req, res) => {
    const patients = await storage.getInbodyPatients();
    res.json(patients);
  });

  app.get("/api/inbody/patients/:id", async (req, res) => {
    const patient = await storage.getInbodyPatient(Number(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.post("/api/inbody/patients", async (req, res) => {
    try {
      const input = insertInbodyPatientSchema.parse(req.body);
      const existing = await storage.getInbodyPatientByPatientId(input.patientId);
      if (existing) return res.status(400).json({ message: "Patient ID already exists" });
      const patient = await storage.createInbodyPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch("/api/inbody/patients/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertInbodyPatientSchema.partial().parse(req.body);
      const exists = await storage.getInbodyPatient(id);
      if (!exists) return res.status(404).json({ message: "Patient not found" });
      const updated = await storage.updateInbodyPatient(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/inbody/patients/:id", async (req, res) => {
    const id = Number(req.params.id);
    const exists = await storage.getInbodyPatient(id);
    if (!exists) return res.status(404).json({ message: "Patient not found" });
    await storage.deleteInbodyPatient(id);
    res.status(204).send();
  });

  // ---- INBODY TESTS ----
  app.get("/api/inbody/tests", async (_req, res) => {
    const tests = await storage.getAllInbodyTests();
    res.json(tests);
  });

  app.get("/api/inbody/patients/:id/tests", async (req, res) => {
    const tests = await storage.getInbodyTests(Number(req.params.id));
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
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/inbody/tests/:id", async (req, res) => {
    await storage.deleteInbodyTest(Number(req.params.id));
    res.status(204).send();
  });

  await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getOrders();
  if (existing.length === 0) {
    await storage.createOrder({ patientName: "Alice Dupont", phoneNumber: "0612345678", productName: "Doliprane 1000mg", status: "À commander" });
    await storage.createOrder({ patientName: "Jean Martin", phoneNumber: "0798765432", productName: "Amoxicilline", status: "Commandé" });
    await storage.createOrder({ patientName: "Sophie Bernard", phoneNumber: "0655443322", productName: "Vitamin C", status: "Reçu - À prévenir" });
  }
}
