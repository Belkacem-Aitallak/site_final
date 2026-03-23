import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertOrderSchema,
  insertPreparationSchema,
  insertInbodyPatientSchema,
  insertInbodyTestSchema,
} from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ---- PATIENTS ----
  app.get("/api/patients", async (_req, res) => {
    const patients = await storage.getInbodyPatients();
    res.json(patients);
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const input = insertInbodyPatientSchema.parse(req.body);
      const existing = await storage.getInbodyPatientByPatientId(input.patientId);
      if (existing) return res.status(400).json({ message: "ID Patient déjà existant" });
      const patient = await storage.createInbodyPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Erreur lors de la création du patient" });
    }
  });

  // ---- COMMANDES (ORDERS) ----
  app.get("/api/orders", async (req, res) => {
    const status = req.query.status as string | undefined;
    const orders = await storage.getOrders(status);
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const input = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Erreur lors de la création de la commande" });
    }
  });

  // ---- PRÉPARATIONS ----
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
      res.status(500).json({ message: "Erreur lors de l'ajout de la préparation" });
    }
  });

  // ---- INBODY TESTS ----
  app.post("/api/inbody/tests", async (req, res) => {
    try {
      const input = insertInbodyTestSchema.parse(req.body);
      const test = await storage.createInbodyTest(input);
      res.status(201).json(test);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Erreur lors de l'enregistrement Inbody" });
    }
  });

  return httpServer;
}