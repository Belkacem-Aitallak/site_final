import { orders, preparations, inbodyPatients, inbodyTests, type InsertOrder, type Order, type Preparation, type InsertPreparation, type InbodyPatient, type InsertInbodyPatient, type InbodyTest, type InsertInbodyTest } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Orders
  getOrders(status?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  // Preparations
  getPreparations(): Promise<Preparation[]>;
  getPreparation(id: number): Promise<Preparation | undefined>;
  createPreparation(prep: InsertPreparation): Promise<Preparation>;
  updatePreparation(id: number, updates: Partial<InsertPreparation>): Promise<Preparation>;
  deletePreparation(id: number): Promise<void>;
  // InBody Patients
  getInbodyPatients(): Promise<InbodyPatient[]>;
  getInbodyPatient(id: number): Promise<InbodyPatient | undefined>;
  getInbodyPatientByPatientId(patientId: string): Promise<InbodyPatient | undefined>;
  createInbodyPatient(patient: InsertInbodyPatient): Promise<InbodyPatient>;
  updateInbodyPatient(id: number, updates: Partial<InsertInbodyPatient>): Promise<InbodyPatient>;
  deleteInbodyPatient(id: number): Promise<void>;
  // InBody Tests
  getInbodyTests(patientId: number): Promise<InbodyTest[]>;
  getAllInbodyTests(): Promise<InbodyTest[]>;
  createInbodyTest(test: InsertInbodyTest): Promise<InbodyTest>;
  deleteInbodyTest(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
    async getOrders(status?: string) {
      return [];
    }

  async getOrder(id: number): Promise<Order | undefined> {
    return undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    return insertOrder as any;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    return updates as any;
  }

  async deleteOrder(id: number): Promise<void> {
    return;
  }

  async getPreparations(): Promise<Preparation[]> {
    return await db.select().from(preparations).orderBy(desc(preparations.createdAt));
  }

  async getPreparation(id: number): Promise<Preparation | undefined> {
    const [prep] = await db.select().from(preparations).where(eq(preparations.id, id));
    return prep;
  }

  async createPreparation(prep: InsertPreparation): Promise<Preparation> {
    const [created] = await db.insert(preparations).values(prep).returning();
    return created;
  }

  async updatePreparation(id: number, updates: Partial<InsertPreparation>): Promise<Preparation> {
    const [updated] = await db.update(preparations).set(updates).where(eq(preparations.id, id)).returning();
    return updated;
  }

  async deletePreparation(id: number): Promise<void> {
    await db.delete(preparations).where(eq(preparations.id, id));
  }

  async getInbodyPatients(): Promise<InbodyPatient[]> {
    return await db.select().from(inbodyPatients).orderBy(desc(inbodyPatients.createdAt));
  }

  async getInbodyPatient(id: number): Promise<InbodyPatient | undefined> {
    const [patient] = await db.select().from(inbodyPatients).where(eq(inbodyPatients.id, id));
    return patient;
  }

  async getInbodyPatientByPatientId(patientId: string): Promise<InbodyPatient | undefined> {
    const [patient] = await db.select().from(inbodyPatients).where(eq(inbodyPatients.patientId, patientId));
    return patient;
  }

  async createInbodyPatient(patient: InsertInbodyPatient): Promise<InbodyPatient> {
    const [created] = await db.insert(inbodyPatients).values(patient).returning();
    return created;
  }

  async updateInbodyPatient(id: number, updates: Partial<InsertInbodyPatient>): Promise<InbodyPatient> {
    const [updated] = await db.update(inbodyPatients).set(updates).where(eq(inbodyPatients.id, id)).returning();
    return updated;
  }

  async deleteInbodyPatient(id: number): Promise<void> {
    await db.delete(inbodyTests).where(eq(inbodyTests.patientId, id));
    await db.delete(inbodyPatients).where(eq(inbodyPatients.id, id));
  }

  async getInbodyTests(patientId: number): Promise<InbodyTest[]> {
    return await db.select().from(inbodyTests).where(eq(inbodyTests.patientId, patientId)).orderBy(desc(inbodyTests.testDate));
  }

  async getAllInbodyTests(): Promise<InbodyTest[]> {
    return await db.select().from(inbodyTests).orderBy(desc(inbodyTests.testDate));
  }

  async createInbodyTest(test: InsertInbodyTest): Promise<InbodyTest> {
    const [created] = await db.insert(inbodyTests).values(test).returning();
    // Decrement remaining sessions for patient
    const [patient] = await db.select().from(inbodyPatients).where(eq(inbodyPatients.id, test.patientId));
    if (patient && patient.remainingSessions > 0) {
      await db.update(inbodyPatients)
        .set({ remainingSessions: patient.remainingSessions - 1 })
        .where(eq(inbodyPatients.id, test.patientId));
    }
    return created;
  }

  async deleteInbodyTest(id: number): Promise<void> {
    await db.delete(inbodyTests).where(eq(inbodyTests.id, id));
  }
}

export const storage = new DatabaseStorage();
