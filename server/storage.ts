// @ts-nocheck
import { db } from "./db";
import {
  orders, preparations, inbodyPatients, inbodyTests,
  type InsertOrder, type Order, type Preparation,
  type InsertPreparation, type InbodyPatient,
  type InsertInbodyPatient, type InbodyTest, type InsertInbodyTest,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage {
  async getOrders(status) {
    if (status && status !== "Tous") {
      return await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
    }
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async createOrder(insertOrder) {
    const [created] = await db.insert(orders).values(insertOrder).returning();
    return created;
  }
  async updateOrder(id, updates) {
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated;
  }
  async deleteOrder(id) {
    await db.delete(orders).where(eq(orders.id, id));
  }
  async getPreparations() {
    return await db.select().from(preparations).orderBy(desc(preparations.createdAt));
  }
  async createPreparation(prep) {
    const [created] = await db.insert(preparations).values(prep).returning();
    return created;
  }
  async getInbodyPatients() {
    return await db.select().from(inbodyPatients).orderBy(desc(inbodyPatients.createdAt));
  }
  async getInbodyPatientByPatientId(patientId) {
    const [p] = await db.select().from(inbodyPatients).where(eq(inbodyPatients.patientId, patientId));
    return p;
  }
  async createInbodyPatient(p) {
    const [created] = await db.insert(inbodyPatients).values(p).returning();
    return created;
  }
  async getAllInbodyTests() {
    return await db.select().from(inbodyTests);
  }
  async createInbodyTest(t) {
    const [created] = await db.insert(inbodyTests).values(t).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();