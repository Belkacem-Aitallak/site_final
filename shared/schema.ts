import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUS_OPTIONS = [
  "À commander",
  "Commandé",
  "Reçu - À prévenir",
  "Terminé"
] as const;

export const PREP_STATUS_OPTIONS = [
  "En attente",
  "En cours",
  "Prête",
  "Livrée"
] as const;

export const SUBSCRIPTION_PLANS = [1, 2, 4, 8, 12] as const;

export const STAFF_OPTIONS = [
  "Amine", "Kacem", "Nour", "Imene", "Nadira", "Rachid", "Sarah Guiz",
  "Kais", "Speed", "Maria", "Dallel", "Hassina", "Adem", "Neila",
  "Djoudjou", "Hayet", "Ludmila", "Nidal", "Oussama", "Yacine", "Zahra"
] as const;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  productName: text("product_name").notNull(),
  status: text("status", { enum: STATUS_OPTIONS }).notNull().default("À commander"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preparations = pgTable("preparations", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  patientName: text("patient_name").notNull(),
  preparationType: text("preparation_type").notNull(),
  description: text("description"),
  preparedBy: text("prepared_by").notNull(),
  status: text("status", { enum: PREP_STATUS_OPTIONS }).notNull().default("En attente"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inbodyPatients = pgTable("inbody_patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  dateOfBirth: text("date_of_birth"),
  totalSessions: integer("total_sessions").notNull().default(0),
  remainingSessions: integer("remaining_sessions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inbodyTests = pgTable("inbody_tests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  testDate: text("test_date").notNull(),
  operator: text("operator").notNull(),
  weight: real("weight"),
  bodyFat: real("body_fat"),
  muscleMass: real("muscle_mass"),
  bmi: real("bmi"),
  bodyWater: real("body_water"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertPreparationSchema = createInsertSchema(preparations).omit({ id: true, createdAt: true });
export const insertInbodyPatientSchema = createInsertSchema(inbodyPatients).omit({ id: true, createdAt: true });
export const insertInbodyTestSchema = createInsertSchema(inbodyTests).omit({ id: true, createdAt: true });

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Preparation = typeof preparations.$inferSelect;
export type InsertPreparation = z.infer<typeof insertPreparationSchema>;
export type InbodyPatient = typeof inbodyPatients.$inferSelect;
export type InsertInbodyPatient = z.infer<typeof insertInbodyPatientSchema>;
export type InbodyTest = typeof inbodyTests.$inferSelect;
export type InsertInbodyTest = z.infer<typeof insertInbodyTestSchema>;
