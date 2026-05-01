import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

function section(title: string) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function run(label: string, command: string, args: string[] = []) {
  try {
    const output = execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    console.log(`OK ${label}`);
    if (output) console.log(output.split("\n").slice(0, 8).join("\n"));
  } catch (error) {
    console.log(`WARN ${label}`);
    if (error instanceof Error) console.log(error.message);
  }
}

function envNames(path: string): string[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0])
    .sort();
}

section("Runtime");
console.log(`Node: ${process.version}`);
run("npm", "npm", ["--version"]);

section("GitHub");
run("gh auth", "gh", ["auth", "status", "-h", "github.com"]);
run("repo", "gh", [
  "repo",
  "view",
  "mikeberry6/Infra-MA2",
  "--json",
  "nameWithOwner,defaultBranchRef,viewerPermission",
]);

section("Vercel");
run("whoami", "vercel", ["whoami"]);
if (existsSync(".vercel/project.json")) {
  console.log(`OK linked project: ${readFileSync(".vercel/project.json", "utf8").trim()}`);
} else {
  console.log("WARN .vercel/project.json is missing; run `vercel link --yes --project infra-ma-2`.");
}

section("Environment");
const names = envNames(".env.local");
if (names.length === 0) {
  console.log("WARN .env.local is missing or empty.");
} else {
  console.log(`OK .env.local names (${names.length}): ${names.join(", ")}`);
}
for (const required of ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]) {
  console.log(`${names.includes(required) ? "OK" : "WARN"} ${required}`);
}

section("Local Checks");
run("typecheck", "npx", ["tsc", "--noEmit"]);
run("tests", "npm", ["test"]);
