# Next.js base template

Next.js App Router + TypeScript + Tailwind v4 + zod.

shadcn/ui is set up automatically: `npm install` (or pnpm/yarn) triggers a `postinstall`
hook that runs `shadcn init -y -f -d -t next --no-monorepo`, which generates
`components.json` and the full `app/globals.css` (CSS variables, animations, etc.)
using shadcn's current defaults — no manual prompts, no hand-maintained CSS to
go stale.

## After scaffolding

```bash
pnpm install          # also runs the shadcn postinstall step
npx shadcn@latest add button   # add components as needed
pnpm dev
```
