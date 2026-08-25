import { betterAuth } from "better-auth";

// Pick the adapter matching your backend module (Prisma, Postgres pool, etc.)
// See: https://better-auth.com/docs/adapters
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
});
