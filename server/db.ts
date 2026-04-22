import { eq, and, desc, asc, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  InsertUser, 
  users,
  specialties,
  doctors,
  patients,
  appointments,
  medicalRecords,
  notifications,
  doctorSchedules,
  type Specialty,
  type InsertSpecialty,
  type Doctor,
  type InsertDoctor,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type MedicalRecord,
  type InsertMedicalRecord,
  type Notification,
  type InsertNotification,
  type DoctorSchedule,
  type InsertDoctorSchedule,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_db) return _db;

  const connectionString = ENV.databaseUrl || process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[Database] DATABASE_URL is not set");
    return null;
  }

  try {
    if (!_pool) {
      _pool = mysql.createPool(connectionString);
    }
    // mysql2/promise Pool typings diverge from drizzle-orm's expected Pool; runtime is correct.
    _db = drizzle(_pool as never);
  } catch (error) {
    console.warn("[Database] Failed to connect:", error);
    _db = null;
  }

  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    updateSet.updatedAt = new Date(); // Garante que sabemos quando o perfil foi atualizado

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    const linkFields = ["linkedDoctorId", "linkedPatientId"] as const;
    for (const field of linkFields) {
      if (user[field] === undefined) continue;
      values[field] = user[field];
      updateSet[field] = user[field];
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= SPECIALTIES =============

export async function getSpecialties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specialties).orderBy(asc(specialties.name));
}

export async function getSpecialtyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(specialties).where(eq(specialties.id, id)).limit(1);
  return result[0];
}

export async function createSpecialty(data: InsertSpecialty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(specialties).values(data);
  return result;
}

export async function updateSpecialty(id: number, data: Partial<InsertSpecialty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(specialties).set(data).where(eq(specialties.id, id));
}

export async function deleteSpecialty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(specialties).where(eq(specialties.id, id));
}

// ============= DOCTORS =============

export async function getDoctors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(doctors).orderBy(asc(doctors.name));
}

export async function getDoctorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result[0];
}

export async function getDoctorsBySpecialty(specialtyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(doctors).where(eq(doctors.specialtyId, specialtyId)).orderBy(asc(doctors.name));
}

/** Próximo número de registro no formato CRM-000001 (alinhado ao próximo id da tabela). */
export async function getNextDoctorLicenseNumber(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db
    .select({ next: sql<number>`COALESCE(MAX(${doctors.id}), 0) + 1` })
    .from(doctors);
  const n = Number(row?.next ?? 1);
  return `CRM-${String(n).padStart(6, "0")}`;
}

export async function createDoctor(data: InsertDoctor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(doctors).values(data);
  return result;
}

export async function updateDoctor(id: number, data: Partial<InsertDoctor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(doctors).set(data).where(eq(doctors.id, id));
}

export async function deleteDoctor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(doctors).where(eq(doctors.id, id));
}

// ============= DOCTOR SCHEDULES =============

export async function getDoctorSchedules(doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));
}

export async function createDoctorSchedule(data: InsertDoctorSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(doctorSchedules).values(data);
}

export async function updateDoctorSchedule(id: number, data: Partial<InsertDoctorSchedule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(doctorSchedules).set(data).where(eq(doctorSchedules.id, id));
}

export async function deleteDoctorSchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(doctorSchedules).where(eq(doctorSchedules.id, id));
}

// ============= PATIENTS =============

export async function getPatients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients).where(eq(patients.isActive, true)).orderBy(asc(patients.name));
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result[0];
}

export async function searchPatients(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients).where(
    and(
      eq(patients.isActive, true),
      like(patients.name, `%${query}%`)
    )
  ).orderBy(asc(patients.name));
}

export async function createPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(patients).values(data);
}

export async function updatePatient(id: number, data: Partial<InsertPatient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(patients).set(data).where(eq(patients.id, id));
}

export async function deletePatient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(patients).set({ isActive: false }).where(eq(patients.id, id));
}

// ============= APPOINTMENTS =============

export async function getAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result[0];
}

export async function getAppointmentsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments)
    .where(eq(appointments.patientId, patientId))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentsByDoctor(doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments)
    .where(eq(appointments.doctorId, doctorId))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentsByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments)
    .where(sql`DATE(${appointments.appointmentDate}) >= ${startDate} AND DATE(${appointments.appointmentDate}) <= ${endDate}`)
    .orderBy(asc(appointments.appointmentDate));
}

export async function checkAppointmentConflict(doctorId: number, date: string, time: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(appointments).where(
    and(
      eq(appointments.doctorId, doctorId),
      eq(appointments.appointmentDate, sql`STR_TO_DATE(${date + ' ' + time}, '%Y-%m-%d %H:%i')`),
      sql`${appointments.status} != 'cancelled'`
    )
  ).limit(1);
  return result.length > 0;
}

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(appointments).values(data);
}

/** Insere consulta e devolve o id (para notificações e integrações). */
export async function createAppointmentReturningId(
  data: InsertAppointment
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  const header = Array.isArray(result) ? result[0] : result;
  const rawId = (header as { insertId?: number | bigint }).insertId;
  if (rawId !== undefined && rawId !== null) {
    const n = typeof rawId === "bigint" ? Number(rawId) : rawId;
    if (n > 0) return n;
  }
  const rows = await db
    .select({ id: appointments.id })
    .from(appointments)
    .orderBy(desc(appointments.id))
    .limit(1);
  if (!rows[0]) throw new Error("Não foi possível obter o id da consulta criada");
  return rows[0].id;
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set(data).where(eq(appointments.id, id));
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(appointments).where(eq(appointments.id, id));
}

// ============= MEDICAL RECORDS =============

export async function getMedicalRecordsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(medicalRecords)
    .where(eq(medicalRecords.patientId, patientId))
    .orderBy(desc(medicalRecords.createdAt));
}

export async function getMedicalRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id)).limit(1);
  return result[0];
}

export async function createMedicalRecord(data: InsertMedicalRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(medicalRecords).values(data);
}

export async function updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(medicalRecords).set(data).where(eq(medicalRecords.id, id));
}

// ============= NOTIFICATIONS =============

export async function getPendingNotifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.status, "pending"));
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(data);
}

export async function updateNotification(id: number, data: Partial<InsertNotification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications).set(data).where(eq(notifications.id, id));
}

// ============= STATISTICS =============

export async function getStatistics() {
  const db = await getDb();
  if (!db) return { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalSpecialties: 0 };
  
  const [patientCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(patients).where(eq(patients.isActive, true));
  const [doctorCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(doctors).where(eq(doctors.isActive, true));
  const [appointmentCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(appointments);
  const [specialtyCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(specialties);
  
  return {
    totalPatients: patientCount?.count || 0,
    totalDoctors: doctorCount?.count || 0,
    totalAppointments: appointmentCount?.count || 0,
    totalSpecialties: specialtyCount?.count || 0,
  };
}

export async function getStatisticsForPatient(patientId: number) {
  const db = await getDb();
  if (!db) {
    return { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalSpecialties: 0 };
  }

  const [appointmentCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(appointments)
    .where(eq(appointments.patientId, patientId));

  return {
    totalPatients: 1,
    totalDoctors: 0,
    totalAppointments: Number(appointmentCount?.count ?? 0),
    totalSpecialties: 0,
  };
}

export async function getStatisticsForDoctor(doctorId: number) {
  const db = await getDb();
  if (!db) {
    return { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalSpecialties: 0 };
  }

  const [appointmentCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId));

  const [patientRow] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${appointments.patientId})` })
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId));

  return {
    totalPatients: Number(patientRow?.count ?? 0),
    totalDoctors: 1,
    totalAppointments: Number(appointmentCount?.count ?? 0),
    totalSpecialties: 1,
  };
}
