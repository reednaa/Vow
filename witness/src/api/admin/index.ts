import { Elysia } from "elysia";
import staticPlugin from "@elysiajs/static";
import { createAuthHandler } from "./auth.ts";
import { createAdminApiPlugin } from "./api.ts";

export function createAdminHandler(
  db: any,
  adminPasswordHash: string | null,
  adminJwtSecret: string | null
) {
  if (!adminPasswordHash || !adminJwtSecret) {
    return new Elysia()
      .all("/admin/auth/*", ({ set }) => {
        set.status = 503;
        return {
          error:
            "Admin not configured. Set ADMIN_PASSWORD_HASH and ADMIN_JWT_SECRET environment variables.",
        };
      })
      .all("/admin/api/*", ({ set }) => {
        set.status = 503;
        return {
          error:
            "Admin not configured. Set ADMIN_PASSWORD_HASH and ADMIN_JWT_SECRET environment variables.",
        };
      });
  }

  return new Elysia()
    .use(createAuthHandler(adminPasswordHash, adminJwtSecret))
    .use(createAdminApiPlugin(db, adminJwtSecret))
    .use(
      staticPlugin({
        assets: "public/admin",
        prefix: "/admin",
      })
    );
}
