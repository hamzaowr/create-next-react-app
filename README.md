# create-next-react-app

Personal scaffolding CLI. Two base templates (Next.js App Router, Vite + React), both preconfigured with Tailwind v4, shadcn/ui (Base UI primitives), and zod. Prompts for optional modules on top: backend, ORM, auth, state, and data fetching.

## Setup (one-time)

```bash
git clone <this-repo> create-next-react-app`
cd create-next-react-app
npm install
npm link          # makes `create-next-react-app` available globally
```

## Usage

```bash
create-next-react-app my-new-project
# or just: create-next-react-app   (it'll prompt for a name too)
```

You'll be walked through:

- Framework: Next.js or Vite + React
- Backend: Firebase / Supabase / custom Postgres / none
- Prisma? better-auth? Zustand? TanStack Query? (all optional, independent toggles)
- Package manager

It copies the base template, layers in the files/deps/env-vars for whatever you picked, merges everything into one `package.json` and `.env.example`, then prints next steps.

## Structure

```
templates/
  next-base/     Next.js App Router + Tailwind v4 + shadcn(Base UI) + zod
  vite-base/     Vite + React + TanStack Router + Tailwind v4 + shadcn(Base UI) + zod
modules/
  firebase/      lib/firebase.ts + env vars + firebase dep
  supabase/      lib/supabase.ts + env vars + supabase-js dep
  custom-db/     lib/db.ts (raw pg Pool) + DATABASE_URL
  prisma/        prisma/schema.prisma + lib/prisma.ts + db:* scripts
  better-auth/   lib/auth.ts + env vars
  zustand/       store/example-store.ts
  tanstack-query/  lib/query-client.ts + components/query-provider.tsx
bin/create.js    the interactive CLI
```

## Adding a new module later

Drop a new folder in `modules/` with a `manifest.json` (see any existing one for the shape: `dependencies`, `devDependencies`, `envVars`, `files`, optional `scripts`, `postInstallNote`) plus the files it references. Add it to the relevant prompt in `bin/create.js`. No other changes needed — the copy/merge logic is generic.

## Notes

- Templates ship without `node_modules` (as templates should) — the CLI's own deps (`prompts`, `fs-extra`, `kleur`) are separate from what gets scaffolded into your project.
- Both base templates use Tailwind v4's CSS-first config (no `tailwind.config.ts`), so after cloning you can go straight to `npx shadcn@latest add <component>` — Base UI is shadcn's default as of July 2026, no extra flag needed. Pass `-b radix` to shadcn init/add if a specific project needs Radix instead.
- `custom-db`'s `lib/db.ts` is a raw `pg` pool — skip it if you're using Prisma, since Prisma manages its own connection.
