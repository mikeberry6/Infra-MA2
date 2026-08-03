import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { toCsv } from "../../src/lib/csv";
import type {
  FundRefreshCandidate,
  FundRefreshEvidence,
  FundRefreshSnapshot,
} from "../../src/modules/funds/refresh-schema";
import {
  canonicalJson,
  canonicalManagerKey,
  evidenceSourceId,
  loadFundEvidenceManifestAtCommit,
  loadFundManifestAtCommit,
  normalizeIdentity,
  snapshotChangedFields,
  validateFundEvidenceManifest,
  validateFundRefreshCandidate,
  type EvidenceManifestRecord,
  type FundEvidenceManifest,
  type FundManifest,
  type FundManifestRecord,
} from "../fund-refresh/lib";
import { REPO_ROOT } from "./lib";

const RUN_DIRECTORY = path.join(
  REPO_ROOT,
  "audits/fund-refresh/2026-08-02-lineage-additions",
);
const POLICY_PATH = path.join(RUN_DIRECTORY, "implementation-policy.json");
const SOURCE_PLAN_PATH = path.join(
  REPO_ROOT,
  "audits/fund-census/2026-07-29/implementation/promotion-plan.json",
);
const FUND_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "prisma/seed-data/funds.manifest.json",
);
const EVIDENCE_MANIFEST_PATH = path.join(
  REPO_ROOT,
  "prisma/seed-data/fund-evidence.manifest.json",
);

interface LineagePolicy {
  schemaVersion: 1;
  runId: string;
  baseCommit: string;
  sourceCensusPlan: string;
  retrievedAt: string;
  selectionRule: string;
  includedLegacyIds: string[];
  excludedReviewedCandidates: Array<{
    legacyId: string;
    fundName: string;
    reason: string;
  }>;
  expected: {
    baselineFunds: number;
    includedAdditions: number;
    finalFunds: number;
    affectedRatio: number;
    newOwnershipLinks: number;
  };
  releasePolicy: {
    manifestMaterialization: true;
    productionApply: false;
    ownershipMutation: false;
    requiresTrustedLiveAudit: true;
    requiresGpt56ProReview: true;
    requiresHumanReview: true;
  };
}

interface SourcePlanCandidate {
  action: "CREATE" | "UPDATE";
  legacyId: string;
  after: FundRefreshSnapshot;
  rationale: string;
}

interface SourcePromotionPlan {
  candidates: SourcePlanCandidate[];
}

interface CuratedFund {
  snapshotPatch?: Partial<FundRefreshSnapshot>;
  evidence: FundRefreshEvidence[];
  note: string;
}

export interface LineageRelease {
  policy: LineagePolicy;
  baselineManifest: FundManifest;
  manifest: FundManifest;
  evidenceManifest: FundEvidenceManifest;
  candidates: FundRefreshCandidate[];
  candidateSetHash: string;
}

const RETRIEVED_AT = "2026-08-02";
const CHECKED_AT = "2026-08-02T23:30:00-04:00";

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function source(
  url: string,
  supportedFields: Array<keyof FundRefreshSnapshot>,
  evidenceLabel: string,
  options: Partial<Pick<
    FundRefreshEvidence,
    "sourceTier" | "scope" | "publishedAt" | "confidence"
  >> = {},
): FundRefreshEvidence {
  return {
    sourceId: evidenceSourceId(url),
    url,
    supportedFields: [...new Set(supportedFields)].sort(),
    sourceTier: options.sourceTier ?? "PRIMARY",
    scope: options.scope ?? "FUND",
    publishedAt: options.publishedAt ?? null,
    retrievedAt: RETRIEVED_AT,
    confidence: options.confidence ?? "HIGH",
    evidenceLabel,
  };
}

const ALL_DESCRIPTIVE_FIELDS: Array<keyof FundRefreshSnapshot> = [
  "fundName",
  "fundStatus",
  "investmentStrategy",
  "managerName",
  "regions",
  "sectors",
  "strategies",
  "structure",
  "vintage",
];

const ALL_SIZE_FIELDS: Array<keyof FundRefreshSnapshot> = [
  "size",
  "sizeAsOf",
  "sizeBasis",
  "sizeNativeAmount",
  "sizeNativeCurrency",
  "sizeUsdMm",
];

const CURATED: Record<string, CuratedFund> = {
  "FUND-151": {
    snapshotPatch: {
      sourceUrls: [
        "https://www.antin-ip.com/who-we-are/strategies/mid-cap",
        "https://www.antin-ip.com/wp-content/uploads/2025/12/Antin-FY25-Results-Transcript-1.pdf",
        "https://www.antin-ip.com/wp-content/uploads/2026/05/Antin-1Q26-Activity-Update-PR-VF.pdf",
      ],
      strategyUrl: "https://www.antin-ip.com/who-we-are/strategies/mid-cap",
    },
    evidence: [
      source(
        "https://www.antin-ip.com/who-we-are/strategies/mid-cap",
        [
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          "strategies",
        ],
        "Official Mid Cap strategy, sectors and North American mandate",
      ),
      source(
        "https://www.antin-ip.com/wp-content/uploads/2025/12/Antin-FY25-Results-Transcript-1.pdf",
        [
          "fundName",
          "fundStatus",
          "managerName",
          ...ALL_SIZE_FIELDS,
          "structure",
          "vintage",
        ],
        "Official Mid Cap II target and fundraising timetable",
        { publishedAt: "2026-03-12" },
      ),
      source(
        "https://www.antin-ip.com/wp-content/uploads/2026/05/Antin-1Q26-Activity-Update-PR-VF.pdf",
        ["fundName", "fundStatus", "managerName", "vintage"],
        "Official confirmation that Mid Cap II fundraising launched",
        { publishedAt: "2026-05-06" },
      ),
    ],
    note: "Same-series successor to Antin Mid Cap Fund I; €2.5B is a target, not a close.",
  },
  "FUND-152": {
    snapshotPatch: {
      sourceUrls: [
        "https://www.prnewswire.com/news-releases/arclight-closes-fund-v-at-33-billion-in-commitments-133075573.html",
      ],
    },
    evidence: [
      source(
        "https://www.prnewswire.com/news-releases/arclight-closes-fund-v-at-33-billion-in-commitments-133075573.html",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "ArcLight-issued Fund V final-close release and North American mandate",
        { publishedAt: "2011-11-02" },
      ),
    ],
    note: "Predecessor in the ArcLight flagship energy-infrastructure series.",
  },
  "FUND-153": {
    snapshotPatch: {
      sourceUrls: [
        "https://www.prnewswire.com/news-releases/arclight-closes-sixth-fund-with-56-billion-in-commitments-300120201.html",
      ],
    },
    evidence: [
      source(
        "https://www.prnewswire.com/news-releases/arclight-closes-sixth-fund-with-56-billion-in-commitments-300120201.html",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "ArcLight-issued Fund VI final-close release and North American mandate",
        { publishedAt: "2015-07-29" },
      ),
    ],
    note: "Predecessor in the ArcLight flagship energy-infrastructure series.",
  },
  "FUND-154": {
    snapshotPatch: {
      sourceUrls: [
        "https://arclight.com/portfolio-services/",
        "https://www.prnewswire.com/news-releases/arclight-closes-seventh-fund-with-3-4-billion-in-commitments-300997414.html",
      ],
    },
    evidence: [
      source(
        "https://arclight.com/portfolio-services/",
        ["fundName", "investmentStrategy", "managerName", "regions", "sectors"],
        "Official Fund VII portfolio and North American asset attribution",
      ),
      source(
        "https://www.prnewswire.com/news-releases/arclight-closes-seventh-fund-with-3-4-billion-in-commitments-300997414.html",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "ArcLight-issued Fund VII final-close release and sector mandate",
        { publishedAt: "2020-02-03" },
      ),
    ],
    note: "Immediate predecessor to ArcLight Infrastructure Partners Fund VIII.",
  },
  "FUND-155": {
    snapshotPatch: {
      sourceUrls: [
        "https://www.areswms.com.au/wp-content/uploads/Ares_Sustainability_Report-vF-2021F.pdf",
        "https://www.businesswire.com/news/home/20211215006088/en/Ares-Management-Corporation-Raises-%242.2-Billion-of-Climate-Infrastructure-Capital",
        "https://www.sec.gov/Archives/edgar/data/1810559/000156761921012462/xslFormDX01/primary_doc.xml",
      ],
    },
    evidence: [
      source(
        "https://www.areswms.com.au/wp-content/uploads/Ares_Sustainability_Report-vF-2021F.pdf",
        ["investmentStrategy", "regions", "sectors", "strategies"],
        "Official ACIP portfolio and North American investment evidence",
        { publishedAt: "2022-01-01" },
      ),
      source(
        "https://www.businesswire.com/news/home/20211215006088/en/Ares-Management-Corporation-Raises-%242.2-Billion-of-Climate-Infrastructure-Capital",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
        ],
        "Ares-issued ACIP final-close release",
        { publishedAt: "2021-12-16" },
      ),
      source(
        "https://www.sec.gov/Archives/edgar/data/1810559/000156761921012462/xslFormDX01/primary_doc.xml",
        ["fundName", "managerName", "structure", "vintage"],
        "SEC filing for ACIP legal identity, manager and formation year",
        { publishedAt: "2021-06-30" },
      ),
    ],
    note: "Predecessor to the existing Ares Climate Infrastructure Partners II record.",
  },
  "FUND-159": {
    snapshotPatch: {
      sizeAsOf: "2020-04-15",
      sourceUrls: [
        "https://puc.sd.gov/commission/dockets/HydrocarbonPipeline/2022/HP22-001/testimony/intervenors/NDuganAttach2.pdf",
        "https://www.blackrock.com/corporate/literature/whitepaper/blackrock-infrastructure-impact-report.pdf",
        "https://www.nasdaq.com/press-release/blackrock-raises-us%245.1-billion-for-global-energy-power-infrastructure-fund-iii-third",
      ],
      strategyUrl: "https://www.nasdaq.com/press-release/blackrock-raises-us%245.1-billion-for-global-energy-power-infrastructure-fund-iii-third",
    },
    evidence: [
      source(
        "https://puc.sd.gov/commission/dockets/HydrocarbonPipeline/2022/HP22-001/testimony/intervenors/NDuganAttach2.pdf",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "Regulatory-record copy of BlackRock's GEPIF III close release",
        {
          sourceTier: "INSTITUTIONAL",
          publishedAt: "2022-08-31",
        },
      ),
      source(
        "https://www.blackrock.com/corporate/literature/whitepaper/blackrock-infrastructure-impact-report.pdf",
        ["fundStatus", "regions", "sectors"],
        "Official BlackRock infrastructure portfolio report",
        { publishedAt: "2025-12-31" },
      ),
      source(
        "https://www.nasdaq.com/press-release/blackrock-raises-us%245.1-billion-for-global-energy-power-infrastructure-fund-iii-third",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "BlackRock-issued GEPIF III release distributed via Business Wire/Nasdaq",
        { publishedAt: "2020-04-15" },
      ),
    ],
    note: "Earlier BlackRock energy-and-power flagship; obsolete 404 BlackRock newsroom URLs were replaced with opened copies of the issuer release.",
  },
  "FUND-160": {
    snapshotPatch: {
      strategies: ["Greenfield", "Value-Add"],
      sourceUrls: [
        "https://portal.ct.gov/-/media/OTT/Pension-Funds/Investment-Advisory-Council/031021MeetingPacket.pdf",
        "https://www.blackrock.com/corporate/literature/whitepaper/blackrock-infrastructure-impact-report.pdf",
        "https://www.nasdaq.com/press-release/blackrock-real-assets-achieves-a-us%244.8-billion-final-close-for-global-renewable",
      ],
      strategyUrl: "https://www.nasdaq.com/press-release/blackrock-real-assets-achieves-a-us%244.8-billion-final-close-for-global-renewable",
    },
    evidence: [
      source(
        "https://portal.ct.gov/-/media/OTT/Pension-Funds/Investment-Advisory-Council/031021MeetingPacket.pdf",
        [
          "fundName",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          "strategies",
          "structure",
          "vintage",
        ],
        "Connecticut pension investment memorandum for GRP III",
        { sourceTier: "INSTITUTIONAL", publishedAt: "2021-03-10" },
      ),
      source(
        "https://www.blackrock.com/corporate/literature/whitepaper/blackrock-infrastructure-impact-report.pdf",
        ["fundStatus", "regions", "sectors"],
        "Official BlackRock renewable-power portfolio report",
        { publishedAt: "2025-12-31" },
      ),
      source(
        "https://www.nasdaq.com/press-release/blackrock-real-assets-achieves-a-us%244.8-billion-final-close-for-global-renewable",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "BlackRock-issued GRP III release distributed via Business Wire/Nasdaq",
        { publishedAt: "2021-04-08" },
      ),
    ],
    note: "Predecessor to the existing GRP IV record; strategy is classified Value-Add/Greenfield from the institutional memorandum rather than Core-Plus.",
  },
  "FUND-161": {
    snapshotPatch: {
      sizeAsOf: "2020-02-07",
      vintage: "2019",
      sourceUrls: [
        "https://bam.brookfield.com/sites/brookfield-bam-v2/files/BAM-IR-Master/Supplemental-Information/2026/Q1-26-BAM-Supplemental.pdf",
        "https://bn.brookfield.com/press-releases/brookfield-closes-us20-billion-global-infrastructure-fund",
        "https://www.brookfield.com/about-us/investments/genesee-wyoming",
      ],
      strategyUrl: "https://bn.brookfield.com/press-releases/brookfield-closes-us20-billion-global-infrastructure-fund",
    },
    evidence: [
      source(
        "https://bam.brookfield.com/sites/brookfield-bam-v2/files/BAM-IR-Master/Supplemental-Information/2026/Q1-26-BAM-Supplemental.pdf",
        ["fundName", "fundStatus", "managerName", "strategies", "vintage"],
        "Current Brookfield supplemental showing BIF IV vintage and core-plus classification",
        { publishedAt: "2026-05-08" },
      ),
      source(
        "https://bn.brookfield.com/press-releases/brookfield-closes-us20-billion-global-infrastructure-fund",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "Official BIF IV final-close release",
        { publishedAt: "2020-02-07" },
      ),
      source(
        "https://www.brookfield.com/about-us/investments/genesee-wyoming",
        ["fundStatus", "regions", "sectors"],
        "Official North American rail investment attribution",
      ),
    ],
    note: "Predecessor to the existing BIF V record; vintage follows Brookfield's current 2019 reporting.",
  },
  "FUND-164": {
    snapshotPatch: {
      size: "€2.0B total commitments",
      sizeNativeCurrency: "EUR",
      sizeNativeAmount: "2000000000",
      sizeBasis: "FINAL_CLOSE",
      sizeAsOf: "2015-07-31",
      sourceUrls: [
        "https://www.cip.com/funds/flagship-funds/",
        "https://www.cip.com/sustainability-related-disclosures/ci-ii-sustainability-related-disclosures/",
      ],
    },
    evidence: [
      source(
        "https://www.cip.com/funds/flagship-funds/",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "Official CI II launch, close, commitments, sectors and North American mandate",
      ),
      source(
        "https://www.cip.com/sustainability-related-disclosures/ci-ii-sustainability-related-disclosures/",
        ["fundName", "fundStatus", "managerName"],
        "Current CI II periodic-disclosure index",
      ),
    ],
    note: "CIP flagship predecessor. The source discloses July 2015 but no day; sizeAsOf is conservatively normalized to month-end.",
  },
  "FUND-165": {
    snapshotPatch: {
      size: "€3.5B final close",
      sizeNativeCurrency: "EUR",
      sizeNativeAmount: "3500000000",
      sizeBasis: "FINAL_CLOSE",
      sizeAsOf: "2018-03-31",
      sourceUrls: [
        "https://www.cip.com/funds/flagship-funds/",
        "https://www.cip.com/sustainability-related-disclosures/ci-iii-sustainability-related-disclosures/",
      ],
    },
    evidence: [
      source(
        "https://www.cip.com/funds/flagship-funds/",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "Official CI III launch, final close, sectors and North American mandate",
      ),
      source(
        "https://www.cip.com/sustainability-related-disclosures/ci-iii-sustainability-related-disclosures/",
        ["fundName", "fundStatus", "managerName"],
        "Current CI III periodic-disclosure index",
      ),
    ],
    note: "CIP flagship predecessor. The source discloses March 2018 but no day; sizeAsOf is conservatively normalized to month-end.",
  },
  "FUND-166": {
    snapshotPatch: {
      investmentStrategy: "Flagship value-add digital infrastructure fund investing across data centers, fiber, towers, small cells, edge infrastructure and related connectivity platforms.",
      size: "$8.3B final close",
      sizeUsdMm: 8300,
      sizeNativeAmount: "8300000000",
      sizeAsOf: "2021-12-31",
      vintage: "2020",
      regions: ["Global", "North America"],
      sourceUrls: [
        "https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-surpasses-target-close-second-flagship-fund-83",
        "https://ir.digitalbridge.com/node/11786/html",
        "https://ir.digitalbridge.com/static-files/e9b2a84d-4cd5-46d7-b01e-d19cc58e82f9",
      ],
      strategyUrl: "https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-surpasses-target-close-second-flagship-fund-83",
    },
    evidence: [
      source(
        "https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-surpasses-target-close-second-flagship-fund-83",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "Official DBP II final-close release and digital-infrastructure mandate",
        { publishedAt: "2022-01-19" },
      ),
      source(
        "https://ir.digitalbridge.com/node/11786/html",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "DigitalBridge 2021 Form 10-K confirming DBP II close and opportunistic platform",
        { publishedAt: "2022-02-28" },
      ),
      source(
        "https://ir.digitalbridge.com/static-files/e9b2a84d-4cd5-46d7-b01e-d19cc58e82f9",
        ["fundName", "fundStatus", "managerName"],
        "Current DigitalBridge reporting for DBP II lineage",
        { publishedAt: "2026-04-28" },
      ),
    ],
    note: "Predecessor to DBP III. Corrected from the draft's $8.2B/2019 to the official $8.3B final close and 2020 fundraising vintage.",
  },
  "FUND-167": {
    snapshotPatch: {
      investmentStrategy: "Flagship value-add digital infrastructure fund investing across connectivity, towers, fiber and data-center platforms.",
      size: "$4.059B final close",
      sizeUsdMm: 4059,
      sizeNativeAmount: "4059000000",
      sizeAsOf: "2019-12-31",
      vintage: "2018",
      regions: ["Global", "North America"],
      sourceUrls: [
        "https://ir.digitalbridge.com/node/12381/html",
        "https://ir.digitalbridge.com/static-files/9e7ef26e-8303-4476-bcba-65eb1e479c06",
        "https://ir.digitalbridge.com/static-files/e9b2a84d-4cd5-46d7-b01e-d19cc58e82f9",
      ],
      strategyUrl: "https://ir.digitalbridge.com/node/12381/html",
    },
    evidence: [
      source(
        "https://ir.digitalbridge.com/node/12381/html",
        ["fundName", "fundStatus", "investmentStrategy", "managerName", "strategies", "structure"],
        "DigitalBridge filing confirming current DBP I legal/display name and flagship strategy",
        { publishedAt: "2022-08-09" },
      ),
      source(
        "https://ir.digitalbridge.com/static-files/9e7ef26e-8303-4476-bcba-65eb1e479c06",
        [
          "fundName",
          "fundStatus",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          ...ALL_SIZE_FIELDS,
          "strategies",
          "structure",
          "vintage",
        ],
        "2019 annual report confirming DCP/DBP I close, commitments and digital portfolio",
        { publishedAt: "2020-03-02" },
      ),
      source(
        "https://ir.digitalbridge.com/static-files/e9b2a84d-4cd5-46d7-b01e-d19cc58e82f9",
        ["fundName", "fundStatus", "managerName"],
        "Current DigitalBridge reporting for DBP I lineage",
        { publishedAt: "2026-04-28" },
      ),
    ],
    note: "Inaugural predecessor to DBP II/III. Uses the current DigitalBridge Partners name and the reported $4.059B commitment amount.",
  },
  "FUND-169": {
    snapshotPatch: {
      size: "$1.0B+ commitments including co-investment vehicles and SMAs",
      sizeUsdMm: 1000,
      sizeNativeAmount: "1000000000",
      sizeBasis: "COMMITMENTS",
      sizeAsOf: "2024-11-20",
      vintage: "2024",
      sourceUrls: [
        "https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/",
      ],
      strategyUrl: "https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/",
    },
    evidence: [
      source(
        "https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "Official Fund VI close, value-add mandate, sectors and North American scope",
        { publishedAt: "2024-11-20" },
      ),
    ],
    note: "Predecessor to InfraRed Fund VII. Corrected from the unsupported $1.8B draft amount to the disclosed above-$1B combined commitment figure.",
  },
  "FUND-170": {
    snapshotPatch: {
      sizeAsOf: "2019-12-19",
      vintage: "2019",
      sectors: ["Digital", "Midstream", "Power & ET", "Transportation"],
      regions: ["Global", "North America"],
      sourceUrls: [
        "https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B6A1F5A66-9F45-4E90-9F6A-8A9E0D8C2C4B%7D",
        "https://www.morganstanley.com/im/en-sg/institutional-investor/about-us/newsroom/press-release/ms-nhip-iii-close.html",
      ],
      strategyUrl: "https://www.morganstanley.com/im/en-sg/institutional-investor/about-us/newsroom/press-release/ms-nhip-iii-close.html",
    },
    evidence: [
      source(
        "https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B6A1F5A66-9F45-4E90-9F6A-8A9E0D8C2C4B%7D",
        ["fundName", "regions", "sectors"],
        "New York regulatory record linking NHIP III to a North American digital asset",
        { sourceTier: "INSTITUTIONAL", publishedAt: "2020-12-15" },
      ),
      source(
        "https://www.morganstanley.com/im/en-sg/institutional-investor/about-us/newsroom/press-release/ms-nhip-iii-close.html",
        [...ALL_DESCRIPTIVE_FIELDS, ...ALL_SIZE_FIELDS],
        "Official NHIP III final-close release, global mandate and focus sectors",
        { publishedAt: "2019-12-19" },
      ),
    ],
    note: "Predecessor to NHIP IV and same series as NHIP II. Replaced the draft's invalid vintage text with the disclosed 2019 first-close year.",
  },
  "FUND-171": {
    snapshotPatch: {
      vintage: "2020",
      strategies: ["Value-Add"],
      sourceUrls: [
        "https://nj.gov/njbonds/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/AgendaItem7c-StonepeakInfrastructureFundIV.pdf",
        "https://stonepeak.com/in-the-news/bloomberg-stonepeak-closes-fourth-north-american-infrastructure-fund-with-14-billion-of-commitments",
        "https://stonepeak.com/wp-content/uploads/2025/04/2025-Mid-Year-Market-and-Firm-Update-Presentation.pdf",
      ],
      sizeAsOf: "2022-02-02",
      strategyUrl: "https://stonepeak.com/in-the-news/bloomberg-stonepeak-closes-fourth-north-american-infrastructure-fund-with-14-billion-of-commitments",
    },
    evidence: [
      source(
        "https://nj.gov/njbonds/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/AgendaItem7c-StonepeakInfrastructureFundIV.pdf",
        [
          "fundName",
          "investmentStrategy",
          "managerName",
          "regions",
          "sectors",
          "strategies",
          "structure",
          "vintage",
        ],
        "New Jersey investment memorandum for Fund IV strategy, sectors and North American scope",
        { sourceTier: "INSTITUTIONAL", publishedAt: "2021-03-01" },
      ),
      source(
        "https://stonepeak.com/in-the-news/bloomberg-stonepeak-closes-fourth-north-american-infrastructure-fund-with-14-billion-of-commitments",
        [
          "fundName",
          "fundStatus",
          "managerName",
          "regions",
          ...ALL_SIZE_FIELDS,
          "structure",
        ],
        "Stonepeak-hosted Fund IV close and $14B commitment announcement",
        { publishedAt: "2022-02-02" },
      ),
      source(
        "https://stonepeak.com/wp-content/uploads/2025/04/2025-Mid-Year-Market-and-Firm-Update-Presentation.pdf",
        ["fundName", "fundStatus", "managerName", "sectors", "strategies"],
        "Current Stonepeak presentation classifying Fund IV within value-add real assets",
        { publishedAt: "2025-04-30" },
      ),
    ],
    note: "Predecessor to Stonepeak Fund V. Corrected the draft classification to Value-Add and the vintage to the institutional 2020 vintage.",
  },
};

function canonicalSnapshot(snapshot: FundRefreshSnapshot): FundRefreshSnapshot {
  return {
    ...snapshot,
    strategies: [...snapshot.strategies].sort(),
    sectors: [...snapshot.sectors].sort(),
    regions: [...snapshot.regions].sort(),
    sourceUrls: [...new Set(snapshot.sourceUrls)].sort(),
  };
}

function manifestRecord(snapshot: FundRefreshSnapshot): FundManifestRecord {
  return {
    id: snapshot.legacyId,
    managerName: snapshot.managerName,
    fundName: snapshot.fundName,
    ticker: snapshot.ticker,
    investmentStrategy: snapshot.investmentStrategy,
    sourceUrls: snapshot.sourceUrls,
    size: snapshot.size,
    sizeUsdMm: snapshot.sizeUsdMm,
    sizeNativeCurrency: snapshot.sizeNativeCurrency,
    sizeNativeAmount: snapshot.sizeNativeAmount,
    sizeBasis: snapshot.sizeBasis,
    sizeAsOf: snapshot.sizeAsOf,
    sizeUsdFxRate: snapshot.sizeUsdFxRate,
    sizeUsdFxDate: snapshot.sizeUsdFxDate,
    vintage: snapshot.vintage,
    strategies: snapshot.strategies,
    structure: snapshot.structure,
    status: snapshot.fundStatus,
    sectors: snapshot.sectors,
    regions: snapshot.regions,
    portfolioCompanies: [],
    strategyUrl: snapshot.strategyUrl ?? "",
  };
}

function orderedEvidenceRecord(
  record: EvidenceManifestRecord,
): EvidenceManifestRecord {
  return {
    legacyId: record.legacyId,
    sourceId: record.sourceId,
    url: record.url,
    supportedFields: record.supportedFields,
    sourceTier: record.sourceTier,
    scope: record.scope,
    publishedAt: record.publishedAt,
    retrievedAt: record.retrievedAt,
    confidence: record.confidence,
    evidenceLabel: record.evidenceLabel,
  };
}

function assertRelease(release: Omit<LineageRelease, "candidateSetHash">): void {
  const { policy, baselineManifest, manifest, evidenceManifest, candidates } = release;
  if (baselineManifest.funds.length !== policy.expected.baselineFunds) {
    throw new Error(
      `Baseline count mismatch: ${baselineManifest.funds.length} != ${policy.expected.baselineFunds}`,
    );
  }
  if (candidates.length !== policy.expected.includedAdditions) {
    throw new Error(
      `Addition count mismatch: ${candidates.length} != ${policy.expected.includedAdditions}`,
    );
  }
  if (manifest.funds.length !== policy.expected.finalFunds) {
    throw new Error(
      `Final count mismatch: ${manifest.funds.length} != ${policy.expected.finalFunds}`,
    );
  }
  if (candidates.length / baselineManifest.funds.length > 0.1) {
    throw new Error("The lineage release exceeds the 10% refresh cap");
  }
  const baselineManagers = new Set(
    baselineManifest.funds.map((fund) => canonicalManagerKey(fund.managerName)),
  );
  for (const candidate of candidates) {
    if (!baselineManagers.has(canonicalManagerKey(candidate.identity.managerName))) {
      throw new Error(`${candidate.identity.legacyId}: manager is not in the baseline`);
    }
    const validation = validateFundRefreshCandidate(candidate);
    const zodErrors = validation.zodIssues?.map((issue) => issue.message) ?? [];
    const contractErrors = validation.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => `${issue.code}: ${issue.message}`);
    if (zodErrors.length > 0 || contractErrors.length > 0) {
      throw new Error(
        `${candidate.identity.legacyId}: ${[...zodErrors, ...contractErrors].join(" | ")}`,
      );
    }
  }
  const evidenceErrors = validateFundEvidenceManifest(evidenceManifest)
    .filter((issue) => issue.severity === "error");
  if (evidenceErrors.length > 0) {
    throw new Error(
      `Evidence manifest errors: ${evidenceErrors.map((issue) => issue.code).join(", ")}`,
    );
  }
  const identities = new Map<string, string>();
  for (const fund of manifest.funds) {
    const key = `${canonicalManagerKey(fund.managerName)}\u0000${normalizeIdentity(fund.fundName)}`;
    const existing = identities.get(key);
    if (existing) {
      throw new Error(`Duplicate normalized fund identity: ${existing} / ${fund.id}`);
    }
    identities.set(key, fund.id);
  }
}

export function buildLineageRelease(): LineageRelease {
  const policy = readJson<LineagePolicy>(POLICY_PATH);
  const sourcePlan = readJson<SourcePromotionPlan>(SOURCE_PLAN_PATH);
  const baselineManifest = loadFundManifestAtCommit(policy.baseCommit);
  const baselineEvidence = loadFundEvidenceManifestAtCommit(policy.baseCommit);
  const sourceCandidates = new Map(
    sourcePlan.candidates.map((candidate) => [candidate.legacyId, candidate]),
  );
  const candidates = policy.includedLegacyIds.map((legacyId) => {
    const sourceCandidate = sourceCandidates.get(legacyId);
    const curated = CURATED[legacyId];
    if (!sourceCandidate || sourceCandidate.action !== "CREATE") {
      throw new Error(`${legacyId}: missing CREATE source candidate`);
    }
    if (!curated) throw new Error(`${legacyId}: missing curated evidence`);
    const after = canonicalSnapshot({
      ...sourceCandidate.after,
      ...curated.snapshotPatch,
    });
    return {
      action: "CREATE" as const,
      identity: {
        legacyId,
        managerName: after.managerName,
        fundName: after.fundName,
      },
      before: null,
      after,
      changedFields: snapshotChangedFields(null, after),
      evidence: [...curated.evidence].sort((left, right) =>
        left.url.localeCompare(right.url)
        || left.evidenceLabel.localeCompare(right.evidenceLabel)
      ),
      confidence: "HIGH" as const,
      unresolvedQuestions: [],
      ownershipLinkImpact: {
        matchedOwnershipPeriodCount: 0,
        matchedOwnershipVehicles: [],
        linkedOwnershipPeriodCount: 0,
        linkedCompanyIds: [],
        mutationProposed: false as const,
        notes: "New fund record; no OwnershipPeriod or portfolio-company mutation is proposed.",
      },
    } satisfies FundRefreshCandidate;
  }).sort((left, right) => left.identity.legacyId.localeCompare(right.identity.legacyId));

  const baselineIds = new Set(baselineManifest.funds.map((fund) => fund.id));
  for (const candidate of candidates) {
    if (baselineIds.has(candidate.identity.legacyId)) {
      throw new Error(`${candidate.identity.legacyId}: ID already exists in baseline`);
    }
  }
  const manifest: FundManifest = {
    ...baselineManifest,
    // Preserve the reviewed baseline byte ordering and append this release only.
    // Several historical suffixed IDs intentionally are not lexicographically ordered.
    funds: [
      ...baselineManifest.funds,
      ...candidates.map((candidate) => manifestRecord(candidate.after!)),
    ],
  };

  const evidenceRecords: EvidenceManifestRecord[] = [
    ...baselineEvidence.records,
    ...candidates.flatMap((candidate) =>
      candidate.evidence.map((evidence) => ({
        legacyId: candidate.identity.legacyId,
        ...evidence,
      })),
    ),
  ].sort((left, right) =>
    left.legacyId.localeCompare(right.legacyId)
    || left.url.localeCompare(right.url)
    || left.evidenceLabel.localeCompare(right.evidenceLabel)
  ).map(orderedEvidenceRecord);
  const fundNotes = [
    ...baselineEvidence.fundNotes,
    ...candidates.map((candidate) => ({
      legacyId: candidate.identity.legacyId,
      strategyUrl: candidate.after!.strategyUrl,
      evidenceType: "Fund-specific primary and/or institutional evidence",
      gaps: CURATED[candidate.identity.legacyId].note,
      recommendedDataEdits: "Materialized as a reviewed same-lineage addition; production apply remains gated.",
    })),
  ].sort((left, right) => left.legacyId.localeCompare(right.legacyId));
  const evidenceManifest: FundEvidenceManifest = {
    ...baselineEvidence,
    asOf: policy.retrievedAt,
    records: evidenceRecords,
    fundNotes,
  };
  const partial = {
    policy,
    baselineManifest,
    manifest,
    evidenceManifest,
    candidates,
  };
  assertRelease(partial);
  return {
    ...partial,
    candidateSetHash: createHash("sha256")
      .update(canonicalJson(candidates))
      .digest("hex"),
  };
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function renderReviewPacket(release: LineageRelease): string {
  const sections = release.candidates.map((candidate) => [
    `### ${candidate.identity.legacyId} — CREATE`,
    `- Manager / fund: ${candidate.identity.managerName} / ${candidate.identity.fundName}`,
    `- Size / vintage: ${candidate.after!.size} / ${candidate.after!.vintage}`,
    `- Strategy badges: ${candidate.after!.strategies.join(", ")}`,
    `- Regions: ${candidate.after!.regions.join(", ")}`,
    `- Evidence: ${candidate.evidence.map((item) => item.url).join("; ")}`,
    `- Review note: ${CURATED[candidate.identity.legacyId].note}`,
  ].join("\n")).join("\n\n");
  return [
    "# GPT-5.6 Pro review packet — lineage additions",
    "",
    `- Run ID: ${release.policy.runId}`,
    `- Candidate-set hash: ${release.candidateSetHash}`,
    `- Base commit: ${release.policy.baseCommit}`,
    "- Mandatory review pool: all 15 CREATE candidates",
    "- Production apply authorized: no",
    "",
    sections,
    "",
    "A trusted live audit, GPT-5.6 Pro review tied to the final PR head, and human approval are still required before an executable FundRefreshProposal may be finalized.",
    "",
  ].join("\n");
}

export function materializeLineageRelease(release = buildLineageRelease()): void {
  fs.mkdirSync(RUN_DIRECTORY, { recursive: true });
  writeJson(FUND_MANIFEST_PATH, release.manifest);
  writeJson(EVIDENCE_MANIFEST_PATH, release.evidenceManifest);
  writeJson(path.join(RUN_DIRECTORY, "candidate-set.json"), {
    schemaVersion: 1,
    artifactType: "FUND_LINEAGE_CANDIDATE_SET",
    runId: release.policy.runId,
    baseCommit: release.policy.baseCommit,
    candidateSetHash: release.candidateSetHash,
    selectionRule: release.policy.selectionRule,
    summary: {
      baselineFunds: release.baselineManifest.funds.length,
      creates: release.candidates.length,
      finalFunds: release.manifest.funds.length,
      affectedRatio: release.candidates.length / release.baselineManifest.funds.length,
      ownershipMutations: 0,
    },
    candidates: release.candidates,
  });
  const fieldDiffRows = release.candidates.flatMap((candidate) =>
    candidate.changedFields.map((field) => ({
      runId: release.policy.runId,
      candidateSetHash: release.candidateSetHash,
      action: candidate.action,
      legacyId: candidate.identity.legacyId,
      managerName: candidate.identity.managerName,
      fundName: candidate.identity.fundName,
      field,
      before: "null",
      after: JSON.stringify(candidate.after?.[field] ?? null),
      confidence: candidate.confidence,
      evidenceUrls: candidate.evidence
        .filter((item) => item.supportedFields.includes(field))
        .map((item) => item.url)
        .join("; "),
    })),
  );
  fs.writeFileSync(
    path.join(RUN_DIRECTORY, "field-diff.csv"),
    toCsv(fieldDiffRows, [
      "runId",
      "candidateSetHash",
      "action",
      "legacyId",
      "managerName",
      "fundName",
      "field",
      "before",
      "after",
      "confidence",
      "evidenceUrls",
    ]),
  );
  writeJson(path.join(RUN_DIRECTORY, "source-health.json"), {
    schemaVersion: 1,
    artifactType: "FUND_REFRESH_SOURCE_HEALTH",
    runId: release.policy.runId,
    proposalHash: release.candidateSetHash,
    sources: release.candidates.flatMap((candidate) =>
      candidate.evidence.map((item) => ({
        legacyId: candidate.identity.legacyId,
        sourceId: item.sourceId,
        url: item.url,
        evidenceLabel: item.evidenceLabel,
        status: "OPENED",
        checkedAt: CHECKED_AT,
        httpStatus: null,
        lastModifiedAt: null,
        error: null,
      })),
    ),
  });
  writeJson(path.join(RUN_DIRECTORY, "ownership-impact.json"), {
    schemaVersion: 1,
    artifactType: "FUND_REFRESH_OWNERSHIP_IMPACT",
    runId: release.policy.runId,
    proposalHash: release.candidateSetHash,
    candidates: release.candidates.map((candidate) => ({
      legacyId: candidate.identity.legacyId,
      ...candidate.ownershipLinkImpact,
    })),
  });
  writeJson(path.join(RUN_DIRECTORY, "scope-coverage.json"), {
    schemaVersion: 1,
    artifactType: "FUND_LINEAGE_SCOPE_COVERAGE",
    runId: release.policy.runId,
    candidateSetHash: release.candidateSetHash,
    baselineFunds: release.baselineManifest.funds.length,
    selectedFunds: release.candidates.length,
    selectedManagerKeys: [
      ...new Set(
        release.candidates.map((candidate) =>
          canonicalManagerKey(candidate.identity.managerName)
        ),
      ),
    ].sort(),
    includedLegacyIds: release.policy.includedLegacyIds,
    excludedReviewedCandidates: release.policy.excludedReviewedCandidates,
    sourceFailuresRetainedAsEvidence: [],
    unresolvedScope: [],
  });
  writeJson(path.join(RUN_DIRECTORY, "readiness.json"), {
    schemaVersion: 1,
    artifactType: "FUND_LINEAGE_RELEASE_READINESS",
    runId: release.policy.runId,
    candidateSetHash: release.candidateSetHash,
    manifestMaterialized: true,
    executableProposalReady: false,
    productionApplyAuthorized: false,
    blockers: [
      "TRUSTED_LIVE_AUDIT_REQUIRED",
      "GPT_5_6_PRO_REVIEW_REQUIRED",
      "HUMAN_REVIEW_REQUIRED",
    ],
    checks: {
      candidateContractErrors: 0,
      evidenceManifestErrors: 0,
      ownershipMutations: 0,
      affectedRatioWithinTenPercent: true,
      baselineFunds: release.baselineManifest.funds.length,
      finalFunds: release.manifest.funds.length,
    },
  });
  fs.writeFileSync(
    path.join(RUN_DIRECTORY, "pro-review.md"),
    renderReviewPacket(release),
  );
}

function main(): void {
  const release = buildLineageRelease();
  materializeLineageRelease(release);
  console.log(JSON.stringify({
    runId: release.policy.runId,
    candidateSetHash: release.candidateSetHash,
    additions: release.candidates.length,
    finalFunds: release.manifest.funds.length,
    productionApplyAuthorized: false,
  }, null, 2));
}

if (
  process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
