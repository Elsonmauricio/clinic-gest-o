import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  date,
  time,
  boolean,
  longtext,
  uniqueIndex,
  index
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "doctor", "patient"]).default("user").notNull(),
  linkedDoctorId: int("linkedDoctorId"),
  linkedPatientId: int("linkedPatientId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  openIdIdx: index("openId_idx").on(table.openId),
  linkedDoctorIdx: index("users_linkedDoctorId_idx").on(table.linkedDoctorId),
  linkedPatientIdx: index("users_linkedPatientId_idx").on(table.linkedPatientId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Especialidades médicas (Cardiologia, Dermatologia, etc.)
 */
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("specialty_name_idx").on(table.name),
}));

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

/**
 * Médicos com suas especialidades e informações de contacto
 */
export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  specialtyId: int("specialtyId").notNull().references(() => specialties.id, { onDelete: "restrict" }),
  licenseNumber: varchar("licenseNumber", { length: 50 }).notNull().unique(),
  bio: text("bio"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  specialtyIdIdx: index("doctor_specialtyId_idx").on(table.specialtyId),
  emailIdx: index("doctor_email_idx").on(table.email),
  licenseIdx: uniqueIndex("doctor_license_idx").on(table.licenseNumber),
}));

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

/**
 * Horários de atendimento dos médicos
 */
export const doctorSchedules = mysqlTable("doctorSchedules", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  doctorIdIdx: index("schedule_doctorId_idx").on(table.doctorId),
}));

export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = typeof doctorSchedules.$inferInsert;

/**
 * Pacientes com informações pessoais
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: date("dateOfBirth").notNull(),
  cpf: varchar("cpf", { length: 20 }).notNull().unique(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 20 }),
  emergencyContact: varchar("emergencyContact", { length: 255 }),
  emergencyPhone: varchar("emergencyPhone", { length: 20 }),
  medicalHistory: longtext("medicalHistory"),
  allergies: text("allergies"),
  currentMedications: text("currentMedications"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("patient_email_idx").on(table.email),
  cpfIdx: uniqueIndex("patient_cpf_idx").on(table.cpf),
  phoneIdx: index("patient_phone_idx").on(table.phone),
}));

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Consultas agendadas
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "restrict" }),
  doctorId: int("doctorId").notNull().references(() => doctors.id, { onDelete: "restrict" }),
  appointmentDate: date("appointmentDate").notNull(),
  appointmentTime: time("appointmentTime").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  patientIdIdx: index("appointment_patientId_idx").on(table.patientId),
  doctorIdIdx: index("appointment_doctorId_idx").on(table.doctorId),
  dateIdx: index("appointment_date_idx").on(table.appointmentDate),
  statusIdx: index("appointment_status_idx").on(table.status),
}));

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Prontuários médicos com histórico de consultas
 */
export const medicalRecords = mysqlTable("medicalRecords", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  appointmentId: int("appointmentId").references(() => appointments.id, { onDelete: "set null" }),
  recordDate: timestamp("recordDate").defaultNow().notNull(),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  prescription: text("prescription"),
  notes: longtext("notes"),
  nextAppointmentDate: date("nextAppointmentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  patientIdIdx: index("record_patientId_idx").on(table.patientId),
  appointmentIdIdx: index("record_appointmentId_idx").on(table.appointmentId),
  dateIdx: index("record_date_idx").on(table.recordDate),
}));

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;

/**
 * Notificações do sistema
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: int("appointmentId").notNull().references(() => appointments.id, { onDelete: "cascade" }),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["reminder", "confirmation", "cancellation", "rescheduling"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  scheduledFor: timestamp("scheduledFor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  appointmentIdIdx: index("notification_appointmentId_idx").on(table.appointmentId),
  patientIdIdx: index("notification_patientId_idx").on(table.patientId),
  statusIdx: index("notification_status_idx").on(table.status),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Relations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ many }) => ({
  // Users can have multiple roles/actions in the system
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  doctors: many(doctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [doctors.specialtyId],
    references: [specialties.id],
  }),
  schedules: many(doctorSchedules),
  appointments: many(appointments),
}));

export const doctorSchedulesRelations = relations(doctorSchedules, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorSchedules.doctorId],
    references: [doctors.id],
  }),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  notifications: many(notifications),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  medicalRecord: one(medicalRecords),
  notifications: many(notifications),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  patient: one(patients, {
    fields: [medicalRecords.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  appointment: one(appointments, {
    fields: [notifications.appointmentId],
    references: [appointments.id],
  }),
  patient: one(patients, {
    fields: [notifications.patientId],
    references: [patients.id],
  }),
}));
