import { prisma } from "../src/lib/prisma";
import { cleanupStoredImportPreviews } from "../src/modules/imports/preview-store";

const BATCH_SIZE = 500;
const MAX_BATCHES = 10;

async function main() {
  let deleted = 0;
  let batches = 0;

  while (batches < MAX_BATCHES) {
    const batchDeleted = await cleanupStoredImportPreviews({
      limit: BATCH_SIZE,
    });
    deleted += batchDeleted;
    batches += 1;
    if (batchDeleted < BATCH_SIZE) break;
  }

  console.log(JSON.stringify({
    event: "import_preview_cleanup",
    deleted,
    batches,
    batchSize: BATCH_SIZE,
    bounded: true,
  }));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({
      event: "import_preview_cleanup_failure",
      errorType: error instanceof Error ? error.name : "UnknownError",
    }));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
