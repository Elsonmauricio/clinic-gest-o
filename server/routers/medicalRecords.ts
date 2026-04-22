import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { medicalRecords } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const medicalRecordsRouter = router({
  // Lista prontuários de um paciente específico
  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.patientId, input.patientId))
        .orderBy(medicalRecords.createdAt);
    }),

  // Cria um novo prontuário/nota clínica
  create: protectedProcedure
    .input(z.object({
      patientId: z.number(),
      symptoms: z.string().min(1, "Sintomas são obrigatórios"),
      diagnosis: z.string().min(1, "Diagnóstico é obrigatório"),
      treatment: z.string(),
      prescription: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await ctx.db.insert(medicalRecords).values({
        ...input,
        createdAt: new Date(),
      });
      return result;
    }),
});