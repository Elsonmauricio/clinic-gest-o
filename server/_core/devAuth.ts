import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { User } from "../../drizzle/schema";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw.length > 2048 ? "/" : raw;
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = (req as any).query[key];
  return typeof value === "string" ? value : undefined;
}

function parseRoleParam(raw: string | undefined): User["role"] {
  const r = raw?.toLowerCase()?.trim();
  if (r === "user" || r === "doctor" || r === "patient" || r === "admin") {
    return r;
  }
  return "admin";
}

/**
 * Login local só em desenvolvimento (cookie de sessão real, sem portal OAuth).
 * Ative no cliente com VITE_DEV_LOGIN=1 e desative o bypass com DEV_AUTH_BYPASS=0.
 *
 * Query opcional: `role=admin|user|doctor|patient`, `doctorId=`, `patientId=` (IDs devem existir na BD).
 */
export function registerDevAuthRoutes(app: Express) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  (app as any).get("/api/dev/login", async (req: Request, res: Response) => {
    const redirect = safeRedirectPath(getQueryParam(req, "redirect"));
    const role = parseRoleParam(getQueryParam(req, "role"));

    let linkedDoctorId: number | null = null;
    let linkedPatientId: number | null = null;

    if (role === "doctor") {
      const id = parseInt(getQueryParam(req, "doctorId") ?? "", 10);
      if (!Number.isFinite(id)) {
        (res as any).status(400).send("Parâmetro doctorId é obrigatório e deve ser numérico para role=doctor");
        return;
      }
      const doc = await db.getDoctorById(id);
      if (!doc) {
        (res as any).status(400).send("doctorId não corresponde a um médico existente");
        return;
      }
      linkedDoctorId = id;
    }

    if (role === "patient") {
      const id = parseInt(getQueryParam(req, "patientId") ?? "", 10);
      if (!Number.isFinite(id)) {
        (res as any).status(400).send("Parâmetro patientId é obrigatório e deve ser numérico para role=patient");
        return;
      }
      const pat = await db.getPatientById(id);
      if (!pat) {
        (res as any).status(400).send("patientId não corresponde a um paciente existente");
        return;
      }
      linkedPatientId = id;
    }

    const displayName =
      getQueryParam(req, "name")?.trim() ||
      process.env.DEV_LOGIN_DISPLAY_NAME?.trim() ||
      (role === "admin"
        ? "Administrador (dev)"
        : role === "user"
          ? "Receção (dev)"
          : role === "doctor"
            ? `Médico (dev) #${linkedDoctorId}`
            : `Paciente (dev) #${linkedPatientId}`);

    const openId =
      role === "admin"
        ? "dev-login-admin"
        : role === "user"
          ? "dev-login-staff"
          : role === "doctor"
            ? `dev-login-doctor-${linkedDoctorId}`
            : `dev-login-patient-${linkedPatientId}`;

    try {
      await db.upsertUser({
        openId,
        name: displayName,
        email: `${openId.replace(/[^a-z0-9-]/gi, "-")}@local.test`,
        loginMethod: "dev-login",
        role,
        linkedDoctorId,
        linkedPatientId,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: displayName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      (res as any).cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      (res as any).redirect(302, redirect);
    } catch (error) {
      console.error("[DevAuth] Login failed", error);
      (res as any).status(500).send("Dev login failed");
    }
  });

  (app as any).get("/api/dev/logout", (req: Request, res: Response) => {
    const redirect = safeRedirectPath(getQueryParam(req, "redirect"));
    const cookieOptions = getSessionCookieOptions(req);
    (res as any).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    (res as any).redirect(302, redirect);
  });
}
