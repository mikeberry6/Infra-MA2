import "dotenv/config";
import { runStagingNewsDigest } from "../src/modules/news-evidence/digest-runner";

runStagingNewsDigest().then((result) => {
  console.log(JSON.stringify(result));
}).catch((error: unknown) => {
  console.error("News digest failed.", error instanceof Error ? error.name : "UnknownError");
  process.exitCode = 1;
});
