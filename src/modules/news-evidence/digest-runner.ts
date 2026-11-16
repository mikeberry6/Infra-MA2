import { assertMutationDatabaseTargetFromEnv } from "@/lib/database-target";
import { withImportTransaction } from "@/lib/prisma-transaction";
import { buildNextDigestEdition } from "./digest";

function endpoint(host: string) {
  return host.trim().toLowerCase().replace(/-pooler(?=\.|$)/, "");
}

export async function runStagingNewsDigest() {
  if (process.env.NEWS_DIGEST_ENABLED !== "true") throw new Error("The news digest is disabled.");
  if (process.env.VERCEL_ENV === "production" || process.env.NEWS_PIPELINE_TARGET !== "staging") {
    throw new Error("Set NEWS_PIPELINE_TARGET=staging and use an isolated database.");
  }
  assertMutationDatabaseTargetFromEnv();
  const target = endpoint(new URL(process.env.DATABASE_URL ?? "").hostname);
  const forbidden = [process.env.FORBIDDEN_DATABASE_HOST, process.env.FORBIDDEN_DATABASE_HOST_2];
  if (forbidden.some((host) => host && endpoint(host) === target)) {
    throw new Error("Database mutation target is explicitly forbidden.");
  }

  const startDate = process.env.NEWS_DIGEST_START_DATE;
  if (!startDate) throw new Error("Set NEWS_DIGEST_START_DATE to the first Eastern edition date.");

  const now = new Date();
  const editions = [];
  for (let count = 0; count < 31; count += 1) {
    const edition = await withImportTransaction((tx) => buildNextDigestEdition(tx, { now, startDate }));
    if (!edition) break;
    editions.push({ date: edition.date, count: edition._count.entries });
  }
  return { editions };
}
