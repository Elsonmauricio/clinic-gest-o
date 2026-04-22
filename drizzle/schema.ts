import { mysqlTable, serial, varchar, text, datetime, int, json, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Tabela de Usuários (users)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user").notNull(), // admin, user, doctor, patient
  loginMethod: varchar("login_method", { length: 50 }),
  linkedDoctorId: int("linked_doctor_id"),
  linkedPatientId: int("linked_patient_id"),
  createdAt: datetime("created_at").default(new Date()).notNull(),
  updatedAt: datetime("updated_at").default(new Date()).notNull(),
  lastSignedIn: datetime("last_signed_in").default(new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de Especialidades (specialties)
export const specialties = mysqlTable("specialties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

// Tabela de Médicos (doctors)
export const doctors = mysqlTable("doctors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  specialtyId: int("specialty_id").notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  availability: json("availability"), // Ex: { monday: { start: '08:00', end: '18:00' }, ... }
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

// Relações para Médicos
export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [doctors.specialtyId],
    references: [specialties.id],
  }),
  appointments: many(appointments),
}));

// Tabela de Pacientes (patients)
export const patients = mysqlTable("patients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  dateOfBirth: datetime("date_of_birth").notNull(),
  medicalHistory: text("medical_history"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// Relações para Pacientes
export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
}));

// Tabela de Agendamentos (appointments)
export const appointments = mysqlTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: int("patient_id").notNull(),
  doctorId: int("doctor_id").notNull(),
  appointmentDate: datetime("appointment_date").notNull(),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Relações para Agendamentos
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));

// Tabela de Prontuários Médicos (medical_records)
export const medicalRecords = mysqlTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: int("patient_id").notNull(),
  symptoms: text("symptoms").notNull(),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment"),
  prescription: text("prescription"),
  notes: text("notes"),
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;

// Tabela de Notificações (notifications) - Adicionada com base na DOCUMENTACAO.md
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // reminder, alert, cancellation
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, sent, failed
  scheduledAt: datetime("scheduled_at"),
  sentAt: datetime("sent_at"),
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Tabela de Horários do Médico (doctorSchedules) - Adicionada com base no uso em doctor.ts
export const doctorSchedules = mysqlTable("doctor_schedules", {
  id: serial("id").primaryKey(),
  doctorId: int("doctor_id").notNull(),
  dayOfWeek: varchar("day_of_week", { length: 10 }).notNull(), // monday, tuesday, etc.
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:mm
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:mm
  createdAt: datetime("created_at").default(new Date()).notNull(),
});

export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = typeof doctorSchedules.$inferInsert;

export const doctorSchedulesRelations = relations(doctorSchedules, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorSchedules.doctorId],
    references: [doctors.id],
  }),
}));