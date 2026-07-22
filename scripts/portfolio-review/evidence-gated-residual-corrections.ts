import { sha256 } from "./lib";

export const RESIDUAL_CORRECTIONS_SCHEMA_VERSION = 1 as const;
export const RESIDUAL_CORRECTIONS_SCOPE =
  "EVIDENCE_GATED_NON_IDENTITY_RESIDUAL_CORRECTIONS" as const;
export const REVIEWED_RESIDUAL_ACTION_COUNT = 42 as const;
export const REVIEWED_RESIDUAL_ACTION_SET_SHA256 =
  "cc74f7ba9889664fa965f2a9ea81c53ceea66ef32b33d0336ec9aff92eaa1b8f";
export const REVIEWED_RESIDUAL_MANIFEST_SHA256 =
  "51af7ad4f77b64d46ea4f856bbd2f0e51b3d03484bdb7ce94d4b378f14e531b3";
export const REVIEWED_RESIDUAL_SEED_SHA256 =
  "00caa33236a89c5eab438b83780993f985d096737c57c188576ad082f13b8232";

export interface EvidenceReference {
  publisher: string;
  url: string;
  finding: string;
}

export interface CompanyGuard {
  id: string;
  name: string;
  yearFounded: number | null;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
  coreSha256: string;
}

export interface ProtectedDigest {
  count: number;
  sha256: string;
}

export interface CompanyProtection {
  companyId: string;
  companyName: string;
  ownership: ProtectedDigest;
  milestones: ProtectedDigest;
  citations: ProtectedDigest;
}

export interface TableCounts {
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  citations: number;
  sources: number;
}

export interface CitationIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  nullsNotDistinct: boolean;
  hasIsPrimary: boolean;
  companyHasLastVerifiedAt: boolean;
  definition: string | null;
}

interface ActionBase {
  id: string;
  companyId?: string;
  evidence: readonly EvidenceReference[];
}

export interface CompanyUpdateAction extends ActionBase {
  actionType: "COMPANY_UPDATE";
  companyId: string;
  current: { yearFounded: number | null; description: string };
  proposed: { yearFounded: number | null; description: string };
}

export interface OwnershipUpdateAction extends ActionBase {
  actionType: "OWNERSHIP_UPDATE";
  companyId: string;
  current: {
    investmentYear: number | null;
    vehicleName: string | null;
    stake: string | null;
  };
  proposed: {
    investmentYear: number | null;
    vehicleName: string | null;
    stake: string | null;
  };
}

export interface MilestoneUpdateAction extends ActionBase {
  actionType: "MILESTONE_UPDATE";
  companyId: string;
  current: MilestoneRow;
  proposed: MilestoneRow;
}

export interface MilestoneInsertAction extends ActionBase {
  actionType: "MILESTONE_INSERT";
  companyId: string;
  proposed: MilestoneRow;
}

export interface MilestoneDeleteAction extends ActionBase {
  actionType: "MILESTONE_DELETE";
  companyId: string;
  current: MilestoneRow;
}

export interface CitationUpdateAction extends ActionBase {
  actionType: "CITATION_UPDATE";
  companyId: string;
  current: CitationRow;
  proposed: CitationRow;
}

export interface SourceInsertAction extends ActionBase {
  actionType: "SOURCE_INSERT";
  proposed: SourceRow;
}

export interface CitationInsertAction extends ActionBase {
  actionType: "CITATION_INSERT";
  companyId: string;
  proposed: CitationRow;
}

export type ResidualAction =
  | CitationInsertAction
  | CitationUpdateAction
  | CompanyUpdateAction
  | MilestoneDeleteAction
  | MilestoneInsertAction
  | MilestoneUpdateAction
  | OwnershipUpdateAction
  | SourceInsertAction;

export interface MilestoneRow {
  id: string;
  companyId: string;
  date: string;
  event: string;
  category: string;
  sortDate: string | null;
}

export interface CitationRow {
  id: string;
  sourceId: string;
  dealId: string | null;
  companyId: string | null;
  purpose: string;
  evidenceLabel: string | null;
}

export interface SourceRow {
  id: string;
  label: string;
  url: string;
  type: string;
}

export interface ExistingSourceGuard extends SourceRow {}

export interface QuarantinedField {
  company: string;
  field: string;
  proposedValue: string | null;
  reason: string;
}

export interface ResidualManifest {
  companyGuards: CompanyGuard[];
  actions: ResidualAction[];
  existingSourceGuards: ExistingSourceGuard[];
  protectedSets: CompanyProtection[];
  tableCounts: TableCounts;
  citationIndex: CitationIndexState;
  quarantinedFields: readonly QuarantinedField[];
}

export interface ResidualSnapshot {
  companyGuards: CompanyGuard[];
  targetRows: Record<string, unknown>;
  existingSourceGuards: ExistingSourceGuard[];
  protectedSets: CompanyProtection[];
  tableCounts: TableCounts;
  citationIndex: CitationIndexState;
  insertConflicts: string[];
  seedSha256: string;
}

export interface ResidualPlan {
  actions: ResidualAction[];
  actionCount: number;
  actionSetSha256: string;
  executionSha256: string;
  snapshotSha256: string;
  counts: Record<string, number>;
  quarantinedFields: readonly QuarantinedField[];
}

const E = {
  broadwing: {
    publisher: "I Squared Capital",
    url: "https://isquaredcapital.com/cpt_news/i-squared-capital-and-low-carbon-infrastructure-announce-landmark-clean-power-partnership-with-google/",
    finding:
      "The 2025 release identifies Low Carbon Infrastructure as an I Squared portfolio company, but does not disclose I Squared's original entry date.",
  },
  caturus: {
    publisher: "Caturus and Mubadala Energy",
    url: "https://caturus.com/news/kimmeridge-closes-strategic-equity-investment-from-mubadala-energy-and-rebrands-integrated-natural-gas-platform-as-caturus",
    finding:
      "Caturus states that Mubadala's 24.1% investment closed on August 7, 2025 and SoTex HoldCo was rebranded; it does not establish Kimmeridge's original entry date.",
  },
  arclight: {
    publisher: "ArcLight Capital Partners",
    url: "https://arclight.com/portfolio-services/",
    finding:
      "ArcLight identifies Thunderbird as a Fund VIII portfolio investment but does not disclose the acquisition date.",
  },
  transalta: {
    publisher: "TransAlta",
    url: "https://transalta.com/newsroom/transalta-enters-memorandum-of-understanding-for-data-centre-development-at-keephills-site-with-potential-to-scale-up-to-1-gw/",
    finding:
      "The February 27, 2026 release is a non-binding MOU and says development remains subject to approvals and definitive binding agreements.",
  },
  altius: {
    publisher: "Altius Minerals",
    url: "https://altiusminerals.com/_resources/esg/2020-12-22-sustainability-report-final-1608747310-1668212299.pdf?v=040103",
    finding: "Altius states that it formed Altius Renewable Royalties in 2018.",
  },
  homer: {
    publisher: "Rockefeller Brothers Fund",
    url: "https://www.rbf.org/sites/default/files/rbf-investing-2020-report-final-pages.pdf",
    finding:
      "The case study states that RRG established Homer as a Vision Ridge portfolio company in 2011.",
  },
  powerFactors: {
    publisher: "Power Factors",
    url: "https://www.powerfactors.com/about",
    finding:
      "Power Factors' company history states that Vista Equity Partners became majority owner in 2021.",
  },
  relam: {
    publisher: "Paceline Equity Partners",
    url: "https://pacelineequity.com/portfolio/relam/",
    finding:
      "Paceline records a May 2026 exit, so the existing combined exit milestone is a divestiture.",
  },
  ullico: {
    publisher: "Ullico",
    url: "https://www.ullico.com/uif-portfolio/",
    finding:
      "Ullico's portfolio materials support its ownership of Southern Star and its participation in Student Transportation.",
  },
  student: {
    publisher: "Torys",
    url: "https://www.torys.com/work/2018/02/student-transportation-acquired-by-a-group-of-investors-led-by-cdpq",
    finding:
      "Torys identifies CDPQ and Ullico as the purchaser group and dates the transaction to 2018.",
  },
  supervia: {
    publisher: "The Legal 500",
    url: "https://www.legal500.com/gc-powerlist/mexico-2022/thomas-heather/",
    finding:
      "Macquarie's Latin America M&A lead states that MIP V signed and closed the acquisition of 50% of Supervía in 2022.",
  },
  backBay: {
    publisher: "Manulife Investment Management",
    url: "https://www.manulifeim.com/institutional/global/en/strategies/private-markets/infrastructure/infrastructure-team",
    finding:
      "Manulife's current infrastructure materials identify Back Bay Solar as a Fund I portfolio company but do not disclose the original investment date.",
  },
  ecosave: {
    publisher: "Ridgewood Infrastructure",
    url: "https://ridgewoodinfrastructure.com/ecosave/",
    finding:
      "Ridgewood's current company page identifies Ecosave as a portfolio company but does not disclose the original investment date.",
  },
  envirapac: {
    publisher: "Generate Capital",
    url: "https://generatecapital.com/investment/",
    finding:
      "Generate's current investment materials identify the EnviraPAC Monticello project but do not disclose the original investment date.",
  },
  palmetto: {
    publisher: "I Squared Capital",
    url: "https://isquaredcapital.com/txnm_fund/infratech/",
    finding:
      "I Squared's current InfraTech portfolio materials identify Palmetto but do not disclose the original investment date.",
  },
  tower: {
    publisher: "Grain Management",
    url: "https://graingp.com/investments/",
    finding:
      "Grain's current investments page identifies Tower Investments I but does not disclose the original investment date.",
  },
  twin: {
    publisher: "Astatine Investment Partners",
    url: "https://astatineip.com/investment/twin-parking-holdings/",
    finding:
      "Astatine's current company page identifies Twin Parking Holdings as a portfolio investment but does not disclose the original investment date.",
  },
} satisfies Record<string, EvidenceReference>;

const descriptions = {
  homerCurrent:
    "Homer is a California water asset platform comprising water in storage, water rights, and related water storage infrastructure. Its end markets are public and private water users that require supply, storage, and water management solutions in a state facing structural water scarcity and groundwater regulation. The platform follows an asset-heavy model built around ownership or control of long-lived water assets rather than an asset-light advisory model. Public disclosures describe the business as a collection of strategic water assets in California, and the platform is managed by Renewable Resources Group, which focuses on land and water infrastructure. Vision Ridge identifies Homer as an active investment, and current public materials indicate that the asset base continues to be managed in partnership with RRG.",
  homerProposed:
    "Homer is a California water asset platform comprising water in storage, water rights, and related water storage infrastructure. Its end markets are public and private water users that require supply, storage, and water management solutions in a state facing structural water scarcity and groundwater regulation. The platform follows an asset-heavy model built around ownership or control of long-lived water assets rather than an asset-light advisory model. Public disclosures describe the business as a collection of strategic water assets in California, and the platform is managed by Renewable Resources Group, which focuses on land and water infrastructure. A Rockefeller Brothers Fund case study states that Renewable Resources Group established Homer as a Vision Ridge portfolio company in 2011, and current public materials indicate that the asset base continues to be managed in partnership with RRG.",
  transaltaCurrent:
    "TransAlta Keephills Data Centre JV is a development partnership for a large Alberta data-center project linked to dedicated power supply at the Keephills site. The venture is designed to serve high-density computing demand and depends on both digital-infrastructure development and long-term power procurement. Its model is asset-heavy because value is tied to site control, major capital deployment, and integrated electricity infrastructure rather than an asset-light colocation strategy. TransAlta announced in 2026 that it had entered into an MOU with CPP Investments and Brookfield for an initial approximately 230 MW project with potential to scale to 1 GW. Public sources reviewed do not disclose the ownership percentages of the development partners.",
  transaltaProposed:
    "TransAlta Keephills Data Centre JV is a proposed development partnership for a large Alberta data-center project linked to dedicated power supply at the Keephills site. The venture is designed to serve high-density computing demand and depends on both digital-infrastructure development and long-term power procurement. Its model is asset-heavy because value would be tied to site control, major capital deployment, and integrated electricity infrastructure rather than an asset-light colocation strategy. On February 27, 2026, TransAlta announced a non-binding MOU with CPP Investments and Brookfield for an initial approximately 230 MW project with potential to scale to 1 GW. The parties stated that all development remained subject to regulatory approvals and definitive binding agreements, so no investment closing date or committed ownership percentages are recorded.",
  superviaCurrent:
    "Supervía Poniente is an urban toll road in Mexico City linking the Santa Fe district with the Periférico corridor in the city's southwest. Its customers are passenger and commercial vehicle users that require faster road access into and out of one of Mexico City's main business districts. The operating model is asset-heavy and concession based, with toll revenue generated from a fixed transport corridor rather than from transport operations or rolling stock. The road comprises tunnels, elevated structures, and related urban highway infrastructure crossing complex topography in western Mexico City. The final section opened in 2013, and Macquarie Asset Management continues to identify Supervía as a portfolio transportation investment in Mexico; the current ownership percentages are not publicly disclosed.",
  superviaProposed:
    "Supervía Poniente is an urban toll road in Mexico City linking the Santa Fe district with the Periférico corridor in the city's southwest. Its customers are passenger and commercial vehicle users that require faster road access into and out of one of Mexico City's main business districts. The operating model is asset-heavy and concession based, with toll revenue generated from a fixed transport corridor rather than from transport operations or rolling stock. The road comprises tunnels, elevated structures, and related urban highway infrastructure crossing complex topography in western Mexico City. The final section opened in 2013. A 2022 Legal 500 profile of Macquarie Asset Management's Latin America M&A lead described Macquarie Infrastructure Partners V as having signed and closed the acquisition of 50% of Supervía Poniente from Grupo Copri, and Macquarie continues to identify Supervía as a portfolio transportation investment in Mexico.",
};

const companyCoreHashes: Record<string, string> = {
  cmnva0s6p00mvm8lz161gv8op:
    "144ea45bdc77538c79fff720d686378883395baeab2578b3e939449063383736",
  cmnva0neh00ffm8lzahvamxj4:
    "635a0fb9846f1b63b6949f1899a1e5ce2fefd4b4061d1a5191f2a7843f62ca82",
  cmnva1379015um8lztkdg1cvl:
    "4d2dc5e6f6a752529fd8f6727bc9753a29f8c930476a7b2c5b2f577423a9d41d",
  cmnva0yoj00xum8lzwg8dmzod:
    "6e2325e54aadd9829fd221dcca89566855c7cdb70e2281e6023a40da6785fb4f",
  cmnva0r2f00lkm8lzgbr17l7i:
    "7c46f703ed396a500a5523fa35effd84c40221ddbce1761f1d3c7f8273561f6e",
  cmnva11xs013lm8lzbijxthhl:
    "2915d54be3c5196bb37565f4c8c81bf0503f64292f61608c9e4cb1637ba22568",
  cmnva0ob200gwm8lzylau3hcz:
    "cb1be0d376788bfc8400e21a12cb5c4d9b9c4593cd62448990519a34d59862e7",
  cmnva13d80163m8lz0yrzfcfe:
    "0684fe558e0bfa4a3258ddb6416f0fb59a4138431c911728ab12c95956c0fcbe",
  j26_company_73d971e0f59d91410eff4415:
    "fdf492ddf04f9c7724d7a637c67863ba415a07d451f36af0545d43dbf71715fe",
  j26_company_1687d4667f7fd0fe148ec99b:
    "130b6a6ba72d6fc4407446f92bfce49165646b308e9ebea8120a3b4948352a23",
  cmnva0ydv00xbm8lzgnyuwlc4:
    "f5a9003407c39308975d343806f2f231168641a6f23631ccb003053805cb7adb",
  cmnva0yee00xcm8lzevorlgbc:
    "c9d44ad1d0d4c205985f326d83318269bb03139c0e829f17d9b35c78665568f6",
  cmnva15zk019dm8lzguft5t4r:
    "50b8bb1c7fcc8896b23b5d771abc0075c87016584d117f68981c54e216ff27f8",
  cmnva162v019jm8lz4lm3ae96:
    "3cc05161097ebec4e1ca417ebf4f896c5717fea1fa04f3c315a3bde320dfcfe7",
  cmnva0ujt00qym8lztts9ejk4:
    "699fb988f1d946a2d402b98829a0028a3a6ae3af39eae549bf7426ef1e710191",
  cmnva0qn700ksm8lz9gbfksqb:
    "7453b52297267815065329b43c57781e8f092c761581a22ef1cb73481a570dc4",
  cmnva0yth00y3m8lzxujaneei:
    "b93b93c4422a9b262790f3b981be87306ab646c02fd442cfb6761b93867ce340",
  cmnva0vbn00scm8lzk6qev06f:
    "506c7472d5077a707aa8106e802770fd39716771536933eef324a7a4a13694fb",
};

const guards: CompanyGuard[] = [
  [
    "cmnva0s6p00mvm8lz161gv8op",
    "Altius Renewable Royalties Corp.",
    null,
    "2026-07-22T17:38:06.452000",
  ],
  [
    "cmnva0neh00ffm8lzahvamxj4",
    "Back Bay Solar, LLC",
    null,
    "2026-04-25T17:04:21.845000",
  ],
  [
    "cmnva1379015um8lztkdg1cvl",
    "Broadwing Energy / Low Carbon Infrastructure",
    null,
    "2026-04-25T17:03:49.854000",
  ],
  [
    "cmnva0yoj00xum8lzwg8dmzod",
    "Caturus Energy",
    null,
    "2026-07-22T17:38:06.452000",
  ],
  ["cmnva0r2f00lkm8lzgbr17l7i", "Ecosave", 2002, "2026-04-25T17:04:59.230000"],
  [
    "cmnva11xs013lm8lzbijxthhl",
    "EnviraPAC Monticello",
    null,
    "2026-04-25T17:03:23.978000",
  ],
  ["cmnva0ob200gwm8lzylau3hcz", "Homer", null, "2026-04-25T17:05:26.858000"],
  ["cmnva13d80163m8lz0yrzfcfe", "Palmetto", null, "2026-04-25T17:03:51.823000"],
  [
    "j26_company_73d971e0f59d91410eff4415",
    "Power Factors",
    2013,
    "2026-07-22T19:04:12.657000",
  ],
  [
    "j26_company_1687d4667f7fd0fe148ec99b",
    "R.E.L.A.M.",
    null,
    "2026-07-22T19:04:12.657000",
  ],
  [
    "cmnva0ydv00xbm8lzgnyuwlc4",
    "Southern Star Central Gas Pipeline",
    1904,
    "2026-04-25T17:02:30.079000",
  ],
  [
    "cmnva0yee00xcm8lzevorlgbc",
    "Student Transportation of America and Canada",
    1997,
    "2026-04-25T17:02:30.289000",
  ],
  [
    "cmnva15zk019dm8lzguft5t4r",
    "Sunstone Power",
    null,
    "2026-04-25T17:02:37.853000",
  ],
  [
    "cmnva162v019jm8lz4lm3ae96",
    "Supervía Poniente",
    2013,
    "2026-04-25T17:27:06.659000",
  ],
  [
    "cmnva0ujt00qym8lztts9ejk4",
    "Thunderbird Renewables",
    null,
    "2026-04-25T17:01:24.742000",
  ],
  [
    "cmnva0qn700ksm8lz9gbfksqb",
    "Tower Investments I",
    null,
    "2026-04-25T17:03:37.702000",
  ],
  [
    "cmnva0yth00y3m8lzxujaneei",
    "TransAlta Keephills Data Centre JV",
    2026,
    "2026-04-25T17:02:42.257000",
  ],
  [
    "cmnva0vbn00scm8lzk6qev06f",
    "Twin Parking Holdings",
    null,
    "2026-04-25T17:01:36.054000",
  ],
].map(([id, name, yearFounded, updatedAt]) => ({
  id: id as string,
  name: name as string,
  yearFounded: yearFounded as number | null,
  companyStatus: "ACTIVE",
  recordStatus: "PUBLISHED",
  updatedAt: updatedAt as string,
  coreSha256: companyCoreHashes[id as string],
}));

const owner = (
  id: string,
  companyId: string,
  investmentYear: number | null,
  proposedYear: number | null,
  vehicleName: string | null,
  stake: string | null,
  evidence: EvidenceReference,
  proposedVehicle = vehicleName,
  proposedStake = stake,
): OwnershipUpdateAction => ({
  actionType: "OWNERSHIP_UPDATE",
  id,
  companyId,
  evidence: [evidence],
  current: { investmentYear, vehicleName, stake },
  proposed: {
    investmentYear: proposedYear,
    vehicleName: proposedVehicle,
    stake: proposedStake,
  },
});

const milestone = (
  id: string,
  companyId: string,
  date: string,
  event: string,
  category: string,
  sortDate: string | null,
): MilestoneRow => ({ id, companyId, date, event, category, sortDate });

const citation = (
  id: string,
  sourceId: string,
  companyId: string,
  purpose: string,
  evidenceLabel: string | null,
  dealId: string | null = null,
): CitationRow => ({ id, sourceId, dealId, companyId, purpose, evidenceLabel });

const citationUpdate = (
  id: string,
  sourceId: string,
  companyId: string,
  currentPurpose: string,
  currentLabel: string | null,
  proposedPurpose: string,
  proposedLabel: string | null,
  evidence: EvidenceReference,
): CitationUpdateAction => ({
  actionType: "CITATION_UPDATE",
  id,
  companyId,
  evidence: [evidence],
  current: citation(id, sourceId, companyId, currentPurpose, currentLabel),
  proposed: citation(id, sourceId, companyId, proposedPurpose, proposedLabel),
});

const actions: ResidualAction[] = [
  {
    actionType: "COMPANY_UPDATE",
    id: "cmnva0ob200gwm8lzylau3hcz",
    companyId: "cmnva0ob200gwm8lzylau3hcz",
    evidence: [E.homer],
    current: { yearFounded: null, description: descriptions.homerCurrent },
    proposed: { yearFounded: 2011, description: descriptions.homerProposed },
  },
  {
    actionType: "COMPANY_UPDATE",
    id: "cmnva0yth00y3m8lzxujaneei",
    companyId: "cmnva0yth00y3m8lzxujaneei",
    evidence: [E.transalta],
    current: { yearFounded: 2026, description: descriptions.transaltaCurrent },
    proposed: {
      yearFounded: null,
      description: descriptions.transaltaProposed,
    },
  },
  {
    actionType: "COMPANY_UPDATE",
    id: "cmnva162v019jm8lz4lm3ae96",
    companyId: "cmnva162v019jm8lz4lm3ae96",
    evidence: [E.supervia],
    current: { yearFounded: 2013, description: descriptions.superviaCurrent },
    proposed: { yearFounded: 2013, description: descriptions.superviaProposed },
  },
  owner(
    "cmoel9jip009v01lzvvs8tdfg",
    "cmnva1379015um8lztkdg1cvl",
    2025,
    null,
    "I Squared Capital",
    null,
    E.broadwing,
  ),
  owner(
    "cmoel9yev00840slzy1bcmd07",
    "cmnva0yoj00xum8lzwg8dmzod",
    2025,
    null,
    "Kimmeridge Flagship Funds",
    null,
    E.caturus,
  ),
  owner(
    "cmoel6fk80049w2lzr9aujnyi",
    "cmnva0ujt00qym8lztts9ejk4",
    2024,
    null,
    "ArcLight Infrastructure Partners Fund VIII",
    null,
    E.arclight,
  ),
  owner(
    "cmoel83dz00b2y1lzdx1wxhkq",
    "cmnva0yth00y3m8lzxujaneei",
    2026,
    null,
    "Real Assets (Infrastructure)",
    null,
    E.transalta,
  ),
  owner(
    "own_IYhDlVgAKBHXL_yItR2c",
    "cmnva0s6p00mvm8lz161gv8op",
    null,
    2018,
    "Retained ownership",
    "57%",
    E.altius,
  ),
  owner(
    "cmoelbmd800cm3alzmutnsowp",
    "cmnva0ob200gwm8lzylau3hcz",
    null,
    2011,
    "Sustainable Asset Fund I & II",
    null,
    E.homer,
  ),
  owner(
    "j26_owner_df3545c784510cc84bb2f28e",
    "j26_company_73d971e0f59d91410eff4415",
    null,
    2021,
    "Vista-managed investment",
    "Existing investor (percentage undisclosed)",
    E.powerFactors,
  ),
  owner(
    "cmoelbk4j00an3alznk8h3v36",
    "cmnva0ydv00xbm8lzgnyuwlc4",
    null,
    2019,
    "UIF",
    null,
    E.ullico,
  ),
  owner(
    "cmoelbkgl00ax3alzv8w7zi2o",
    "cmnva0yee00xcm8lzevorlgbc",
    null,
    2018,
    "UIF",
    null,
    E.student,
  ),
  owner(
    "cmoem3hba0038iilzxqskdojm",
    "cmnva162v019jm8lz4lm3ae96",
    null,
    2022,
    "MIP V / MMIF",
    null,
    E.supervia,
    "Macquarie Infrastructure Partners V",
    "50%",
  ),
  {
    actionType: "MILESTONE_UPDATE",
    id: "j26_milestone_ffeef0fd3f2907e0d72be82c",
    companyId: "j26_company_1687d4667f7fd0fe148ec99b",
    evidence: [E.relam],
    current: milestone(
      "j26_milestone_ffeef0fd3f2907e0d72be82c",
      "j26_company_1687d4667f7fd0fe148ec99b",
      "May 2026",
      "Paceline Equity Partners records its R.E.L.A.M. exit in May 2026, and Basalt Infrastructure Partners lists RELAM among its current investments.",
      "ACQUISITION",
      "2026-05-01T00:00:00.000000",
    ),
    proposed: milestone(
      "j26_milestone_ffeef0fd3f2907e0d72be82c",
      "j26_company_1687d4667f7fd0fe148ec99b",
      "May 2026",
      "Paceline Equity Partners records its R.E.L.A.M. exit in May 2026, and Basalt Infrastructure Partners lists RELAM among its current investments.",
      "DIVESTITURE",
      "2026-05-01T00:00:00.000000",
    ),
  },
  {
    actionType: "MILESTONE_UPDATE",
    id: "cmp1h7gtk00iqw41ffsc3rvol",
    companyId: "cmnva0vbn00scm8lzk6qev06f",
    evidence: [E.twin],
    current: milestone(
      "cmp1h7gtk00iqw41ffsc3rvol",
      "cmnva0vbn00scm8lzk6qev06f",
      "2026",
      "Astatine Investment Partners identifies Twin Parking Holdings as an active transportation portfolio company.",
      "FINANCING",
      "2026-01-01T00:00:00.000000",
    ),
    proposed: milestone(
      "cmp1h7gtk00iqw41ffsc3rvol",
      "cmnva0vbn00scm8lzk6qev06f",
      "2026",
      "Astatine Investment Partners identifies Twin Parking Holdings as an active transportation portfolio company.",
      "OTHER",
      "2026-01-01T00:00:00.000000",
    ),
  },
  {
    actionType: "MILESTONE_DELETE",
    id: "cmp1h7xq901ayw41fiausqy6e",
    companyId: "cmnva0yth00y3m8lzxujaneei",
    evidence: [E.transalta],
    current: milestone(
      "cmp1h7xq901ayw41fiausqy6e",
      "cmnva0yth00y3m8lzxujaneei",
      "2026",
      "TransAlta Keephills Data Centre JV was founded.",
      "FOUNDING",
      "2026-01-01T00:00:00.000000",
    ),
  },
  ...[
    [
      "res_mil_caturus_mubadala_close_20250807",
      "cmnva0yoj00xum8lzwg8dmzod",
      "Aug 7, 2025",
      "Mubadala Energy closed a strategic investment for a 24.1% equity stake and SoTex HoldCo was rebranded as Caturus.",
      "FINANCING",
      "2025-08-07T04:00:00.000000",
      E.caturus,
    ],
    [
      "res_mil_altius_formation_2018",
      "cmnva0s6p00mvm8lz161gv8op",
      "2018",
      "Altius Minerals formed Altius Renewable Royalties as a new subsidiary.",
      "FINANCING",
      "2018-01-01T00:00:00.000000",
      E.altius,
    ],
    [
      "res_mil_homer_formation_2011",
      "cmnva0ob200gwm8lzylau3hcz",
      "2011",
      "Renewable Resources Group established Homer as a Vision Ridge portfolio company to improve the resilience of California's water system.",
      "FINANCING",
      "2011-01-01T00:00:00.000000",
      E.homer,
    ],
    [
      "res_mil_power_factors_vista_2021",
      "j26_company_73d971e0f59d91410eff4415",
      "2021",
      "Vista Equity Partners became the majority owner of Power Factors.",
      "ACQUISITION",
      "2021-01-01T00:00:00.000000",
      E.powerFactors,
    ],
    [
      "res_mil_southern_star_ullico_2019",
      "cmnva0ydv00xbm8lzgnyuwlc4",
      "Feb 2019",
      "Southern Star announced a capital raise with Ullico Infrastructure Fund as a minority partner.",
      "FINANCING",
      "2019-02-01T05:00:00.000000",
      E.ullico,
    ],
    [
      "res_mil_supervia_macquarie_2022",
      "cmnva162v019jm8lz4lm3ae96",
      "2022",
      "Macquarie Infrastructure Partners V signed and closed the acquisition of 50% of Supervía Poniente from Grupo Copri.",
      "ACQUISITION",
      "2022-01-01T00:00:00.000000",
      E.supervia,
    ],
  ].map(([id, companyId, date, event, category, sortDate, evidence]) => ({
    actionType: "MILESTONE_INSERT" as const,
    id: id as string,
    companyId: companyId as string,
    evidence: [evidence as EvidenceReference],
    proposed: milestone(
      id as string,
      companyId as string,
      date as string,
      event as string,
      category as string,
      sortDate as string,
    ),
  })),
  citationUpdate(
    "cmoxwnt4x0b3st01fk6z7dt4n",
    "cmoqcg7ru092x171fyjec8fnw",
    "cmnva1379015um8lztkdg1cvl",
    "OWNERSHIP_INVESTMENT",
    "I Squared Capital transaction announcement",
    "OWNERSHIP_INVESTMENT",
    "I Squared portfolio-company evidence; original investment date not disclosed",
    E.broadwing,
  ),
  citationUpdate(
    "cmnvaehw40c2pm8lz6fzwxurz",
    "cmnvaehuj0c2om8lzaoowi0ey",
    "cmnva0yoj00xum8lzwg8dmzod",
    "SUPPORTING_CONTEXT",
    null,
    "OWNERSHIP_INVESTMENT",
    "Mubadala 24.1% investment closing and Caturus rebrand",
    E.caturus,
  ),
  citationUpdate(
    "cmnvaehz40c2rm8lzxlqqc8z8",
    "cmnvaehxi0c2qm8lznasl7f8x",
    "cmnva0yoj00xum8lzwg8dmzod",
    "SUPPORTING_CONTEXT",
    null,
    "OWNERSHIP_INVESTMENT",
    "Mubadala 24.1% investment closing",
    E.caturus,
  ),
  citationUpdate(
    "cmnva9ep808s4m8lzycn8wj76",
    "cmnva99bd08ojm8lz8l66biwv",
    "cmnva0ujt00qym8lztts9ejk4",
    "OPERATIONS_ASSETS",
    null,
    "OWNERSHIP_INVESTMENT",
    "Current ArcLight Fund VIII portfolio evidence; original investment date not disclosed",
    E.arclight,
  ),
  citationUpdate(
    "cmoxwmvnu09ett01famfaa55k",
    "cmnvabjdy0a5sm8lz3d8pv761",
    "cmnva0yth00y3m8lzxujaneei",
    "OWNERSHIP_INVESTMENT",
    "CPP Investments transaction announcement",
    "MILESTONE_EVENT",
    "Non-binding MOU; development remains subject to approvals and definitive agreements",
    E.transalta,
  ),
  citationUpdate(
    "cmnva531o0624m8lzcow3r63n",
    "cmnva4zyl0602m8lzk8zi2lbr",
    "cmnva0ydv00xbm8lzgnyuwlc4",
    "SUPPORTING_CONTEXT",
    null,
    "OWNERSHIP_INVESTMENT",
    "Ullico Infrastructure Fund ownership evidence",
    E.ullico,
  ),
  citationUpdate(
    "cmoxwo82e0buyt01fnf14hjku",
    "cmnvaf13h0cewm8lzwv4ecvvu",
    "cmnva162v019jm8lz4lm3ae96",
    "OPERATIONS_ASSETS",
    "Macquarie operations / asset details",
    "OWNERSHIP_INVESTMENT",
    "Macquarie current portfolio evidence",
    E.supervia,
  ),
  citationUpdate(
    "cmoxwo8t60bwbt01friox8cn3",
    "cmnva5op006glm8lzvry9ospn",
    "cmnva0neh00ffm8lzahvamxj4",
    "SUPPORTING_CONTEXT",
    "Portfolio evidence source — Manulife — Back Bay Solar, LLC",
    "OWNERSHIP_INVESTMENT",
    "Current Manulife Fund I portfolio evidence; original investment date not disclosed",
    E.backBay,
  ),
  citationUpdate(
    "cmoxwopcp0cq7t01fb6hr83te",
    "cmnva7oz907osm8lz987ptj4j",
    "cmnva0r2f00lkm8lzgbr17l7i",
    "SUPPORTING_CONTEXT",
    "Ridgewoodinfrastructure — Ecosave",
    "OWNERSHIP_INVESTMENT",
    "Current Ridgewood portfolio evidence; original investment date not disclosed",
    E.ecosave,
  ),
  citationUpdate(
    "cmoxwnh470ai5t01f0tc694ql",
    "cmnvad88l0b8am8lz0rit94st",
    "cmnva11xs013lm8lzbijxthhl",
    "SUPPORTING_CONTEXT",
    "Portfolio evidence source — Generate Capital — EnviraPAC Monticello",
    "OWNERSHIP_INVESTMENT",
    "Current Generate-backed project evidence; original investment date not disclosed",
    E.envirapac,
  ),
  citationUpdate(
    "cmoxwnu510b5mt01f7usucw1g",
    "cmnvadx7j0bohm8lzvfee62sb",
    "cmnva13d80163m8lz0yrzfcfe",
    "SUPPORTING_CONTEXT",
    "Portfolio evidence — I Squared Capital — Palmetto",
    "OWNERSHIP_INVESTMENT",
    "Current I Squared InfraTech portfolio evidence; original investment date not disclosed",
    E.palmetto,
  ),
  citationUpdate(
    "cmoxwnnsy0auat01fvrxlkmw6",
    "cmnva7c8d07h2m8lzpzc1h7v7",
    "cmnva0qn700ksm8lz9gbfksqb",
    "COMPANY_PROFILE",
    "Graingp company profile",
    "OWNERSHIP_INVESTMENT",
    "Current Grain portfolio evidence; original investment date not disclosed",
    E.tower,
  ),
  citationUpdate(
    "cmoxwlxnz07qst01f5hsiqj5t",
    "cmnva9tiq0920m8lzdpknvey1",
    "cmnva0vbn00scm8lzk6qev06f",
    "SUPPORTING_CONTEXT",
    "Astatineip — Twin Parking Holdings",
    "OWNERSHIP_INVESTMENT",
    "Current Astatine portfolio evidence; original investment date not disclosed",
    E.twin,
  ),
  ...[
    [
      "res_src_altius_2018",
      "Altius Minerals — 2018 formation of Altius Renewable Royalties",
      E.altius.url,
      "PRESENTATION",
      E.altius,
    ],
    [
      "res_src_homer_2011",
      "Rockefeller Brothers Fund — Homer case study",
      E.homer.url,
      "PRESENTATION",
      E.homer,
    ],
    [
      "res_src_supervia_2022",
      "The Legal 500 — Macquarie Supervía acquisition",
      E.supervia.url,
      "ARTICLE",
      E.supervia,
    ],
  ].map(([id, label, url, type, evidence]) => ({
    actionType: "SOURCE_INSERT" as const,
    id: id as string,
    evidence: [evidence as EvidenceReference],
    proposed: {
      id: id as string,
      label: label as string,
      url: url as string,
      type: type as string,
    },
  })),
  ...[
    [
      "res_cit_altius_2018",
      "res_src_altius_2018",
      "cmnva0s6p00mvm8lz161gv8op",
      "Altius formation and owner-entry evidence",
      E.altius,
    ],
    [
      "res_cit_homer_2011",
      "res_src_homer_2011",
      "cmnva0ob200gwm8lzylau3hcz",
      "Vision Ridge portfolio-company formation in 2011",
      E.homer,
    ],
    [
      "res_cit_power_factors_vista_2021",
      "j26_source_78a7d470e780ded2de7a407c",
      "j26_company_73d971e0f59d91410eff4415",
      "Vista became majority owner in 2021",
      E.powerFactors,
    ],
    [
      "res_cit_supervia_2022",
      "res_src_supervia_2022",
      "cmnva162v019jm8lz4lm3ae96",
      "MIP V signed and closed a 50% acquisition in 2022",
      E.supervia,
    ],
  ].map(([id, sourceId, companyId, evidenceLabel, evidence]) => ({
    actionType: "CITATION_INSERT" as const,
    id: id as string,
    companyId: companyId as string,
    evidence: [evidence as EvidenceReference],
    proposed: citation(
      id as string,
      sourceId as string,
      companyId as string,
      "OWNERSHIP_INVESTMENT",
      evidenceLabel as string,
    ),
  })),
];

export const REVIEWED_RESIDUAL_MANIFEST: ResidualManifest = {
  companyGuards: guards,
  actions,
  existingSourceGuards: [
    {
      id: "j26_source_78a7d470e780ded2de7a407c",
      label: "Power Factors — company profile",
      url: "https://www.powerfactors.com/about",
      type: "WEBSITE",
    },
  ],
  protectedSets: [
    {
      companyId: "cmnva0s6p00mvm8lz161gv8op",
      companyName: "Altius Renewable Royalties Corp.",
      ownership: {
        count: 2,
        sha256:
          "e1f210903d138ef8ec9dd5b3723b55201feab6a7af92d3337233ea99bf8dcda9",
      },
      milestones: {
        count: 6,
        sha256:
          "fc0be46da547f634fbc0b8a211de653ffcd7f2331f6011d698dfd39a87922cbf",
      },
      citations: {
        count: 9,
        sha256:
          "f9939057ec4c32c83864111887d250d9b500d79ca58184dc5b508057de820776",
      },
    },
    {
      companyId: "cmnva0neh00ffm8lzahvamxj4",
      companyName: "Back Bay Solar, LLC",
      ownership: {
        count: 1,
        sha256:
          "83adfeebc8216f660752d7e7e9dba359d850fa4faa78d5df23e36aaea91385d4",
      },
      milestones: {
        count: 2,
        sha256:
          "c9a283e58b703a77d50c7e8f72986f4289759899226da1c5281864cbc46af5f4",
      },
      citations: {
        count: 6,
        sha256:
          "368e2e5329fb895085008b63386e8e34e087062497cd2ac63a9655819602b66d",
      },
    },
    {
      companyId: "cmnva1379015um8lztkdg1cvl",
      companyName: "Broadwing Energy / Low Carbon Infrastructure",
      ownership: {
        count: 1,
        sha256:
          "b677568ad637d4aa802b0e9f070b1ddb24b324f43985461bd8b9a9348440533d",
      },
      milestones: {
        count: 3,
        sha256:
          "82aaf7620932d4a37e983b80748abe3614c73095a10d01522820543eb8f5eb34",
      },
      citations: {
        count: 9,
        sha256:
          "99f85990474b23f3e27d36349577b2d6902f4e98626f96941a0a76be6d9665b0",
      },
    },
    {
      companyId: "cmnva0yoj00xum8lzwg8dmzod",
      companyName: "Caturus Energy",
      ownership: {
        count: 3,
        sha256:
          "49658f1ca19952443bb59277af25dfba341c117decf24a8143339599f8cb1690",
      },
      milestones: {
        count: 3,
        sha256:
          "924d15ca3ede25b68207e3b708a625201fd8e3c7f4e2dc7fd6d370bdfeba7c4f",
      },
      citations: {
        count: 10,
        sha256:
          "d2735cb0a1c666761c5503c0f04a83651dfc5d5774d0c0a86e1e055eea459ed6",
      },
    },
    {
      companyId: "cmnva0r2f00lkm8lzgbr17l7i",
      companyName: "Ecosave",
      ownership: {
        count: 1,
        sha256:
          "1f5de9cf0e768a07c5d6a62aa46b94ede77524da457a854ada3aa076fbc3bff1",
      },
      milestones: {
        count: 1,
        sha256:
          "974cae8f4e6d44b5c4918790191ff7e18fd36fa7b50ecbae7dabe721f19fda1b",
      },
      citations: {
        count: 6,
        sha256:
          "c80d19efaad927ff9ca6ff3b1c86416a9a59a77e1408bf16ecaafa169a0592aa",
      },
    },
    {
      companyId: "cmnva11xs013lm8lzbijxthhl",
      companyName: "EnviraPAC Monticello",
      ownership: {
        count: 1,
        sha256:
          "9a88c8d81ed3585ac5db471ea5bb80aa381670218e065d83139c160f428ea740",
      },
      milestones: {
        count: 0,
        sha256:
          "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      },
      citations: {
        count: 8,
        sha256:
          "cdc68871a969fe6c47172c29db1c8a3cdf58828669a3b8ed8cb44034b3f399b5",
      },
    },
    {
      companyId: "cmnva0ob200gwm8lzylau3hcz",
      companyName: "Homer",
      ownership: {
        count: 1,
        sha256:
          "11bd19f82c677751d94396851bf2eec4819d8d2080066bcc1c842b23926ce57a",
      },
      milestones: {
        count: 0,
        sha256:
          "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      },
      citations: {
        count: 8,
        sha256:
          "9f4785faa8899851406a16ce8daf3ecbe9a32e1094d2841fd6d55ab1d78c44cb",
      },
    },
    {
      companyId: "cmnva13d80163m8lz0yrzfcfe",
      companyName: "Palmetto",
      ownership: {
        count: 1,
        sha256:
          "6c0bb964f38b64bf38eeb99f844fe471462073f3be51b06613594aced76f7216",
      },
      milestones: {
        count: 3,
        sha256:
          "9e50d5eac727307b896853a33a7b321032513eb4d6a75cd7b4ff8a324a343ee7",
      },
      citations: {
        count: 6,
        sha256:
          "754e925a61cb76fd9dd5af64d84be7292040760b20b1b391c5aa4d0a3e12f881",
      },
    },
    {
      companyId: "j26_company_73d971e0f59d91410eff4415",
      companyName: "Power Factors",
      ownership: {
        count: 2,
        sha256:
          "30fc8f97f07c8fcdd082386dff608ae0d28b151bf38c7c29f2477115387d0856",
      },
      milestones: {
        count: 3,
        sha256:
          "23d01b9a8d037e88140068375448a62b3ec0ae220e1652667fea4120a851ed85",
      },
      citations: {
        count: 2,
        sha256:
          "ce526771651f893687307d926cd4ee9e7046f621bf5f90d366faad0e46a2407f",
      },
    },
    {
      companyId: "j26_company_1687d4667f7fd0fe148ec99b",
      companyName: "R.E.L.A.M.",
      ownership: {
        count: 2,
        sha256:
          "b4444a03c0cd8bbcbffe7e1e5cfe224a217369b983822a860d06efee5ff7c9bd",
      },
      milestones: {
        count: 3,
        sha256:
          "dad9bdcb96a64af0bf585263129dfa8a0da5ef500f0d2d59fc41e8c0fd7aa43d",
      },
      citations: {
        count: 3,
        sha256:
          "ba604ba1f554ad9e2a4e44811a0aceafda0a4eb66fd049a9b3ece037e9df465f",
      },
    },
    {
      companyId: "cmnva0ydv00xbm8lzgnyuwlc4",
      companyName: "Southern Star Central Gas Pipeline",
      ownership: {
        count: 2,
        sha256:
          "f61482ad5551f7ee9722d766d0e2c8208fe5793f1c1f12ef7c66c5c9cacb1238",
      },
      milestones: {
        count: 4,
        sha256:
          "b27397bccb059a67fadb53ea0f7f6657f308d7c339eb43b5e6322e6736242e88",
      },
      citations: {
        count: 11,
        sha256:
          "b9327e91851a588e05d8376e3c986ad8432d7b7f70fd2760662c784ae88f833e",
      },
    },
    {
      companyId: "cmnva0yee00xcm8lzevorlgbc",
      companyName: "Student Transportation of America and Canada",
      ownership: {
        count: 2,
        sha256:
          "04e23fef147e76cea02e3f1e9570e4024a4fc77d68df704615ed7d54374485b5",
      },
      milestones: {
        count: 4,
        sha256:
          "8337f130ad1e731df90acb8a2e9b737032a5ffa8e41c9cae18313d1e11dbc63a",
      },
      citations: {
        count: 12,
        sha256:
          "77d309740b251056d93ac01099f876f41b97a5626230e665c1adf9eb17ce71f3",
      },
    },
    {
      companyId: "cmnva15zk019dm8lzguft5t4r",
      companyName: "Sunstone Power",
      ownership: {
        count: 1,
        sha256:
          "48a8ae3868982bd8550296839fc3c72c45a79655d25d00a6f3e61e5223ad59c2",
      },
      milestones: {
        count: 2,
        sha256:
          "1d610eb03e5591b2b859ce79074a952343690f568a578691950040144da37e2f",
      },
      citations: {
        count: 8,
        sha256:
          "203dd4d9381e7e00da57f8da54c19e4b546ad379373c676a5fbf708e92ddf79c",
      },
    },
    {
      companyId: "cmnva162v019jm8lz4lm3ae96",
      companyName: "Supervía Poniente",
      ownership: {
        count: 1,
        sha256:
          "fec547bc12f49833f37802e7421189c7849bc15ad552ddd5921b5cf1708404fd",
      },
      milestones: {
        count: 2,
        sha256:
          "90e7e6e9f36fa211fb78a886c5de1dde50667a74e72354f945790a79096e258b",
      },
      citations: {
        count: 8,
        sha256:
          "4bd2323d6988fbe8a5f4fb6e49e91ff91e89ed76b7083696216108cdc52ea463",
      },
    },
    {
      companyId: "cmnva0ujt00qym8lztts9ejk4",
      companyName: "Thunderbird Renewables",
      ownership: {
        count: 1,
        sha256:
          "7ab6248c6b5a0c6eaad499a716eb833900bd89e7c5e56d19e4071bf5d00dc4f9",
      },
      milestones: {
        count: 2,
        sha256:
          "a0a1848086f3b6f647bbafd3196dbef25d6c9a8ee6ebee3ad65f1423ff9225da",
      },
      citations: {
        count: 6,
        sha256:
          "213205c6255d54e1f3f38cccbd516d342b0b050fdda62b7ad976180e0ddb1587",
      },
    },
    {
      companyId: "cmnva0qn700ksm8lz9gbfksqb",
      companyName: "Tower Investments I",
      ownership: {
        count: 1,
        sha256:
          "1ed257f5e398df47ff54691644f6d63b3dc1e1f65549d8871deed46a2711b5fc",
      },
      milestones: {
        count: 1,
        sha256:
          "5521aaac344a0ee453e48102268bccaa5765ce0e0366e35b666ed4d69346f57f",
      },
      citations: {
        count: 6,
        sha256:
          "f201640ed557679d20458f29d4a163c0a52f1be311489bc052966cc5f76c5a61",
      },
    },
    {
      companyId: "cmnva0yth00y3m8lzxujaneei",
      companyName: "TransAlta Keephills Data Centre JV",
      ownership: {
        count: 1,
        sha256:
          "09dc909e290c989afb11c7481b63a9961a220076b0b171e4e72d813bb278b40b",
      },
      milestones: {
        count: 5,
        sha256:
          "b340fc4e2fa12931e0b4300bd0f10fc974a08d4608ee928a9d1cdd345e2f1ef0",
      },
      citations: {
        count: 6,
        sha256:
          "5eeaac38c4a5e0d0681be4c7ab6478a2337f93e2dfdddc0b939872c4a55fb283",
      },
    },
    {
      companyId: "cmnva0vbn00scm8lzk6qev06f",
      companyName: "Twin Parking Holdings",
      ownership: {
        count: 1,
        sha256:
          "92be59010382360ecc9894c754616d427ff307082bf3bef75b8cc9b91925ab49",
      },
      milestones: {
        count: 1,
        sha256:
          "21f73e4dcf738b2aafb0f5e87687778cb9437db1d8b4897f38c3433699748f40",
      },
      citations: {
        count: 6,
        sha256:
          "aa007a8b83f5e95e07972a9ab8ad0a7145f326a8147b9fc6e2f9e7369218b80d",
      },
    },
  ],
  tableCounts: {
    companies: 1191,
    ownershipPeriods: 1410,
    milestones: 4231,
    citations: 10236,
    sources: 4857,
  },
  citationIndex: {
    exists: true,
    isUnique: true,
    isValid: true,
    isReady: true,
    nullsNotDistinct: true,
    hasIsPrimary: false,
    companyHasLastVerifiedAt: false,
    definition:
      'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" USING btree ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT WHERE ("companyId" IS NOT NULL)',
  },
  quarantinedFields: [
    {
      company: "Phoenix Renewables",
      field: "investmentYear and milestones",
      proposedValue: null,
      reason:
        "ArcLight's dated SkyVest release does not name Phoenix and current portfolio evidence supplies no entry date.",
    },
    {
      company: "Golden State / OnTrac / Tract",
      field: "Company identity and ownership",
      proposedValue: null,
      reason:
        "Complex identity replacements are excluded from this non-identity remediation.",
    },
    {
      company: "Flamingo",
      field: "Ownership",
      proposedValue: null,
      reason:
        "The residual ownership inference is not supported strongly enough for an exact correction.",
    },
    {
      company: "Chester County / Rocky Mountain / Trenton",
      field: "All proposed changes",
      proposedValue: null,
      reason:
        "Quarantined records remain outside this evidence-gated action set.",
    },
    {
      company: "Sunstone Power",
      field: "live yearFounded and OwnershipPeriod.investmentYear",
      proposedValue: null,
      reason:
        "No primary source establishes a founding or sponsor-entry year; only seed pseudo-precision is removed.",
    },
    {
      company: "Caturus Energy",
      field: "Kimmeridge original investment year",
      proposedValue: null,
      reason:
        "The August 2025 close establishes Mubadala's investment and continued Kimmeridge participation, not Kimmeridge's original entry date.",
    },
  ],
};

export function targetKey(action: ResidualAction): string {
  return `${action.actionType}:${action.id}`;
}

export function expectedTargetRows(): Record<string, unknown> {
  return Object.fromEntries(
    REVIEWED_RESIDUAL_MANIFEST.actions
      .filter((action) => "current" in action)
      .map((action) => [targetKey(action), action.current]),
  );
}

export function residualActions(): ResidualAction[] {
  return [...REVIEWED_RESIDUAL_MANIFEST.actions].sort(
    (a, b) =>
      a.actionType.localeCompare(b.actionType) || a.id.localeCompare(b.id),
  );
}

const EXECUTION_ORDER: Record<ResidualAction["actionType"], number> = {
  COMPANY_UPDATE: 10,
  OWNERSHIP_UPDATE: 20,
  MILESTONE_UPDATE: 30,
  MILESTONE_DELETE: 31,
  MILESTONE_INSERT: 32,
  CITATION_UPDATE: 40,
  SOURCE_INSERT: 50,
  CITATION_INSERT: 60,
};

export function residualExecutionActions(): ResidualAction[] {
  return [...REVIEWED_RESIDUAL_MANIFEST.actions].sort(
    (a, b) =>
      EXECUTION_ORDER[a.actionType] - EXECUTION_ORDER[b.actionType] ||
      a.id.localeCompare(b.id),
  );
}

export function residualExecutionSha256(): string {
  return sha256(residualExecutionActions());
}

export function residualActionSetSha256(): string {
  return sha256(residualActions());
}

export function residualManifestSha256(): string {
  return sha256(REVIEWED_RESIDUAL_MANIFEST);
}

function exact(label: string, actual: unknown, expected: unknown): void {
  if (sha256(actual) !== sha256(expected)) throw new Error(`${label} drifted`);
}

export function assertReviewedResidualManifest(): void {
  for (const [label, value] of [
    ["action-set", REVIEWED_RESIDUAL_ACTION_SET_SHA256],
    ["manifest", REVIEWED_RESIDUAL_MANIFEST_SHA256],
    ["seed replay", REVIEWED_RESIDUAL_SEED_SHA256],
  ] as const) {
    if (!/^[0-9a-f]{64}$/.test(value)) {
      throw new Error(`Reviewed ${label} hash is not pinned`);
    }
  }
  if (actions.length !== REVIEWED_RESIDUAL_ACTION_COUNT) {
    throw new Error(
      `Residual action count ${actions.length} does not equal ${REVIEWED_RESIDUAL_ACTION_COUNT}`,
    );
  }
  if (
    actions.some(
      (action) =>
        action.evidence.length === 0 ||
        action.evidence.some((e) => !e.url.startsWith("https://")),
    )
  ) {
    throw new Error("Every residual action must carry HTTPS evidence");
  }
  const serialized = JSON.stringify(actions);
  for (const excluded of [
    "Phoenix Renewables",
    "Golden State",
    "OnTrac",
    "Tract",
    "Flamingo",
    "Chester County",
    "Rocky Mountain",
    "Trenton Biogas",
  ]) {
    if (serialized.includes(excluded))
      throw new Error(`${excluded} leaked into residual actions`);
  }
  exact(
    "Action-set hash",
    residualActionSetSha256(),
    REVIEWED_RESIDUAL_ACTION_SET_SHA256,
  );
  exact(
    "Manifest hash",
    residualManifestSha256(),
    REVIEWED_RESIDUAL_MANIFEST_SHA256,
  );
}

export function buildResidualPlan(snapshot: ResidualSnapshot): ResidualPlan {
  assertReviewedResidualManifest();
  const manifest = REVIEWED_RESIDUAL_MANIFEST;
  exact("Company guards", snapshot.companyGuards, manifest.companyGuards);
  exact("Target rows", snapshot.targetRows, expectedTargetRows());
  exact(
    "Existing source guards",
    snapshot.existingSourceGuards,
    manifest.existingSourceGuards,
  );
  exact(
    "Protected company sets",
    snapshot.protectedSets,
    manifest.protectedSets,
  );
  exact("Table counts", snapshot.tableCounts, manifest.tableCounts);
  exact(
    "Citation identity index",
    snapshot.citationIndex,
    manifest.citationIndex,
  );
  if (snapshot.insertConflicts.length)
    throw new Error(`Insert conflicts: ${snapshot.insertConflicts.join(", ")}`);
  exact(
    "Seed replay digest",
    snapshot.seedSha256,
    REVIEWED_RESIDUAL_SEED_SHA256,
  );
  const sorted = residualExecutionActions();
  return {
    actions: sorted,
    actionCount: sorted.length,
    actionSetSha256: residualActionSetSha256(),
    executionSha256: residualExecutionSha256(),
    snapshotSha256: sha256(snapshot),
    counts: sorted.reduce<Record<string, number>>((out, action) => {
      out[action.actionType] = (out[action.actionType] ?? 0) + 1;
      return out;
    }, {}),
    quarantinedFields: manifest.quarantinedFields,
  };
}

export function residualSeedProjection(companies: readonly any[]): unknown {
  const names = new Set(
    REVIEWED_RESIDUAL_MANIFEST.companyGuards.map((row) => row.name),
  );
  return companies
    .filter((company) => names.has(company.name))
    .map((company) => ({
      name: company.name,
      yearFounded: company.yearFounded ?? null,
      investmentYear: company.investmentYear ?? null,
      description: company.description,
      owners: company.owners ?? [],
      milestones: company.milestones ?? [],
      sources: company.sources ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function residualSeedSha256(companies: readonly any[]): string {
  return sha256(residualSeedProjection(companies));
}
