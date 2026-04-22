import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { doctors, specialties } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const doctorRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: doctors.id,
        name: doctors.name,
        email: doctors.email,
        licenseNumber: doctors.licenseNumber,
        specialty: specialties.name,
      })
      .from(doctors)
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db.select().from(doctors).where(eq(doctors.id, input.id));
      return result;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string(),
      specialtyId: z.number(),
      licenseNumber: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(doctors).values(input);
    }),

  updateAvailability: protectedProcedure
    .input(z.object({
      id: z.number(),
      availability: z.any(), // JSON contendo os horários
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(doctors)
        .set({ availability: input.availability })
        .where(eq(doctors.id, input.id));
    }),

  // Mock para o calendário de disponibilidade do frontend
  getAvailabilityCalendar: protectedProcedure
    .input(z.object({ doctorId: z.number(), month: z.number() }))
    .query(async () => {
      return {
        disabledDates: [],
        availableDates: [],
      };
    }),
});