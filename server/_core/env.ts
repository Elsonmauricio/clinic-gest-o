export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // In development, allow bypassing OAuth/cookie auth to unblock local UI work.
  // Set DEV_AUTH_BYPASS=0 to force real auth in development.
  devAuthBypass:
    process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS !== "0",
  // Optional: DEV_AUTH_ROLE=admin|user (defaults to admin)
  devAuthRole:
    process.env.DEV_AUTH_ROLE === "user" ? ("user" as const) : ("admin" as const),
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
