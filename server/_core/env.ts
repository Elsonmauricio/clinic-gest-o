const isDev = process.env.NODE_ENV !== "production";

export type DevAuthRole = "admin" | "user" | "doctor" | "patient";

function parseDevAuthRole(): DevAuthRole {
  const r = process.env.DEV_AUTH_ROLE?.toLowerCase()?.trim();
  if (r === "user" || r === "doctor" || r === "patient") return r;
  return "admin";
}

function parseOptionalPositiveInt(key: string): number | undefined {
  const n = parseInt(process.env[key] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** JWT precisa de payload appId e name não vazios; em dev usamos valores por omissão seguros para desenvolvimento local. */
export const ENV = {
  appId:
    process.env.VITE_APP_ID?.trim() ||
    (isDev ? "clinica-gestao-local" : ""),
  cookieSecret:
    process.env.JWT_SECRET?.trim() ||
    (isDev
      ? "local-dev-jwt-secret-change-with-JWT_SECRET-in-production-min-32"
      : ""),
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Só ativa com DEV_AUTH_BYPASS=1 (login falso "Dev Local" sem cookie).
  // Por omissão em desenvolvimento usa sessão real: /api/dev/login ou OAuth.
  devAuthBypass:
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_AUTH_BYPASS === "1",
  devAuthRole: parseDevAuthRole(),
  devLinkedDoctorId: parseOptionalPositiveInt("DEV_LINKED_DOCTOR_ID"),
  devLinkedPatientId: parseOptionalPositiveInt("DEV_LINKED_PATIENT_ID"),
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
