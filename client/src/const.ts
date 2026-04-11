export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export type DevLoginRole = "admin" | "user" | "doctor" | "patient";

/** Login de desenvolvimento com papel e ligação opcional a médico/paciente na BD. */
export function getDevLoginUrl(opts: {
  role: DevLoginRole;
  doctorId?: number;
  patientId?: number;
  name?: string;
}) {
  const next =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/";
  const params = new URLSearchParams();
  params.set("redirect", next);
  params.set("role", opts.role);
  if (opts.doctorId != null) params.set("doctorId", String(opts.doctorId));
  if (opts.patientId != null) params.set("patientId", String(opts.patientId));
  if (opts.name?.trim()) params.set("name", opts.name.trim());
  return `${window.location.origin}/api/dev/login?${params.toString()}`;
}

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  if (import.meta.env.VITE_DEV_LOGIN === "1") {
    return getDevLoginUrl({ role: "admin" });
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID || "clinica-gestao-local";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
