import { router, protectedProcedure, publicProcedure } from "../_core/trpc";

export const authRouter = router({
  // Retorna os dados do utilizador atual baseados na sessão (cookie)
  me: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      isAuthenticated: true,
    };
  }),

  // Procedimento para terminar a sessão (Logout)
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie("session");
    return { success: true };
  }),
});