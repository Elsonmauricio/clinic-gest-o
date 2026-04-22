import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers/routers"; // Caminho relativo ajustado

export const trpc = createTRPCReact<AppRouter>();