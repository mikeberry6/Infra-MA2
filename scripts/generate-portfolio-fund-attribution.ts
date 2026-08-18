import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildCurrentOwnerFundAudit,
  type ActiveOwnerRow,
} from "./audit-current-owner-funds.ts";
import { funds, type Fund } from "../prisma/seed-data/funds.ts";
import type { PortCo } from "../prisma/seed-data/portco-types.ts";
import { verifyManifest } from "./portfolio-fund-attribution/schema.ts";

type Attribution = "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED";
type Confidence = "HIGH" | "MEDIUM" | "LOW";

interface Candidate {
  fundName: string;
  managerName: string;
  vintage: string;
  score: number;
  reasons: string[];
  attributionOnly: boolean;
  sourceUrls: string[];
}

type CandidateFund = Pick<
  Fund,
  "managerName" | "fundName" | "vintage" | "regions" | "status" | "structure" | "sourceUrls"
> & { attributionOnly?: boolean };

interface ReviewedAttributionOverride {
  companyName: string;
  investmentFirm: string;
  attribution: Attribution;
  confidence: Confidence;
  attributedFundName: string | null;
  rationale: string;
  sourceUrls: string[];
}

interface LedgerRow {
  recordId: string;
  ownershipPeriodId: string | null;
  sourceRowKey: string;
  companyName: string;
  country: string;
  investmentFirm: string;
  currentVehicleName: string;
  databaseVehicleName: string | null;
  investmentYear: number | null;
  stake: string | null;
  attribution: Attribution;
  confidence: Confidence | null;
  attributedFundName: string | null;
  disclosedOrEstimatedFundName: string | null;
  currentLinkedFundName: string | null;
  currentFundAttribution: Attribution;
  linkedCanonicalFundName: string | null;
  targetLinkedFundName: string | null;
  alternatives: Candidate[];
  rationale: string;
  evidenceUrls: string[];
  sourceAuditStatus: string;
  sourceAuditConfidence: string;
  applyEligible: boolean;
  proposedAction:
    | "SET_DISCLOSED_LINKED"
    | "SET_DISCLOSED_UNLISTED"
    | "SET_INFERRED"
    | "SET_DIRECT_PROGRAM"
    | "RESEARCH_REQUIRED";
  fundDatabaseAction: "NONE" | "REVIEW_ALIAS_OR_SIZE_GATED_ADDITION";
}

const ROOT = process.cwd();
const DEFAULT_AS_OF = "2026-08-16";

const MANAGER_ALIASES: Record<string, string[]> = {
  "3i group": ["3i infrastructure", "3i"],
  "3i infrastructure": ["3i group", "3i"],
  "apg infrastructure": ["apg asset management", "apg"],
  "apg asset management": ["apg infrastructure", "apg"],
  "arcLight capital partners": ["arclight capital", "arclight"],
  "blackrock (gip)": ["global infrastructure partners", "gip", "blackrock"],
  "brookfield asset management": ["brookfield infrastructure", "brookfield renewable", "brookfield"],
  "cdpq": ["la caisse", "caisse de depot"],
  "cvc dif": ["cvc", "dif"],
  "ecp": ["energy capital partners"],
  "eig global energy partners": ["eig"],
  "eip": ["energy infrastructure partners"],
  "gcm": ["gcm grosvenor"],
  "goldman sachs asset management": ["gsam", "goldman sachs alternatives"],
  "ifm investors": ["ifm"],
  "infratil": ["morrison and co"],
  "instar": ["instar asset management", "instaragf"],
  "instar asset management": ["instar", "instaragf"],
  "cc and l": ["connor clark and lunn infrastructure", "cc&l infrastructure"],
  "connor clark and lunn infrastructure": ["cc&l", "cc&l infrastructure"],
  "lone star funds": ["lone star"],
  "morgan stanley infrastructure partners": ["msip", "morgan stanley infrastructure"],
  "msip": ["morgan stanley infrastructure partners", "morgan stanley infrastructure"],
  "oaktree / duration": ["duration capital partners", "duration"],
  "ontario teachers pension plan": ["otpp", "ontario teachers"],
  "quinbrook infrastructure": ["quinbrook infrastructure partners", "quinbrook"],
  "sk capital partners": ["sk capital"],
  "swiss life": ["swiss life asset managers"],
  "vision ridge": ["vision ridge partners"],
  "vista equity partners": ["vista"],
  "tpg": ["tpg rise climate"],
};

const ATTRIBUTION_ONLY_FUNDS: CandidateFund[] = [
  {
    managerName: "Energy Capital Partners",
    fundName: "ECP Fund III",
    vintage: "2013",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.sec.gov/Archives/edgar/data/1594547/000159454713000001/xslFormDX01/primary_doc.xml",
      "https://www.sec.gov/files/litigation/admin/2022/ia-6049.pdf",
    ],
    attributionOnly: true,
  },
  {
    managerName: "Energy Capital Partners",
    fundName: "ECP Fund IV",
    vintage: "2017",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.ecpgp.com/about/news-and-insights/press-releases/2020/energy-capital-partners-raises-68-billion-for-fund-iv-and-co-investment-pools",
    ],
    attributionOnly: true,
  },
  {
    managerName: "Meridiam",
    fundName: "Meridiam Infrastructure North America I",
    vintage: "2008",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.meridiam.com/wp-content/uploads/2021/09/impact_report_2018_final.pdf"],
    attributionOnly: true,
  },
  {
    managerName: "Meridiam",
    fundName: "Meridiam Infrastructure North America II",
    vintage: "2012",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.meridiam.com/wp-content/uploads/2021/09/impact_report_2018_final.pdf"],
    attributionOnly: true,
  },
  {
    managerName: "Meridiam",
    fundName: "Meridiam Infrastructure North America III",
    vintage: "2017",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.meridiam.com/wp-content/uploads/2021/09/impact_report_2018_final.pdf"],
    attributionOnly: true,
  },
  {
    managerName: "Quinbrook Infrastructure Partners",
    fundName: "Quinbrook Low Carbon Power Fund",
    vintage: "2017",
    regions: ["North America", "Europe", "Asia-Pacific"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/",
      "https://www.quinbrook.com/news-insights/quinbrooks-low-carbon-power-fund-awarded-esg-investment-fund-of-the-year-by-esg-investing/",
    ],
    attributionOnly: true,
  },
  {
    managerName: "Instar Asset Management",
    fundName: "InstarAGF Essential Infrastructure Fund I",
    vintage: "2017",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://instarinvest.com/2020/06/instaragf-essential-infrastructure-fund-ii-achieves-final-close/?lang=en"],
    attributionOnly: true,
  },
  {
    managerName: "Instar Asset Management",
    fundName: "InstarAGF Essential Infrastructure Fund II",
    vintage: "2020",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://instarinvest.com/2020/06/instaragf-essential-infrastructure-fund-ii-achieves-final-close/?lang=en"],
    attributionOnly: true,
  },
  {
    managerName: "SDC Capital Partners",
    fundName: "SDC Digital Infrastructure Opportunity Fund I",
    vintage: "2017",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1723715/000095017218000095/xslFormDX01/primary_doc.xml"],
    attributionOnly: true,
  },
  {
    managerName: "SDC Capital Partners",
    fundName: "SDC Digital Infrastructure Opportunity Fund II",
    vintage: "2020",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1258602/000125860220000083/exhibit102membershipunitpu.htm"],
    attributionOnly: true,
  },
  {
    managerName: "SDC Capital Partners",
    fundName: "SDC Digital Infrastructure Opportunity Fund III",
    vintage: "2022",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1915910/000191591022000001/0001915910-22-000001-index.htm"],
    attributionOnly: true,
  },
  {
    managerName: "Ridgewood Infrastructure",
    fundName: "Ridgewood Water & Strategic Infrastructure Fund I",
    vintage: "2018",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announces-acquisition-of-sienergy-lp/",
      "https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target/",
    ],
    attributionOnly: true,
  },
  {
    managerName: "EIG",
    fundName: "EIG Fund XVII",
    vintage: "2017",
    regions: ["Global"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1712778/000171277817000002/0001712778-17-000002-index.html"],
    attributionOnly: true,
  },
  {
    managerName: "CIM Group",
    fundName: "CIM Infrastructure Fund I",
    vintage: "2007",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1614976/000110465920042966/0001104659-20-042966-index.htm"],
    attributionOnly: true,
  },
  {
    managerName: "CIM Group",
    fundName: "CIM Infrastructure Fund II",
    vintage: "2016",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1660051/000166005116000001/xslFormDX07/primary_doc.xml"],
    attributionOnly: true,
  },
  {
    managerName: "I Squared Capital",
    fundName: "ISQ Global Infrastructure Fund II",
    vintage: "2017",
    regions: ["North America", "Europe", "Asia-Pacific"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1711309/000171130818000001/xslFormDX01/primary_doc.xml"],
    attributionOnly: true,
  },
  {
    managerName: "I Squared Capital",
    fundName: "ISQ Global Infrastructure Fund III",
    vintage: "2020",
    regions: ["North America", "Europe", "Asia-Pacific"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1821358/000182135821000001/xslFormDX08/primary_doc.xml"],
    attributionOnly: true,
  },
  {
    managerName: "Morgan Stanley Infrastructure Partners",
    fundName: "North Haven Infrastructure Partners",
    vintage: "2008",
    regions: ["North America", "Europe"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.morganstanley.com/press-releases/chicago-parking-meters-llc-selected-as-winning-bidder-for-the-chicago-metered-parking-system_045f9d28-c142-11dd-b3a2-8df06e0b6eda"],
    attributionOnly: true,
  },
  {
    managerName: "Morgan Stanley Infrastructure Partners",
    fundName: "North Haven Infrastructure Partners II (NHIP II)",
    vintage: "2015",
    regions: ["North America", "Europe"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.morganstanley.com/im/en-dk/institutional-investor/about-us/newsroom/press-release/ms-nhip-ii-close.html",
      "https://www.sec.gov/Archives/edgar/data/1747009/000110465919014910/a19-4320_28k.htm",
    ],
    attributionOnly: true,
  },
  {
    managerName: "GCM Grosvenor",
    fundName: "GCM Grosvenor Labor Impact Fund",
    vintage: "2019",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.gcmgrosvenor.com/2020/09/14/gcm-grosvenor-closes-its-labor-impact-fund/"],
    attributionOnly: true,
  },
  {
    managerName: "GCM Grosvenor",
    fundName: "GCM Grosvenor Infrastructure Advantage Fund I",
    vintage: "2019",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: ["https://www.gcmgrosvenor.com/2025/04/22/gcm-grosvenor-announces-1-3-billion-final-close-for-infrastructure-advantage-fund-ii-a-nearly-50-increase-over-its-predecessor-fund/"],
    attributionOnly: true,
  },
  {
    managerName: "Oaktree / Duration",
    fundName: "Oaktree Transportation Infrastructure Fund",
    vintage: "2018",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.brookfieldoaktreeholdings.com/static-files/e6f91d62-82e8-4045-8e2b-8cd2d64a5bf0",
    ],
    attributionOnly: true,
  },
  {
    managerName: "SK Capital Partners",
    fundName: "SK Capital Partners VI",
    vintage: "2021",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://skcapitalpartners.com/sk-capital-closes-fund-vi-exceeds-target-at-2-95-billion/",
      "https://www.sec.gov/Archives/edgar/data/1899756/000189975621000001/xslFormDX01/primary_doc.xml",
    ],
    attributionOnly: true,
  },
  {
    managerName: "American Securities",
    fundName: "American Securities Partners VIII, L.P.",
    vintage: "2017",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.sec.gov/Archives/edgar/data/1718376/000171837517000001/xslFormDX01/primary_doc.xml",
    ],
    attributionOnly: true,
  },
  {
    managerName: "Vista Equity Partners",
    fundName: "Vista Foundation Fund IV, L.P.",
    vintage: "2020",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://www.powerfactors.com/news/power-factors-to-be-acquired-by-vista-equity-partners",
      "https://info.vistaequitypartners.com/rs/vistaequitypartnersiiillc/images/Vista%20Exchange%20-%20July%20Review.pdf",
    ],
    attributionOnly: true,
  },
  {
    managerName: "Connor, Clark & Lunn Infrastructure",
    fundName: "Connor, Clark & Lunn Institutional Infrastructure Fund",
    vintage: "Evergreen",
    regions: ["North America"],
    status: "Evergreen",
    structure: "Open-End",
    sourceUrls: [
      "https://cclinfrastructure.cclgroup.com/insight/news-infra-ccl-infrastructure-achieves-record-growth-in-2024/",
      "https://cclinfrastructure.cclgroup.com/what-we-do/investing-with-ccl-infrastructure/",
    ],
    attributionOnly: true,
  },
  {
    managerName: "Vision Ridge Partners",
    fundName: "Vision Ridge Sustainable Asset Fund I",
    vintage: "2014",
    regions: ["North America"],
    status: "Financial Close",
    structure: "Closed-End",
    sourceUrls: [
      "https://vision-ridge.com/investments/",
      "https://vision-ridge.com/wp-content/uploads/2021/04/SAF-III-Fund-Close-Press-Release-4.1.21.pdf",
    ],
    attributionOnly: true,
  },
];

const REVIEWED_ATTRIBUTION_OVERRIDES: ReviewedAttributionOverride[] = [
  {
    companyName: "Edwards Sanborn Solar + Storage",
    investmentFirm: "Axium Infrastructure",
    attribution: "UNRESOLVED",
    confidence: "HIGH",
    attributedFundName: null,
    rationale: "Reviewed evidence identifies Axium ES Holdings LLC, Axium Co-Invest Holdings, and AxInfra US LP in the ownership chain, but does not disclose a production-curated matching fund. The active period remains unlinked rather than being inferred to the generic AxInfra Fund I-IV record.",
    sourceUrls: [
      "https://www.axiuminfra.com/portfolio-assets/?lang=en",
      "https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20240130-5233",
    ],
  },
  {
    companyName: "Axium Aster & Axium Bloom",
    investmentFirm: "Axium Infrastructure",
    attribution: "UNRESOLVED",
    confidence: "HIGH",
    attributedFundName: null,
    rationale: "Reviewed evidence identifies separate Aster and Bloom holding vehicles and names AIC II for Aster, but it does not support one exact current fund assignment across both ownership periods. Both periods remain unlinked pending the separate fund review rather than being inferred to the generic AxInfra Fund I-IV record.",
    sourceUrls: [
      "https://www.axiuminfra.com/portfolio-assets/?lang=en",
      "https://www.axiuminfra.com/wp-content/uploads/2022/06/Axium_2022_ESG_Report.pdf",
    ],
  },
  {
    companyName: "Axium Extendicare LTC II LP",
    investmentFirm: "Axium Infrastructure",
    attribution: "UNRESOLVED",
    confidence: "HIGH",
    attributedFundName: null,
    rationale: "Reviewed current ownership evidence identifies Axium LTC Limited Partnership as the holding vehicle and Axium Infrastructure as the 85% owner, but does not disclose a commingled fund.",
    sourceUrls: [
      "https://extendicare-1c124.kxcdn.com/app/uploads/2026/08/EXE-Q2-2026-Interim-MDA-vSedar2.pdf?x89279=",
      "https://www.extendicare.com/app/uploads/2025/06/997.pdf",
    ],
  },
  {
    companyName: "Virginia International Gateway",
    investmentFirm: "Astatine Investment Partners",
    attribution: "UNRESOLVED",
    confidence: "HIGH",
    attributedFundName: null,
    rationale: "Astatine identifies Virginia International Gateway as a current managed investment, but the reviewed public evidence does not disclose the active fund, managed account, or holding vehicle. The separate Alinda Infrastructure Fund II investment was exited in 2019, so the current period is intentionally left unlinked rather than inferred to a later Astatine fund.",
    sourceUrls: [
      "https://astatineip.com/investment/virginia-international-gateway/",
      "https://astatineip.com/investment/virginia-international-gateway-2/",
    ],
  },
  {
    companyName: "Ports America",
    investmentFirm: "Oaktree / Duration",
    attribution: "INFERRED",
    confidence: "LOW",
    attributedFundName: "Oaktree Ports America Fund (HS III), L.P.",
    rationale: "Estimated from the Ports America-specific Oaktree vehicle disclosed in its SEC filing. The vehicle was formed after the original investment date, so this is treated as a later ownership vehicle rather than proof of the initial 2014 fund.",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1759972/000156761919012053/xslFormDX08/primary_doc.xml"],
  },
  {
    companyName: "Bayonne water and wastewater concession",
    investmentFirm: "Argo Infrastructure Partners",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "AIA Energy North America LLC",
    rationale: "Bayonne public records identify the transferred ownership entity as AIA Energy North America, an Argo-managed investment vehicle.",
    sourceUrls: ["https://www.bayonnenj.org/_Content/pdf/minutes/2017-05-17-Council-Minutes.pdf"],
  },
  {
    companyName: "Middletown Water Joint Venture LLC",
    investmentFirm: "Argo Infrastructure Partners",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "AIA Energy North America LLC",
    rationale: "The reviewed concession evidence places Middletown alongside Bayonne in the AIA Energy North America ownership structure managed by Argo.",
    sourceUrls: ["https://middletownborough.com/wp-content/uploads/2020/12/Executed-Concession-Agreement-A4495119.pdf"],
  },
  {
    companyName: "Thule Energy Storage",
    investmentFirm: "Argo Infrastructure Partners",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "ACP Thule Investments LLC",
    rationale: "The California regulatory filing identifies ACP Thule Investments LLC as Thule's Argo-managed parent vehicle.",
    sourceUrls: ["https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M345/K698/345698025.PDF"],
  },
  {
    companyName: "Caturus",
    investmentFirm: "Kimmeridge",
    attribution: "INFERRED",
    confidence: "LOW",
    attributedFundName: "Kimmeridge Energy Fund V / Kimmeridge Energy Fund VI / SoTex Co-Invest",
    rationale: "Estimated as a multi-vehicle attribution because Kimmeridge's sustainability reporting places the Caturus asset base across Fund V, Fund VI, and SoTex Co-Invest rather than one exclusive fund.",
    sourceUrls: ["https://kimmeridge.com/wp-content/uploads/2025/11/Kimmeridge-2024-Sustainability-Report-Final.pdf"],
  },
  {
    companyName: "Commonwealth LNG",
    investmentFirm: "Kimmeridge",
    attribution: "INFERRED",
    confidence: "LOW",
    attributedFundName: "Kimmeridge Energy Fund V / Kimmeridge Energy Fund VI / SoTex Co-Invest",
    rationale: "Estimated from Commonwealth LNG's integration into Caturus and Kimmeridge's disclosure that the broader asset base spans Fund V, Fund VI, and SoTex Co-Invest.",
    sourceUrls: ["https://kimmeridge.com/wp-content/uploads/2025/11/Kimmeridge-2024-Sustainability-Report-Final.pdf"],
  },
  {
    companyName: "DataBank",
    investmentFirm: "Swiss Life",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities III",
    rationale: "Swiss Life reporting identifies Global Infrastructure Opportunities III (GIO III) as the lead fund for the DataBank co-investment.",
    sourceUrls: ["https://swisslife.tools.factsheetslive.com/portfolioplaner/product/LU2781073882/documents/jb/"],
  },
  {
    companyName: "DataBank",
    investmentFirm: "Swiss Life Asset Managers",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities III",
    rationale: "Swiss Life reporting identifies Global Infrastructure Opportunities III (GIO III) as the lead fund for the DataBank co-investment.",
    sourceUrls: ["https://swisslife.tools.factsheetslive.com/portfolioplaner/product/LU2781073882/documents/jb/"],
  },
  {
    companyName: "Flamingo Crossings Village",
    investmentFirm: "Swiss Life",
    attribution: "INFERRED",
    confidence: "LOW",
    attributedFundName: "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities III",
    rationale: "Estimated by normalizing the reviewed ownership label Swiss Life GIO III Holding S.à r.l. to the corresponding GIO III fund lineage; public materials do not independently disclose the exact legal fund interest.",
    sourceUrls: ["https://ch.swisslife-am.com/content/dam/slam/documents_publications/investment_foundation/en/r/e_ast_qb_03_2024_igchf.pdf"],
  },
  {
    companyName: "JFK New Terminal One",
    investmentFirm: "Swiss Life",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Swiss Life GIO III Co-Invest / JLC Infrastructure Fund I, L.P.",
    rationale: "Swiss Life reporting identifies its New Terminal One exposure as a GIO III co-investment alongside JLC Infrastructure Fund I.",
    sourceUrls: ["https://ch.swisslife-am.com/content/dam/slam/documents_publications/investment_foundation/de/r/d_ast_sl_jahresbericht_2022_2023.pdf"],
  },
  {
    companyName: "The New Terminal One at JFK",
    investmentFirm: "Swiss Life",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Swiss Life GIO III Co-Invest / JLC Infrastructure Fund I, L.P.",
    rationale: "Swiss Life reporting identifies its New Terminal One exposure as a GIO III co-investment alongside JLC Infrastructure Fund I.",
    sourceUrls: ["https://ch.swisslife-am.com/content/dam/slam/documents_publications/investment_foundation/de/r/d_ast_sl_jahresbericht_2022_2023.pdf"],
  },
  {
    companyName: "Dresser Utility Solutions",
    investmentFirm: "First Reserve",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "First Reserve Infrastructure Opportunities Fund (FRIOF)",
    rationale: "First Reserve's official portfolio identifies Dresser under FRIOF.",
    sourceUrls: ["https://www.firstreserve.com/portfolio/1000"],
  },
  {
    companyName: "Monterey Mushrooms",
    investmentFirm: "Paine Schwartz Partners",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Paine Schwartz Food Chain Fund VI, L.P.",
    rationale: "Paine Schwartz's Fund VI final-close disclosure lists Monterey Mushrooms as a Fund VI investment.",
    sourceUrls: ["https://paineschwartz.com/news/paine-schwartz-partners-closes-1-7-billionfood-and-agribusiness-focused-fund-vi/"],
  },
  {
    companyName: "Vantage Data Centers",
    investmentFirm: "Silver Lake",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Silver Lake Partners VII",
    rationale: "Silver Lake's Fund VII final-close announcement specifically identifies the Vantage Data Centers reinvestment as part of the fund's activity.",
    sourceUrls: ["https://www.silverlake.com/silver-lake-closes-20-5-billion-fundraise-for-slp-vii/"],
  },
  {
    companyName: "Vigor Marine Group",
    investmentFirm: "Lone Star Funds",
    attribution: "DISCLOSED",
    confidence: "HIGH",
    attributedFundName: "Lone Star Fund XI",
    rationale: "Lone Star's official private-equity portfolio identifies Vigor Marine Group under Lone Star Fund XI.",
    sourceUrls: ["https://lonestarfunds.com/investment-strategies/private-equity/"],
  },
  {
    companyName: "Homer",
    investmentFirm: "Vision Ridge",
    attribution: "DIRECT_PROGRAM",
    confidence: "HIGH",
    attributedFundName: null,
    rationale: "Homer predates Vision Ridge Sustainable Asset Fund I and is classified as an early direct sponsor investment rather than assigned to a later fund.",
    sourceUrls: ["https://www.rbf.org/sites/default/files/rbf-investing-2020-report-final-pages.pdf"],
  },
];

const ATTRIBUTION_ONLY_FUND_NAMES = new Set(ATTRIBUTION_ONLY_FUNDS.map((fund) => fund.fundName));
const CANDIDATE_FUNDS: CandidateFund[] = [
  ...funds.filter((fund) => !ATTRIBUTION_ONLY_FUND_NAMES.has(fund.fundName)),
  ...ATTRIBUTION_ONLY_FUNDS,
];

const DIRECT_PROGRAM_FIRMS = new Set([
  "acadia infrastructure capital",
  "allianz global investors",
  "allianz capital partners",
  "altius minerals",
  "altius renewable royalties",
  "australian retirement trust",
  "bmo financial group",
  "comstock resources",
  "cdpq",
  "edf group",
  "equitix",
  "hf capital",
  "imco",
  "john laing",
  "keyera",
  "masdar",
  "norges bank investment management",
  "ocean winds",
  "pggm",
  "psp investments",
  "qia",
  "talen energy",
  "united community bank",
  "wren house",
  "tract capital",
  "adia infrastructure",
  "allied industrial partners",
  "btg pactual timberland investment group",
  "cox enterprises",
  "emera",
  "energy transfer lp",
  "epointzero",
  "ferrovial n.v.",
  "kinder morgan, inc.",
  "qic",
  "tract capital management",
  "ugi utilities",
  "harbert management corp (harbert infra / gulf pacific)",
].map(canonical));

function parseArgs(argv: string[]): { asOf: string; outputDir: string; snapshotPath: string; force: boolean } {
  const read = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    if (index >= 0) return argv[index + 1];
    const inline = argv.find((argument) => argument.startsWith(`${flag}=`));
    return inline?.slice(flag.length + 1);
  };
  const asOf = read("--as-of") ?? DEFAULT_AS_OF;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error("--as-of must use YYYY-MM-DD");
  const outputDir = path.resolve(read("--output-dir") ?? path.join(ROOT, "audits", "portfolio-fund-attribution", asOf));
  return {
    asOf,
    outputDir,
    snapshotPath: path.resolve(read("--production-snapshot") ?? path.join(ROOT, "audits", "portfolio-fund-attribution", asOf, "production-snapshot.json")),
    force: argv.includes("--force"),
  };
}

interface ProductionSnapshot {
  schemaVersion: 1;
  artifactType: "PORTFOLIO_FUND_ATTRIBUTION_PRODUCTION_SNAPSHOT";
  asOfDate: string;
  companyCount: number;
  activeOwnershipCount: number;
  publishedFundCount: number;
  availableFundNames: string[];
  records: Array<{
    ownershipPeriodId: string;
    companyId: string;
    companyName: string;
    country: string;
    description: string;
    investmentFirm: string;
    vehicleName: string | null;
    displayVehicleName: string;
    currentLinkedFundName: string | null;
    currentFundAttribution: Attribution;
    investmentYear: number | null;
    stake: string | null;
    milestones: Array<{ date: string; event: string; category: string }>;
    sources: Array<{ label: string; url: string; type: string; purpose: string; evidenceLabel: string | null }>;
  }>;
  capturedAt: string;
  snapshotSha256: string;
}

function loadProductionRows(snapshotPath: string, asOfDate: string): {
  snapshotSha256: string;
  availableFundNames: Set<string>;
  rows: ActiveOwnerRow[];
} {
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as ProductionSnapshot;
  if (snapshot.schemaVersion !== 1 || snapshot.artifactType !== "PORTFOLIO_FUND_ATTRIBUTION_PRODUCTION_SNAPSHOT") {
    throw new Error("Production attribution snapshot has the wrong artifact type");
  }
  if (snapshot.asOfDate !== asOfDate || snapshot.records.length !== snapshot.activeOwnershipCount) {
    throw new Error("Production attribution snapshot date or record count is invalid");
  }
  if (snapshot.publishedFundCount !== snapshot.availableFundNames.length) {
    throw new Error("Production attribution snapshot fund count is invalid");
  }
  const { capturedAt: _capturedAt, snapshotSha256, ...content } = snapshot;
  if (sha256(content) !== snapshotSha256) throw new Error("Production attribution snapshot SHA-256 is invalid");
  if (new Set(snapshot.records.map((record) => record.ownershipPeriodId)).size !== snapshot.records.length) {
    throw new Error("Production attribution snapshot ownership IDs are not unique");
  }
  const rows = snapshot.records.map((record): ActiveOwnerRow => {
    const owner = {
      investmentFirm: record.investmentFirm,
      ownershipVehicle: record.displayVehicleName,
      vehicleName: record.vehicleName ?? undefined,
      fundName: record.currentLinkedFundName ?? undefined,
      investmentYear: record.investmentYear ?? undefined,
      stake: record.stake ?? undefined,
      status: "Active" as const,
    };
    const company = {
      name: record.companyName,
      investmentFirm: record.investmentFirm,
      sector: "Utilities",
      subsector: "",
      region: "North America",
      country: record.country,
      ownershipVehicle: record.displayVehicleName,
      description: record.description,
      status: "Active",
      milestones: record.milestones,
      sources: record.sources.map((source) => ({
        ...source,
        evidenceLabel: source.evidenceLabel ?? undefined,
      })),
      owners: [owner],
    } as PortCo;
    return {
      company,
      owner,
      rowKey: record.ownershipPeriodId,
      ownershipPeriodId: record.ownershipPeriodId,
      databaseVehicleName: record.vehicleName,
      currentFundAttribution: record.currentFundAttribution,
    };
  });
  return { snapshotSha256, availableFundNames: new Set(snapshot.availableFundNames), rows };
}

function canonical(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(inc|llc|ltd|plc|lp|limited|corp|corporation|holdings|group|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return canonical(value)
    .split(" ")
    .filter((token) => token.length > 1 && !new Set(["the", "and", "fund", "funds", "infrastructure", "capital", "management", "partners", "investment", "investments"]).has(token));
}

function overlap(left: string, right: string): number {
  const a = tokens(left);
  const b = new Set(tokens(right));
  if (!a.length || !b.size) return 0;
  return a.filter((token) => b.has(token)).length / Math.max(a.length, b.size);
}

function managerTerms(value: string): string[] {
  const normalized = canonical(value);
  const aliases = Object.entries(MANAGER_ALIASES)
    .filter(([key, values]) => canonical(key) === normalized || values.some((alias) => canonical(alias) === normalized))
    .flatMap(([key, values]) => [key, ...values]);
  return Array.from(new Set([value, ...aliases].map(canonical).filter(Boolean)));
}

function managerScore(owner: string, manager: string): number {
  let best = 0;
  for (const left of managerTerms(owner)) {
    for (const right of managerTerms(manager)) {
      if (left === right) best = Math.max(best, 1);
      else best = Math.max(best, overlap(left, right));
    }
  }
  return best;
}

function vintageYear(vintage: string): number | null {
  const match = vintage.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function candidateScore(
  fund: CandidateFund,
  firm: string,
  currentVehicle: string,
  investmentYear: number | null,
): Candidate | null {
  const managerMatch = managerScore(firm, fund.managerName);
  if (managerMatch < 0.68) return null;
  const reasons = [`manager match ${managerMatch.toFixed(2)}`];
  let score = managerMatch * 45;
  const nameOverlap = overlap(currentVehicle, fund.fundName);
  if (nameOverlap > 0) {
    score += nameOverlap * 30;
    reasons.push(`vehicle-name overlap ${nameOverlap.toFixed(2)}`);
  }
  const year = vintageYear(fund.vintage);
  if (investmentYear && year) {
    const delta = investmentYear - year;
    if (delta >= 0 && delta <= 3) {
      score += 25;
      reasons.push(`vintage ${year} is ${delta} years before investment`);
    } else if (delta >= 0 && delta <= 7) {
      score += 15;
      reasons.push(`vintage ${year} precedes investment by ${delta} years`);
    } else if (delta >= 0) {
      score += 4;
      reasons.push(`older vintage ${year}`);
    } else if (delta >= -2) {
      score += 8;
      reasons.push(`investment predates reported close by ${Math.abs(delta)} year${delta === -1 ? "" : "s"}; pre-close deployment is plausible`);
    } else {
      score -= Math.min(35, Math.abs(delta) * 12);
      reasons.push(`vintage ${year} post-dates investment`);
    }
  } else if (/evergreen/i.test(fund.vintage) || /evergreen|open-end|permanent/i.test(fund.structure)) {
    score += 10;
    reasons.push("evergreen/permanent-capital vehicle");
  }
  if (fund.regions.includes("North America") || fund.regions.includes("Global")) {
    score += 5;
    reasons.push("North America-relevant mandate");
  }
  if (fund.status === "Financial Close" || fund.status === "Evergreen") score += 3;
  if (fund.attributionOnly) reasons.push("historical vehicle retained for attribution only");
  return {
    fundName: fund.fundName,
    managerName: fund.managerName,
    vintage: fund.vintage,
    score: Math.round(score * 10) / 10,
    reasons,
    attributionOnly: fund.attributionOnly === true,
    sourceUrls: fund.sourceUrls,
  };
}

function candidatesFor(firm: string, vehicle: string, investmentYear: number | null): Candidate[] {
  return CANDIDATE_FUNDS
    .map((fund) => candidateScore(fund, firm, vehicle, investmentYear))
    .filter((candidate): candidate is Candidate => candidate !== null)
    .sort((left, right) => right.score - left.score || left.fundName.localeCompare(right.fundName));
}

function exactFund(label: string, firm: string): Fund | null {
  const normalized = canonical(label);
  const matches = funds.filter((fund) => canonical(fund.fundName) === normalized && managerScore(firm, fund.managerName) >= 0.68);
  return matches.length === 1 ? matches[0] : null;
}

function directProgramLabel(value: string, firm: string): boolean {
  if (/\b(balance sheet|proprietary capital|direct investment|direct stake|direct ownership|direct corporate ownership|direct platform investment|retained ownership|separately managed account|sma|pension plan|sovereign|listed company|corporate capital)\b/i.test(value)) {
    return true;
  }
  return DIRECT_PROGRAM_FIRMS.has(canonical(firm));
}

function reviewedAttributionOverride(
  companyName: string,
  investmentFirm: string,
): ReviewedAttributionOverride | null {
  const matches = REVIEWED_ATTRIBUTION_OVERRIDES.filter((override) => (
    canonical(override.companyName) === canonical(companyName)
    && canonical(override.investmentFirm) === canonical(investmentFirm)
  ));
  if (matches.length > 1) {
    throw new Error(`Duplicate reviewed attribution override for ${companyName} / ${investmentFirm}`);
  }
  return matches[0] ?? null;
}

function inferredNamedVehicle(value: string): string | null {
  const trimmed = value.trim();
  if (/^(?:n\.?a\.?|not (?:publicly )?disclosed|undisclosed|none|—)$/i.test(trimmed)) return null;
  return /\b(?:fund\s+[ivxlcdm0-9]+|partners\s+[ivxlcdm]+|holdings?\s+[ivxlcdm0-9]+|l\.?p\.?)\b/i.test(trimmed)
    ? trimmed
    : null;
}

function sha256(value: unknown): string {
  const payload = Buffer.isBuffer(value)
    ? value
    : typeof value === "string"
      ? value
      : JSON.stringify(value);
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function sourceHash(file: string): string {
  return fs.existsSync(file) ? sha256(fs.readFileSync(file)) : sha256("missing");
}

function classify(
  index: number,
  built: ReturnType<typeof buildCurrentOwnerFundAudit>,
  availableFundNames: ReadonlySet<string>,
): LedgerRow {
  const { auditRows, workingRows } = built;
  const audit = auditRows[index];
  const source = workingRows[index];
  if (!audit || !source) throw new Error(`Missing attribution source row ${index}`);
  const owner = source.owner;
  const investmentYear = owner.investmentYear ?? null;
  const currentVehicleName = owner.vehicleName || owner.ownershipVehicle || owner.investmentFirm;
  const evidenceUrls = audit.evidence_urls.split(/;\s*/).filter(Boolean);
  const disclosedLabel = audit.verified_fund_vehicle_result && audit.verified_fund_vehicle_result !== "n.a."
    ? audit.verified_fund_vehicle_result
    : null;
  const reviewedOverride = reviewedAttributionOverride(source.company.name, owner.investmentFirm);
  const ownerFund = owner.fundName ? exactFund(owner.fundName, owner.investmentFirm) : null;
  const disclosedFund = disclosedLabel ? exactFund(disclosedLabel, owner.investmentFirm) : null;
  const reviewedFund = reviewedOverride?.attributedFundName
    ? exactFund(reviewedOverride.attributedFundName, owner.investmentFirm)
    : null;
  const linkedFund = reviewedFund ?? ownerFund ?? disclosedFund;
  // A vehicle label that happens to equal a curated fund name is not proof of
  // an existing database foreign key. Only the snapshot/seed owner's explicit
  // fundName represents the current link.
  const currentFundLookup = owner.fundName || "";
  const currentLinkedFund = funds.find((fund) => fund.fundName === currentFundLookup) ?? null;
  const rankedCandidates = candidatesFor(owner.investmentFirm, owner.ownershipVehicle || "", investmentYear);
  const top = rankedCandidates[0] ?? null;
  const runnerUp = rankedCandidates[1] ?? null;

  let attribution: Attribution;
  let confidence: Confidence | null;
  let fundName: string | null;
  let rationale: string;
  let proposedAction: LedgerRow["proposedAction"];
  let fundDatabaseAction: LedgerRow["fundDatabaseAction"] = "NONE";
  let applyEligible = false;
  let chronologyIsPlausible = true;

  if (reviewedOverride) {
    attribution = reviewedOverride.attribution;
    confidence = reviewedOverride.confidence;
    fundName = reviewedOverride.attributedFundName;
    rationale = reviewedOverride.rationale;
    if (attribution === "DISCLOSED") {
      proposedAction = linkedFund ? "SET_DISCLOSED_LINKED" : "SET_DISCLOSED_UNLISTED";
      fundDatabaseAction = linkedFund ? "NONE" : "REVIEW_ALIAS_OR_SIZE_GATED_ADDITION";
      const linkedVintageYear = linkedFund ? vintageYear(linkedFund.vintage) : null;
      chronologyIsPlausible = !investmentYear || !linkedVintageYear || linkedVintageYear <= investmentYear + 1;
      applyEligible = !!linkedFund && confidence === "HIGH" && chronologyIsPlausible;
    } else if (attribution === "INFERRED") {
      proposedAction = "SET_INFERRED";
    } else if (attribution === "DIRECT_PROGRAM") {
      proposedAction = "SET_DIRECT_PROGRAM";
    } else {
      proposedAction = "RESEARCH_REQUIRED";
    }
  } else if (audit.result_status === "Verified fund" || audit.result_status === "Verified fund - missing from funds list") {
    attribution = "DISCLOSED";
    confidence = audit.confidence.toUpperCase() as Confidence;
    fundName = linkedFund?.fundName ?? disclosedLabel;
    rationale = audit.notes;
    proposedAction = linkedFund ? "SET_DISCLOSED_LINKED" : "SET_DISCLOSED_UNLISTED";
    fundDatabaseAction = linkedFund ? "NONE" : "REVIEW_ALIAS_OR_SIZE_GATED_ADDITION";
    const linkedVintageYear = linkedFund ? vintageYear(linkedFund.vintage) : null;
    chronologyIsPlausible = !investmentYear || !linkedVintageYear || linkedVintageYear <= investmentYear + 1;
    applyEligible = !!linkedFund && confidence === "HIGH" && chronologyIsPlausible;
  } else if (directProgramLabel(
    `${owner.ownershipVehicle} ${audit.verified_fund_vehicle_result} ${audit.notes}`,
    owner.investmentFirm,
  )) {
    attribution = "DIRECT_PROGRAM";
    confidence = audit.confidence.toUpperCase() as Confidence;
    fundName = null;
    rationale = audit.notes;
    proposedAction = "SET_DIRECT_PROGRAM";
    applyEligible = false;
  } else if (top && top.score >= 35) {
    const margin = top.score - (runnerUp?.score ?? 0);
    attribution = "INFERRED";
    confidence = top.score >= 68 && margin >= 12 ? "MEDIUM" : "LOW";
    fundName = currentLinkedFund?.fundName ?? top.fundName;
    rationale = currentLinkedFund
      ? `Estimated by preserving the existing curated link to ${currentLinkedFund.fundName}; public disclosure does not identify a distinct fund. Ranked evidence considered ${top.reasons.join(", ")}.`
      : `Estimated from ${top.reasons.join(", ")}; ${runnerUp ? `next candidate trails by ${margin.toFixed(1)} points` : "no second manager-matched fund candidate"}. Public disclosure does not identify a distinct fund.`;
    proposedAction = "SET_INFERRED";
  } else if (inferredNamedVehicle(currentVehicleName)) {
    attribution = "INFERRED";
    confidence = "LOW";
    fundName = inferredNamedVehicle(currentVehicleName);
    rationale = `Estimated by retaining the reviewed current vehicle label ${currentVehicleName}; attached public sources identify the investment relationship but do not independently confirm the exact vehicle.`;
    proposedAction = "SET_INFERRED";
  } else {
    attribution = "UNRESOLVED";
    confidence = null;
    fundName = null;
    rationale = `${audit.notes} No credible fund candidate exists in the curated fund database.`;
    proposedAction = "RESEARCH_REQUIRED";
  }

  const recordId = `OFA-${sha256(source.rowKey).slice(0, 12).toUpperCase()}`;
  const attributedFundName = attribution === "DISCLOSED" || attribution === "INFERRED" ? fundName : null;
  const desiredLinkName = attribution === "INFERRED"
    ? fundName
    : attribution === "DISCLOSED" && chronologyIsPlausible
      ? linkedFund?.fundName ?? currentLinkedFund?.fundName ?? null
      : attribution === "DISCLOSED"
        ? currentLinkedFund?.fundName ?? null
        : null;
  const targetLinkedFundName = desiredLinkName && availableFundNames.has(desiredLinkName)
    ? desiredLinkName
    : currentLinkedFund?.fundName ?? null;
  return {
    recordId,
    ownershipPeriodId: source.ownershipPeriodId ?? null,
    sourceRowKey: source.rowKey,
    companyName: source.company.name,
    country: source.company.country,
    investmentFirm: owner.investmentFirm,
    currentVehicleName,
    databaseVehicleName: source.ownershipPeriodId ? source.databaseVehicleName ?? null : currentVehicleName,
    investmentYear,
    stake: owner.stake ?? null,
    attribution,
    confidence,
    attributedFundName,
    disclosedOrEstimatedFundName: fundName,
    currentLinkedFundName: currentLinkedFund?.fundName ?? null,
    currentFundAttribution: source.currentFundAttribution ?? "UNRESOLVED",
    linkedCanonicalFundName: linkedFund?.fundName ?? (attribution === "INFERRED" ? fundName : null),
    targetLinkedFundName,
    alternatives: rankedCandidates.slice(0, 3),
    rationale,
    evidenceUrls: Array.from(new Set([
      ...evidenceUrls,
      ...(reviewedOverride?.sourceUrls ?? []),
      ...(top?.attributionOnly ? top.sourceUrls : []),
    ])),
    sourceAuditStatus: audit.result_status,
    sourceAuditConfidence: audit.confidence,
    applyEligible,
    proposedAction,
    fundDatabaseAction,
  };
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  return values.reduce((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {} as Record<T, number>);
}

function markdown(ledger: ReturnType<typeof buildPortfolioFundAttributionLedger>): string {
  const s = ledger.summary;
  return `# Portfolio Fund Attribution Ledger — ${ledger.asOfDate}

This review-only ledger classifies every active ownership row. It does not add funds or mutate Prisma data. Inferred rows are estimates and remain visibly distinct from disclosed assignments.

| Measure | Count |
| --- | ---: |
| Portfolio companies | ${s.companyCount} |
| Active ownership rows | ${s.activeOwnershipRows} |
| Disclosed | ${s.attributionCounts.DISCLOSED ?? 0} |
| Inferred estimates | ${s.attributionCounts.INFERRED ?? 0} |
| Direct / program | ${s.attributionCounts.DIRECT_PROGRAM ?? 0} |
| Unresolved | ${s.attributionCounts.UNRESOLVED ?? 0} |
| High-confidence deterministic subset | ${s.applyEligibleRows} |
| Full reviewed attribution manifest | ${s.activeOwnershipRows} |
| Named funds/vehicles outside curated fund database | ${s.sizeGatedFundReviewRows} |

## Guardrails

- A disclosed vehicle outside the curated fund database stays disclosed without bypassing the approximately $1bn fund-addition gate.
- An inferred assignment always includes a confidence level, rationale, and ranked alternatives.
- Inference is capped at Medium confidence; it is never presented as public disclosure.
- Direct/program classification requires explicit balance-sheet, proprietary-capital, SMA, pension, sovereign, or corporate-capital language.
- Production writes require a separately reviewed, immutable apply manifest.
`;
}

export function buildPortfolioFundAttributionLedger(
  asOfDate: string,
  options: {
    rows?: ActiveOwnerRow[];
    sourceScope?: "PRODUCTION_SNAPSHOT" | "EVALUATED_SEED";
    snapshotSha256?: string;
    availableFundNames?: ReadonlySet<string>;
  } = {},
) {
  const built = buildCurrentOwnerFundAudit(options.rows);
  if (built.auditRows.length !== built.workingRows.length) throw new Error("Audit row count does not match active ownership rows");
  const availableFundNames = options.availableFundNames ?? new Set(funds.map((fund) => fund.fundName));
  const rows = built.workingRows.map((_, index) => classify(index, built, availableFundNames));
  if (new Set(rows.map((row) => row.recordId)).size !== rows.length) throw new Error("Attribution record IDs are not unique");
  const companyCount = new Set(rows.map((row) => `${row.companyName}\u0000${row.country}`)).size;
  const summary = {
    companyCount,
    activeOwnershipRows: rows.length,
    attributionCounts: countBy(rows.map((row) => row.attribution)),
    confidenceCounts: countBy(rows.map((row) => row.confidence ?? "NONE")),
    applyEligibleRows: rows.filter((row) => row.applyEligible).length,
    sizeGatedFundReviewRows: rows.filter((row) => row.fundDatabaseAction !== "NONE").length,
  };
  const content = {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_LEDGER",
    asOfDate,
    sourceScope: options.sourceScope ?? "EVALUATED_SEED",
    policy: {
      fundAdditionThreshold: "approximately US$1bn; attribution never bypasses the curated-fund size gate",
      inferenceDisclosure: "INFERRED rows must be shown as Estimated with confidence and rationale",
      inferenceConfidenceCap: "MEDIUM",
    },
    sources: {
      companiesSha256: sourceHash(path.join(ROOT, "prisma", "seed-data", "companies.ts")),
      fundsSha256: sourceHash(path.join(ROOT, "prisma", "seed-data", "funds.ts")),
      supplementalSha256: sourceHash(path.join(ROOT, "portfolio_companies_active_web.json")),
      productionSnapshotSha256: options.snapshotSha256 ?? null,
    },
    summary,
    rows,
  };
  const ledger = {
    ...content,
    generatedAt: new Date().toISOString(),
    ledgerSha256: sha256(content),
  };
  validateLedger(ledger);
  return ledger;
}

export function validateLedger(ledger: ReturnType<typeof buildPortfolioFundAttributionLedger>): void {
  if (ledger.rows.length !== ledger.summary.activeOwnershipRows) {
    throw new Error("Ledger summary does not match row count");
  }
  if (new Set(ledger.rows.map((row) => row.recordId)).size !== ledger.rows.length) {
    throw new Error("Attribution record IDs are not unique");
  }
  for (const row of ledger.rows) {
    if (row.attribution === "INFERRED") {
      if (!row.confidence || row.confidence === "HIGH") {
        throw new Error(`${row.recordId}: inferred confidence must be LOW or MEDIUM`);
      }
      if (!row.attributedFundName || !row.rationale.trim()) {
        throw new Error(`${row.recordId}: inferred assignments require a fund and rationale`);
      }
      if (row.targetLinkedFundName && row.targetLinkedFundName !== row.attributedFundName) {
        throw new Error(`${row.recordId}: inferred fund link must match its displayed estimate`);
      }
    }
    if (row.attribution === "DISCLOSED" && !row.attributedFundName) {
      throw new Error(`${row.recordId}: disclosed assignments require a displayed fund or vehicle name`);
    }
    if ((row.attribution === "DIRECT_PROGRAM" || row.attribution === "UNRESOLVED") && row.targetLinkedFundName !== null) {
      throw new Error(`${row.recordId}: direct/program and unresolved assignments cannot link a fund`);
    }
    if ((row.attribution === "DIRECT_PROGRAM" || row.attribution === "UNRESOLVED") && row.attributedFundName !== null) {
      throw new Error(`${row.recordId}: direct/program and unresolved assignments cannot name a fund`);
    }
    if (row.applyEligible && (
      row.attribution !== "DISCLOSED"
      || row.confidence !== "HIGH"
      || !row.linkedCanonicalFundName
      || row.fundDatabaseAction !== "NONE"
    )) {
      throw new Error(`${row.recordId}: apply eligibility exceeds the deterministic disclosed-fund policy`);
    }
    if (row.fundDatabaseAction !== "NONE" && row.proposedAction !== "SET_DISCLOSED_UNLISTED") {
      throw new Error(`${row.recordId}: fund-database review must remain separate from inferred attribution`);
    }
  }
}

function csvEscape(value: unknown): string {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csv(ledger: ReturnType<typeof buildPortfolioFundAttributionLedger>): string {
  const headers = [
    "recordId",
    "ownershipPeriodId",
    "companyName",
    "country",
    "investmentFirm",
    "currentVehicleName",
    "databaseVehicleName",
    "investmentYear",
    "stake",
    "attribution",
    "confidence",
    "attributedFundName",
    "disclosedOrEstimatedFundName",
    "currentLinkedFundName",
    "linkedCanonicalFundName",
    "targetLinkedFundName",
    "rationale",
    "evidenceUrls",
    "sourceAuditStatus",
    "applyEligible",
    "proposedAction",
    "fundDatabaseAction",
  ] as const;
  return [
    headers.join(","),
    ...ledger.rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
    "",
  ].join("\n");
}

function buildApplyManifest(ledger: ReturnType<typeof buildPortfolioFundAttributionLedger>) {
  const mutations = ledger.rows
    .map((row) => ({
      recordId: row.recordId,
      ownershipPeriodId: row.ownershipPeriodId,
      companyName: row.companyName,
      country: row.country,
      investmentFirm: row.investmentFirm,
      currentVehicleName: row.currentVehicleName,
      databaseVehicleName: row.databaseVehicleName,
      investmentYear: row.investmentYear,
      stake: row.stake,
      targetLinkedFundName: row.targetLinkedFundName,
      expected: {
        fundAttribution: row.currentFundAttribution ?? "UNRESOLVED",
        currentLinkedFundName: row.currentLinkedFundName,
      },
      set: {
        fundAttribution: row.attribution,
        attributedFundName: row.attributedFundName,
        attributionConfidence: row.attribution === "INFERRED" ? row.confidence : null,
        attributionRationale: row.rationale,
      },
      evidenceUrls: row.evidenceUrls,
    }));
  const fundLinkChanges = mutations.filter((mutation) => (
    mutation.expected.currentLinkedFundName !== mutation.targetLinkedFundName
  )).length;
  const countedAttributions = countBy(mutations.map((mutation) => mutation.set.fundAttribution));
  const attributionCounts = {
    DISCLOSED: countedAttributions.DISCLOSED ?? 0,
    INFERRED: countedAttributions.INFERRED ?? 0,
    DIRECT_PROGRAM: countedAttributions.DIRECT_PROGRAM ?? 0,
    UNRESOLVED: countedAttributions.UNRESOLVED ?? 0,
  };
  const content = {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST",
    asOfDate: ledger.asOfDate,
    ledgerSha256: ledger.ledgerSha256,
    sourceSnapshotSha256: ledger.sources.productionSnapshotSha256,
    policy: {
      sourceScope: ledger.sourceScope,
      mutationScope: "OwnershipPeriod attribution metadata and existing-fund link only",
      allowedAttributions: ["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"] as const,
      fundCreates: 0,
      fundUpdates: 0,
      ownershipIdentityChanges: 0,
      attributionCounts,
      inferredWrites: attributionCounts.INFERRED ?? 0,
      fundLinkChanges,
    },
    expectedMutationCount: mutations.length,
    mutations,
  };
  return { ...content, manifestSha256: sha256(content) };
}

function writeArtifact(file: string, content: string, force: boolean): void {
  if (fs.existsSync(file) && !force) throw new Error(`Refusing to overwrite ${path.relative(ROOT, file)} without --force`);
  fs.writeFileSync(file, content);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const production = loadProductionRows(options.snapshotPath, options.asOf);
  const ledger = buildPortfolioFundAttributionLedger(options.asOf, {
    rows: production.rows,
    sourceScope: "PRODUCTION_SNAPSHOT",
    snapshotSha256: production.snapshotSha256,
    availableFundNames: production.availableFundNames,
  });
  const seedLedger = buildPortfolioFundAttributionLedger(options.asOf, { sourceScope: "EVALUATED_SEED" });
  const applyManifest = verifyManifest(buildApplyManifest(ledger));
  const seedApplyManifest = verifyManifest(buildApplyManifest(seedLedger));
  fs.mkdirSync(options.outputDir, { recursive: true });
  writeArtifact(path.join(options.outputDir, "ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`, options.force);
  writeArtifact(path.join(options.outputDir, "ledger.csv"), csv(ledger), options.force);
  writeArtifact(path.join(options.outputDir, "summary.md"), markdown(ledger), options.force);
  writeArtifact(path.join(options.outputDir, "apply-manifest.json"), `${JSON.stringify(applyManifest, null, 2)}\n`, options.force);
  writeArtifact(path.join(options.outputDir, "seed-ledger.json"), `${JSON.stringify(seedLedger, null, 2)}\n`, options.force);
  writeArtifact(path.join(options.outputDir, "seed-apply-manifest.json"), `${JSON.stringify(seedApplyManifest, null, 2)}\n`, options.force);
  console.log(JSON.stringify({
    outputDir: path.relative(ROOT, options.outputDir),
    production: { summary: ledger.summary, ledgerSha256: ledger.ledgerSha256, manifestSha256: applyManifest.manifestSha256 },
    evaluatedSeed: { summary: seedLedger.summary, ledgerSha256: seedLedger.ledgerSha256, manifestSha256: seedApplyManifest.manifestSha256 },
  }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) main();
