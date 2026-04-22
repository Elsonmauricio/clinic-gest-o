import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { specialties } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const specialtyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(specialties);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(specialties).values(input);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string(), description: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.update(specialties).set(input).where(eq(specialties.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(specialties).where(eq(specialties.id, input.id));
    }),
});