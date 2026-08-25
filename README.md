# create-next-react-app

Personal scaffolding CLI. Two base templates (Next.js App Router, Vite + React), both preconfigured with Tailwind v4 and zod. shadcn/ui sets itself up automatically on first `install` via a `postinstall` hook, no manual `shadcn init` prompts. Prompts for optional modules on top: backend, ORM, auth, state, and data fetching.

## Setup (one-time)

```bash
git clone <this-repo> create-next-react-app
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
- Prisma? better-auth? Zustand? TanStack Query? react-icons? (all optional, independent toggles)
- Package manager

It copies the base template, layers in the files/deps/env-vars for whatever you picked, merges everything into one `package.json` and `.env.example`, then prints next steps.

Once you `cd` in and run install, two things happen automatically:

1. Your package manager installs everything (all base deps pinned to `latest`, so you always get current major versions).
2. `postinstall` runs `shadcn init -y -f -d -t next|vite --no-monorepo`, which generates `components.json` and the full `globals.css`/`index.css` using shadcn's own current defaults (Base UI primitives, "nova" style, CSS vars, animations, the whole thing), same as if you'd run `shadcn init` by hand and accepted the defaults, just without the prompts.

**Heads up — I couldn't fully verify this last step end-to-end.** My sandbox blocks outbound requests to `ui.shadcn.com` (not on its allowed domain list), so while I confirmed `npm install` correctly triggers the `postinstall` hook, I couldn't confirm the actual shadcn network fetch completes cleanly. The command is built directly from shadcn's official CLI docs (`-y` skip confirm, `-f` force overwrite, `-d` use defaults, `-t` template, `--no-monorepo` to avoid an interactive prompt neither `-y` nor `-d` suppresses), so it should be right, but run `npm install` on a real project once after pulling this and check `components.json` + `globals.css` actually land. If `-d`'s default preset ever changes or breaks, swap in an explicit `-p <preset-name>` (see `npx shadcn@latest init --help` for current preset names).

## Structure

```
templates/
  next-base/     Next.js App Router + Tailwind v4 + zod (shadcn added via postinstall)
  vite-base/     Vite + React + TanStack Router + Tailwind v4 + zod (shadcn added via postinstall)
modules/
  firebase/        lib/firebase.ts + env vars + firebase dep
  supabase/        lib/supabase.ts + env vars + supabase-js dep
  custom-db/       lib/db.ts (raw pg Pool) + DATABASE_URL
  prisma/          prisma/schema.prisma + lib/prisma.ts + db:* scripts
  better-auth/     lib/auth.ts + env vars
  zustand/         store/example-store.ts
  tanstack-query/  lib/query-client.ts + components/query-provider.tsx
  react-icons/     no files, just adds the dependency
bin/create.js      the interactive CLI
```

## Adding a new module later

Drop a new folder in `modules/` with a `manifest.json` (see any existing one for the shape: `dependencies`, `devDependencies`, `envVars`, `files`, optional `scripts`, `postInstallNote`) plus the files it references. Add it to the relevant prompt in `bin/create.js`. No other changes needed, the copy/merge logic is generic.

## Notes

- Templates ship without `node_modules` (as templates should) — the CLI's own deps (`prompts`, `fs-extra`, `kleur`) are separate from what gets scaffolded into your project.
- All base-template dependency versions are set to `"latest"` so every scaffold pulls current majors. If a breaking release ever causes issues, pin the specific package back down in that template's `package.json`.
- `custom-db`'s `lib/db.ts` is a raw `pg` pool, skip it if you're using Prisma, since Prisma manages its own connection.
