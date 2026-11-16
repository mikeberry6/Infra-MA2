import { createHash, timingSafeEqual } from "node:crypto";
import { withImportTransaction } from "@/lib/prisma-transaction";
import { runStagingNewsDigest } from "@/modules/news-evidence/digest-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store, max-age=0" };

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "preview" || process.env.NEWS_PIPELINE_TARGET !== "staging"
    || process.env.NEWS_DIGEST_ENABLED !== "true") {
    return Response.json({ error: "Not found" }, { status: 404, headers });
  }

  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || secret.length < 16 || !authorization
    || !timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`))) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const scheduleId = request.headers.get("ce-vssscheduleid");
  const executionId = request.headers.get("ce-id");
  const eventType = request.headers.get("ce-type");
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID ?? null;
  const deploymentNonce = process.env.NEWS_STAGING_DEPLOYMENT_NONCE ?? null;
  if (!scheduleId || !/^sch_[a-zA-Z0-9_-]{1,120}$/.test(scheduleId)
    || !executionId || !/^[a-zA-Z0-9_-]{1,128}$/.test(executionId)
    || eventType !== "com.vercel.schedule.v1beta" || (!deploymentId && !deploymentNonce)) {
    return Response.json({ error: "Invalid schedule invocation" }, { status: 400, headers });
  }

  const startedAt = new Date();
  try {
    const result = await runStagingNewsDigest();
    await withImportTransaction((tx) => tx.pipelineRun.create({
      data: {
        pipeline: "evidence-news-staging-digest",
        status: "SUCCEEDED",
        startedAt,
        endedAt: new Date(),
        inserted: result.editions.length,
        metadata: { scheduleId, executionId, deploymentId, deploymentNonce },
      },
      select: { id: true },
    }));
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: "Staging digest failed" }, { status: 500, headers });
  }
}
