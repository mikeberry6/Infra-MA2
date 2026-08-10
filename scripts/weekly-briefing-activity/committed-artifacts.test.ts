import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  activityAuditManifestSchema,
  assertManifestArtifactIntegrity,
  canonicalJson,
  deriveSecondReviewReasons,
  hashCanonical,
  sha256Text,
  validateManifestForPublication,
} from "./index";
import {
  currentApprovalSummary,
  verifyReviewPacket,
  type ReviewPacket,
} from "./workflow-packets";
import {
  computeNonChartSha256,
  renderManifestActivityEmail,
} from "./render-charts";
import {
  assertUserAuthorizedPublicationWaiverMatches,
  parseUserAuthorizedPublicationWaiver,
} from "./user-authorized-waiver";
import {
  computeApprovedWeeklyBriefingIndexSha256,
  readApprovedWeeklyBriefingIndex,
  resolveLatestApprovedWeeklyBriefingEdition,
} from "../../src/app/weekly-briefing/approved-editions";

const RUN_DIRECTORY = "audits/weekly-briefing-activity/2026-08-07";

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8")) as unknown;
}

describe("committed August 7 V2 audit artifacts", () => {
  it("binds the evidence-backed 403-candidate classification and all packet files", () => {
    const manifest = activityAuditManifestSchema.parse(readJson(`${RUN_DIRECTORY}/manifest.json`));
    assertManifestArtifactIntegrity(manifest);
    expect(manifest).toMatchObject({
      schemaVersion: 2,
      methodologyVersion: "WEEKLY_BRIEFING_ACTIVITY_V2",
      cutoffDate: "2026-08-07",
      status: "IN_REVIEW",
      expectedCandidateCount: 403,
      publicationApproval: null,
    });
    // One 403-row source candidate contains two legally distinct transactions,
    // so the record-level queue contains two suffixed outputs for that legacy ID.
    expect(manifest.records).toHaveLength(404);
    expect(new Set(manifest.records.map((record) => record.recordId)).size).toBe(404);
    expect(new Set(manifest.records.map((record) => record.legacyId)).size).toBe(403);
    expect(manifest.records.every((record) =>
      record.scope !== "UNRESOLVED"
      && record.review.firstReview === null
      && record.review.secondReview === null)).toBe(true);
    expect(manifest.records.filter((record) => record.splitSuffix !== null).map((record) => record.recordId))
      .toEqual([
        "INF-2026-077#substantial-group-acquisition",
        "INF-2026-077#youfibre-brsk-sale",
      ]);
    expect(manifest.totals).toEqual({
      grandTotal: { directFund: 285, portfolioCompany: 117, total: 402 },
      bySector: [
        { sector: "Power & ET", counts: { directFund: 100, portfolioCompany: 56, total: 156 } },
        { sector: "Utilities", counts: { directFund: 28, portfolioCompany: 10, total: 38 } },
        { sector: "Digital", counts: { directFund: 53, portfolioCompany: 20, total: 73 } },
        { sector: "Midstream", counts: { directFund: 19, portfolioCompany: 3, total: 22 } },
        { sector: "Transportation", counts: { directFund: 53, portfolioCompany: 22, total: 75 } },
        { sector: "Social Infra", counts: { directFund: 32, portfolioCompany: 6, total: 38 } },
      ],
      byRegion: [
        { region: "North America", counts: { directFund: 115, portfolioCompany: 52, total: 167 } },
        { region: "Europe", counts: { directFund: 110, portfolioCompany: 47, total: 157 } },
        { region: "Asia-Pacific", counts: { directFund: 44, portfolioCompany: 16, total: 60 } },
        { region: "Latin America", counts: { directFund: 11, portfolioCompany: 2, total: 13 } },
        { region: "Middle East & Africa", counts: { directFund: 5, portfolioCompany: 0, total: 5 } },
      ],
    });
    expect(currentApprovalSummary(manifest)).toEqual({
      firstCurrent: 0,
      secondReviewAssessmentPending: 404,
      secondRequired: 0,
      secondCurrent: 0,
      unresolved: 0,
    });

    const validation = validateManifestForPublication(manifest, {
      repositoryRoot: process.cwd(),
    });
    const codeCounts = validation.issues.reduce<Record<string, number>>((counts, issue) => {
      counts[issue.code] = (counts[issue.code] ?? 0) + 1;
      return counts;
    }, {});
    expect(validation.ok).toBe(false);
    expect(validation.issues).toHaveLength(421);
    expect(codeCounts).toEqual({
      MISSING_FIRST_REVIEW: 404,
      MISSING_SECOND_REVIEW: 15,
      MANIFEST_NOT_APPROVED: 1,
      FINAL_CONTROL_MISMATCH: 1,
    });

    const index = readJson(`${RUN_DIRECTORY}/reviews/first/index.json`) as {
      indexSha256: string;
      packetCount: number;
      recordCount: number;
      baseManifestSha256: string;
      packets: Array<{ packetId: string; packetSha256: string; recordCount: number }>;
    };
    const { indexSha256, ...indexWithoutHash } = index;
    expect(indexSha256).toBe(hashCanonical(
      "weekly-briefing-activity-review-packet-index-v2",
      indexWithoutHash,
    ));
    expect(index).toMatchObject({
      packetCount: 17,
      recordCount: 404,
      baseManifestSha256: manifest.manifestSha256,
    });

    const queuedIds = new Set<string>();
    for (const packetEntry of index.packets) {
      const packetPath = `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.packet.json`;
      const packet = verifyReviewPacket(readJson(packetPath));
      expect(packet.packetSha256).toBe(packetEntry.packetSha256);
      expect(packet.recordCount).toBe(packetEntry.recordCount);
      expect(packet.baseManifestSha256).toBe(manifest.manifestSha256);
      for (const record of packet.records) {
        expect(queuedIds.has(record.recordId)).toBe(false);
        queuedIds.add(record.recordId);
      }

      const review = readJson(
        `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.review.json`,
      ) as {
        packetId: string;
        packetSha256: string;
        reviewer: string;
        reviewedAt: string;
        humanAttestation: Record<string, boolean>;
        decisions: Array<{
          baseRecordId: string;
          baseReviewedInputHash: string;
          outputs: Array<{ reviewedRecord: ReviewPacket["records"][number]["record"]; notes: string }>;
        }>;
      };
      expect(review).toMatchObject({
        packetId: packet.packetId,
        packetSha256: packet.packetSha256,
        reviewer: "REPLACE_WITH_HUMAN_NAME",
        reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
      });
      expect(Object.keys(review.humanAttestation).sort()).toEqual([
        "classificationVerified",
        "dispositionVerified",
        "evidenceOpened",
        "performedByHuman",
      ]);
      expect(Object.values(review.humanAttestation).every((value) => value === false)).toBe(true);
      expect(review.decisions).toHaveLength(packet.recordCount);
      const packetById = new Map(packet.records.map((record) => [record.recordId, record]));
      for (const decision of review.decisions) {
        const packetRecord = packetById.get(decision.baseRecordId);
        expect(packetRecord).toBeDefined();
        expect(decision.baseReviewedInputHash).toBe(packetRecord?.baseReviewedInputHash);
        expect(decision.outputs).toHaveLength(1);
        expect(decision.outputs[0].notes).toBe("");
        expect(canonicalJson(decision.outputs[0].reviewedRecord)).toBe(canonicalJson(packetRecord?.record));
      }

      const markdown = readFileSync(join(
        process.cwd(),
        `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.md`,
      ), "utf8");
      expect(markdown).toContain("**Recommended scope**");
      expect(markdown).toContain("Original automation candidate *(research prompt; not approval)*");
      expect(markdown).toContain("Acting entity");
      expect(markdown).toContain("Sponsor lineage");
      expect(markdown).toContain("Scope rationale");
      expect(markdown).toContain("Disposition rationale");
      expect(markdown).toContain("Evidence to open:");

      const worksheet = readJson(
        `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.worksheet.json`,
      ) as {
        artifactType: string;
        packetId: string;
        packetSha256: string;
        reviewer: string;
        reviewedAt: string;
        humanAttestation: Record<string, boolean>;
        decisions: Array<{
          baseRecordId: string;
          baseReviewedInputHash: string;
          evidenceOpened: boolean;
          decision: string;
          outputs: Array<{ notes: string }>;
        }>;
      };
      expect(worksheet).toMatchObject({
        artifactType: "WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET",
        packetId: packet.packetId,
        packetSha256: packet.packetSha256,
        reviewer: "REPLACE_WITH_HUMAN_NAME",
        reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
      });
      expect(Object.values(worksheet.humanAttestation).every((value) => value === false)).toBe(true);
      expect(worksheet.decisions).toHaveLength(packet.recordCount);
      for (const decision of worksheet.decisions) {
        const packetRecord = packetById.get(decision.baseRecordId);
        expect(packetRecord).toBeDefined();
        expect(decision).toMatchObject({
          baseReviewedInputHash: packetRecord?.baseReviewedInputHash,
          evidenceOpened: false,
          decision: "REPLACE_WITH_ACCEPT_RECOMMENDATION_OR_EDITED_RECORD",
          outputs: [{ notes: "" }],
        });
      }
    }
    expect(queuedIds).toEqual(new Set(manifest.records.map((record) => record.recordId)));

    const canonicalExceptions = manifest.records
      .filter((record) => deriveSecondReviewReasons(record).length > 0);
    expect(canonicalExceptions).toHaveLength(15);
    const reviewIndex = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/reviews/index.md`),
      "utf8",
    );
    expect(reviewIndex).toContain("First approvals current | 0 / 404");
    expect(reviewIndex).toContain("NON-APPROVABLE PREVIEW — 15 canonical exception records");
    expect(reviewIndex).toContain("second-review-exception-preview.md");
    const exceptionPreview = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/reviews/second-review-exception-preview.md`),
      "utf8",
    );
    expect(exceptionPreview).toContain("PLANNING ONLY — NOT A REVIEW PACKET, SIGNATURE, OR APPROVAL");
    expect(exceptionPreview.match(/^## \d+\./gm)).toHaveLength(15);
    for (const record of canonicalExceptions) {
      expect(exceptionPreview).toContain(`\`${record.recordId}\``);
    }
  });

  it("publishes only the deterministic August 7 charts through the exact user-authorized waiver", async () => {
    const manifestRaw = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/manifest.json`),
      "utf8",
    );
    const manifest = activityAuditManifestSchema.parse(JSON.parse(manifestRaw));
    assertManifestArtifactIntegrity(manifest);

    const publicEmail = readFileSync(
      join(process.cwd(), "public/email-format/2026-08-07.html"),
      "utf8",
    );
    const previewEmail = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/preview/2026-08-07.html`),
      "utf8",
    );
    expect(publicEmail).toBe(previewEmail);
    expect(sha256Text(publicEmail))
      .toBe("59ca9ba91ad31ee093f29a0368ce7ad20f3040bd2408f045d42d5c6f3dffe68b");
    expect(computeNonChartSha256(publicEmail))
      .toBe("9970916e829cda394f57126c723bd7ba76a8e5709f0b80a0a2488a9fa0d9767c");
    expect(renderManifestActivityEmail({
      sourceHtml: publicEmail,
      manifest,
      expectedNonChartSha256:
        "9970916e829cda394f57126c723bd7ba76a8e5709f0b80a0a2488a9fa0d9767c",
    }).html).toBe(publicEmail);

    const parsedEmail = new DOMParser().parseFromString(publicEmail, "text/html");
    expect(parsedEmail.querySelectorAll("table[data-activity-legend]")).toHaveLength(1);
    const chartPresentationOrder = Array.from(parsedEmail.querySelectorAll<HTMLTableElement>(
      "table[data-activity-chart], table[data-activity-legend]",
    )).map((table) => table.dataset.activityChart ?? "legend");
    expect(chartPresentationOrder).toEqual(["sector", "region", "legend"]);
    const charts = Array.from(
      parsedEmail.querySelectorAll<HTMLTableElement>("table[data-activity-chart]"),
    );
    expect(charts.map((chart) => chart.dataset.activityChart)).toEqual([
      "sector",
      "region",
    ]);
    const expectedRows = [
      [
        ["Power & ET", 100, 56, 156, 100],
        ["Transportation", 53, 22, 75, 48],
        ["Digital", 53, 20, 73, 47],
        ["Utilities", 28, 10, 38, 24],
        ["Social Infra", 32, 6, 38, 24],
        ["Midstream", 19, 3, 22, 14],
      ],
      [
        ["North America", 115, 52, 167, 100],
        ["Europe", 110, 47, 157, 94],
        ["Asia-Pacific", 44, 16, 60, 36],
        ["Latin America", 11, 2, 13, 8],
        ["Middle East & Africa", 5, 0, 5, 3],
      ],
    ];
    charts.forEach((chart, chartIndex) => {
      expect(chart.dataset.activityPeriod).toBe("2026 YTD through 2026-08-07");
      expect(chart.querySelector("div, svg, script, style, [class]")).toBeNull();
      expect(chart.outerHTML).not.toMatch(
        /display:\s*(?:flex|grid)|var\(--|gradient|position:\s*absolute/i,
      );
      const rows = Array.from(
        chart.querySelectorAll<HTMLTableRowElement>("tr[data-activity-row]"),
      );
      expect(rows.map((row) => [
        row.dataset.activityRow,
        Number(row.dataset.direct),
        Number(row.dataset.portfolio),
        Number(row.dataset.total),
        Number(row.dataset.originalFill),
      ])).toEqual(expectedRows[chartIndex]);

      for (const row of rows) {
        const direct = Number(row.dataset.direct);
        const portfolio = Number(row.dataset.portfolio);
        const total = Number(row.dataset.total);
        const originalFill = Number(row.dataset.originalFill);
        expect(direct + portfolio).toBe(total);
        const labelTables = Array.from(
          row.querySelectorAll<HTMLTableElement>("table[data-activity-stack-labels]"),
        );
        expect(labelTables).toHaveLength(1);
        const labelTable = labelTables[0];
        const directLabels = Array.from(
          labelTable.querySelectorAll<HTMLElement>(
            '[data-activity-stack-label="direct"]',
          ),
        );
        const portfolioLabels = Array.from(
          labelTable.querySelectorAll<HTMLElement>(
            '[data-activity-stack-label="portfolio"]',
          ),
        );
        expect(directLabels).toHaveLength(1);
        expect(portfolioLabels).toHaveLength(1);
        const directLabel = directLabels[0];
        const portfolioLabel = portfolioLabels[0];
        expect(directLabel.dataset.activityCount).toBe(String(direct));
        expect(portfolioLabel.dataset.activityCount).toBe(String(portfolio));
        const normalizeLabelText = (value: string | null): string => (value ?? "")
          .replace(/\u00a0/g, " ")
          .replace(/\s*·\s*/g, " · ")
          .replace(/\s+/g, " ")
          .trim();
        expect(normalizeLabelText(labelTable.textContent))
          .toBe(`${direct} Direct · ${portfolio} Portfolio`);
        expect(normalizeLabelText(directLabel.textContent)).toBe(`${direct} Direct`);
        expect(normalizeLabelText(portfolioLabel.textContent)).toBe(`${portfolio} Portfolio`);
        const directCount = directLabel.querySelector<HTMLElement>("span");
        const portfolioCount = portfolioLabel.querySelector<HTMLElement>("span");
        expect(normalizeLabelText(directCount?.textContent ?? null)).toBe(String(direct));
        expect(normalizeLabelText(portfolioCount?.textContent ?? null)).toBe(String(portfolio));
        expect(directCount?.getAttribute("style")).toContain("color: #442142");
        expect(portfolioCount?.getAttribute("style")).toContain("color: #766B43");
        expect(labelTable.querySelectorAll("[data-activity-segment]")).toHaveLength(0);

        const segments = Array.from(
          row.querySelectorAll<HTMLTableCellElement>("td[data-activity-segment]"),
        );
        expect(new Set(segments.map((segment) => segment.closest("table"))).size).toBe(1);
        expect(segments[0]?.closest("table")).not.toBe(labelTable);
        const widths = new Map(segments.map((segment) => [
          segment.dataset.activitySegment,
          Number(segment.getAttribute("width")?.replace("%", "")),
        ]));
        expect((widths.get("direct") ?? 0) + (widths.get("portfolio") ?? 0))
          .toBe(originalFill);
        expect(widths.get("remainder") ?? 0).toBe(100 - originalFill);
        expect(Array.from(widths.values()).reduce((sum, width) => sum + width, 0))
          .toBe(100);
        for (const segment of segments) {
          expect(segment.getAttribute("height")).toBe("14");
          expect(segment.hasAttribute("bgcolor")).toBe(true);
          expect(segment.getAttribute("style")).toContain("background-color:");
        }
        const directSegment = row.querySelector<HTMLTableCellElement>(
          'td[data-activity-segment="direct"]',
        );
        const portfolioSegment = row.querySelector<HTMLTableCellElement>(
          'td[data-activity-segment="portfolio"]',
        );
        expect(directSegment?.getAttribute("bgcolor")).toBe("#442142");
        if ((widths.get("portfolio") ?? 0) > 0) {
          expect(portfolioSegment?.getAttribute("bgcolor")).toBe("#8F7C4D");
        } else {
          expect(portfolioSegment).toBeNull();
        }
      }
      expect(rows.reduce(
        (sum, row) => sum + Number(row.dataset.direct),
        0,
      )).toBe(285);
      expect(rows.reduce(
        (sum, row) => sum + Number(row.dataset.portfolio),
        0,
      )).toBe(117);
      expect(rows.reduce(
        (sum, row) => sum + Number(row.dataset.total),
        0,
      )).toBe(402);
    });

    expect(sha256Text(readFileSync(join(process.cwd(), "public/email-format/2026-07-31.html"), "utf8")))
      .toBe("17ae39249677e8f57db1038641cbb582357576ac6465b92bea2dc3f71c58388e");

    const waiverRaw = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/user-authorized-publication-waiver.json`),
      "utf8",
    );
    const waiver = parseUserAuthorizedPublicationWaiver(waiverRaw);
    expect(waiver).toMatchObject({
      edition: "2026-08-07",
      manifestPath: `${RUN_DIRECTORY}/manifest.json`,
      manifestSha256:
        "124a216beaa42516397269ef9e4cec81e1bcf75e63dc8adbe8986d8e23d3d268",
      manifestStatus: "IN_REVIEW",
      publicationApprovalPresent: false,
      finalApprovedTotal: null,
      protectedNonChartSha256:
        "9970916e829cda394f57126c723bd7ba76a8e5709f0b80a0a2488a9fa0d9767c",
      renderedEmailSha256:
        "59ca9ba91ad31ee093f29a0368ce7ad20f3040bd2408f045d42d5c6f3dffe68b",
      validationIssueCount: 421,
      validationIssueCodeCounts: {
        MISSING_FIRST_REVIEW: 404,
        MISSING_SECOND_REVIEW: 15,
        MANIFEST_NOT_APPROVED: 1,
        FINAL_CONTROL_MISMATCH: 1,
      },
      totals: {
        directFund: 285,
        portfolioCompany: 117,
        total: 402,
      },
    });
    assertUserAuthorizedPublicationWaiverMatches(waiver, {
      repositoryRoot: process.cwd(),
      manifest,
      manifestFileSha256: sha256Text(manifestRaw),
      renderedEmailSha256: sha256Text(publicEmail),
      protectedNonChartSha256: computeNonChartSha256(publicEmail),
    });

    const approvedIndexRaw = readFileSync(
      join(process.cwd(), "public/email-format/approved-editions.json"),
      "utf8",
    );
    const approvedIndex = await readApprovedWeeklyBriefingIndex();
    expect(approvedIndex.indexSha256).toBe(
      computeApprovedWeeklyBriefingIndexSha256(approvedIndex),
    );
    expect(approvedIndex.entries.map((entry) => entry.edition)).toEqual([
      "2026-07-31",
      "2026-08-07",
    ]);
    const augustEntry = approvedIndex.entries.find(
      (entry) => entry.edition === "2026-08-07",
    );
    expect(augustEntry).toEqual({
      edition: "2026-08-07",
      approval: {
        kind: "USER_AUTHORIZED_WAIVER",
        manifestPath: `${RUN_DIRECTORY}/manifest.json`,
        manifestSha256: manifest.manifestSha256,
        emailPath: "public/email-format/2026-08-07.html",
        renderedEmailSha256: sha256Text(publicEmail),
        protectedNonChartSha256: computeNonChartSha256(publicEmail),
        waiverPath: `${RUN_DIRECTORY}/user-authorized-publication-waiver.json`,
        waiverSha256: sha256Text(waiverRaw),
      },
    });
    expect(resolveLatestApprovedWeeklyBriefingEdition({
      index: approvedIndex,
      archivedEditions: ["2026-08-07", "2026-07-31"],
    })).toBe("2026-08-07");
    expect(JSON.parse(approvedIndexRaw)).toEqual(approvedIndex);
  });
});
