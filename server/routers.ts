import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============= VALIDATION SCHEMAS =============

const specialtySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

const doctorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  specialtyId: z.number().int().positive("Especialidade é obrigatória"),
  licenseNumber: z.string().min(1, "Número de registro é obrigatório"),
  bio: z.string().optional(),
});

const doctorScheduleSchema = z.object({
  doctorId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
});

const patientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)").transform(val => new Date(val)),
  cpf: z.string().min(11, "CPF inválido"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
});

const appointmentSchema = z.object({
  patientId: z.number().int().positive("Paciente é obrigatório"),
  doctorId: z.number().int().positive("Médico é obrigatório"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)").transform(val => new Date(val)),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:MM)"),
  notes: z.string().optional(),
});

const appointmentUpdateSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
});

const medicalRecordSchema = z.object({
  patientId: z.number().int().positive(),
  appointmentId: z.number().int().positive().optional(),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  nextAppointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)").optional().transform(val => val ? new Date(val) : undefined),
});

// ============= SPECIALTY ROUTER =============

const specialtyRouter = router({
  list: publicProcedure.query(async () => {
    return db.getSpecialties();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const specialty = await db.getSpecialtyById(input.id);
      if (!specialty) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Especialidade não encontrada" });
      }
      return specialty;
    }),

  create: adminProcedure
    .input(specialtySchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db.createSpecialty(input);
        return { success: true, message: "Especialidade criada com sucesso" };
      } catch (error: any) {
        if (error.message.includes("Duplicate entry")) {
          throw new TRPCError({ code: "CONFLICT", message: "Especialidade já existe" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar especialidade" });
      }
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int().positive(), data: specialtySchema.partial() }))
    .mutation(async ({ input }) => {
      await db.updateSpecialty(input.id, input.data);
      return { success: true, message: "Especialidade atualizada com sucesso" };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      try {
        await db.deleteSpecialty(input.id);
        return { success: true, message: "Especialidade removida com sucesso" };
      } catch (error: any) {
        if (error.message.includes("FOREIGN KEY")) {
          throw new TRPCError({ code: "CONFLICT", message: "Não é possível remover especialidade com médicos associados" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao remover especialidade" });
      }
    }),
});

// ============= DOCTOR ROUTER =============

const doctorRouter = router({
  list: publicProcedure.query(async () => {
    return db.getDoctors();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const doctor = await db.getDoctorById(input.id);
      if (!doctor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Médico não encontrado" });
      }
      return doctor;
    }),

  getBySpecialty: publicProcedure
    .input(z.object({ specialtyId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return db.getDoctorsBySpecialty(input.specialtyId);
    }),

  create: adminProcedure
    .input(doctorSchema)
    .mutation(async ({ input }) => {
      try {
        await db.createDoctor(input as any);
        return { success: true, message: "Médico criado com sucesso" };
      } catch (error: any) {
        if (error.message.includes("Duplicate entry")) {
          throw new TRPCError({ code: "CONFLICT", message: "Email ou número de registro já existe" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar médico" });
      }
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int().positive(), data: doctorSchema.partial() }))
    .mutation(async ({ input }) => {
      await db.updateDoctor(input.id, input.data as any);
      return { success: true, message: "Médico atualizado com sucesso" };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      try {
        await db.deleteDoctor(input.id);
        return { success: true, message: "Médico removido com sucesso" };
      } catch (error: any) {
        if (error.message.includes("FOREIGN KEY")) {
          throw new TRPCError({ code: "CONFLICT", message: "Não é possível remover médico com consultas associadas" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao remover médico" });
      }
    }),

  getSchedules: publicProcedure
    .input(z.object({ doctorId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return db.getDoctorSchedules(input.doctorId);
    }),

  addSchedule: adminProcedure
    .input(doctorScheduleSchema)
    .mutation(async ({ input }) => {
      await db.createDoctorSchedule(input);
      return { success: true, message: "Horário adicionado com sucesso" };
    }),

  deleteSchedule: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await db.deleteDoctorSchedule(input.id);
      return { success: true, message: "Horário removido com sucesso" };
    }),
});

// ============= PATIENT ROUTER =============

const patientRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getPatients();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const patient = await db.getPatientById(input.id);
      if (!patient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paciente não encontrado" });
      }
      return patient;
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      return db.searchPatients(input.query);
    }),

  create: adminProcedure
    .input(patientSchema)
    .mutation(async ({ input }) => {
      try {
        await db.createPatient(input as any);
        return { success: true, message: "Paciente criado com sucesso" };
      } catch (error: any) {
        if (error.message.includes("Duplicate entry")) {
          throw new TRPCError({ code: "CONFLICT", message: "Email ou CPF já existe" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar paciente" });
      }
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int().positive(), data: patientSchema.partial() }))
    .mutation(async ({ input }) => {
      await db.updatePatient(input.id, input.data as any);
      return { success: true, message: "Paciente atualizado com sucesso" };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await db.deletePatient(input.id);
      return { success: true, message: "Paciente removido com sucesso" };
    }),

  getHistory: protectedProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return db.getMedicalRecordsByPatient(input.patientId);
    }),
});

// ============= APPOINTMENT ROUTER =============

const appointmentRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAppointments();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const appointment = await db.getAppointmentById(input.id);
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consulta não encontrada" });
      }
      return appointment;
    }),

  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return db.getAppointmentsByPatient(input.patientId);
    }),

  getByDoctor: protectedProcedure
    .input(z.object({ doctorId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return db.getAppointmentsByDoctor(input.doctorId);
    }),

  getByDateRange: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ input }) => {
      return db.getAppointmentsByDateRange(input.startDate, input.endDate);
    }),

  create: adminProcedure
    .input(appointmentSchema)
    .mutation(async ({ input }) => {
      // Validar se paciente existe
      const patient = await db.getPatientById(input.patientId);
      if (!patient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paciente não encontrado" });
      }

      // Validar se médico existe
      const doctor = await db.getDoctorById(input.doctorId);
      if (!doctor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Médico não encontrado" });
      }

      // Verificar conflito de horário
      const dateStr = input.appointmentDate instanceof Date ? input.appointmentDate.toISOString().split('T')[0] : input.appointmentDate;
      const hasConflict = await db.checkAppointmentConflict(input.doctorId, dateStr, input.appointmentTime);
      if (hasConflict) {
        throw new TRPCError({ code: "CONFLICT", message: "Horário já está ocupado para este médico" });
      }

      try {
        await db.createAppointment({
          ...input,
          status: "scheduled",
        } as any);
        return { success: true, message: "Consulta agendada com sucesso" };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao agendar consulta" });
      }
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int().positive(), data: appointmentUpdateSchema }))
    .mutation(async ({ input }) => {
      await db.updateAppointment(input.id, input.data);
      return { success: true, message: "Consulta atualizada com sucesso" };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await db.deleteAppointment(input.id);
      return { success: true, message: "Consulta removida com sucesso" };
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await db.updateAppointment(input.id, { status: "cancelled" });
      return { success: true, message: "Consulta cancelada com sucesso" };
    }),
});

// ============= MEDICAL RECORD ROUTER =============

const medicalRecordRouter = router({
  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return db.getMedicalRecordsByPatient(input.patientId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const record = await db.getMedicalRecordById(input.id);
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Prontuário não encontrado" });
      }
      return record;
    }),

  create: adminProcedure
    .input(medicalRecordSchema)
    .mutation(async ({ input }) => {
      await db.createMedicalRecord(input as any);
      return { success: true, message: "Prontuário criado com sucesso" };
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int().positive(), data: medicalRecordSchema.partial() }))
    .mutation(async ({ input }) => {
      const data = input.data as any;
      if (data.nextAppointmentDate && typeof data.nextAppointmentDate === 'string') {
        data.nextAppointmentDate = new Date(data.nextAppointmentDate);
      }
      await db.updateMedicalRecord(input.id, data);
      return { success: true, message: "Prontuário atualizado com sucesso" };
    }),
});

// ============= STATISTICS ROUTER =============

const statisticsRouter = router({
  getOverview: protectedProcedure.query(async () => {
    return db.getStatistics();
  }),
});

// ============= MAIN ROUTER =============

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  specialty: specialtyRouter,
  doctor: doctorRouter,
  patient: patientRouter,
  appointment: appointmentRouter,
  medicalRecord: medicalRecordRouter,
  statistics: statisticsRouter,
});

export type AppRouter = typeof appRouter;
