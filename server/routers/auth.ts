import { router, protectedProcedure } from "../_core/trpc";

export const authRouter = router({
  // Retorna os dados do utilizador atual baseados na sessão (cookie)
  me: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      isAuthenticated: true,
    };
  }),
});