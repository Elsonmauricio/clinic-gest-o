import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { patients } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const patientRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(patients).orderBy(desc(patients.createdAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db.select().from(patients).where(eq(patients.id, input.id));
      return result;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string(),
      cpf: z.string(),
      // A propriedade dateOfBirth estava duplicada. Mantemos apenas a versão com transform.
      dateOfBirth: z.string().transform((str) => new Date(str)), 
      medicalHistory: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(patients).values(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string(),
      cpf: z.string(),
      // A propriedade dateOfBirth estava duplicada. Mantemos apenas a versão com transform.
      dateOfBirth: z.string().transform((str) => new Date(str)), 
      medicalHistory: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, dateOfBirth, ...data } = input;
      return await ctx.db.update(patients).set({ ...data, dateOfBirth }).where(eq(patients.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(patients).where(eq(patients.id, input.id));
    }),
});