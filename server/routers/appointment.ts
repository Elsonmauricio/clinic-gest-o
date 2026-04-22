import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { appointments, patients, doctors } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const appointmentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
        patientName: patients.name,
        doctorName: doctors.name,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .orderBy(desc(appointments.appointmentDate));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select()
        .from(appointments)
        .where(eq(appointments.id, input.id));
      return result;
    }),

  create: protectedProcedure
    .input(z.object({
      patientId: z.number(),
      doctorId: z.number(),
      appointmentDate: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(appointments).values({ ...input, status: "scheduled" });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(appointments)
        .set({ status: input.status })
        .where(eq(appointments.id, input.id));
    }),
});