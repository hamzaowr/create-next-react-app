# create-next-react-app

A personal scaffolding CLI for starting new Next.js or Vite + React projects without redoing the same setup every time.

Two base templates, both preconfigured with Tailwind v4, shadcn/ui, and zod. When you run the CLI, it walks you through a short set of prompts (backend, ORM, auth, state, icons, shadcn style) and scaffolds a new project with only what you picked, deps and env vars merged into one `package.json` and `.env.example`.

## Why this exists

Every new project meant reconfiguring Tailwind, shadcn, and whichever backend/ORM/auth combo that project needed, time that could go into the actual project instead. This tool does that setup once per project in under a minute, and stays flexible enough to handle the fact that not every project uses the same backend or ORM.

## What you get

**Both base templates include, always:**

- TypeScript
- Tailwind v4 (CSS-first config, no `tailwind.config.ts`)
- shadcn/ui — configured automatically on first install (see below), not hand-maintained
- zod
- `lucide-react` (shadcn's icon set)

**Next.js template (`next-base`):** App Router, `next.config.mjs`, `postcss.config.mjs`.

**Vite template (`vite-base`):** Vite + React + TanStack Router (file-based routing already wired in `src/routes/`).

**Optional, prompted per project:**
| Module | Adds |
|---|---|
| Firebase | `lib/firebase.ts`, Firebase env vars, `firebase` dep |
| Supabase | `lib/supabase.ts`, Supabase env vars, `@supabase/supabase-js` dep |
| Custom database | `lib/db.ts` (raw `pg` Pool client), `DATABASE_URL` |
| Prisma | `prisma/schema.prisma`, `lib/prisma.ts`, `db:push`/`db:studio`/`db:generate` scripts |
| better-auth | `lib/auth.ts`, auth env vars |
| Zustand | `store/example-store.ts` |
| TanStack Query | `lib/query-client.ts`, `components/query-provider.tsx` |
| react-icons | just the dependency |

Backend and ORM are independent choices, e.g. custom Postgres + Prisma is a valid combination.

## shadcn/ui setup

Rather than shipping a hand-maintained `components.json` and `globals.css` that drift out of date, both templates run shadcn's own `init` automatically the first time you install:

```
shadcn init -y -f -d -t <next|vite> --no-monorepo
```

This is wired up as a `postinstall` script, so it fires the moment you run `pnpm install` (or `npm`/`yarn`), no manual prompts, no stale hand-copied CSS variables.

You also get a style prompt when scaffolding: **Nova** (default), **Vega**, **Maia**, **Lyra**, **Mira**, **Luma**, **Sera**, or **Rhea**. Picking anything other than Nova swaps the `-d` flag for an explicit `-p <preset>` in the generated `postinstall` script.

**Changing the style later**, once a project already exists:

| Situation                                             | Command                                                                                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Haven't customized any components yet                 | `npx shadcn@latest apply --preset <name>`                                                                                          |
| Already customized components, want to keep that work | `npx shadcn@latest init --preset <name> --force --no-reinstall`, then update components one at a time via `npx shadcn@latest info` |
| Just want new CSS vars/colors, not component code     | `npx shadcn@latest init --preset <name> --force --no-reinstall`                                                                    |

## Setup (one-time, per machine)

```bash
git clone git@github.com:hamzaowr/create-next-react-app.git
cd create-next-react-app
npm install
npm link          # makes `create-next-react-app` available globally
```

Or, once it's pushed to GitHub, skip the clone entirely and run it straight off the repo from any machine:

```bash
npx github:hamzaowr/create-next-react-app my-new-project
```

This does a shallow clone under the hood, installs the CLI's own deps, runs it, and leaves nothing behind, no permanent install, and it always uses whatever's on `main`.

## Usage

```bash
create-next-react-app my-new-project
# or just: create-next-react-app   (it'll prompt for a project name too)
```

You'll be prompted for:

1. Framework — Next.js or Vite + React
2. Backend — Firebase / Supabase / custom Postgres / none
3. Prisma? better-auth? Zustand? TanStack Query? react-icons? — independent yes/no toggles
4. shadcn/ui style — Nova through Rhea
5. Package manager — pnpm / npm / yarn

Then:

```bash
cd my-new-project
pnpm install     # installs deps AND runs shadcn init via postinstall
pnpm dev
```

## Project structure

```
create-next-react-app/
├── bin/
│   └── create.js          the interactive CLI
├── templates/
│   ├── next-base/         Next.js App Router + Tailwind v4 + zod
│   └── vite-base/         Vite + React + TanStack Router + Tailwind v4 + zod
└── modules/
    ├── firebase/
    ├── supabase/
    ├── custom-db/
    ├── prisma/
    ├── better-auth/
    ├── zustand/
    ├── tanstack-query/
    └── react-icons/
```

Each module folder has:

- `manifest.json` — `dependencies`, `devDependencies`, `envVars`, `files` (source → destination pairs), optional `scripts`, optional `postInstallNote`
- the actual files it copies in (e.g. `files/lib/firebase.ts`)

`bin/create.js` reads the manifest for every module you selected, copies its files into the new project, and merges its deps/scripts/env vars into the project's `package.json`/`.env.example`.

## Adding a new module

1. Create `modules/<name>/manifest.json` and whatever files it references under `modules/<name>/files/`.
2. Add a prompt for it in `bin/create.js` (a `confirm` for a simple toggle, or add a `value` to the `backend` select if it's another backend option).
3. Include it in the `selectedModules` array in `bin/create.js`.

No changes needed to the copy/merge logic itself, it's generic and just reads whatever manifest it's given.

## Notes

- Templates ship without `node_modules`, as templates should. The CLI's own dependencies (`prompts`, `fs-extra`, `kleur`) are separate from what gets scaffolded into your project.
- All base-template dependency versions are set to `"latest"`, so every scaffold pulls current majors. If a future breaking release causes problems, pin that specific package back down in the relevant template's `package.json`.
- `custom-db`'s `lib/db.ts` is a raw `pg` pool. Skip it if you're also using Prisma, since Prisma manages its own connection.
- The `shadcn init` step needs real network access to `ui.shadcn.com`. If it ever fails silently in a restricted environment (CI, sandboxed containers), that's the likely cause.
