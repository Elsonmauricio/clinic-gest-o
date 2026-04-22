import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers/routers"; // Ajuste o caminho conforme a localização do seu appRouter
import { createContext } from "../server/_core/context"; // Ajuste o caminho
import type { Request, Response, NextFunction } from 'express';

const handler = createExpressMiddleware({
  router: appRouter,
  createContext,
});

// Para Vercel, você exporta a função handler
export default async (req: Request, res: Response, next: NextFunction) => {
  await handler(req, res, next);
};