#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import prompts from "prompts";
import kleur from "kleur";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const MODULES_DIR = path.join(ROOT, "modules");

const spawnAsync = (cmd, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      ...options,
      stdio: "inherit",
      shell: true,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}`));
    });
  });
};

async function main() {
  const targetArg = process.argv[2];

  const answers = await prompts(
    [
      {
        type: targetArg ? null : "text",
        name: "projectName",
        message: "Project name:",
        initial: "my-app",
      },
      {
        type: "select",
        name: "framework",
        message: "Framework:",
        choices: [
          { title: "Next.js (App Router)", value: "next-base" },
          { title: "Vite + React", value: "vite-base" },
        ],
      },
      {
        type: "select",
        name: "backend",
        message: "Backend:",
        choices: [
          { title: "Firebase", value: "firebase" },
          { title: "Supabase", value: "supabase" },
          { title: "Custom database (Postgres via pg)", value: "custom-db" },
          { title: "None", value: null },
        ],
      },
      {
        type: "confirm",
        name: "usePrisma",
        message: "Add Prisma ORM?",
        initial: false,
      },
      {
        type: "confirm",
        name: "useAuth",
        message: "Add better-auth?",
        initial: false,
      },
      {
        type: "confirm",
        name: "useZustand",
        message: "Add Zustand?",
        initial: false,
      },
      {
        type: "confirm",
        name: "useQuery",
        message: "Add TanStack Query?",
        initial: false,
      },
      {
        type: "confirm",
        name: "useReactIcons",
        message: "Add react-icons?",
        initial: false,
      },
      {
        type: "select",
        name: "shadcnStyle",
        message: "shadcn/ui style:",
        choices: [
          {
            title: "Nova — classic shadcn look, balanced density (default)",
            value: "nova",
          },
          { title: "Vega — tighter padding, compact layouts", value: "vega" },
          { title: "Maia — soft and rounded, generous spacing", value: "maia" },
          {
            title: "Lyra — sharp, boxy, zero radius, pairs with mono fonts",
            value: "lyra",
          },
          { title: "Mira — dense, built for data-heavy UIs", value: "mira" },
          { title: "Luma — softer, more fluid", value: "luma" },
          { title: "Sera — editorial, typographic", value: "sera" },
          { title: "Rhea", value: "rhea" },
        ],
        initial: 0,
      },
      {
        type: "select",
        name: "packageManager",
        message: "Package manager:",
        choices: [
          { title: "pnpm", value: "pnpm" },
          { title: "npm", value: "npm" },
          { title: "yarn", value: "yarn" },
        ],
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        console.log(kleur.red("Cancelled."));
        process.exit(1);
      },
    },
  );

  const projectName = targetArg || answers.projectName;
  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    console.log(kleur.red(`Directory "${projectName}" already exists.`));
    process.exit(1);
  }

  const selectedModules = [
    answers.backend,
    answers.usePrisma ? "prisma" : null,
    answers.useAuth ? "better-auth" : null,
    answers.useZustand ? "zustand" : null,
    answers.useQuery ? "tanstack-query" : null,
    answers.useReactIcons ? "react-icons" : null,
  ].filter(Boolean);

  console.log(
    kleur.cyan(
      `\nScaffolding ${projectName} (${answers.framework}) with: ${selectedModules.join(", ") || "no extra modules"}\n`,
    ),
  );

  // 1. Copy base template
  await fs.copy(path.join(TEMPLATES_DIR, answers.framework), targetDir);
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;

  let envAppend = "";
  const notes = [];

  // 2. Apply each selected module
  for (const modName of selectedModules) {
    const modDir = path.join(MODULES_DIR, modName);
    const manifest = await fs.readJson(path.join(modDir, "manifest.json"));

    for (const file of manifest.files || []) {
      const src = path.join(modDir, file.src);
      const dest = path.join(targetDir, file.dest);
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(src, dest);
    }

    Object.assign((pkg.dependencies ||= {}), manifest.dependencies || {});
    Object.assign((pkg.devDependencies ||= {}), manifest.devDependencies || {});
    if (manifest.scripts) Object.assign((pkg.scripts ||= {}), manifest.scripts);

    if (manifest.envVars?.length) {
      envAppend +=
        `\n# ${manifest.label}\n` + manifest.envVars.join("\n") + "\n";
    }
    if (manifest.postInstallNote) {
      notes.push(`- [${manifest.label}] ${manifest.postInstallNote}`);
    }
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  if (envAppend) {
    await fs.appendFile(path.join(targetDir, ".env.example"), envAppend);
  }

  // 3. Run installations interactively
  console.log(
    kleur.cyan(`\nScaffolding complete. Preparing to install dependencies...`),
  );

  try {
    // Run package manager install
    console.log(kleur.bold(`\n▶ Running ${answers.packageManager} install...`));
    await spawnAsync(answers.packageManager, ["install"], { cwd: targetDir });

    // Run shadcn init interactively
    console.log(kleur.bold(`\nInitializing shadcn/ui...`));

    const shadcnArgs = ["shadcn@latest", "init"];
    // Pass the preset the user chose so they don't get asked twice,
    // but shadcn will still prompt for any other missing configuration.
    if (answers.shadcnStyle && answers.shadcnStyle !== "nova") {
      shadcnArgs.push("--preset", answers.shadcnStyle);
    }

    await spawnAsync("npx", shadcnArgs, { cwd: targetDir });

    // Success output
    console.log(kleur.green(`\nDone! Your project is ready.\n`));
    console.log(`  cd ${projectName}`);
    console.log(`  ${answers.packageManager} run dev\n`);

    if (notes.length) {
      console.log(kleur.yellow("Module notes:"));
      notes.forEach((n) => console.log("  " + n));
      console.log();
    }
  } catch (error) {
    console.error(kleur.red("\nSetup failed:"));
    console.error(error.message);
    console.log(kleur.yellow("\nYou can still manually finish the setup:"));
    console.log(`  cd ${projectName}`);
    console.log(`  ${answers.packageManager} install`);
    console.log(`  npx shadcn@latest init\n`);
    process.exit(1);
  }
}

main();
