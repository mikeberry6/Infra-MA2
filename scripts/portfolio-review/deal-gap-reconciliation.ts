import { sha256 } from "./lib";

export const DEAL_GAP_RECONCILIATION_SCHEMA_VERSION = 1 as const;
export const DEAL_GAP_RECONCILIATION_SCOPE =
  "EVIDENCE_BACKED_DEAL_CARD_GAP_RECONCILIATION" as const;
export const REVIEWED_DEAL_GAP_ACTION_COUNT = 30 as const;
export const REVIEWED_DEAL_GAP_ACTION_SET_SHA256 =
  "47ea8622ecfcd296fba1d75f2ba331ebfc529662c453fde149638951e25cf29c";
export const REVIEWED_DEAL_GAP_MANIFEST_SHA256 =
  "50c5ecf68c725d40a0057ec1686522ed70aff5365c5688209051dd2c2887983f";

export type DealStatus =
  "ANNOUNCED" | "CLOSED" | "PENDING_REGULATORY_APPROVAL" | "TERMINATED";

export interface EvidenceReference {
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
}

export interface DealSnapshot {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  date: string;
  description: string;
  keyHighlights: string[];
  dealStatus: DealStatus;
  closingDate: string | null;
  recordStatus: string;
  updatedAt: string;
}

export interface MilestoneSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  event: string;
  category: string;
  sortDate: string | null;
}

export interface CitationSnapshot {
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

export interface OwnershipSnapshot {
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

export type OwnershipInsertState = Omit<OwnershipSnapshot, "createdAt">;

export interface CompanyGuard {
  id: string;
  name: string;
  country: string;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
}

export interface OrganizationGuard {
  id: string;
  name: string;
  types: string[];
  recordStatus: string;
}

export interface ReconciliationTableCounts {
  deals: number;
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  citations: number;
  sources: number;
  organizations: number;
}

export interface DealGapSnapshot {
  deals: DealSnapshot[];
  milestones: MilestoneSnapshot[];
  citations: CitationSnapshot[];
  ownershipPeriods: OwnershipSnapshot[];
  companies: CompanyGuard[];
  organizations: OrganizationGuard[];
  proposedCitationConflicts: CitationSnapshot[];
  proposedOwnershipConflicts: OwnershipSnapshot[];
  tableCounts: ReconciliationTableCounts;
}

export interface DealUpdateAction {
  actionType: "DEAL_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

export interface MilestoneUpdateAction {
  actionType: "MILESTONE_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
}

export interface CitationUpdateAction {
  actionType: "CITATION_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

export interface OwnershipUpdateAction {
  actionType: "OWNERSHIP_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: OwnershipSnapshot;
  proposed: OwnershipSnapshot;
}

export interface OwnershipDeleteAction {
  actionType: "OWNERSHIP_DELETE";
  id: string;
  evidence: EvidenceReference;
  current: OwnershipSnapshot;
}

export interface OwnershipInsertAction {
  actionType: "OWNERSHIP_INSERT";
  id: string;
  evidence: EvidenceReference;
  proposed: OwnershipInsertState;
}

export type DealGapAction =
  | DealUpdateAction
  | MilestoneUpdateAction
  | CitationUpdateAction
  | OwnershipUpdateAction
  | OwnershipDeleteAction
  | OwnershipInsertAction;

export interface QuarantinedFinding {
  legacyId: string;
  companyNames: string[];
  evidence: EvidenceReference;
  finding: string;
  reason: string;
}

export interface DealGapManifest {
  dealUpdates: readonly DealUpdateAction[];
  milestoneUpdates: readonly MilestoneUpdateAction[];
  citationUpdates: readonly CitationUpdateAction[];
  ownershipUpdates: readonly OwnershipUpdateAction[];
  ownershipDeletes: readonly OwnershipDeleteAction[];
  ownershipInserts: readonly OwnershipInsertAction[];
  protectedDeals: readonly DealSnapshot[];
  citationGuards: readonly CitationSnapshot[];
  ownershipGuards: readonly OwnershipSnapshot[];
  companyGuards: readonly CompanyGuard[];
  organizationGuards: readonly OrganizationGuard[];
  quarantinedFindings: readonly QuarantinedFinding[];
}

const astoundEvidence: EvidenceReference = {
  publisher: "Stonepeak",
  url: "https://stonepeak.com/news/gfiber-and-stonepeaks-astound-to-combine-creating-a-leading-independent-broadband-provider",
  evidenceDate: "2026-03-11",
  finding:
    "Stonepeak and Alphabet announced their agreement to combine Astound Broadband and GFiber on March 11, 2026, with closing expected in the fourth quarter of 2026.",
};

const bayonneEvidence: EvidenceReference = {
  publisher: "Morgan Stanley Infrastructure Partners",
  url: "https://www.morganstanley.com/press-releases/msip-agrees-to-sell-bayonne-energy-center",
  evidenceDate: "2026-03-17",
  finding:
    "MSIP announced its agreement to sell Bayonne Energy Center to Jupiter Energy Investor on March 17, 2026, with closing expected in the third quarter of 2026.",
};

const edgeConneXEvidence: EvidenceReference = {
  publisher: "EQT",
  url: "https://eqtgroup.com/news/eqt-introduces-ai-infrastructure-strategy-to-help-build-the-foundation-of-the-ai-economy-2026-04-21",
  evidenceDate: "2026-04-21",
  finding:
    "EQT described a dedicated AI Infrastructure strategy fully seeded by EdgeConneX; it did not state that EdgeConneX had completed a transfer from EQT Infrastructure into a new vehicle.",
};

const gateCityEvidence: EvidenceReference = {
  publisher: "Ara Partners",
  url: "https://www.arapartners.com/news/ara-energy-to-acquire-gate-city-power-gate-city-renewable-fuels-and-interest-in-jet-retail-network-for-875-million/",
  evidenceDate: "2026-03-11",
  finding:
    "Ara announced on March 11, 2026 that it had secured rights to acquire the Gate City portfolios from HF Capital, with closing still subject to conditions.",
};

const pembinaEvidence: EvidenceReference = {
  publisher: "Apollo",
  url: "https://www.apollo.com/insights-news/pressreleases/2026/04/apollo-funds-to-acquire-40-interest-in-pembina-gas-infrastructure-3279810",
  evidenceDate: "2026-04-23",
  finding:
    "Apollo announced on April 23, 2026 an agreement to acquire KKR's 40% PGI interest; Pembina retained 60% and closing was expected by the end of the second quarter.",
};

const pembina2022OwnershipEvidence: EvidenceReference = {
  publisher: "Pembina Pipeline / SEC",
  url: "https://www.sec.gov/Archives/edgar/data/1546066/000127956922001364/ex991.pdf",
  evidenceDate: "2022-08-15",
  finding:
    "Pembina's closing release records the 2022 PGI joint-venture close, with Pembina retaining 60% and KKR holding 40%.",
};

const rowanEvidence: EvidenceReference = {
  publisher: "Rowan Digital Infrastructure",
  url: "https://www.prnewswire.com/news-releases/rowan-digital-infrastructure-announces-strategic-recapitalization-302738729.html",
  evidenceDate: "2026-04-09",
  finding:
    "Rowan stated that Blackstone-affiliated funds acquired a significant minority interest and that Rowan remained backed by Quinbrook and Blackstone.",
};

const sabreEvidence: EvidenceReference = {
  publisher: "Blackstone",
  url: "https://www.blackstone.com/news/press/tpg-to-acquire-majority-stake-in-sabre-industries-from-blackstone-energy-transition-partners/",
  evidenceDate: "2026-02-05",
  finding:
    "Blackstone described a signed majority-sale agreement to TPG Rise Climate with closing expected in the second quarter; no closing announcement was found as of July 22, 2026.",
};

const verticalBridgeEvidence: EvidenceReference = {
  publisher: "Vertical Bridge",
  url: "https://www.verticalbridge.com/press-releases/vertical-bridge-announces-1-5-billion-strategic-equity-investment-from-kkr",
  evidenceDate: "2026-04-22",
  finding:
    "Vertical Bridge announced KKR's $1.5 billion strategic equity investment on April 22, primarily through KKR's core infrastructure strategy, with DigitalBridge and La Caisse also participating.",
};

const i3Evidence: EvidenceReference = {
  publisher: "T-Mobile",
  url: "https://www.t-mobile.com/news/business/t-mobile-add-two-strategic-fiber-joint-ventures-gonetspeed-greenlight-i3",
  evidenceDate: "2026-04-28",
  finding:
    "T-Mobile announced the Wren House joint-venture agreement on April 28, 2026, with closing expected in the second half of 2026 and an expected approximately $700 million T-Mobile investment.",
};

function withoutUpdatedAt(row: DealSnapshot): Omit<DealSnapshot, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = row;
  void _updatedAt;
  return rest;
}

const astoundDeal: DealSnapshot = {
  id: "cmnva4dfl05htm8lzoxfrhqr9",
  legacyId: "INF-2026-123",
  title: "Stonepeak / Alphabet combine GFiber with Astound Broadband",
  target: "GFiber / Astound Broadband",
  date: "2026-03-12T08:00:00.000",
  description:
    "Stonepeak and Alphabet announced the combination of GFiber with Stonepeak's Astound Broadband, creating a leading independent broadband provider.",
  keyHighlights: [
    "Stonepeak and Alphabet combine GFiber with Astound Broadband",
    "Creates a leading independent broadband provider in the United States",
  ],
  dealStatus: "ANNOUNCED",
  closingDate: null,
  recordStatus: "PUBLISHED",
  updatedAt: "2026-04-12T04:44:15.489000",
};

const edgeConneXDeal: DealSnapshot = {
  id: "cmoqc7ntm05z3171fxlx5azok",
  legacyId: "INF-2026-180",
  title: "EQT seeds AI Infrastructure strategy with EdgeConneX",
  target: "EdgeConneX",
  date: "2026-04-21T09:00:00.000",
  description:
    "EQT launched a dedicated AI Infrastructure strategy fully seeded by portfolio company EdgeConneX, transferring the data center platform from EQT Infrastructure into the new vehicle to support its growth trajectory. Since EQT’s 2020 acquisition, EdgeConneX has scaled capacity nearly 20x and plans to develop more than 10 GW of additional data center capacity, leveraging EQT’s broader infrastructure platform of 100+ GW energy pipeline, 90+ data centers and 29mm miles of fiber.",
  keyHighlights: [
    "EQT launched a dedicated AI Infrastructure strategy fully seeded by portfolio company EdgeConneX, transferring the data center platform from EQT Infrastructure into the new vehicle to support its growth trajectory. Since EQT’s 2020 acquisition, EdgeConneX has scaled capacity nearly 20x and plans to develop more than 10 GW of additional data center capacity, leveraging EQT’s broader infrastructure platform of 100+ GW energy pipeline, 90+ data centers and 29mm miles of fiber.",
  ],
  dealStatus: "ANNOUNCED",
  closingDate: null,
  recordStatus: "PUBLISHED",
  updatedAt: "2026-05-03T22:23:39.610000",
};

const edgeConneXDescription =
  "EQT launched a dedicated AI Infrastructure strategy fully seeded by portfolio company EdgeConneX to support its growth trajectory. Since EQT’s 2020 acquisition, EdgeConneX has scaled capacity nearly 20x and plans to develop more than 10 GW of additional data center capacity, leveraging EQT’s broader infrastructure platform of 100+ GW energy pipeline, 90+ data centers and 29mm miles of fiber.";

const gateCityDeal: DealSnapshot = {
  id: "cmnva4cny05hjm8lzwud37i6n",
  legacyId: "INF-2026-113",
  title:
    "Ara Partners acquires Gate City Power, Gate City Renewable Fuels, and JET from HF Capital",
  target: "Gate City Power / Gate City Renewable Fuels / JET",
  date: "2026-03-09T08:00:00.000",
  description:
    "Ara Energy, a portfolio platform of Ara Partners, agreed to acquire Gate City Power, Gate City Renewable Fuels, and an interest in the JET retail network from HF Capital for approximately $875mm. Gate City Power owns thermal generation assets totaling approximately 2.2 GW across NYISO and ISO-NE, while Gate City Renewable Fuels comprises U.S. ethanol production assets; the JET retail network will be acquired in partnership with Ara Infrastructure.",
  keyHighlights: [
    "Ara Energy acquires Gate City Power, Renewable Fuels, and JET from HF Capital for ~$875mm",
    "Gate City Power owns ~2.2 GW thermal generation across NYISO and ISO-NE",
    "JET retail network acquired in partnership with Ara Infrastructure",
  ],
  dealStatus: "ANNOUNCED",
  closingDate: null,
  recordStatus: "PUBLISHED",
  updatedAt: "2026-04-12T04:44:14.494000",
};

const pembinaDeal: DealSnapshot = {
  id: "cmoqc7o2g05z6171fujvq3wdw",
  legacyId: "INF-2026-183",
  title: "Apollo acquires KKR stake in Pembina Gas Infrastructure",
  target: "Pembina Gas Infrastructure (PGI)",
  date: "2026-04-20T08:00:00.000",
  description:
    "Apollo-managed funds agreed to acquire KKR’s 40% interest in Pembina Gas Infrastructure, with Pembina Pipeline retaining its 60% stake and existing governance unchanged; the deal is expected to close by the end of Q2 2026. PGI — formed as a JV between Pembina and KKR in 2022 — operates roughly 5 Bcf/d of processing capacity across 23 plants, ~3,900 km of gathering pipelines and ~330,000 bpd of NGL extraction serving Montney and Duvernay producers in Alberta and British Columbia.",
  keyHighlights: [
    "Apollo-managed funds agreed to acquire KKR’s 40% interest in Pembina Gas Infrastructure, with Pembina Pipeline retaining its 60% stake and existing governance unchanged; the deal is expected to close by the end of Q2 2026. PGI — formed as a JV between Pembina and KKR in 2022 — operates roughly 5 Bcf/d of processing capacity across 23 plants, ~3,900 km of gathering pipelines and ~330,000 bpd of NGL extraction serving Montney and Duvernay producers in Alberta and British Columbia.",
  ],
  dealStatus: "ANNOUNCED",
  closingDate: null,
  recordStatus: "PUBLISHED",
  updatedAt: "2026-05-03T22:23:39.928000",
};

const verticalBridgeDeal: DealSnapshot = {
  id: "cmoqc7nqw05z2171fcmdj2xty",
  legacyId: "INF-2026-179",
  title:
    "KKR invests $1.5bn in Vertical Bridge alongside DigitalBridge and La Caisse",
  target: "Vertical Bridge",
  date: "2026-04-23T09:00:00.000",
  description:
    "KKR is making a $1.5bn strategic equity investment in Vertical Bridge, joining existing sponsors DigitalBridge and La Caisse (formerly CDPQ), who both rolled into the new structure to establish a fully funded, long-term capital base. Vertical Bridge is the largest private owner and operator of communications infrastructure in the United States, with a portfolio of more than 17,000 towers; KKR has now deployed over $40bn of equity into digital infrastructure globally.",
  keyHighlights: [
    "KKR is making a $1.5bn strategic equity investment in Vertical Bridge, joining existing sponsors DigitalBridge and La Caisse (formerly CDPQ), who both rolled into the new structure to establish a fully funded, long-term capital base. Vertical Bridge is the largest private owner and operator of communications infrastructure in the United States, with a portfolio of more than 17,000 towers; KKR has now deployed over $40bn of equity into digital infrastructure globally.",
  ],
  dealStatus: "ANNOUNCED",
  closingDate: null,
  recordStatus: "PUBLISHED",
  updatedAt: "2026-05-03T22:23:39.512000",
};

const i3Deal: DealSnapshot = {
  id: "cmoqc7pe105zo171fkqrp0yu9",
  legacyId: "INF-2026-201",
  title: "Wren House and T-Mobile form joint venture to acquire i3 Broadband",
  target: "i3 Broadband",
  date: "2026-04-30T13:00:00.000",
  description:
    "T-Mobile entered into a definitive agreement to form a 50/50 joint venture with Wren House to acquire i3 Broadband, with T-Mobile expected to invest approximately $700mm for its 50% equity interest. i3 Broadband is a fiber-to-the-premises operator serving customers across Illinois, Missouri, and Rhode Island.",
  keyHighlights: [
    "T-Mobile entered into a definitive agreement to form a 50/50 joint venture with Wren House to acquire i3 Broadband, with T-Mobile expected to invest approximately $700mm for its 50% equity interest. i3 Broadband is a fiber-to-the-premises operator serving customers across Illinois, Missouri, and Rhode Island.",
  ],
  dealStatus: "ANNOUNCED",
  closingDate: null,
  recordStatus: "PUBLISHED",
  updatedAt: "2026-05-03T22:23:41.641000",
};

const protectedDeals: DealSnapshot[] = [
  {
    id: "cmnva46x805fhm8lz46mi1syf",
    legacyId: "INF-2026-038",
    title:
      "TPG Rise Climate acquires majority stake in Sabre Industries from Blackstone",
    target: "Sabre Industries",
    date: "2026-02-06T08:00:00.000",
    description:
      "TPG Rise Climate announced the acquisition of a majority stake in Sabre Industries from Blackstone.",
    keyHighlights: [
      "Majority stake buyout of Sabre Industries by TPG Rise Climate from Blackstone",
      "Sabre Industries is a leading manufacturer of utility-scale transmission and distribution equipment",
    ],
    dealStatus: "ANNOUNCED",
    closingDate: null,
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-12T04:44:07.053000",
  },
  {
    id: "cmnva4dyu05i0m8lziv0bctfu",
    legacyId: "INF-2026-130",
    title:
      "Morgan Stanley Infrastructure Partners divests Bayonne Energy Center to Jupiter Energy Investor",
    target: "Bayonne Energy Center",
    date: "2026-03-17T08:00:00.000",
    description:
      "Morgan Stanley Infrastructure Partners agreed to sell its stake in Thermal Bayonne Holdings, operator of the 660 MW Bayonne Energy Center, to Jupiter Energy Investor.",
    keyHighlights: [
      "MSIP divests Bayonne Energy Center (660 MW) to Jupiter Energy Investor",
      "Combined-cycle natural gas power plant in Bayonne, New Jersey",
    ],
    dealStatus: "ANNOUNCED",
    closingDate: null,
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-12T04:44:16.182000",
  },
  {
    id: "cmoqc7mft05yk171fbj6rf6in",
    legacyId: "INF-2026-161",
    title:
      "Blackstone acquires significant minority stake in Rowan Digital Infrastructure",
    target: "Rowan Digital Infrastructure",
    date: "2026-04-09T08:00:00.000",
    description:
      "Funds affiliated with Blackstone acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook. The investment supports Rowan’s U.S. hyperscale data-center development and capacity expansion.",
    keyHighlights: [
      "Funds affiliated with Blackstone acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook. The investment supports Rowan’s U.S. hyperscale data-center development and capacity expansion.",
    ],
    dealStatus: "CLOSED",
    closingDate: null,
    recordStatus: "PUBLISHED",
    updatedAt: "2026-07-22T20:45:42.090000",
  },
];

const ownershipGuards: OwnershipSnapshot[] = [
  {
    id: "cmoelb6n400fc2olzeal7fiy5",
    companyId: "cmnva0msm00eem8lzzj5e2uxi",
    companyName: "Astound Broadband",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zuq0002wm8lz4qeogdbh",
    organizationName: "Stonepeak",
    vehicleName: "Not publicly disclosed",
    stake: null,
    investmentYear: 2021,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:05:06.400000",
  },
  {
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
  {
    id: "cmoel8mya00clyqlzfa5e05u5",
    companyId: "cmnva108n010nm8lztvho67ta",
    companyName: "EdgeConneX",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zz8s004gm8lzdqsy41oy",
    organizationName: "EQT Infrastructure",
    vehicleName: "EQT Infrastructure IV, V",
    stake: null,
    investmentYear: 2020,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:03:07.570000",
  },
  {
    id: "cmoelb02q009t2olz7zuhjvwx",
    companyId: "cmnva0p6h00ibm8lzimyld7ll",
    companyName: "Rowan Digital Infrastructure",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zwqi003lm8lz8b6lw1bs",
    organizationName: "Quinbrook",
    vehicleName: "Founded by Quinbrook in 2022",
    stake: null,
    investmentYear: 2020,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:04:57.890000",
  },
  {
    id: "cmoxwgx3a01xmt01fgd30i4f7",
    companyId: "cmnva0p6h00ibm8lzimyld7ll",
    companyName: "Rowan Digital Infrastructure",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zow9000um8lzmxq856dz",
    organizationName: "Blackstone",
    vehicleName: "Strategic minority stake",
    stake: null,
    investmentYear: 2026,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:25:07.078000",
  },
  {
    id: "cmoel78gs0005xdlzzn413o7f",
    companyId: "cmnva0xcx00vim8lzauj488h7",
    companyName: "Sabre Industries",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zow9000um8lzmxq856dz",
    organizationName: "Blackstone",
    vehicleName: "Blackstone Energy Transition Partners",
    stake: null,
    investmentYear: 2021,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:02:02.140000",
  },
  {
    id: "cmoel7unc003ty1lzupyprwfy",
    companyId: "cmnva0yg100xfm8lzipn8kron",
    companyName: "Vertical Bridge",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zpyg0018m8lza55ef6ju",
    organizationName: "DigitalBridge",
    vehicleName: "DigitalBridge Equity",
    stake: null,
    investmentYear: 2014,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:02:30.888000",
  },
  {
    id: "cmoxwetvc01dtt01fjj7o93jf",
    companyId: "cmnva0yg100xfm8lzipn8kron",
    companyName: "Vertical Bridge",
    fundId: "cmnva0ilb00bcm8lzg800fpmz",
    fundName: "CDPQ Infrastructure",
    organizationId: "cmnv9zsx7002am8lzyo22qh5v",
    organizationName: "La Caisse de dépôt (CDPQ)",
    vehicleName: "CDPQ Infrastructure",
    stake: "30%",
    investmentYear: 2019,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:23:29.592000",
  },
  {
    id: "cmoxweu0u01dvt01fu93f2kjh",
    companyId: "cmnva0yg100xfm8lzipn8kron",
    companyName: "Vertical Bridge",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zsrd0028m8lz9ag8wlwr",
    organizationName: "KKR",
    vehicleName: "Strategic equity investment",
    stake: null,
    investmentYear: 2026,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:23:29.790000",
  },
  {
    id: "cmoelbnvw00e03alzlh3hm975",
    companyId: "cmnva0ra500lym8lzco0glku7",
    companyName: "i3 Broadband",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zxmt003vm8lzlvaadm9g",
    organizationName: "Wren House",
    vehicleName:
      "Wren House direct acquisition; exact stake details not disclosed in the cited public materials.",
    stake: null,
    investmentYear: 2020,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:05:28.748000",
  },
];

const companyGuards: CompanyGuard[] = [
  [
    "cmnva0msm00eem8lzzj5e2uxi",
    "Astound Broadband",
    "United States",
    "2026-04-25T17:05:06.499000",
  ],
  [
    "cmnva0p6h00ibm8lzimyld7ll",
    "Rowan Digital Infrastructure",
    "United States",
    "2026-04-25T17:04:58.011000",
  ],
  [
    "cmnva0ra500lym8lzco0glku7",
    "i3 Broadband",
    "United States",
    "2026-04-25T17:05:28.880000",
  ],
  [
    "cmnva0rwv00mdm8lz50afv9c7",
    "Bayonne Energy Center",
    "United States",
    "2026-04-25T17:04:36.964000",
  ],
  [
    "cmnva0u3800q6m8lzunge3dpu",
    "Gate City Power",
    "United States",
    "2026-04-25T17:01:18.948000",
  ],
  [
    "cmnva0u3v00q7m8lzeju2j5q0",
    "Gate City Renewable Fuels",
    "United States",
    "2026-04-25T17:01:19.125000",
  ],
  [
    "cmnva0xcx00vim8lzauj488h7",
    "Sabre Industries",
    "United States",
    "2026-04-25T17:02:02.250000",
  ],
  [
    "cmnva0yg100xfm8lzipn8kron",
    "Vertical Bridge",
    "United States",
    "2026-04-25T17:02:31.066000",
  ],
  [
    "cmnva108n010nm8lztvho67ta",
    "EdgeConneX",
    "United States",
    "2026-07-22T17:38:06.452000",
  ],
  [
    "cmnva14ug017ym8lzuudd6lxq",
    "Pembina Gas Infrastructure Inc.",
    "Canada",
    "2026-04-25T17:04:12.785000",
  ],
].map(([id, name, country, updatedAt]) => ({
  id,
  name,
  country,
  companyStatus: "ACTIVE",
  recordStatus: "PUBLISHED",
  updatedAt,
}));

export const REVIEWED_DEAL_GAP_MANIFEST: DealGapManifest = {
  dealUpdates: [
    {
      actionType: "DEAL_UPDATE",
      id: astoundDeal.id,
      evidence: astoundEvidence,
      current: astoundDeal,
      proposed: {
        ...withoutUpdatedAt(astoundDeal),
        date: "2026-03-11T08:00:00.000",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: edgeConneXDeal.id,
      evidence: edgeConneXEvidence,
      current: edgeConneXDeal,
      proposed: {
        ...withoutUpdatedAt(edgeConneXDeal),
        description: edgeConneXDescription,
        keyHighlights: [edgeConneXDescription],
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: gateCityDeal.id,
      evidence: gateCityEvidence,
      current: gateCityDeal,
      proposed: {
        ...withoutUpdatedAt(gateCityDeal),
        date: "2026-03-11T08:00:00.000",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: pembinaDeal.id,
      evidence: pembinaEvidence,
      current: pembinaDeal,
      proposed: {
        ...withoutUpdatedAt(pembinaDeal),
        date: "2026-04-23T08:00:00.000",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: verticalBridgeDeal.id,
      evidence: verticalBridgeEvidence,
      current: verticalBridgeDeal,
      proposed: {
        ...withoutUpdatedAt(verticalBridgeDeal),
        date: "2026-04-22T09:00:00.000",
      },
    },
    {
      actionType: "DEAL_UPDATE",
      id: i3Deal.id,
      evidence: i3Evidence,
      current: i3Deal,
      proposed: {
        ...withoutUpdatedAt(i3Deal),
        date: "2026-04-28T13:00:00.000",
      },
    },
  ],
  milestoneUpdates: [
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h8yn602wrw41fgm1vn96y",
      evidence: astoundEvidence,
      current: {
        id: "cmp1h8yn602wrw41fgm1vn96y",
        companyId: "cmnva0msm00eem8lzzj5e2uxi",
        companyName: "Astound Broadband",
        date: "Mar 2026",
        event:
          "Stonepeak and Alphabet announced an agreement to combine Astound with GFiber, with Stonepeak to be the majority shareholder of the new venture.",
        category: "OTHER",
        sortDate: "2026-03-01T05:00:00.000",
      },
      proposed: {
        id: "cmp1h8yn602wrw41fgm1vn96y",
        companyId: "cmnva0msm00eem8lzzj5e2uxi",
        companyName: "Astound Broadband",
        date: "Mar 11, 2026",
        event:
          "Stonepeak and Alphabet agreed to combine Astound Broadband with GFiber, with Stonepeak to be the majority shareholder; closing is expected in the fourth quarter of 2026.",
        category: "ACQUISITION",
        sortDate: "2026-03-11T04:00:00.000",
      },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h8rr402l5w41f8oub353u",
      evidence: bayonneEvidence,
      current: {
        id: "cmp1h8rr402l5w41f8oub353u",
        companyId: "cmnva0rwv00mdm8lz50afv9c7",
        companyName: "Bayonne Energy Center",
        date: "Mar 2026",
        event:
          "Morgan Stanley Infrastructure Partners announced an agreement to sell Bayonne Energy Center.",
        category: "DIVESTITURE",
        sortDate: "2026-03-01T05:00:00.000",
      },
      proposed: {
        id: "cmp1h8rr402l5w41f8oub353u",
        companyId: "cmnva0rwv00mdm8lz50afv9c7",
        companyName: "Bayonne Energy Center",
        date: "Mar 17, 2026",
        event:
          "Morgan Stanley Infrastructure Partners agreed to sell Bayonne Energy Center to Jupiter Energy Investor, with closing expected in the third quarter of 2026.",
        category: "DIVESTITURE",
        sortDate: "2026-03-17T04:00:00.000",
      },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h8mcz02bfw41f2ape6cu0",
      evidence: pembinaEvidence,
      current: {
        id: "cmp1h8mcz02bfw41f2ape6cu0",
        companyId: "cmnva14ug017ym8lzuudd6lxq",
        companyName: "Pembina Gas Infrastructure Inc.",
        date: "Apr 20, 2026",
        event:
          "KKR agreed to sell Pembina Gas Infrastructure (PGI) to Apollo Global Management.",
        category: "DIVESTITURE",
        sortDate: "2026-04-20T04:00:00.000",
      },
      proposed: {
        id: "cmp1h8mcz02bfw41f2ape6cu0",
        companyId: "cmnva14ug017ym8lzuudd6lxq",
        companyName: "Pembina Gas Infrastructure Inc.",
        date: "Apr 23, 2026",
        event:
          "KKR agreed to sell its 40% interest in Pembina Gas Infrastructure to Apollo-managed funds; Pembina retained 60%, with closing expected by the end of the second quarter of 2026.",
        category: "DIVESTITURE",
        sortDate: "2026-04-23T04:00:00.000",
      },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h7uqr016cw41f6iu6erow",
      evidence: verticalBridgeEvidence,
      current: {
        id: "cmp1h7uqr016cw41f6iu6erow",
        companyId: "cmnva0yg100xfm8lzipn8kron",
        companyName: "Vertical Bridge",
        date: "Apr 23, 2026",
        event:
          "KKR / DigitalBridge / La Caisse announced an investment in Vertical Bridge.",
        category: "FINANCING",
        sortDate: "2026-04-23T04:00:00.000",
      },
      proposed: {
        id: "cmp1h7uqr016cw41f6iu6erow",
        companyId: "cmnva0yg100xfm8lzipn8kron",
        companyName: "Vertical Bridge",
        date: "Apr 22, 2026",
        event:
          "KKR announced a $1.5 billion strategic equity investment in Vertical Bridge, primarily through its core infrastructure strategy; DigitalBridge and La Caisse also participated.",
        category: "FINANCING",
        sortDate: "2026-04-22T04:00:00.000",
      },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: "cmp1h947o036ew41f4splh6lj",
      evidence: i3Evidence,
      current: {
        id: "cmp1h947o036ew41f4splh6lj",
        companyId: "cmnva0ra500lym8lzco0glku7",
        companyName: "i3 Broadband",
        date: "Apr 30, 2026",
        event:
          "T-Mobile agreed to form a 50/50 joint venture with Wren House to acquire i3 Broadband.",
        category: "EXPANSION",
        sortDate: "2026-04-30T04:00:00.000",
      },
      proposed: {
        id: "cmp1h947o036ew41f4splh6lj",
        companyId: "cmnva0ra500lym8lzco0glku7",
        companyName: "i3 Broadband",
        date: "Apr 28, 2026",
        event:
          "T-Mobile agreed to form a 50/50 joint venture with Wren House to acquire i3 Broadband, with closing expected in the second half of 2026.",
        category: "ACQUISITION",
        sortDate: "2026-04-28T04:00:00.000",
      },
    },
  ],
  citationUpdates: [
    citationUpdate(
      "cmoxwosz60cwot01fq2fh9vj7",
      "cmnva4teb05w4m8lz8bh5jvib",
      "cmnva4dfl05htm8lzoxfrhqr9",
      "cmnva0msm00eem8lzzj5e2uxi",
      "SUPPORTING_CONTEXT",
      "Stonepeak — Astound Broadband",
      "Stonepeak",
      astoundEvidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "Stonepeak/Alphabet agreement to combine Astound and GFiber; expected Q4 2026 close.",
      astoundEvidence,
    ),
    citationUpdate(
      "cmoxwofj20c8at01fahgva73m",
      "cmnva4u0p05wim8lz3wxy2t3c",
      "cmnva4dyu05i0m8lziv0bctfu",
      "cmnva0rwv00mdm8lz50afv9c7",
      "SUPPORTING_CONTEXT",
      "Morganstanley — Bayonne Energy Center",
      "Morgan Stanley",
      bayonneEvidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "MSIP agreement to sell Bayonne to Jupiter; expected Q3 2026 close.",
      bayonneEvidence,
    ),
    citationUpdate(
      "cmoxwn8qs0a2nt01f0qnmvym6",
      "cmoqc90zg06g6171fc21qllv8",
      "cmoqc7ntm05z3171fxlx5azok",
      "cmnva108n010nm8lztvho67ta",
      "SUPPORTING_CONTEXT",
      "EQT - INF-2026-180 - EdgeConneX",
      "EQT",
      edgeConneXEvidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "EQT - INF-2026-180 - EdgeConneX",
      edgeConneXEvidence,
    ),
    citationUpdate(
      "cmnva97to08nkm8lz2pcs66oc",
      "cmnva97rx08njm8lzuuq15dkt",
      null,
      "cmnva0u3800q6m8lzunge3dpu",
      "SUPPORTING_CONTEXT",
      null,
      "Arapartners — Gate City Power",
      gateCityEvidence.url,
      "PRESS_RELEASE",
      "MILESTONE_EVENT",
      "Ara agreement to acquire Gate City Power from HF Capital; announced Mar 11, 2026, closing pending.",
      gateCityEvidence,
      "cmnva4cny05hjm8lzwud37i6n",
    ),
    citationUpdate(
      "cmnva97ya08nom8lzrjh58gw4",
      "cmnva97rx08njm8lzuuq15dkt",
      null,
      "cmnva0u3v00q7m8lzeju2j5q0",
      "SUPPORTING_CONTEXT",
      null,
      "Arapartners — Gate City Power",
      gateCityEvidence.url,
      "PRESS_RELEASE",
      "MILESTONE_EVENT",
      "Ara agreement to acquire Gate City Renewable Fuels from HF Capital; announced Mar 11, 2026, closing pending.",
      gateCityEvidence,
      "cmnva4cny05hjm8lzwud37i6n",
    ),
    citationUpdate(
      "cmoxwo4r60boxt01fh7qagdch",
      "cmoqc919906gc171fx7c364au",
      "cmoqc7o2g05z6171fujvq3wdw",
      "cmnva14ug017ym8lzuudd6lxq",
      "SUPPORTING_CONTEXT",
      "Apollo - INF-2026-183 - Pembina Gas Infrastructure (PGI)",
      "Apollo",
      pembinaEvidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "Apollo agreement to acquire KKR's 40% PGI interest; announced Apr 23, 2026, closing pending.",
      pembinaEvidence,
    ),
    citationUpdate(
      "cmoxwo4qm0bowt01f6q7dun3t",
      "cmnvaefzi0c1dm8lzpfyeb2s2",
      null,
      "cmnva14ug017ym8lzuudd6lxq",
      "FINANCING_FILINGS",
      "KKR closing confirmation",
      "SEC — Pembina Gas Infrastructure Inc.",
      pembina2022OwnershipEvidence.url,
      "SEC_FILING",
      "OWNERSHIP_INVESTMENT",
      "Pembina and KKR closed the PGI joint venture in 2022; KKR held 40% and Pembina held 60%.",
      pembina2022OwnershipEvidence,
    ),
    citationUpdate(
      "cmoxwoosf0cp7t01fb4i47t0e",
      "cmoqc8zb106f4171fyq1c4x65",
      "cmoqc7mft05yk171fbj6rf6in",
      "cmnva0p6h00ibm8lzimyld7ll",
      "SUPPORTING_CONTEXT",
      "PR Newswire - INF-2026-161 - Rowan Digital Infrastructure",
      "PR Newswire",
      rowanEvidence.url,
      "PRESS_RELEASE",
      "MILESTONE_EVENT",
      "Blackstone-affiliated funds acquired a significant minority stake; Rowan remained backed by Quinbrook and Blackstone.",
      rowanEvidence,
    ),
    citationUpdate(
      "cmoxwmar508ejt01fm5cnhkr2",
      "cmnvaarlo09o6m8lzg9du0853",
      null,
      "cmnva0xcx00vim8lzauj488h7",
      "OWNERSHIP_INVESTMENT",
      "Blackstone initial investment / ownership",
      "Blackstone — Sabre Industries",
      sabreEvidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "TPG signed majority acquisition; Blackstone retained current ownership pending close.",
      sabreEvidence,
      "cmnva46x805fhm8lz46mi1syf",
    ),
    citationUpdate(
      "cmoxwmpgn0944t01fieojuot5",
      "cmoqc90w506g4171frc362g7k",
      "cmoqc7nqw05z2171fcmdj2xty",
      "cmnva0yg100xfm8lzipn8kron",
      "SUPPORTING_CONTEXT",
      "Vertical Bridge - INF-2026-179 - Vertical Bridge",
      "Vertical Bridge",
      verticalBridgeEvidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "KKR $1.5bn investment, primarily through core infrastructure; DigitalBridge and La Caisse participated.",
      verticalBridgeEvidence,
    ),
    citationUpdate(
      "cmoxwp44e0dfyt01ffeogejts",
      "cmoqc92t406hc171fryyeu3gq",
      "cmoqc7pe105zo171fkqrp0yu9",
      "cmnva0ra500lym8lzco0glku7",
      "SUPPORTING_CONTEXT",
      "T-Mobile - INF-2026-201 - i3 Broadband",
      "T-Mobile",
      i3Evidence.url,
      "ARTICLE",
      "MILESTONE_EVENT",
      "T-Mobile/Wren House 50/50 JV agreement; pending 2H 2026 close and expected $700 million T-Mobile investment.",
      i3Evidence,
    ),
  ],
  ownershipUpdates: [
    {
      actionType: "OWNERSHIP_UPDATE",
      id: "cmoela18100a30slz15t9ca1t",
      evidence: pembinaEvidence,
      current: {
        id: "cmoela18100a30slz15t9ca1t",
        companyId: "cmnva14ug017ym8lzuudd6lxq",
        companyName: "Pembina Gas Infrastructure Inc.",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zsrd0028m8lz9ag8wlwr",
        organizationName: "KKR",
        vehicleName: "KKR Global Infrastructure Investors",
        stake: null,
        investmentYear: 2022,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:04:12.721000",
      },
      proposed: {
        id: "cmoela18100a30slz15t9ca1t",
        companyId: "cmnva14ug017ym8lzuudd6lxq",
        companyName: "Pembina Gas Infrastructure Inc.",
        fundId: null,
        fundName: null,
        organizationId: "cmnv9zsrd0028m8lz9ag8wlwr",
        organizationName: "KKR",
        vehicleName: "KKR Global Infrastructure Funds",
        stake: "40%",
        investmentYear: 2022,
        exitYear: null,
        isActive: true,
        createdAt: "2026-04-25T17:04:12.721000",
      },
    },
  ],
  ownershipDeletes: [
    ownershipDelete(
      "cmoel6b3d0010w2lzpiohn5sw",
      "cmnva0u3800q6m8lzunge3dpu",
      "Gate City Power",
      "cmnv9zno5000fm8lzlkca6kde",
      "Ara Partners",
      "Ara Energy",
      null,
      2026,
      gateCityEvidence,
    ),
    ownershipDelete(
      "cmoel6b8d0013w2lzjik5vh1d",
      "cmnva0u3v00q7m8lzeju2j5q0",
      "Gate City Renewable Fuels",
      "cmnv9zno5000fm8lzlkca6kde",
      "Ara Partners",
      "Ara Energy",
      null,
      2026,
      gateCityEvidence,
    ),
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoxwgcet01rxt01f6ah0r98b",
      evidence: pembinaEvidence,
      current: ownership(
        "cmoxwgcet01rxt01f6ah0r98b",
        "cmnva14ug017ym8lzuudd6lxq",
        "Pembina Gas Infrastructure Inc.",
        "cmnv9znlm000em8lzp6y6a9k0",
        "Apollo Global Management",
        "Announced acquisition of KKR's 40% interest",
        "40%",
        2026,
        "2026-05-09T05:24:40.277000",
      ),
    },
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoxwegwa01a5t01fz76n6sag",
      evidence: sabreEvidence,
      current: ownership(
        "cmoxwegwa01a5t01fz76n6sag",
        "cmnva0xcx00vim8lzauj488h7",
        "Sabre Industries",
        "cmnv9zvhd0036m8lzmm21ksk6",
        "TPG",
        "Signed agreement for TPG Rise Climate majority stake",
        "Majority",
        2026,
        "2026-05-09T05:23:12.778000",
      ),
    },
    {
      actionType: "OWNERSHIP_DELETE",
      id: "cmoel7ulq003sy1lznwoxc305",
      evidence: verticalBridgeEvidence,
      current: ownership(
        "cmoel7ulq003sy1lznwoxc305",
        "cmnva0yg100xfm8lzipn8kron",
        "Vertical Bridge",
        "cmnv9zsx7002am8lzyo22qh5v",
        "La Caisse de dépôt (CDPQ)",
        "CDPQ Infrastructure (30% Stake)",
        null,
        2019,
        "2026-04-25T17:02:30.830000",
      ),
    },
  ],
  ownershipInserts: [
    hfOwnershipInsert(
      "ownership_gate_city_power_hf_capital_current",
      "cmnva0u3800q6m8lzunge3dpu",
      "Gate City Power",
    ),
    hfOwnershipInsert(
      "ownership_gate_city_renewable_fuels_hf_capital_current",
      "cmnva0u3v00q7m8lzeju2j5q0",
      "Gate City Renewable Fuels",
    ),
  ],
  protectedDeals,
  citationGuards: [
    {
      id: "cmoxwlpoy07c8t01fqne8dgmc",
      sourceId: "cmnva97rx08njm8lzuuq15dkt",
      dealId: null,
      companyId: "cmnva0u3800q6m8lzunge3dpu",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Ara Partners transaction announcement",
      sourceLabel: "Arapartners — Gate City Power",
      sourceUrl: gateCityEvidence.url,
      sourceType: "PRESS_RELEASE",
    },
    {
      id: "cmoxwlps207cct01fii0esjn9",
      sourceId: "cmnva97rx08njm8lzuuq15dkt",
      dealId: null,
      companyId: "cmnva0u3v00q7m8lzeju2j5q0",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Ara Partners transaction announcement",
      sourceLabel: "Arapartners — Gate City Power",
      sourceUrl: gateCityEvidence.url,
      sourceType: "PRESS_RELEASE",
    },
  ],
  ownershipGuards,
  companyGuards,
  organizationGuards: [
    {
      id: "cmnva06z50077m8lzyelvyi5y",
      name: "HF Capital",
      types: ["FUND_MANAGER"],
      recordStatus: "PUBLISHED",
    },
  ],
  quarantinedFindings: [
    quarantine(
      "INF-2026-123",
      ["Astound Broadband"],
      astoundEvidence,
      "No close announcement was found; the official release expects a fourth-quarter 2026 close.",
    ),
    quarantine(
      "INF-2026-130",
      ["Bayonne Energy Center"],
      bayonneEvidence,
      "No close announcement was found; the official release expects a third-quarter 2026 close.",
    ),
    quarantine(
      "INF-2026-113",
      ["Gate City Power", "Gate City Renewable Fuels"],
      gateCityEvidence,
      "Ara's acquisition remained conditional, so HF Capital is retained as current owner.",
    ),
    quarantine(
      "INF-2026-183",
      ["Pembina Gas Infrastructure Inc."],
      pembinaEvidence,
      "No close announcement was found; KKR's 40% interest remains current.",
    ),
    quarantine(
      "INF-2026-038",
      ["Sabre Industries"],
      sabreEvidence,
      "No close announcement was found; Blackstone remains current owner.",
    ),
    quarantine(
      "INF-2026-179",
      ["Vertical Bridge"],
      verticalBridgeEvidence,
      "The release mixes future and present-effective language; status remains ANNOUNCED and the KKR owner is preserved pending judgment.",
    ),
    quarantine(
      "INF-2026-201",
      ["i3 Broadband"],
      i3Evidence,
      "No close announcement was found; Wren House remains current owner until the expected second-half close.",
    ),
  ],
};

function citationUpdate(
  id: string,
  sourceId: string,
  dealId: string | null,
  companyId: string,
  purpose: string,
  evidenceLabel: string | null,
  sourceLabel: string,
  sourceUrl: string,
  sourceType: string,
  proposedPurpose: string,
  proposedEvidenceLabel: string | null,
  evidence: EvidenceReference,
  proposedDealId = dealId,
): CitationUpdateAction {
  const current: CitationSnapshot = {
    id,
    sourceId,
    dealId,
    companyId,
    purpose,
    evidenceLabel,
    sourceLabel,
    sourceUrl,
    sourceType,
  };
  return {
    actionType: "CITATION_UPDATE",
    id,
    evidence,
    current,
    proposed: {
      ...current,
      dealId: proposedDealId,
      purpose: proposedPurpose,
      evidenceLabel: proposedEvidenceLabel,
    },
  };
}

function ownership(
  id: string,
  companyId: string,
  companyName: string,
  organizationId: string,
  organizationName: string,
  vehicleName: string,
  stake: string | null,
  investmentYear: number,
  createdAt: string,
): OwnershipSnapshot {
  return {
    id,
    companyId,
    companyName,
    fundId: null,
    fundName: null,
    organizationId,
    organizationName,
    vehicleName,
    stake,
    investmentYear,
    exitYear: null,
    isActive: true,
    createdAt,
  };
}

function ownershipDelete(
  id: string,
  companyId: string,
  companyName: string,
  organizationId: string,
  organizationName: string,
  vehicleName: string,
  stake: string | null,
  investmentYear: number,
  evidence: EvidenceReference,
): OwnershipDeleteAction {
  const createdAt =
    id === "cmoel6b3d0010w2lzpiohn5sw"
      ? "2026-04-25T17:01:18.889000"
      : "2026-04-25T17:01:19.069000";
  return {
    actionType: "OWNERSHIP_DELETE",
    id,
    evidence,
    current: ownership(
      id,
      companyId,
      companyName,
      organizationId,
      organizationName,
      vehicleName,
      stake,
      investmentYear,
      createdAt,
    ),
  };
}

function hfOwnershipInsert(
  id: string,
  companyId: string,
  companyName: string,
): OwnershipInsertAction {
  return {
    actionType: "OWNERSHIP_INSERT",
    id,
    evidence: gateCityEvidence,
    proposed: {
      id,
      companyId,
      companyName,
      fundId: null,
      fundName: null,
      organizationId: "cmnva06z50077m8lzyelvyi5y",
      organizationName: "HF Capital",
      vehicleName:
        "HF Capital ownership; seller in announced Ara transaction pending close",
      stake: null,
      investmentYear: null,
      exitYear: null,
      isActive: true,
    },
  };
}

function quarantine(
  legacyId: string,
  companyNames: string[],
  evidence: EvidenceReference,
  reason: string,
): QuarantinedFinding {
  return {
    legacyId,
    companyNames,
    evidence,
    finding:
      "Preserve incumbent ownership and announced lifecycle state until closing is supported by a primary source.",
    reason,
  };
}

function allActions(manifest = REVIEWED_DEAL_GAP_MANIFEST): DealGapAction[] {
  return [
    ...manifest.dealUpdates,
    ...manifest.milestoneUpdates,
    ...manifest.citationUpdates,
    ...manifest.ownershipUpdates,
    ...manifest.ownershipDeletes,
    ...manifest.ownershipInserts,
  ].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function dealGapActionSetSha256(): string {
  return sha256(allActions());
}

export function dealGapManifestSha256(): string {
  return sha256(REVIEWED_DEAL_GAP_MANIFEST);
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

function byId<T extends { id: string }>(
  label: string,
  rows: readonly T[],
): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (result.has(row.id)) {
      throw new Error(`${label} snapshot contains duplicate ID ${row.id}`);
    }
    result.set(row.id, row);
  }
  return result;
}

export function assertReviewedDealGapManifest(): void {
  const manifest = REVIEWED_DEAL_GAP_MANIFEST;
  const actions = allActions();
  if (actions.length !== REVIEWED_DEAL_GAP_ACTION_COUNT) {
    throw new Error(
      `Reviewed deal-gap action count is ${actions.length}; expected ${REVIEWED_DEAL_GAP_ACTION_COUNT}`,
    );
  }

  const allowedLegacyIds = new Set([
    "INF-2026-038",
    "INF-2026-113",
    "INF-2026-123",
    "INF-2026-130",
    "INF-2026-161",
    "INF-2026-179",
    "INF-2026-180",
    "INF-2026-183",
    "INF-2026-201",
  ]);
  for (const deal of [
    ...manifest.dealUpdates.map((action) => action.current),
    ...manifest.protectedDeals,
  ]) {
    if (!allowedLegacyIds.has(deal.legacyId)) {
      throw new Error(
        `Out-of-scope deal ${deal.legacyId} entered the manifest`,
      );
    }
  }

  const actionKeys = new Set<string>();
  const rowKeys = new Set<string>();
  for (const action of actions) {
    const actionKey = `${action.actionType}:${action.id}`;
    if (actionKeys.has(actionKey)) {
      throw new Error(`Duplicate deal-gap action ${actionKey}`);
    }
    actionKeys.add(actionKey);
    const rowKey = `${action.actionType.split("_")[0]}:${action.id}`;
    if (rowKeys.has(rowKey)) {
      throw new Error(`Multiple deal-gap mutations target ${rowKey}`);
    }
    rowKeys.add(rowKey);
    if (!action.evidence.url.startsWith("https://")) {
      throw new Error(`${actionKey} lacks HTTPS evidence`);
    }
  }

  for (const action of manifest.dealUpdates) {
    if (action.proposed.dealStatus !== action.current.dealStatus) {
      throw new Error(
        `${action.current.legacyId} must preserve lifecycle status`,
      );
    }
    if (action.proposed.closingDate !== action.current.closingDate) {
      throw new Error(`${action.current.legacyId} must preserve closingDate`);
    }
  }
  const verticalKkr = manifest.ownershipGuards.find(
    (row) => row.id === "cmoxweu0u01dvt01fu93f2kjh",
  );
  if (!verticalKkr?.isActive) {
    throw new Error(
      "Vertical Bridge KKR ownership must remain an active guard",
    );
  }
  if (
    manifest.citationGuards.length !== 2 ||
    manifest.citationGuards.some(
      (row) => row.purpose !== "OWNERSHIP_INVESTMENT" || row.dealId !== null,
    )
  ) {
    throw new Error(
      "Gate City ownership citations must remain unlinked ownership guards",
    );
  }
  if (
    manifest.protectedDeals.find((row) => row.legacyId === "INF-2026-038")
      ?.dealStatus !== "ANNOUNCED"
  ) {
    throw new Error("Sabre must remain ANNOUNCED");
  }
  if (
    manifest.ownershipInserts.some(
      (action) => action.proposed.organizationName !== "HF Capital",
    )
  ) {
    throw new Error("Only HF Capital current-owner inserts are reviewed");
  }
  if (
    manifest.quarantinedFindings.some(
      (finding) => !finding.evidence.url.startsWith("https://"),
    )
  ) {
    throw new Error("A quarantined finding lacks HTTPS evidence");
  }
  if (dealGapActionSetSha256() !== REVIEWED_DEAL_GAP_ACTION_SET_SHA256) {
    throw new Error(
      "Deal-gap action-set SHA-256 drifted from the reviewed constant",
    );
  }
  if (dealGapManifestSha256() !== REVIEWED_DEAL_GAP_MANIFEST_SHA256) {
    throw new Error(
      "Deal-gap manifest SHA-256 drifted from the reviewed constant",
    );
  }
}

export interface DealGapPlan {
  actions: DealGapAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    dealUpdates: number;
    milestoneUpdates: number;
    citationUpdates: number;
    ownershipUpdates: number;
    ownershipDeletes: number;
    ownershipInserts: number;
    protectedDeals: number;
    citationGuards: number;
    ownershipGuards: number;
    companyGuards: number;
    organizationGuards: number;
    quarantinedFindings: number;
  };
  quarantinedFindings: readonly QuarantinedFinding[];
}

export function buildDealGapReconciliationPlan(
  snapshot: DealGapSnapshot,
): DealGapPlan {
  assertReviewedDealGapManifest();
  const manifest = REVIEWED_DEAL_GAP_MANIFEST;

  const deals = byId("Deal", snapshot.deals);
  const expectedDeals = [
    ...manifest.dealUpdates.map((action) => action.current),
    ...manifest.protectedDeals,
  ];
  exact(
    "Deal ID set",
    [...deals.keys()].sort(),
    expectedDeals.map((row) => row.id).sort(),
  );
  for (const row of expectedDeals)
    exact(`Deal ${row.id}`, deals.get(row.id), row);

  const milestones = byId("Milestone", snapshot.milestones);
  exact(
    "Milestone ID set",
    [...milestones.keys()].sort(),
    manifest.milestoneUpdates.map((action) => action.id).sort(),
  );
  for (const action of manifest.milestoneUpdates) {
    exact(`Milestone ${action.id}`, milestones.get(action.id), action.current);
  }

  const citations = byId("Citation", snapshot.citations);
  const expectedCitations = [
    ...manifest.citationUpdates.map((action) => action.current),
    ...manifest.citationGuards,
  ];
  exact(
    "Citation ID set",
    [...citations.keys()].sort(),
    expectedCitations.map((row) => row.id).sort(),
  );
  for (const row of expectedCitations) {
    exact(`Citation ${row.id}`, citations.get(row.id), row);
  }
  if (snapshot.proposedCitationConflicts.length > 0) {
    throw new Error("A proposed deal-gap citation identity already conflicts");
  }

  const ownership = byId("OwnershipPeriod", snapshot.ownershipPeriods);
  const expectedOwnership = [
    ...manifest.ownershipUpdates.map((action) => action.current),
    ...manifest.ownershipDeletes.map((action) => action.current),
    ...manifest.ownershipGuards,
  ];
  exact(
    "OwnershipPeriod ID set",
    [...ownership.keys()].sort(),
    expectedOwnership.map((row) => row.id).sort(),
  );
  for (const row of expectedOwnership) {
    exact(`OwnershipPeriod ${row.id}`, ownership.get(row.id), row);
  }
  if (snapshot.proposedOwnershipConflicts.length > 0) {
    throw new Error(
      "A proposed HF Capital ownership identity already conflicts",
    );
  }

  const companies = byId("Company", snapshot.companies);
  exact(
    "Company ID set",
    [...companies.keys()].sort(),
    manifest.companyGuards.map((row) => row.id).sort(),
  );
  for (const row of manifest.companyGuards) {
    exact(`Company ${row.id}`, companies.get(row.id), row);
  }

  const organizations = byId("Organization", snapshot.organizations);
  exact(
    "Organization ID set",
    [...organizations.keys()].sort(),
    manifest.organizationGuards.map((row) => row.id).sort(),
  );
  for (const row of manifest.organizationGuards) {
    exact(`Organization ${row.id}`, organizations.get(row.id), row);
  }

  const actions = allActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: dealGapActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      dealUpdates: manifest.dealUpdates.length,
      milestoneUpdates: manifest.milestoneUpdates.length,
      citationUpdates: manifest.citationUpdates.length,
      ownershipUpdates: manifest.ownershipUpdates.length,
      ownershipDeletes: manifest.ownershipDeletes.length,
      ownershipInserts: manifest.ownershipInserts.length,
      protectedDeals: manifest.protectedDeals.length,
      citationGuards: manifest.citationGuards.length,
      ownershipGuards: manifest.ownershipGuards.length,
      companyGuards: manifest.companyGuards.length,
      organizationGuards: manifest.organizationGuards.length,
      quarantinedFindings: manifest.quarantinedFindings.length,
    },
    quarantinedFindings: manifest.quarantinedFindings,
  };
}
