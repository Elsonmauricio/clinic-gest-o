import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  router,
  protectedProcedure,
  adminProcedure,
  staffProcedure,
} from "./_core/trpc";
import {
  assertStaff,
  canAccessPatientData,
  doctorMatches,
  isStaff,
} from "./_core/permissions";
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
        const licenseNumber = await db.getNextDoctorLicenseNumber();
        await db.createDoctor({ ...input, licenseNumber } as any);
        return {
          success: true,
          message: `Médico criado com sucesso. Número de registro: ${licenseNumber}`,
          licenseNumber,
        };
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
  list: protectedProcedure.query(async ({ ctx }) => {
    const u = ctx.user!;
    if (u.role === "patient") {
      if (!u.linkedPatientId) return [];
      const p = await db.getPatientById(u.linkedPatientId);
      return p ? [p] : [];
    }
    assertStaff(u);
    return db.getPatients();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!canAccessPatientData(ctx.user, input.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const patient = await db.getPatientById(input.id);
      if (!patient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paciente não encontrado" });
      }
      return patient;
    }),

  search: staffProcedure
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
    .query(async ({ ctx, input }) => {
      if (!canAccessPatientData(ctx.user, input.patientId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return db.getMedicalRecordsByPatient(input.patientId);
    }),
});

// ============= APPOINTMENT ROUTER =============

const appointmentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const u = ctx.user!;
    if (u.role === "patient" && u.linkedPatientId) {
      return db.getAppointmentsByPatient(u.linkedPatientId);
    }
    if (u.role === "doctor" && u.linkedDoctorId) {
      return db.getAppointmentsByDoctor(u.linkedDoctorId);
    }
    assertStaff(u);
    return db.getAppointments();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const appointment = await db.getAppointmentById(input.id);
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consulta não encontrada" });
      }
      const u = ctx.user!;
      if (u.role === "patient") {
        if (u.linkedPatientId !== appointment.patientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
      } else if (u.role === "doctor") {
        if (u.linkedDoctorId !== appointment.doctorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
      } else if (!isStaff(u)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return appointment;
    }),

  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!canAccessPatientData(ctx.user, input.patientId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return db.getAppointmentsByPatient(input.patientId);
    }),

  getByDoctor: protectedProcedure
    .input(z.object({ doctorId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!doctorMatches(ctx.user, input.doctorId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return db.getAppointmentsByDoctor(input.doctorId);
    }),

  getByDateRange: staffProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      const u = ctx.user!;
      const rows = await db.getAppointmentsByDateRange(input.startDate, input.endDate);
      if (u.role === "doctor" && u.linkedDoctorId) {
        return rows.filter(a => a.doctorId === u.linkedDoctorId);
      }
      return rows;
    }),

  create: staffProcedure
    .input(appointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const u = ctx.user!;
      if (u.role === "doctor") {
        if (!u.linkedDoctorId || input.doctorId !== u.linkedDoctorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Só pode agendar consultas no seu perfil de médico",
          });
        }
      }
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
        const appointmentId = await db.createAppointmentReturningId({
          ...input,
          status: "scheduled",
        } as any);

        const timeNorm =
          input.appointmentTime.length === 5
            ? `${input.appointmentTime}:00`
            : input.appointmentTime;
        const scheduledFor = new Date(`${dateStr}T${timeNorm}`);

        await db.createNotification({
          appointmentId,
          patientId: input.patientId,
          type: "confirmation",
          status: "pending",
          scheduledFor,
        });

        const dateLabel = new Date(dateStr + "T12:00:00").toLocaleDateString("pt-PT");
        return {
          success: true,
          message: `Consulta agendada para ${patient.name} com Dr(a). ${doctor.name} em ${dateLabel} às ${input.appointmentTime}. Foi registada uma notificação para o paciente (confirmação pendente de envio).`,
          appointmentId,
        };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao agendar consulta" });
      }
    }),

  update: staffProcedure
    .input(z.object({ id: z.number().int().positive(), data: appointmentUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role === "doctor") {
        const appt = await db.getAppointmentById(input.id);
        if (!appt || appt.doctorId !== ctx.user.linkedDoctorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
      }
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
    .mutation(async ({ ctx, input }) => {
      const appointment = await db.getAppointmentById(input.id);
      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consulta não encontrada" });
      }
      const u = ctx.user!;
      if (u.role === "patient") {
        if (u.linkedPatientId !== appointment.patientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
      } else if (u.role === "doctor") {
        if (u.linkedDoctorId !== appointment.doctorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
      } else if (!isStaff(u)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      await db.updateAppointment(input.id, { status: "cancelled" });
      try {
        await db.createNotification({
          appointmentId: input.id,
          patientId: appointment.patientId,
          type: "cancellation",
          status: "pending",
        });
      } catch (e) {
        console.warn("[Notifications] Falha ao registar cancelamento:", e);
      }
      return { success: true, message: "Consulta cancelada com sucesso" };
    }),
});

// ============= MEDICAL RECORD ROUTER =============

const medicalRecordRouter = router({
  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (!canAccessPatientData(ctx.user, input.patientId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return db.getMedicalRecordsByPatient(input.patientId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const record = await db.getMedicalRecordById(input.id);
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Prontuário não encontrado" });
      }
      if (!canAccessPatientData(ctx.user, record.patientId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return record;
    }),

  create: staffProcedure
    .input(medicalRecordSchema)
    .mutation(async ({ input }) => {
      await db.createMedicalRecord(input as any);
      return { success: true, message: "Prontuário criado com sucesso" };
    }),

  update: staffProcedure
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
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const u = ctx.user!;
    if (u.role === "patient") {
      if (!u.linkedPatientId) {
        return {
          totalPatients: 0,
          totalDoctors: 0,
          totalAppointments: 0,
          totalSpecialties: 0,
        };
      }
      return db.getStatisticsForPatient(u.linkedPatientId);
    }
    if (u.role === "doctor") {
      if (!u.linkedDoctorId) {
        return {
          totalPatients: 0,
          totalDoctors: 0,
          totalAppointments: 0,
          totalSpecialties: 0,
        };
      }
      return db.getStatisticsForDoctor(u.linkedDoctorId);
    }
    assertStaff(u);
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
