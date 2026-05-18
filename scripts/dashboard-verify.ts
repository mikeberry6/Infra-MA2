import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DASHBOARD_METRICS } from "../src/modules/dashboard/catalog";
import { buildSampleDashboardView } from "../src/modules/dashboard/sample";

type VerifySummary = {
  runAt: string;
  catalog: {
    metrics: number;
    duplicateMetricIds: string[];
  };
  sampleView: {
    stance: string;
    score: number;
    sections: number;
    sourceHealthRows: number;
  };
  database?: {
    available: boolean;
    metricDefinitions?: number;
    observations?: number;
    signals?: number;
    sourceRuns?: number;
    error?: string;
  };
};

async function main() {
  const ids = DASHBOARD_METRICS.map((metric) => metric.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const sample = buildSampleDashboardView("Verification sample view");
  const summary: VerifySummary = {
    runAt: new Date().toISOString(),
    catalog: {
      metrics: DASHBOARD_METRICS.length,
      duplicateMetricIds: Array.from(new Set(duplicates)),
    },
    sampleView: {
      stance: sample.scorecard.stance,
      score: sample.scorecard.score,
      sections: sample.sections.length,
      sourceHealthRows: sample.sourceHealth.length,
    },
  };

  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    try {
      const [metricDefinitions, observations, signals, sourceRuns] = await Promise.all([
        prisma.dashboardMetricDefinition.count(),
        prisma.dashboardObservation.count(),
        prisma.dashboardSignal.count(),
        prisma.dashboardSourceRun.count(),
      ]);
      summary.database = {
        available: true,
        metricDefinitions,
        observations,
        signals,
        sourceRuns,
      };
    } catch (error) {
      summary.database = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await prisma.$disconnect();
    }
  } else {
    summary.database = {
      available: false,
      error: "DATABASE_URL is not set; database checks skipped.",
    };
  }

  await mkdir("tmp", { recursive: true });
  const outPath = path.join("tmp", "dashboard-verify-summary.json");
  await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`);

  if (summary.catalog.duplicateMetricIds.length > 0) {
    throw new Error(`Duplicate dashboard metric ids: ${summary.catalog.duplicateMetricIds.join(", ")}`);
  }

  console.log(`Dashboard verification complete. Sample stance ${summary.sampleView.stance} (${summary.sampleView.score}/100).`);
  console.log(`Catalog metrics: ${summary.catalog.metrics}; summary written to ${outPath}`);
  if (summary.database?.available) {
    console.log(`Database rows: ${summary.database.metricDefinitions} definitions, ${summary.database.observations} observations, ${summary.database.signals} signals, ${summary.database.sourceRuns} source runs.`);
  } else {
    console.log(`Database check skipped/failed: ${summary.database?.error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
