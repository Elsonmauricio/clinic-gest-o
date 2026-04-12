import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isSecureRequest(req: Request) {
  if ((req as any).protocol === "https") return true;

  const forwardedProto = (req as any).headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const host = (req.hostname || "").toLowerCase();
  const local =
    LOCAL_HOSTS.has(host) ||
    host === "" ||
    host.endsWith(".localhost");

  // Em HTTP local, SameSite=None exige Secure=true; o navegador rejeita o cookie.
  // Lax + secure:false faz a sessão funcionar no mesmo site (ex.: localhost:3000).
  if (local || !isSecureRequest(req)) {
    return {
      domain: undefined,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    };
  }

  return {
    domain: undefined,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  };
}
