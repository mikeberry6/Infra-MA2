import { sha256 } from "./lib";

export const PORTFOLIO_LIFECYCLE_CORRECTION_SCHEMA_VERSION = 1 as const;
export const REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT = 17 as const;
export const REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_SET_SHA256 =
  "32e8a7cf125a7bbe81b1d80f14abfa377c31a12ef0e3022b9cb6bf8c2adb74ab";
export const REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST_SHA256 =
  "26147e8d4ca9b42995d15ac17d992f22f20cc68d14377e38fc3cf88d5de57dcd";

export type DealStatus =
  | "ANNOUNCED"
  | "CLOSED"
  | "PENDING_REGULATORY_APPROVAL"
  | "TERMINATED";

export interface EvidenceReference {
  sourceId: string | null;
  sourceLabel: string;
  sourceType: string;
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
}

export interface DealLifecycleSnapshot {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  description: string;
  stake: string | null;
  assetScale: string | null;
  keyHighlights: string[];
  date: string;
  dealStatus: DealStatus;
  closingDate: string | null;
  recordStatus: string;
  updatedAt: string;
}

export interface OwnershipLifecycleSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  fundId: string | null;
  fundName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CompanyCountryTagsSnapshot {
  id: string;
  name: string;
  country: string;
  countryTags: string[];
  region: string;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
}

export interface MilestoneLifecycleSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  event: string;
  category: string;
  sortDate: string | null;
}

export interface CitationLifecycleSnapshot {
  id: string;
  sourceId: string;
  dealId: string | null;
  companyId: string | null;
  purpose: string;
  evidenceLabel: string | null;
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
}

export interface SourceLifecycleSnapshot {
  id: string;
  label: string;
  url: string;
  type: string;
}

export interface LifecycleTableCounts {
  deals: number;
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  citations: number;
}

export interface PortfolioLifecycleSnapshot {
  deals: DealLifecycleSnapshot[];
  ownershipPeriods: OwnershipLifecycleSnapshot[];
  companies: CompanyCountryTagsSnapshot[];
  milestones: MilestoneLifecycleSnapshot[];
  citations: CitationLifecycleSnapshot[];
  sources: SourceLifecycleSnapshot[];
  proposedMilestoneConflicts: MilestoneLifecycleSnapshot[];
  proposedCitationConflicts: CitationLifecycleSnapshot[];
  tableCounts: LifecycleTableCounts;
}

interface DealUpdate {
  actionType: "DEAL_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: DealLifecycleSnapshot;
  proposed: Omit<DealLifecycleSnapshot, "updatedAt">;
}

interface OwnershipUpdate {
  actionType: "OWNERSHIP_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: OwnershipLifecycleSnapshot;
  proposed: OwnershipLifecycleSnapshot;
}

interface OwnershipDelete {
  actionType: "OWNERSHIP_DELETE";
  id: string;
  evidence: EvidenceReference;
  current: OwnershipLifecycleSnapshot;
}

interface MilestoneUpdate {
  actionType: "MILESTONE_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: MilestoneLifecycleSnapshot;
  proposed: MilestoneLifecycleSnapshot;
}

interface MilestoneInsert {
  actionType: "MILESTONE_INSERT";
  id: string;
  evidence: EvidenceReference;
  proposed: MilestoneLifecycleSnapshot;
}

interface CompanyUpdate {
  actionType: "COMPANY_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: CompanyCountryTagsSnapshot;
  proposed: Omit<CompanyCountryTagsSnapshot, "updatedAt">;
}

interface CitationUpdate {
  actionType: "CITATION_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: CitationLifecycleSnapshot;
  proposed: CitationLifecycleSnapshot;
}

interface IncumbentOwnershipGuard {
  reason: string;
  current: OwnershipLifecycleSnapshot;
}

interface QuarantinedFinding {
  companyId: string;
  companyName: string;
  dealId: string;
  legacyId: string;
  relatedOwnershipIds: string[];
  evidence: EvidenceReference;
  finding: string;
  reason: string;
}

export interface PortfolioLifecycleCorrectionManifest {
  dealUpdates: readonly DealUpdate[];
  ownershipUpdates: readonly OwnershipUpdate[];
  ownershipDeletes: readonly OwnershipDelete[];
  milestoneUpdates: readonly MilestoneUpdate[];
  milestoneInserts: readonly MilestoneInsert[];
  companyUpdates: readonly CompanyUpdate[];
  citationUpdates: readonly CitationUpdate[];
  incumbentOwnershipGuards: readonly IncumbentOwnershipGuard[];
  quarantinedFindings: readonly QuarantinedFinding[];
}

const allianceEvidence: EvidenceReference = {
  sourceId: "cmnva4nlk05skm8lzkm6v24s3",
  sourceLabel: "Blackstone",
  sourceType: "ARTICLE",
  publisher: "Blackstone",
  url: "https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-acquisition-of-alliance-technical-group/",
  evidenceDate: "2026-01-06",
  finding: "Blackstone Energy Transition Partners stated that its funds had acquired Alliance Technical Group.",
};

const prospectEvidence: EvidenceReference = {
  sourceId: "cmnva4mbm05rsm8lzbwlia1nr",
  sourceLabel: "Business Wire",
  sourceType: "PRESS_RELEASE",
  publisher: "Elevate Renewables / Business Wire",
  url: "https://www.businesswire.com/news/home/20260115405115/en/Elevate-Acquires-Prospect-Power-Storage-a-150-MW-Battery-Asset-in-Northern-Virginia",
  evidenceDate: "2026-01-15",
  finding: "Elevate Renewables announced that it acquired the 150 MW Prospect Power battery-storage asset.",
};

const btrEvidence: EvidenceReference = {
  sourceId: "cmnva4o1x05sum8lz65v0wpff",
  sourceLabel: "Business Wire",
  sourceType: "PRESS_RELEASE",
  publisher: "Velocity FBO Network / Business Wire",
  url: "https://www.businesswire.com/news/home/20260213283848/en/Tallvine-Backed-Velocity-FBO-Network-Expands-with-Acquisition-of-BTR-Jet-Center",
  evidenceDate: "2026-02-13",
  finding: "Velocity FBO Network announced its completed acquisition of BTR Jet Center.",
};

const cordelioEvidence: EvidenceReference = {
  sourceId: "cmnvabgvi0a44m8lz20h40bk8",
  sourceLabel: "Patternenergy — Cordelio Power",
  sourceType: "ARTICLE",
  publisher: "Pattern Energy",
  url: "https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/",
  evidenceDate: "2026-04-02",
  finding: "Pattern Energy completed the Cordelio acquisition, adding approximately 1,550 MW across 16 operating and in-construction projects plus most of Cordelio's U.S. development pipeline.",
};

const rowanEvidence: EvidenceReference = {
  sourceId: "cmoqc8zb106f4171fyq1c4x65",
  sourceLabel: "PR Newswire",
  sourceType: "PRESS_RELEASE",
  publisher: "Rowan Digital Infrastructure / PR Newswire",
  url: "https://www.prnewswire.com/news-releases/rowan-digital-infrastructure-announces-strategic-recapitalization-302738729.html",
  evidenceDate: "2026-04-09",
  finding: "Rowan stated that Blackstone-affiliated funds acquired a significant minority stake; the release does not disclose a 49% stake.",
};

const roverEvidence: EvidenceReference = {
  sourceId: "cmoqc92w406he171fq4smsw4q",
  sourceLabel: "Blackstone",
  sourceType: "ARTICLE",
  publisher: "Blackstone",
  url: "https://www.blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america/",
  evidenceDate: "2026-04-29",
  finding: "Ares acquired Blackstone Energy Transition Partners' 32.4% Rover Pipeline stake.",
};

const i3Evidence: EvidenceReference = {
  sourceId: "cmoqc92t406hc171fryyeu3gq",
  sourceLabel: "T-Mobile",
  sourceType: "ARTICLE",
  publisher: "T-Mobile",
  url: "https://www.t-mobile.com/news/business/t-mobile-add-two-strategic-fiber-joint-ventures-gonetspeed-greenlight-i3",
  evidenceDate: "2026-04-29",
  finding: "T-Mobile described a definitive agreement for i3 Broadband that remained subject to closing conditions and was expected to close in the second half of 2026.",
};

const bayonneEvidence: EvidenceReference = {
  sourceId: "cmnva4u0p05wim8lz3wxy2t3c",
  sourceLabel: "Morgan Stanley",
  sourceType: "ARTICLE",
  publisher: "Morgan Stanley Infrastructure Partners",
  url: "https://www.morganstanley.com/press-releases/msip-agrees-to-sell-bayonne-energy-center",
  evidenceDate: "2026-05-07",
  finding: "MSIP announced an agreement to sell Bayonne Energy Center with closing expected in the third quarter of 2026.",
};

const boralexEvidence: EvidenceReference = {
  sourceId: "source_boralex_2025_results",
  sourceLabel: "Scale source — Boralex Inc.",
  sourceType: "ARTICLE",
  publisher: "Boralex",
  url: "https://us.boralex.com/en/press-releases/boralex-annual-results-2025",
  evidenceDate: "2026-02-27",
  finding: "Boralex reports operations across Canada, the United States, France, and the United Kingdom; the canonical country field already lists all four countries.",
};

const boralexOwnershipEvidence: EvidenceReference = {
  sourceId: "cmnva4v0k05x4m8lztgmbr9pn",
  sourceLabel: "Announcement date source — Brookfield Asset Management / La Caisse — Boralex Inc.",
  sourceType: "PRESS_RELEASE",
  publisher: "Boralex",
  url: "https://www.boralex.com/en/press-releases/boralex-enters-definitive-agreement-be-acquired-brookfield-alongside-la-caisse",
  evidenceDate: "2026-03-25",
  finding: "Boralex stated that La Caisse currently owns 15%; Brookfield's 70% and La Caisse's 30% are pro-forma interests that apply only after the announced transaction closes.",
};

const vigorEvidence: EvidenceReference = {
  sourceId: "cmnva8wtv08ghm8lzxnojf1vl",
  sourceLabel: "Vigormarine — Vigor Marine Group",
  sourceType: "PRESS_RELEASE",
  publisher: "Vigor Marine Group",
  url: "https://www.vigormarine.com/news-press/antin-to-acquire-vigor-marine-group",
  evidenceDate: "2026-02-03",
  finding: "Vigor described Antin's acquisition as an agreement subject to regulatory approvals, so Antin must not be represented as the current owner before closing.",
};

const iatpEvidence: EvidenceReference = {
  sourceId: "cmnvac5ye0akhm8lzgtdxg09m",
  sourceLabel: "Infrabridge — Invenergy AMPCI Thermal Power",
  sourceType: "ARTICLE",
  publisher: "InfraBridge",
  url: "https://www.infrabridge.com/news/2026-03-12-arclight-to-acquire-infrabridge-50-stake-in-54-gw-power-portfolio",
  evidenceDate: "2026-03-12",
  finding: "InfraBridge described ArcLight's 50% IATP acquisition as a transaction expected to close in the third quarter of 2026, subject to customary conditions and approvals.",
};

const vigorHistoricalOwnershipEvidence: EvidenceReference = {
  sourceId: null,
  sourceLabel: "Close date source — Lone Star Funds — Vigor Marine Group",
  sourceType: "PRESS_RELEASE",
  publisher: "Vigor Marine Group",
  url: "https://www.vigormarine.com/news-press/carlyle-and-stellex-complete-sale-of-titan-to-an-affiliate-of-lone-star-funds",
  evidenceDate: "2023-06-15",
  finding: "Lone Star completed its acquisition of Titan Acquisition Holdings, Vigor's parent platform, on June 15, 2023; the current Lone Star ownership row's 2019 investment year is stale.",
};

const cornerstoneCloseEvidence: EvidenceReference = {
  sourceId: null,
  sourceLabel: "Talen Energy completes acquisition of high-quality Western PJM assets",
  sourceType: "PRESS_RELEASE",
  publisher: "Talen Energy",
  url: "https://ir.talenenergy.com/news-releases/news-release-details/talen-energy-completes-acquisition-high-quality-western-pjm",
  evidenceDate: "2026-06-15",
  finding: "Talen Energy completed its acquisition of the Cornerstone Generation portfolio on June 15, 2026.",
};

const rowanCurrentDescription = "Quinbrook announced a strategic recapitalization of Rowan Digital Infrastructure through the sale of a 49% significant minority stake to funds affiliated with Blackstone. The transaction monetizes part of Quinbrook’s ownership while retaining control, partnering with Blackstone to support Rowan’s next phase of growth and continued hyperscale data center expansion serving cloud and AI-driven demand.";
const rowanProposedDescription = "Funds affiliated with Blackstone acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook. The investment supports Rowan’s U.S. hyperscale data-center development and capacity expansion.";
const cordelioProposedDescription = "Pattern Energy completed its acquisition of Cordelio Power, adding approximately 1,550 MW across 16 operating and in-construction wind, solar and energy-storage projects in the United States and Canada, plus most of Cordelio’s U.S. development pipeline.";

export const REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST: PortfolioLifecycleCorrectionManifest = {
  dealUpdates: [
    {
      actionType: "DEAL_UPDATE",
      id: "cmnva475e05fkm8lz9ug5ngij",
      evidence: allianceEvidence,
      current: {
        id: "cmnva475e05fkm8lz9ug5ngij",
        legacyId: "INF-2026-041",
        title: "Blackstone acquires Alliance Technical Group platform",
        target: "Alliance Technical Group",
        description: "Blackstone announced the platform acquisition of Alliance Technical Group, an environmental services company.",
        stake: "100%",
        assetScale: null,
        keyHighlights: [
          "Platform acquisition of Alliance Technical Group by Blackstone",
          "Alliance Technical Group is a leading provider of environmental and technical services",
        ],
        date: "2026-01-06T08:00:00.000",
        dealStatus: "ANNOUNCED",
        closingDate: null,
        recordStatus: "PUBLISHED",
        updatedAt: "2026-04-12T04:44:07.346000",
      },
      proposed: {
        id: "cmnva475e05fkm8lz9ug5ngij",
        legacyId: "INF-2026-041",
        title: "Blackstone acquires Alliance Technical Group platform",
        target: "Alliance Technical Group",
        description: "Funds managed by Blackstone Energy Transition Partners acquired Alliance Technical Group, an environmental and technical services platform.",
        stake: "100%",
        assetScale: null,
        keyHighlights: [
          "Platform acquisition of Alliance Technical Group by Blackstone",
          "Alliance Technical Group is a leading provider of environmental and technical services",
        ],
        date: "2026-01-06T08:00:00.000",
        dealStatus: "CLOSED",
        closingDate: null,
        recordStatus: "PUBLISHED",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: "cmnva463505f6m8lzs5kef3dl",
      evidence: prospectEvidence,
      current: {
        id: "cmnva463505f6m8lzs5kef3dl",
        legacyId: "INF-2026-027",
        title: "ArcLight Capital acquires Prospect Power (150 MW BESS) from IFM",
        target: "Prospect Power",
        description: "ArcLight Capital acquired the Prospect Power 150 MW battery energy storage system from IFM.",
        stake: "100%",
        assetScale: "150 MW BESS",
        keyHighlights: [
          "Asset divestiture by IFM and acquisition by ArcLight Capital of the Prospect Power 150 MW BESS",
          "Represents a significant battery storage asset transaction in the US market",
        ],
        date: "2026-01-15T10:00:00.000",
        dealStatus: "ANNOUNCED",
        closingDate: null,
        recordStatus: "PUBLISHED",
        updatedAt: "2026-04-12T04:44:05.969000",
      },
      proposed: {
        id: "cmnva463505f6m8lzs5kef3dl",
        legacyId: "INF-2026-027",
        title: "ArcLight Capital acquires Prospect Power (150 MW BESS) from IFM",
        target: "Prospect Power",
        description: "ArcLight Capital acquired the Prospect Power 150 MW battery energy storage system from IFM.",
        stake: "100%",
        assetScale: "150 MW BESS",
        keyHighlights: [
          "Asset divestiture by IFM and acquisition by ArcLight Capital of the Prospect Power 150 MW BESS",
          "Represents a significant battery storage asset transaction in the US market",
        ],
        date: "2026-01-15T10:00:00.000",
        dealStatus: "CLOSED",
        closingDate: null,
        recordStatus: "PUBLISHED",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: "cmnva47j205fpm8lzr73zqisy",
      evidence: btrEvidence,
      current: {
        id: "cmnva47j205fpm8lzr73zqisy",
        legacyId: "INF-2026-046",
        title: "Tallvine Partners acquires BTR Jet Center via Velocity FBO Network (add-on)",
        target: "BTR Jet Center",
        description: "Tallvine Partners, through Velocity FBO Network, completed an add-on acquisition of BTR Jet Center.",
        stake: "100%",
        assetScale: null,
        keyHighlights: [
          "Add-on acquisition of BTR Jet Center through Tallvine Partners' Velocity FBO Network",
          "Expands the Velocity FBO Network's geographic footprint in the US",
        ],
        date: "2026-02-13T09:00:00.000",
        dealStatus: "ANNOUNCED",
        closingDate: null,
        recordStatus: "PUBLISHED",
        updatedAt: "2026-04-12T04:44:07.838000",
      },
      proposed: {
        id: "cmnva47j205fpm8lzr73zqisy",
        legacyId: "INF-2026-046",
        title: "Tallvine Partners acquires BTR Jet Center via Velocity FBO Network (add-on)",
        target: "BTR Jet Center",
        description: "Tallvine Partners, through Velocity FBO Network, completed an add-on acquisition of BTR Jet Center.",
        stake: "100%",
        assetScale: null,
        keyHighlights: [
          "Add-on acquisition of BTR Jet Center through Tallvine Partners' Velocity FBO Network",
          "Expands the Velocity FBO Network's geographic footprint in the US",
        ],
        date: "2026-02-13T09:00:00.000",
        dealStatus: "CLOSED",
        closingDate: null,
        recordStatus: "PUBLISHED",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: "cmnva44zq05esm8lz8elpwcvh",
      evidence: cordelioEvidence,
      current: {
        id: "cmnva44zq05esm8lz8elpwcvh",
        legacyId: "INF-2026-013",
        title: "CPP Investments acquires Cordelio Power via Pattern Energy (platform merger)",
        target: "Cordelio Power",
        description: "CPP Investments, through Pattern Energy, announced a platform merger with Cordelio Power to create a combined renewable energy platform.",
        stake: "100%",
        assetScale: null,
        keyHighlights: [
          "Platform merger between Cordelio Power and Pattern Energy, backed by CPP Investments",
          "Creates a larger combined renewable energy platform across North America",
        ],
        date: "2026-01-06T08:00:00.000",
        dealStatus: "ANNOUNCED",
        closingDate: null,
        recordStatus: "PUBLISHED",
        updatedAt: "2026-04-12T04:44:04.550000",
      },
      proposed: {
        id: "cmnva44zq05esm8lz8elpwcvh",
        legacyId: "INF-2026-013",
        title: "CPP Investments acquires Cordelio Power via Pattern Energy (platform merger)",
        target: "Cordelio Power",
        description: cordelioProposedDescription,
        stake: "100%",
        assetScale: "Approximately 1,550 MW across 16 operating and in-construction projects",
        keyHighlights: [
          cordelioProposedDescription,
          "Pattern acquired most of Cordelio’s U.S. development pipeline and its team.",
        ],
        date: "2026-01-06T08:00:00.000",
        dealStatus: "CLOSED",
        closingDate: "2026-04-02T08:00:00.000",
        recordStatus: "PUBLISHED",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: "cmoqc7mft05yk171fbj6rf6in",
      evidence: rowanEvidence,
      current: {
        id: "cmoqc7mft05yk171fbj6rf6in",
        legacyId: "INF-2026-161",
        title: "Blackstone acquires 49% stake in Rowan Digital Infrastructure from Quinbrook",
        target: "Rowan Digital Infrastructure",
        description: rowanCurrentDescription,
        stake: "49%",
        assetScale: null,
        keyHighlights: [rowanCurrentDescription],
        date: "2026-04-07T08:00:00.000",
        dealStatus: "ANNOUNCED",
        closingDate: null,
        recordStatus: "PUBLISHED",
        updatedAt: "2026-05-03T22:23:37.817000",
      },
      proposed: {
        id: "cmoqc7mft05yk171fbj6rf6in",
        legacyId: "INF-2026-161",
        title: "Blackstone acquires significant minority stake in Rowan Digital Infrastructure",
        target: "Rowan Digital Infrastructure",
        description: rowanProposedDescription,
        stake: "Significant minority",
        assetScale: null,
        keyHighlights: [rowanProposedDescription],
        date: "2026-04-09T08:00:00.000",
        dealStatus: "CLOSED",
        closingDate: null,
        recordStatus: "PUBLISHED",
      },
    },
  ],
  ownershipUpdates: [
    {
      actionType: "OWNERSHIP_UPDATE",
      id: "cmoel78ak0000xdlz7gmibbn1",
      evidence: roverEvidence,
      current: {
        id: "cmoel78ak0000xdlz7gmibbn1",
        companyId: "cmnva0xcg00vhm8lzllfqv37o",
        companyName: "Rover Pipeline",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zow9000um8lzmxq856dz",
        organizationName: "Blackstone",
        vehicleName: "Blackstone Energy Transition Partners",
        stake: null,
        investmentYear: 2017,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:02:01.916000",
      },
      proposed: {
        id: "cmoel78ak0000xdlz7gmibbn1",
        companyId: "cmnva0xcg00vhm8lzllfqv37o",
        companyName: "Rover Pipeline",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zow9000um8lzmxq856dz",
        organizationName: "Blackstone",
        vehicleName: "Blackstone Energy Transition Partners",
        stake: null,
        investmentYear: 2017,
        exitYear: 2026,
        isActive: false,
        createdAt: "2026-04-25T17:02:01.916000",
      },
    },
    {
      actionType: "OWNERSHIP_UPDATE",
      id: "ownership_boralex_cdpq_2026",
      evidence: boralexOwnershipEvidence,
      current: {
        id: "ownership_boralex_cdpq_2026",
        companyId: "company_boralex_inc_2026",
        companyName: "Boralex Inc.",
        fundId: "cmnva0ilb00bcm8lzg800fpmz",
        fundName: "CDPQ Infrastructure",
        organizationId: "cmnv9zsx7002am8lzyo22qh5v",
        organizationName: "La Caisse de dépôt (CDPQ)",
        vehicleName: "CDPQ Infrastructure",
        stake: "30% pro forma post-close; shareholder/lender since 2017",
        investmentYear: 2017,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-07T16:08:03.983000",
      },
      proposed: {
        id: "ownership_boralex_cdpq_2026",
        companyId: "company_boralex_inc_2026",
        companyName: "Boralex Inc.",
        fundId: "cmnva0ilb00bcm8lzg800fpmz",
        fundName: "CDPQ Infrastructure",
        organizationId: "cmnv9zsx7002am8lzyo22qh5v",
        organizationName: "La Caisse de dépôt (CDPQ)",
        vehicleName: "CDPQ Infrastructure",
        stake: "15%",
        investmentYear: 2017,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-07T16:08:03.983000",
      },
    },
  ],
  ownershipDeletes: [
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoxwhbw5021it01ft1l6jhxe",
      evidence: i3Evidence,
      current: {
        id: "cmoxwhbw5021it01ft1l6jhxe",
        companyId: "cmnva0ra500lym8lzco0glku7",
        companyName: "i3 Broadband",
        fundId: null,
        fundName: null,
        organizationId: "cmoqbwp3a001b171fz6huplze",
        organizationName: "T-Mobile",
        vehicleName: "50/50 fiber joint venture with Wren House",
        stake: "50%",
        investmentYear: 2026,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-09T05:25:26.261000",
      },
    },
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoxwgnu601uyt01fdxlgpd4z",
      evidence: bayonneEvidence,
      current: {
        id: "cmoxwgnu601uyt01fdxlgpd4z",
        companyId: "cmnva0rwv00mdm8lz50afv9c7",
        companyName: "Bayonne Energy Center",
        fundId: null,
        fundName: null,
        organizationId: "cmnva08az007om8lzluydxf4f",
        organizationName: "Jupiter Energy Investor",
        vehicleName: "Announced acquisition from MSIP pending close",
        stake: null,
        investmentYear: 2026,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-09T05:24:55.086000",
      },
    },
    {
      actionType: "OWNERSHIP_DELETE",
      id: "ownership_boralex_brookfield_2026",
      evidence: boralexOwnershipEvidence,
      current: {
        id: "ownership_boralex_brookfield_2026",
        companyId: "company_boralex_inc_2026",
        companyName: "Boralex Inc.",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zysd004am8lzz4lf6gv5",
        organizationName: "Brookfield Asset Management",
        vehicleName: "Brookfield flagship infrastructure strategy",
        stake: "70% pro forma post-close",
        investmentYear: 2026,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-07T16:08:03.983000",
      },
    },
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoel61yl009evflzwd1cnx1v",
      evidence: vigorEvidence,
      current: {
        id: "cmoel61yl009evflzwd1cnx1v",
        companyId: "cmnva0tj200p8m8lz8sb6e93u",
        companyName: "Vigor Marine Group",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zn810009m8lz35ujleyz",
        organizationName: "Antin Infrastructure Partners",
        vehicleName: "Flagship Fund V",
        stake: null,
        investmentYear: 2026,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:01:07.053000",
      },
    },
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoel6dh8002pw2lzdmg91gru",
      evidence: iatpEvidence,
      current: {
        id: "cmoel6dh8002pw2lzdmg91gru",
        companyId: "cmnva0ubj00qkm8lz6et53ta9",
        companyName: "Invenergy AMPCI Thermal Power",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9znt5000hm8lzku8pqnya",
        organizationName: "ArcLight Capital Partners",
        vehicleName: "ArcLight Capital Partners",
        stake: null,
        investmentYear: 2026,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:01:21.980000",
      },
    },
  ],
  milestoneUpdates: [
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h7m5a00qww41f1yfgcyqx",
      evidence: allianceEvidence,
      current: {
        id: "cmp1h7m5a00qww41f1yfgcyqx",
        companyId: "cmnva0x0m00uwm8lzcv0jn3gr",
        companyName: "Alliance Technical Group",
        date: "Jan 6, 2026",
        event: "Blackstone Energy Transition Partners announced the acquisition of Alliance Technical Group.",
        category: "ACQUISITION",
        sortDate: "2026-01-06T05:00:00.000",
      },
      proposed: {
        id: "cmp1h7m5a00qww41f1yfgcyqx",
        companyId: "cmnva0x0m00uwm8lzcv0jn3gr",
        companyName: "Alliance Technical Group",
        date: "Jan 6, 2026",
        event: "Funds managed by Blackstone Energy Transition Partners acquired Alliance Technical Group.",
        category: "ACQUISITION",
        sortDate: "2026-01-06T05:00:00.000",
      },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h8wg602tcw41f91blqqbv",
      evidence: rowanEvidence,
      current: {
        id: "cmp1h8wg602tcw41f91blqqbv",
        companyId: "cmnva0p6h00ibm8lzimyld7ll",
        companyName: "Rowan Digital Infrastructure",
        date: "Apr 7, 2026",
        event: "Quinbrook announced a strategic recapitalization of Rowan through the sale of a 49% minority stake to Blackstone-affiliated funds while retaining control.",
        category: "FINANCING",
        sortDate: "2026-04-07T04:00:00.000",
      },
      proposed: {
        id: "cmp1h8wg602tcw41f91blqqbv",
        companyId: "cmnva0p6h00ibm8lzimyld7ll",
        companyName: "Rowan Digital Infrastructure",
        date: "Apr 9, 2026",
        event: "Blackstone-affiliated funds acquired a significant minority stake in Rowan Digital Infrastructure, while Quinbrook retained control.",
        category: "FINANCING",
        sortDate: "2026-04-09T04:00:00.000",
      },
    },
  ],
  milestoneInserts: [
    {
      actionType: "MILESTONE_INSERT",
      id: "milestone_cordelio_pattern_close_2026",
      evidence: cordelioEvidence,
      proposed: {
        id: "milestone_cordelio_pattern_close_2026",
        companyId: "cmnva0yp200xvm8lzue3btvd8",
        companyName: "Cordelio Power",
        date: "Apr 2, 2026",
        event: "Pattern Energy completed its acquisition of Cordelio Power, adding approximately 1,550 MW of operating and in-construction assets.",
        category: "ACQUISITION",
        sortDate: "2026-04-02T04:00:00.000",
      },
    },
  ],
  companyUpdates: [
    {
      actionType: "COMPANY_UPDATE",
      id: "company_boralex_inc_2026",
      evidence: boralexEvidence,
      current: {
        id: "company_boralex_inc_2026",
        name: "Boralex Inc.",
        country: "United States / Canada / France / United Kingdom",
        countryTags: ["United States", "Canada"],
        region: "GLOBAL",
        companyStatus: "ACTIVE",
        recordStatus: "PUBLISHED",
        updatedAt: "2026-05-07T16:08:03.955000",
      },
      proposed: {
        id: "company_boralex_inc_2026",
        name: "Boralex Inc.",
        country: "United States / Canada / France / United Kingdom",
        countryTags: ["United States", "Canada", "France", "United Kingdom"],
        region: "GLOBAL",
        companyStatus: "ACTIVE",
        recordStatus: "PUBLISHED",
      },
    },
  ],
  citationUpdates: [
    {
      actionType: "CITATION_UPDATE",
      id: "cmoxwmufj09clt01fp7007z4l",
      evidence: cordelioEvidence,
      current: {
        id: "cmoxwmufj09clt01fp7007z4l",
        sourceId: "cmnvabgvi0a44m8lz20h40bk8",
        dealId: null,
        companyId: "cmnva0yp200xvm8lzue3btvd8",
        purpose: "MILESTONE_EVENT",
        evidenceLabel: "Patternenergy transaction or milestone detail",
        sourceLabel: "Patternenergy — Cordelio Power",
        sourceUrl: "https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/",
        sourceType: "ARTICLE",
      },
      proposed: {
        id: "cmoxwmufj09clt01fp7007z4l",
        sourceId: "cmnvabgvi0a44m8lz20h40bk8",
        dealId: "cmnva44zq05esm8lz8elpwcvh",
        companyId: "cmnva0yp200xvm8lzue3btvd8",
        purpose: "MILESTONE_EVENT",
        evidenceLabel: "Patternenergy transaction or milestone detail",
        sourceLabel: "Patternenergy — Cordelio Power",
        sourceUrl: "https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/",
        sourceType: "ARTICLE",
      },
    },
  ],
  incumbentOwnershipGuards: [
    {
      reason: "Wren House remains the incumbent owner until the announced T-Mobile transaction closes.",
      current: {
        id: "cmoelbnvw00e03alzlh3hm975",
        companyId: "cmnva0ra500lym8lzco0glku7",
        companyName: "i3 Broadband",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zxmt003vm8lzlvaadm9g",
        organizationName: "Wren House",
        vehicleName: "Wren House direct acquisition; exact stake details not disclosed in the cited public materials.",
        stake: null,
        investmentYear: 2020,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:05:28.748000",
      },
    },
    {
      reason: "MSIP remains the incumbent owner until the announced Jupiter transaction closes.",
      current: {
        id: "cmoelajuf00db1elz9akeqqug",
        companyId: "cmnva0rwv00mdm8lz50afv9c7",
        companyName: "Bayonne Energy Center",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zxs9003xm8lzzn78ox2e",
        organizationName: "MSIP",
        vehicleName: "Ownership stake in Thermal Bayonne Holdings, LLC",
        stake: null,
        investmentYear: 2018,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:04:36.855000",
      },
    },
    {
      reason: "Preserve Lone Star as Vigor's incumbent owner until the announced Antin transaction closes; this exact guard does not validate its stale 2019 investment year, which is separately quarantined.",
      current: {
        id: "cmoxwdopn012nt01f6m0syzto",
        companyId: "cmnva0tj200p8m8lz8sb6e93u",
        companyName: "Vigor Marine Group",
        fundId: null,
        fundName: null,
        organizationId: "cmoxw8q2a0000t01fhj5dd9kv",
        organizationName: "Lone Star Funds",
        vehicleName: "Seller in announced Antin acquisition pending close",
        stake: null,
        investmentYear: 2019,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-09T05:22:36.251000",
      },
    },
    {
      reason: "DigitalBridge remains the incumbent IATP owner until the announced ArcLight transaction closes; preserve the original GIF II ownership fact.",
      current: {
        id: "cmoel6dfl002ow2lz4tohsr8e",
        companyId: "cmnva0ubj00qkm8lz6et53ta9",
        companyName: "Invenergy AMPCI Thermal Power",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zpyg0018m8lza55ef6ju",
        organizationName: "DigitalBridge",
        vehicleName: "Global Infrastructure Fund II (GIF II)",
        stake: null,
        investmentYear: 2018,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:01:21.921000",
      },
    },
    {
      reason: "DigitalBridge remains the incumbent IATP owner until the announced ArcLight transaction closes; preserve the InfraBridge ownership fact.",
      current: {
        id: "cmoxwdvqg014ot01f1oxvvo51",
        companyId: "cmnva0ubj00qkm8lz6et53ta9",
        companyName: "Invenergy AMPCI Thermal Power",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zpyg0018m8lza55ef6ju",
        organizationName: "DigitalBridge",
        vehicleName: "InfraBridge",
        stake: null,
        investmentYear: 2018,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-09T05:22:45.352000",
      },
    },
    {
      reason: "Ares Management must remain the active incoming Rover owner when Blackstone's sold interest is marked exited.",
      current: {
        id: "cmoqc26xi016v171fvp1nqbyt",
        companyId: "cmnva0xcg00vhm8lzllfqv37o",
        companyName: "Rover Pipeline",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9znym000jm8lzka44v9iu",
        organizationName: "Ares Management",
        vehicleName: "Ares Infrastructure Opportunities",
        stake: null,
        investmentYear: 2026,
        exitYear: null,
        isActive: true,
        createdAt: "2026-05-03T22:19:24.438000",
      },
    },
  ],
  quarantinedFindings: [
    {
      companyId: "cmnva0o2q00gim8lzgib5tltb",
      companyName: "Cornerstone Generation",
      dealId: "cmnva452h05etm8lzpwozr1ef",
      legacyId: "INF-2026-014",
      relatedOwnershipIds: [
        "cmoel8cvg0045yqlzx86lowbj",
        "cmoxwf6ps01h8t01fnizomnys",
      ],
      evidence: cornerstoneCloseEvidence,
      finding: "The Talen ownership row must be preserved: Talen completed the acquisition on June 15, 2026. The stale deal, buyer participant, source/citation, ECP exit, and historical investment year require a separate reviewed correction.",
      reason: "Quarantined because the superseding close requires coordinated participant replacement, new closing evidence, deal narrative changes, and multi-field ownership corrections outside this exact tranche.",
    },
    {
      companyId: "cmnva0tj200p8m8lz8sb6e93u",
      companyName: "Vigor Marine Group",
      dealId: "cmnva487p05fym8lzq6z0rkyg",
      legacyId: "INF-2026-055",
      relatedOwnershipIds: ["cmoxwdopn012nt01f6m0syzto"],
      evidence: vigorHistoricalOwnershipEvidence,
      finding: "The Lone Star ownership row is correctly preserved as incumbent for the pending Antin deal, but its 2019 investment year predates Lone Star's June 15, 2023 acquisition of Titan and requires a separate sourced correction.",
      reason: "Quarantined because normalizing the historical vehicle and investment year should be reviewed separately from deleting the premature Antin row.",
    },
  ],
};

type LifecycleAction =
  | DealUpdate
  | OwnershipUpdate
  | OwnershipDelete
  | MilestoneUpdate
  | MilestoneInsert
  | CompanyUpdate
  | CitationUpdate;

export interface PortfolioLifecycleCorrectionPlan {
  actions: LifecycleAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  quarantinedFindings: readonly QuarantinedFinding[];
  counts: {
    dealUpdates: number;
    ownershipUpdates: number;
    ownershipDeletes: number;
    milestoneUpdates: number;
    milestoneInserts: number;
    companyUpdates: number;
    citationUpdates: number;
    incumbentGuards: number;
    quarantinedFindings: number;
  };
}

function allActions(manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST): LifecycleAction[] {
  return [
    ...manifest.dealUpdates,
    ...manifest.ownershipUpdates,
    ...manifest.ownershipDeletes,
    ...manifest.milestoneUpdates,
    ...manifest.milestoneInserts,
    ...manifest.companyUpdates,
    ...manifest.citationUpdates,
  ].sort((left, right) =>
    left.actionType.localeCompare(right.actionType) || left.id.localeCompare(right.id)
  );
}

export function portfolioLifecycleActionSetSha256(
  manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST,
): string {
  return sha256(allActions(manifest));
}

export function portfolioLifecycleManifestSha256(
  manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST,
): string {
  return sha256(manifest);
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

function byId<T extends { id: string }>(label: string, rows: T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (result.has(row.id)) throw new Error(`${label} snapshot contains duplicate ID ${row.id}`);
    result.set(row.id, row);
  }
  return result;
}

function expectedSourceRows(): SourceLifecycleSnapshot[] {
  const sources = new Map<string, SourceLifecycleSnapshot>();
  for (const action of allActions()) {
    const evidence = action.evidence;
    if (!evidence.sourceId) continue;
    const snapshot = {
      id: evidence.sourceId,
      label: evidence.sourceLabel,
      url: evidence.url,
      type: evidence.sourceType,
    };
    const prior = sources.get(snapshot.id);
    if (prior) exact(`Evidence Source ${snapshot.id}`, prior, snapshot);
    sources.set(snapshot.id, snapshot);
  }
  return [...sources.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function expectedPortfolioLifecycleSourceRows(): SourceLifecycleSnapshot[] {
  return expectedSourceRows();
}

export function assertReviewedPortfolioLifecycleManifest(): void {
  const actions = allActions();
  if (actions.length !== REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT) {
    throw new Error(`Reviewed lifecycle action count is ${actions.length}; expected ${REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT}`);
  }
  const actionKeys = new Set<string>();
  const rowKeys = new Set<string>();
  for (const action of actions) {
    const actionKey = `${action.actionType}:${action.id}`;
    if (actionKeys.has(actionKey)) throw new Error(`Duplicate lifecycle action ${actionKey}`);
    actionKeys.add(actionKey);
    const table = action.actionType.split("_")[0];
    const rowKey = `${table}:${action.id}`;
    if (rowKeys.has(rowKey)) throw new Error(`Multiple lifecycle mutations target ${rowKey}`);
    rowKeys.add(rowKey);
    if (!action.evidence.url.startsWith("https://")) {
      throw new Error(`Lifecycle action ${actionKey} lacks an HTTPS evidence URL`);
    }
  }
  if (portfolioLifecycleActionSetSha256() !== REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_SET_SHA256) {
    throw new Error("Lifecycle action-set SHA-256 drifted from the reviewed constant");
  }
  if (portfolioLifecycleManifestSha256() !== REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST_SHA256) {
    throw new Error("Lifecycle manifest SHA-256 drifted from the reviewed constant");
  }
  if (REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.quarantinedFindings.some((finding) =>
    !finding.evidence.url.startsWith("https://")
  )) {
    throw new Error("A quarantined lifecycle finding lacks an HTTPS evidence URL");
  }
}

export function buildPortfolioLifecycleCorrectionPlan(
  snapshot: PortfolioLifecycleSnapshot,
): PortfolioLifecycleCorrectionPlan {
  assertReviewedPortfolioLifecycleManifest();
  const manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST;
  const dealById = byId("Deal", snapshot.deals);
  const expectedDealIds = manifest.dealUpdates.map((action) => action.id).sort();
  exact("Deal ID set", [...dealById.keys()].sort(), expectedDealIds);
  for (const action of manifest.dealUpdates) {
    exact(`Deal ${action.id}`, dealById.get(action.id), action.current);
  }

  const ownershipById = byId("OwnershipPeriod", snapshot.ownershipPeriods);
  const expectedOwnership = [
    ...manifest.ownershipUpdates.map((action) => action.current),
    ...manifest.ownershipDeletes.map((action) => action.current),
    ...manifest.incumbentOwnershipGuards.map((guard) => guard.current),
  ];
  exact(
    "OwnershipPeriod ID set",
    [...ownershipById.keys()].sort(),
    expectedOwnership.map((row) => row.id).sort(),
  );
  for (const row of expectedOwnership) exact(`OwnershipPeriod ${row.id}`, ownershipById.get(row.id), row);
  for (const guard of manifest.incumbentOwnershipGuards) {
    if (!guard.current.isActive || guard.current.exitYear !== null) {
      throw new Error(`Incumbent OwnershipPeriod ${guard.current.id} is not an active guard`);
    }
  }

  const companyById = byId("Company", snapshot.companies);
  exact("Company ID set", [...companyById.keys()].sort(), manifest.companyUpdates.map((action) => action.id).sort());
  for (const action of manifest.companyUpdates) {
    exact(`Company ${action.id}`, companyById.get(action.id), action.current);
  }

  const milestoneById = byId("Milestone", snapshot.milestones);
  exact("Milestone ID set", [...milestoneById.keys()].sort(), manifest.milestoneUpdates.map((action) => action.id).sort());
  for (const action of manifest.milestoneUpdates) {
    exact(`Milestone ${action.id}`, milestoneById.get(action.id), action.current);
  }
  if (snapshot.proposedMilestoneConflicts.length > 0) {
    throw new Error("The proposed deterministic Cordelio closing milestone already exists or conflicts");
  }

  const citationById = byId("Citation", snapshot.citations);
  exact("Citation ID set", [...citationById.keys()].sort(), manifest.citationUpdates.map((action) => action.id).sort());
  for (const action of manifest.citationUpdates) {
    exact(`Citation ${action.id}`, citationById.get(action.id), action.current);
  }
  if (snapshot.proposedCitationConflicts.length > 0) {
    throw new Error("The proposed Cordelio deal/company/source citation identity conflicts");
  }

  exact("Evidence Sources", [...snapshot.sources].sort((a, b) => a.id.localeCompare(b.id)), expectedSourceRows());

  const actions = allActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: portfolioLifecycleActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    quarantinedFindings: manifest.quarantinedFindings,
    counts: {
      dealUpdates: manifest.dealUpdates.length,
      ownershipUpdates: manifest.ownershipUpdates.length,
      ownershipDeletes: manifest.ownershipDeletes.length,
      milestoneUpdates: manifest.milestoneUpdates.length,
      milestoneInserts: manifest.milestoneInserts.length,
      companyUpdates: manifest.companyUpdates.length,
      citationUpdates: manifest.citationUpdates.length,
      incumbentGuards: manifest.incumbentOwnershipGuards.length,
      quarantinedFindings: manifest.quarantinedFindings.length,
    },
  };
}
