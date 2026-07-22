import type { PortCo, PortCoOwner } from "./portco-types";

type LiveMilestoneCategory =
  | "FOUNDING"
  | "ACQUISITION"
  | "FINANCING"
  | "EXPANSION"
  | "MANAGEMENT"
  | "DIVESTITURE"
  | "IPO"
  | "OTHER";

type SourceType =
  | "WEBSITE"
  | "ARTICLE"
  | "PRESS_RELEASE"
  | "SEC_FILING"
  | "FORM_D"
  | "PRESENTATION"
  | "DATABASE";

type OrgType =
  | "FUND_MANAGER"
  | "CORPORATE"
  | "ADVISOR_FINANCIAL"
  | "ADVISOR_LEGAL"
  | "SOVEREIGN_WEALTH"
  | "PENSION"
  | "OTHER";

export interface July2026DealSource {
  readonly dealLegacyId: string;
  readonly label: string;
  readonly url: string;
  readonly type: SourceType;
  readonly purpose: "MILESTONE_EVENT";
  readonly evidenceLabel: string;
}

export interface July2026Milestone {
  readonly dealLegacyId: string;
  readonly date: string;
  readonly event: string;
  readonly category: LiveMilestoneCategory;
  readonly sortDate: string;
}

interface OwnershipState {
  readonly organizationName?: string;
  readonly fundId?: string | null;
  readonly vehicleName?: string | null;
  readonly stake?: string | null;
  readonly investmentYear?: number | null;
  readonly exitYear?: number | null;
  readonly isActive?: boolean;
}

export type July2026OwnershipOperation =
  | {
      readonly kind: "upsertOrganization";
      readonly name: string;
      readonly expected: { readonly exists: boolean };
      readonly set: {
        readonly types: readonly OrgType[];
        readonly status: "PUBLISHED";
      };
    }
  | {
      readonly kind: "upsertPeriod";
      readonly organizationName: string;
      readonly vehicleName: string;
      readonly expected: { readonly exists: boolean } & OwnershipState;
      readonly set: OwnershipState;
    }
  | {
      readonly kind: "updatePeriod";
      readonly periodId: string;
      readonly expected: OwnershipState;
      readonly set: OwnershipState;
    }
  | {
      readonly kind: "deletePeriod";
      readonly periodId: string;
      readonly expected: OwnershipState;
    };

interface SeedOwnerPatch {
  readonly match: {
    readonly investmentFirm: string;
    readonly ownershipVehicle?: string;
  };
  readonly set: Partial<PortCoOwner>;
}

interface SeedPatch {
  readonly name?: string;
  readonly status?: "Active" | "Realized";
  readonly ownerUpdates?: readonly SeedOwnerPatch[];
  readonly ownerUpserts?: readonly PortCoOwner[];
}

export interface July2026CompanyUpdate {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly status: "PUBLISHED";
  readonly expectedCompanyStatus: "ACTIVE" | "REALIZED";
  readonly setCompanyStatus?: "ACTIVE" | "REALIZED";
  readonly updatedAt: string;
  readonly expectedDescriptionSha256: string;
  readonly narrativeAppend: string;
  readonly sources: readonly July2026DealSource[];
  readonly milestones: readonly July2026Milestone[];
  readonly ownershipOperations?: readonly July2026OwnershipOperation[];
  readonly seedPatch?: SeedPatch;
}

const source = (
  dealLegacyId: string,
  label: string,
  url: string,
  evidenceLabel: string,
  type: SourceType = "ARTICLE",
): July2026DealSource => ({
  dealLegacyId,
  label,
  url,
  type,
  purpose: "MILESTONE_EVENT",
  evidenceLabel,
});

export const july2026DealSources = {
  mobius: source(
    "WB-2026-05-02-002",
    "Airliquide",
    "https://www.airliquide.com/group/press-releases-news/2026-05-04/air-liquide-divests-its-biogas-production-activities-four-countries",
    "Air Liquide biogas activities divestiture to Mobius Renewables",
  ),
  bayWa: source(
    "WB-2026-05-02-005",
    "Baywa Re",
    "https://www.baywa-re.com/en/news/fervo-acquires-baywa-r-e-power-solutions",
    "BayWa r.e. Power Solutions divestiture to Fervo",
  ),
  accelerate: source(
    "WB-2026-05-02-006",
    "Cbreim",
    "https://www.cbreim.com/press-releases/cbre-im-backed-accelerate-surpasses-1-25-billion-dollars-of-equity-commitments",
    "Accelerate $630 million primary capital raise and disclosed investors",
  ),
  h2o: source(
    "WB-2026-05-02-011",
    "GlobeNewswire",
    "https://www.globenewswire.com/news-release/2026/05/04/3286757/0/en/H2O-Innovation-Enters-the-UV-Disinfection-Market-with-the-Acquisition-of-bestUV.html",
    "H2O Innovation acquisition of bestUV",
  ),
  infinity: source(
    "INF-2026-210",
    "Infinity Aviation Group",
    "https://www.globenewswire.com/news-release/2026/05/12/3293191/0/en/Infinity-Aviation-Group-Expands-Private-Jet-FBO-Network-Acquires-Corporate-Air-in-Vero-Beach-FL.html",
    "Infinity Aviation Group acquisition of Corporate Air",
  ),
  caturus: source(
    "INF-2026-222",
    "Mubadala Energy",
    "https://mubadalaenergy.com/news/mubadala-energy-kimmeridge-and-cpp-investments-announce-final-investment-decision-for-caturus-commonwealth-lng-investment-in-the-u-s/",
    "Caturus and Commonwealth LNG FID, financing, and disclosed equity interests",
  ),
  gridStor: source(
    "WB-2026-05-16-004",
    "Gridstor",
    "https://gridstor.com/gridstor-acquires-colorado-battery-energy-storage-project-from-accelergen/",
    "GridStor acquisition of the 199 MW / 796 MWh Birdseye project",
  ),
  plenaryIsc: source(
    "WB-2026-05-16-014",
    "Information Services Corporation",
    "https://isc.gcs-web.com/news-releases/news-release-details/isc-be-acquired-plenary-americas-all-cash-transaction",
    "Plenary Americas agreement to acquire ISC",
    "PRESS_RELEASE",
  ),
  plenaryIscClose: source(
    "WB-2026-05-16-014",
    "Information Services Corporation",
    "https://investors.isc.ca/news-releases/news-release-details/isc-and-plenary-americas-announce-completion-transaction",
    "Plenary Americas completed its acquisition of ISC on July 6, 2026",
    "PRESS_RELEASE",
  ),
  voltera: source(
    "WB-2026-05-23-003",
    "Volterapower",
    "https://www.volterapower.com/post/voltera-and-revel-announce-combination-to-create-scaled-ev-infrastructure-platform-for-fleet-and-autonomous-mobility",
    "Pending combination of Voltera and Revel",
  ),
  gsPower: source(
    "WB-2026-06-06-006",
    "Gspowerpartners",
    "https://gspowerpartners.com/gs-power-partners-secures-51m-tax-equity-financing-for-41-mw-community-solar-portfolio/",
    "GS Power Partners $51 million tax-equity financing",
  ),
  repsol: source(
    "WB-2026-06-13-003",
    "Masdar",
    "https://masdar.ae/en/news/newsroom/repsol-and-masdar-to-partner-in-renewables-portfolio-in-spain",
    "Repsol agreement to sell 49.99% of a Spanish renewables portfolio to Masdar",
  ),
  illinoisSolar: source(
    "WB-2026-06-13-005",
    "Business Wire",
    "https://www.businesswire.com/news/home/20260608197151/en/38-Degrees-North-Acquires-104-MW-Community-Solar-Portfolio-in-Illinois-from-Cypress-Creek",
    "104 MW Illinois community-solar portfolio transaction",
  ),
  a25: source(
    "WB-2026-06-13-012",
    "Lacaisse",
    "https://www.lacaisse.com/en/news/pressreleases/caisse-become-sole-owner-a25-concession-acquiring-transurbans-remaining-stake",
    "La Caisse agreement to acquire the remaining 50% of A25",
  ),
  plenaryUk: source(
    "WB-2026-06-13-013",
    "Plenary",
    "https://plenary.com/news/fc-uk-central-utility-plant-project",
    "University of Kentucky central utility plant P3 financial close",
  ),
  altavair: source(
    "WB-2026-06-20-001",
    "Business Wire",
    "https://www.businesswire.com/news/home/20260617498140/en/KKR-Commits-%241.4-Billion-to-Aircraft-Leasing-with-Altavair",
    "KKR $1.4 billion aircraft-leasing commitment with Altavair",
  ),
  logistec: source(
    "WB-2026-06-20-002",
    "Enstructure",
    "https://enstructure.com/enstructure-to-acquire-logistec-marine-terminal-division-creating-a-leading-network-of-marine-terminals-across-north-america/",
    "Pending sale of LOGISTEC Marine Terminal Division to Enstructure",
  ),
  electrada: source(
    "WB-2026-06-20-003",
    "Inspirationmobility",
    "https://inspirationmobility.com/news/inspiration-mobility-group-acquires-electrada-assets-to-scale-end-to-end-electric-fuel-solutions-for-commercial-fleets",
    "Inspiration Mobility acquisition of selected Electrada assets",
  ),
  kaps: source(
    "WB-2026-06-20-010",
    "Keyera",
    "https://www.keyera.com/news-and-stories/news-releases/keyera-announces-acquisition-of-remaining-50-interest-in-kaps/",
    "Keyera completed acquisition of Stonepeak's remaining 50% KAPS interest",
  ),
  terraGen: source(
    "WB-2026-06-27-003",
    "Investegate",
    "https://www.investegate.co.uk/announcement/rns/pantheon-infrastructure--pint/investment-in-us-renewable-energy-company/9628756",
    "Pantheon Infrastructure commitment to Terra-Gen co-investment",
  ),
  edgeConnex: source(
    "WB-2026-07-03-009",
    "Newswire",
    "https://www.newswire.ca/news-releases/cpp-investments-partners-with-eqt-to-support-global-digital-infrastructure-growth-826226428.html",
    "CPP Investments $1.75 billion investment alongside EQT led by EdgeConneX",
  ),
  ubiquity: source(
    "WB-2026-07-03-016",
    "Intrepidfiber",
    "https://www.intrepidfiber.com/news/intrepid-fiber-networks-to-acquire-ubiquitys-southern-california-fiber-network/",
    "Pending sale of Ubiquity's Southern California fiber network",
  ),
  cardinal: source(
    "WB-2026-07-03-021",
    "Encapinvestments",
    "https://www.encapinvestments.com/news/cardinal-midstream-partners-and-encap-flatrock-announce-sale-delaware-basin-assets-san-mateo",
    "Pending $752 million Cardinal Delaware Basin asset sale",
  ),
  greatBay: source(
    "WB-2026-07-10-001",
    "Altiusminerals",
    "https://altiusminerals.com/_resources/press-releases/nr-20260710.pdf",
    "Pending Great Bay and ARR ownership transactions",
    "PRESENTATION",
  ),
  copia: source(
    "WB-2026-07-10-002",
    "Eqtgroup",
    "https://eqtgroup.com/news/eqt-to-acquire-copia-power-a-leading-integrated-power-and-ai-infrastructure-platform-2026-07-09",
    "Pending EQT acquisition of Copia Power",
  ),
  sabey: source(
    "WB-2026-07-10-011",
    "GlobeNewswire",
    "https://www.globenewswire.com/news-release/2026/07/08/3324085/0/en/sabey-data-center-properties-welcomes-strategic-investment-from-ares-strengthening-platform-for-continued-growth.html",
    "Ares minority investment in Sabey Data Center Properties",
  ),
  summit: source(
    "WB-2026-07-17-002",
    "GlobeNewswire",
    "https://www.globenewswire.com/news-release/2026/07/14/3326975/0/en/global-infrastructure-partners-agrees-to-acquire-summit-ridge-energy.html",
    "Pending GIP acquisition of a controlling interest in Summit Ridge Energy",
  ),
  clearGen: source(
    "WB-2026-07-17-006",
    "Business Wire",
    "https://www.businesswire.com/news/home/20260714806483/en/ClearGen-Acquires-19-MW-Portfolio-of-Operating-Distributed-Generation-Solar-Assets",
    "ClearGen acquisition of ten operating solar projects totaling 19 MW",
  ),
  liberty: source(
    "WB-2026-07-17-008",
    "Libertytire",
    "https://libertytire.com/About/News/Liberty-Tire-Recycling-Strengthens-Gulf-Coast-Operations-and-Recycling-Efforts-with-Strategic-Acquisitions/",
    "Liberty Tire Recycling acquisitions of All American Tire, Colt Tire Recycling, and Genan",
  ),
} as const;

const milestone = (
  dealLegacyId: string,
  date: string,
  sortDate: string,
  event: string,
  category: LiveMilestoneCategory,
): July2026Milestone => ({ dealLegacyId, date, sortDate, event, category });

const publishedActive = {
  status: "PUBLISHED" as const,
  expectedCompanyStatus: "ACTIVE" as const,
};

export const july2026PortfolioDealUpdateManifest = {
  version: "2026-07-22.1",
  batch: "july-21-2026-sync-148",
  approvedAt: "2026-07-22",
  scope: {
    syncedDealCount: 148,
    matchedDealCount: 28,
    noExistingCompanyMatchDealCount: 120,
    canonicalCompanyCount: 31,
    liveCompanyRowCount: 33,
    duplicateClustersPreserved: [
      ["Caturus", "Caturus Energy"],
      ["GS Power Partners", "Green Street Power Partners"],
    ],
  },
  companies: [
    {
      id: "cmnva13m1016hm8lzzalryzuc",
      name: "Mobius Renewables",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:57.827Z",
      expectedDescriptionSha256:
        "2a6d30a7efa33980f63580cdfbd78c242f20bc2acc482ce11b745d0c03ede062",
      narrativeAppend:
        "In May 2026, Mobius agreed to acquire Air Liquide's biogas production and distribution activities in the United States, France, Norway, and Sweden, expanding the platform beyond GreenGasUSA.",
      sources: [july2026DealSources.mobius],
      milestones: [
        milestone(
          "WB-2026-05-02-002",
          "May 8, 2026",
          "2026-05-08",
          "Agreed to acquire Air Liquide's biogas production and distribution activities in the United States, France, Norway, and Sweden.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0s7a00mwm8lzxn1f2868",
      name: "BayWa r.e. AG",
      country: "United States / Mexico",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:00.430Z",
      expectedDescriptionSha256:
        "a656ca9fa29a09ff5f24a34476f568ff6f9dcbc94cb3788ea4844df697781566",
      narrativeAppend:
        "In May 2026, BayWa r.e. completed the divestiture of BayWa r.e. Power Solutions to Fervo; the Italian commercial-and-industrial solar and storage business had installed more than 120 MWp and reported annual revenue above €20 million.",
      sources: [july2026DealSources.bayWa],
      milestones: [
        milestone(
          "WB-2026-05-02-005",
          "May 8, 2026",
          "2026-05-08",
          "Completed the divestiture of BayWa r.e. Power Solutions to Fervo, including a business with more than 120 MWp installed.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva0y3f00wsm8lz8ghiksys",
      name: "Accelerate Infrastructure Opportunities",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:16.822Z",
      expectedDescriptionSha256:
        "02f9ebd2339fa3b24146cf90058c7baa660e468a578796b067b57df4140e8f65",
      narrativeAppend:
        "In May 2026, Accelerate closed a $630 million primary capital raise that increased total equity commitments to $1.26 billion, with new capital from Mubadala, Australian Retirement Trust, and other investors alongside CBRE IM-managed funds.",
      sources: [july2026DealSources.accelerate],
      milestones: [
        milestone(
          "WB-2026-05-02-006",
          "May 8, 2026",
          "2026-05-08",
          "Closed a $630 million primary capital raise, increasing total equity commitments to $1.26 billion and adding Mubadala and Australian Retirement Trust as investors.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertPeriod",
          organizationName: "Mubadala",
          vehicleName: "Direct platform investment",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: null,
            investmentYear: 2026,
            exitYear: null,
            isActive: true,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Australian Retirement Trust",
          vehicleName: "Direct platform investment",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: null,
            investmentYear: 2026,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpserts: [
          {
            investmentFirm: "Mubadala",
            ownershipVehicle: "Direct platform investment",
            investmentYear: 2026,
            status: "Active",
          },
          {
            investmentFirm: "Australian Retirement Trust",
            ownershipVehicle: "Direct platform investment",
            investmentYear: 2026,
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva10ir0113m8lzk0e3tavw",
      name: "H2O Innovation Inc.",
      country: "United States / Canada",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:01.901Z",
      expectedDescriptionSha256:
        "77633ff482d45ca261a2a9cfbdb945f04fa54bf6d8029b01e737d14bcce052c9",
      narrativeAppend:
        "In May 2026, H2O Innovation acquired Dutch ultraviolet-disinfection specialist bestUV, adding proprietary UV reactors for municipal, industrial, maritime, and other water-treatment applications.",
      sources: [july2026DealSources.h2o],
      milestones: [
        milestone(
          "WB-2026-05-02-011",
          "May 8, 2026",
          "2026-05-08",
          "Acquired bestUV, entering the ultraviolet water-disinfection market and adding proprietary reactor technology.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva13q0016nm8lzhdq43gms",
      name: "Infinity Aviation Group",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:58.646Z",
      expectedDescriptionSha256:
        "adc02ee8708258cf56ec8dd755796ca28656ed00fae17207a45d7b4089b919eb",
      narrativeAppend:
        "In May 2026, Infinity Aviation acquired Corporate Air at Vero Beach Regional Airport, adding eight hangars, a passenger terminal, a large ramp, and on-site customs clearance to its FBO network.",
      sources: [july2026DealSources.infinity],
      milestones: [
        milestone(
          "INF-2026-210",
          "May 12, 2026",
          "2026-05-12",
          "Acquired Corporate Air at Vero Beach Regional Airport, expanding the FBO network into South Florida.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmoqc056t00p9171fz56fldhu",
      name: "Caturus",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-05-04T02:17:48.869Z",
      expectedDescriptionSha256:
        "39c307e8ea16d63bef50499299b522d53e7c3c70f24e6a827e65282680aeda7e",
      narrativeAppend:
        "In May 2026, Caturus reached positive final investment decision and closed $9.75 billion of project financing for the 9.5 mtpa Commonwealth LNG facility; the transaction materials disclosed CPP Investments at 31% and Mubadala Energy at 24.1% of Caturus, with Kimmeridge remaining an owner.",
      sources: [july2026DealSources.caturus],
      milestones: [
        milestone(
          "INF-2026-222",
          "May 15, 2026",
          "2026-05-15",
          "Reached positive FID and closed $9.75 billion of financing for Commonwealth LNG; CPP Investments and Mubadala Energy held 31% and 24.1% interests in Caturus, respectively.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertPeriod",
          organizationName: "CPP Investments",
          vehicleName: "Sustainable Energies",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "31%",
            investmentYear: 2025,
            exitYear: null,
            isActive: true,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Mubadala",
          vehicleName: "Mubadala Energy strategic investment",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "24.1%",
            investmentYear: 2025,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpserts: [
          {
            investmentFirm: "CPP Investments",
            ownershipVehicle: "Sustainable Energies",
            investmentYear: 2025,
            stake: "31%",
            status: "Active",
          },
          {
            investmentFirm: "Mubadala",
            ownershipVehicle: "Mubadala Energy strategic investment",
            investmentYear: 2025,
            stake: "24.1%",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva0yoj00xum8lzwg8dmzod",
      name: "Caturus Energy",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:39.676Z",
      expectedDescriptionSha256:
        "99e5b6d1d2f24ebe5a3bc22a738f52e6ff930d3d4c4de103d952666a0b0a1a84",
      narrativeAppend:
        "By the May 2026 Commonwealth LNG final investment decision, CPP Investments had increased its Caturus interest to 31%, Mubadala Energy held 24.1%, and Kimmeridge remained an owner; the platform simultaneously closed $9.75 billion of financing for the 9.5 mtpa project.",
      sources: [july2026DealSources.caturus],
      milestones: [
        milestone(
          "INF-2026-222",
          "May 15, 2026",
          "2026-05-15",
          "Reached positive FID and closed $9.75 billion of financing for Commonwealth LNG; CPP Investments increased its Caturus interest to 31% and Mubadala Energy held 24.1%.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "updatePeriod",
          periodId: "cmoel81d7009dy1lzwgzgpsja",
          expected: {
            organizationName: "CPP Investments",
            fundId: null,
            vehicleName: "Sustainable Energies",
            stake: null,
            investmentYear: 2025,
            exitYear: null,
            isActive: true,
          },
          set: {
            fundId: null,
            stake: "31%",
            investmentYear: 2025,
            exitYear: null,
            isActive: true,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Mubadala",
          vehicleName: "Mubadala Energy strategic investment",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "24.1%",
            investmentYear: 2025,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpdates: [
          {
            match: {
              investmentFirm: "CPP Investments",
              ownershipVehicle: "Sustainable Energies",
            },
            set: { stake: "31%" },
          },
        ],
        ownerUpserts: [
          {
            investmentFirm: "Mubadala",
            ownershipVehicle: "Mubadala Energy strategic investment",
            investmentYear: 2025,
            stake: "24.1%",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva0rsz00m6m8lzkjjqwuws",
      name: "Commonwealth LNG",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:04:39.525Z",
      expectedDescriptionSha256:
        "e0dd74c48c19e23de1bb749052c90a986c8c38793fe45d893349c5c79e69b3de",
      narrativeAppend:
        "In May 2026, Commonwealth LNG reached positive final investment decision and closed $9.75 billion of project financing for its 9.5 mtpa Louisiana export facility; its parent Caturus was 31% owned by CPP Investments and 24.1% by Mubadala Energy, with Kimmeridge remaining an owner.",
      sources: [july2026DealSources.caturus],
      milestones: [
        milestone(
          "INF-2026-222",
          "May 15, 2026",
          "2026-05-15",
          "Reached positive FID and closed $9.75 billion of project financing for the 9.5 mtpa LNG export facility.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertPeriod",
          organizationName: "CPP Investments",
          vehicleName: "Indirect via CPP Investments' 31% stake in Caturus",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "Indirect 31% at Caturus level",
            investmentYear: 2025,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpserts: [
          {
            investmentFirm: "CPP Investments",
            ownershipVehicle:
              "Indirect via CPP Investments' 31% stake in Caturus",
            investmentYear: 2025,
            stake: "Indirect 31% at Caturus level",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva128m0145m8lzcd4okvua",
      name: "GridStor",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:33.608Z",
      expectedDescriptionSha256:
        "929e2236b073b9781e1325b89ec84c3a1037283bd95c945df9b3e0a207a238c5",
      narrativeAppend:
        "In May 2026, GridStor acquired the 199 MW / 796 MWh Birdseye battery-storage project in Adams County, Colorado, with construction expected as early as 2027 and commercial operation targeted by the end of 2028.",
      sources: [july2026DealSources.gridStor],
      milestones: [
        milestone(
          "WB-2026-05-16-004",
          "May 22, 2026",
          "2026-05-22",
          "Acquired the 199 MW / 796 MWh Birdseye battery-storage project in Adams County, Colorado from Accelergen.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0yc800x8m8lziecgny4n",
      name: "Plenary Americas",
      country: "United States / Canada",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:29.276Z",
      expectedDescriptionSha256:
        "d338de289aa440782e4cf3f4ba9a2425ad86ca7f8401d93e49244ffcd6f73ee5",
      narrativeAppend:
        "In May through July 2026, Plenary Americas agreed to and completed its approximately C$1.2 billion implied-enterprise-value acquisition of Information Services Corporation; during June, it was also designated to assume the operating role at A25 upon completion of La Caisse's remaining-interest acquisition and reached financial close on the University of Kentucky Central Utility Plant P3.",
      sources: [
        july2026DealSources.plenaryIsc,
        july2026DealSources.plenaryIscClose,
        july2026DealSources.a25,
        july2026DealSources.plenaryUk,
      ],
      milestones: [
        milestone(
          "WB-2026-05-16-014",
          "May 19, 2026",
          "2026-05-19",
          "Entered into an all-cash agreement to acquire Information Services Corporation for C$51.00 per share at an approximate C$1.2 billion enterprise value.",
          "ACQUISITION",
        ),
        milestone(
          "WB-2026-05-16-014",
          "July 6, 2026",
          "2026-07-06",
          "Completed the acquisition of Information Services Corporation through a wholly owned subsidiary for C$51.00 per share at an approximate implied enterprise value of C$1.2 billion.",
          "ACQUISITION",
        ),
        milestone(
          "WB-2026-06-13-012",
          "June 12, 2026",
          "2026-06-12",
          "Was designated to assume the operating role for A25 when La Caisse completes its acquisition of Transurban's remaining 50% interest.",
          "EXPANSION",
        ),
        milestone(
          "WB-2026-06-13-013",
          "June 12, 2026",
          "2026-06-12",
          "Reached financial close on the University of Kentucky Central Utility Plant public-private partnership.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "deletePeriod",
          periodId: "cmoel7tbt002my1lzkr8hkr23",
          expected: {
            organizationName: "La Caisse de dépôt (CDPQ)",
            fundId: null,
            vehicleName: "CDPQ Infrastructure (100% Stake)",
            stake: null,
            investmentYear: 2020,
            exitYear: null,
            isActive: true,
          },
        },
      ],
    },
    {
      id: "cmnva10ez010xm8lzxkk6b9gt",
      name: "Voltera",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:09.434Z",
      expectedDescriptionSha256:
        "69110427a2f1bc547eca57f01a34ffee1748e682a65c70014dbd23a0cb16d439",
      narrativeAppend:
        "In May 2026, Voltera agreed to combine with Revel into an urban fast-charging platform expected to have more than 1,000 operational and development charging stalls across 11 U.S. metropolitan markets; EQT remains Voltera's owner pending completion.",
      sources: [july2026DealSources.voltera],
      milestones: [
        milestone(
          "WB-2026-05-23-003",
          "May 29, 2026",
          "2026-05-29",
          "Signed a definitive agreement to combine with Revel into a fast-charging platform spanning more than 1,000 stalls across 11 U.S. metropolitan markets.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0zs500ztm8lzhhms21x7",
      name: "GS Power Partners",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:46.169Z",
      expectedDescriptionSha256:
        "27c8cc8f68b458ca51581d320fb1325be8f52050881e2c1cf5e69bb532a17eba",
      narrativeAppend:
        "In June 2026, GS Power Partners closed $51 million of tax-equity financing for a 41 MWdc community-solar portfolio across New York, Maryland, and Illinois, supporting a broader operating and construction portfolio of more than 400 MW.",
      sources: [july2026DealSources.gsPower],
      milestones: [
        milestone(
          "WB-2026-06-06-006",
          "June 5, 2026",
          "2026-06-05",
          "Closed $51 million of tax-equity financing for a 41 MWdc community-solar portfolio across New York, Maryland, and Illinois.",
          "FINANCING",
        ),
      ],
    },
    {
      id: "cmnva0z0j00ygm8lzzolx4281",
      name: "Green Street Power Partners",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:45.949Z",
      expectedDescriptionSha256:
        "27c8cc8f68b458ca51581d320fb1325be8f52050881e2c1cf5e69bb532a17eba",
      narrativeAppend:
        "In June 2026, GS Power Partners closed $51 million of tax-equity financing for a 41 MWdc community-solar portfolio across New York, Maryland, and Illinois, supporting a broader operating and construction portfolio of more than 400 MW.",
      sources: [july2026DealSources.gsPower],
      milestones: [
        milestone(
          "WB-2026-06-06-006",
          "June 5, 2026",
          "2026-06-05",
          "Closed $51 million of tax-equity financing for a 41 MWdc community-solar portfolio across New York, Maryland, and Illinois.",
          "FINANCING",
        ),
      ],
    },
    {
      id: "cmnva0s8b00mym8lzoao2r130",
      name: "Repsol Renovables, S.A.",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:00.939Z",
      expectedDescriptionSha256:
        "619f7a1391871eea1451bcabb4e630ec7f765a31adf1ab6a3a4d54177df64aa6",
      narrativeAppend:
        "In June 2026, Repsol agreed to sell Masdar a 49.99% interest in a Spanish portfolio comprising 705 MW of operating wind and solar assets plus a 565 MW development pipeline for €849 million; the transaction remains pending completion.",
      sources: [july2026DealSources.repsol],
      milestones: [
        milestone(
          "WB-2026-06-13-003",
          "June 12, 2026",
          "2026-06-12",
          "Agreed to sell Masdar 49.99% of a Spanish renewables portfolio comprising 705 MW of operating assets and a 565 MW pipeline for €849 million.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva107j010lm8lzrc22h61u",
      name: "Cypress Creek Renewables",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:07.256Z",
      expectedDescriptionSha256:
        "84e4ec5db2a53d8a81dcea8010a9cffa9375f0e807c7276e4e288759daeba734",
      narrativeAppend:
        "In June 2026, Cypress Creek sold a 104 MW Illinois community-solar portfolio comprising 16 projects across 14 counties to 38 Degrees North; the transaction was an asset divestiture and did not change Cypress Creek's sponsor ownership.",
      sources: [july2026DealSources.illinoisSolar],
      milestones: [
        milestone(
          "WB-2026-06-13-005",
          "June 12, 2026",
          "2026-06-12",
          "Sold a 104 MW Illinois community-solar portfolio comprising 16 projects across 14 counties to 38 Degrees North.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva14za0183m8lznf779pka",
      name: "38 Degrees North",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:04:08.963Z",
      expectedDescriptionSha256:
        "d424820803a2bacf475bd13a270ead60f15a47a12bd4cfd01a015167c49399c7",
      narrativeAppend:
        "In June 2026, 38 Degrees North acquired a 104 MW Illinois community-solar portfolio comprising 16 projects across 14 counties from Cypress Creek Renewables.",
      sources: [july2026DealSources.illinoisSolar],
      milestones: [
        milestone(
          "WB-2026-06-13-005",
          "June 12, 2026",
          "2026-06-12",
          "Acquired a 104 MW Illinois community-solar portfolio comprising 16 projects across 14 counties from Cypress Creek Renewables.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0y7t00x0m8lzg4dq2qy2",
      name: "A25 Concession",
      country: "Canada",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:26.920Z",
      expectedDescriptionSha256:
        "0af1e7f47e64f036e2a8ce482bc88c6953133121daa37e667533304aa9713ae7",
      narrativeAppend:
        "In June 2026, La Caisse agreed to acquire Transurban's remaining 50% interest in A25 for C$280 million, which would increase La Caisse's ownership from 50% to 100% at closing; current ownership remains 50% pending completion.",
      sources: [july2026DealSources.a25],
      milestones: [
        milestone(
          "WB-2026-06-13-012",
          "June 12, 2026",
          "2026-06-12",
          "La Caisse agreed to acquire Transurban's remaining 50% interest for C$280 million; the increase to 100% remains pending completion.",
          "ACQUISITION",
        ),
      ],
      ownershipOperations: [
        {
          kind: "updatePeriod",
          periodId: "cmoel7rij0014y1lztn0pu2oe",
          expected: {
            organizationName: "La Caisse de dépôt (CDPQ)",
            fundId: "cmnva0ilb00bcm8lzg800fpmz",
            vehicleName: "CDPQ Infrastructure",
            stake: null,
            investmentYear: 2023,
            exitYear: null,
            isActive: true,
          },
          set: {
            fundId: "cmnva0ilb00bcm8lzg800fpmz",
            stake: "50%",
            investmentYear: 2023,
            exitYear: null,
            isActive: true,
          },
        },
      ],
    },
    {
      id: "cmnva14ko017nm8lzwcj9kf3f",
      name: "Altavair, L.P. / Altitude Aircraft Leasing",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:04:10.322Z",
      expectedDescriptionSha256:
        "77f498ae6cd8e0b5771f256061fed2231a2131e5931457f3f6d9a454f5a34306",
      narrativeAppend:
        "In June 2026, KKR committed $1.4 billion of additional equity to expand its global aircraft-leasing program with Altavair, building on a platform with 188 aircraft assets acquired or committed across prior portfolios.",
      sources: [july2026DealSources.altavair],
      milestones: [
        milestone(
          "WB-2026-06-20-001",
          "June 19, 2026",
          "2026-06-19",
          "KKR committed $1.4 billion of additional equity to expand its global aircraft-leasing program with Altavair.",
          "FINANCING",
        ),
      ],
    },
    {
      id: "cmnva0mz300epm8lzmbnvkm6k",
      name: "LOGISTEC",
      country: "United States / Canada",
      ...publishedActive,
      updatedAt: "2026-04-25T21:05:09.719Z",
      expectedDescriptionSha256:
        "26d65e8c5e08d3b97a21ee7056407e4767d8194b7a87a7719f284e6659a2b260",
      narrativeAppend:
        "In June 2026, LOGISTEC's owner agreed to sell the marine terminal division to Stonepeak-backed Enstructure, creating a broader North American terminal network; LOGISTEC's current ownership and status remain unchanged until completion.",
      sources: [july2026DealSources.logistec],
      milestones: [
        milestone(
          "WB-2026-06-20-002",
          "June 19, 2026",
          "2026-06-19",
          "Its owner agreed to sell the marine terminal division to Stonepeak-backed Enstructure, subject to closing.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva0uas00qjm8lzga4d479d",
      name: "Inspiration Mobility Group",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:01:21.805Z",
      expectedDescriptionSha256:
        "876fa4f53d415479b0a4112131f7ee586b320e1f8f595e0201c329006a514d07",
      narrativeAppend:
        "In June 2026, Inspiration Mobility acquired selected Electrada assets and team capabilities for its Inspiration Energy platform, adding a network associated with more than 375 charging depots, 99% reported uptime, and over 10 million electric miles supported.",
      sources: [july2026DealSources.electrada],
      milestones: [
        milestone(
          "WB-2026-06-20-003",
          "June 19, 2026",
          "2026-06-19",
          "Acquired selected Electrada assets and team capabilities for the Inspiration Energy commercial-fleet charging platform.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0wrv00ugm8lz9hqg8ony",
      name: "Electrada",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:01:53.775Z",
      expectedDescriptionSha256:
        "2c43af23a34b3764fd2f04978a6327e91250dfb4bf0041d1119eb32f1baf1764",
      narrativeAppend:
        "In June 2026, Electrada transferred selected fleet-electrification assets, technology, and team capabilities to Inspiration Mobility Group; because the source describes selected assets rather than a sale of the legal entity, Electrada remains active under its existing owner pending further evidence.",
      sources: [july2026DealSources.electrada],
      milestones: [
        milestone(
          "WB-2026-06-20-003",
          "June 19, 2026",
          "2026-06-19",
          "Transferred selected fleet-electrification assets, technology, and team capabilities to Inspiration Mobility Group.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva0my100enm8lzqg0rlt1v",
      name: "KAPS",
      country: "Canada",
      ...publishedActive,
      setCompanyStatus: "REALIZED",
      updatedAt: "2026-04-25T21:05:09.219Z",
      expectedDescriptionSha256:
        "ff8cbf33dba6791819ad69abc4e962b997cf4d2da7b99945324c3c87ac88b72e",
      narrativeAppend:
        "In June 2026, Keyera completed the C$1.215 billion acquisition of Stonepeak's remaining 50% non-operating interest in KAPS, ending Stonepeak's ownership and increasing Keyera's interest to 100%.",
      sources: [july2026DealSources.kaps],
      milestones: [
        milestone(
          "WB-2026-06-20-010",
          "June 19, 2026",
          "2026-06-19",
          "Keyera completed the C$1.215 billion acquisition of Stonepeak's remaining 50% interest and became the 100% owner.",
          "DIVESTITURE",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertOrganization",
          name: "Keyera",
          expected: { exists: false },
          set: { types: ["CORPORATE"], status: "PUBLISHED" },
        },
        {
          kind: "updatePeriod",
          periodId: "cmoelb8q2000w3alznwth1cy3",
          expected: {
            organizationName: "Stonepeak",
            fundId: null,
            vehicleName: "50% interest alongside Keyera",
            stake: null,
            investmentYear: 2023,
            exitYear: null,
            isActive: true,
          },
          set: {
            fundId: null,
            stake: "50%",
            investmentYear: 2023,
            exitYear: 2026,
            isActive: false,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Keyera",
          vehicleName: "Direct ownership",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "100%",
            investmentYear: 2026,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        status: "Realized",
        ownerUpdates: [
          {
            match: { investmentFirm: "Stonepeak" },
            set: { stake: "50%", exitYear: 2026, status: "Realized" },
          },
        ],
        ownerUpserts: [
          {
            investmentFirm: "Keyera",
            ownershipVehicle: "Direct ownership",
            investmentYear: 2026,
            stake: "100%",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva13ss016qm8lzthzctwf5",
      name: "Terra-Gen",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:59.255Z",
      expectedDescriptionSha256:
        "eebfa0d4b2b3b09b715e64abc5b887aa080af0404d9bae5a1fa5d6928d8d6849",
      narrativeAppend:
        "In June 2026, Pantheon Infrastructure committed approximately $55 million to Terra-Gen through an Igneo-managed co-investment vehicle; the commitment did not alter the existing 50/50 ownership by Igneo and Masdar.",
      sources: [july2026DealSources.terraGen],
      milestones: [
        milestone(
          "WB-2026-06-27-003",
          "June 26, 2026",
          "2026-06-26",
          "Pantheon Infrastructure committed approximately $55 million through an Igneo-managed Terra-Gen co-investment vehicle.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "updatePeriod",
          periodId: "cmoel9qr8002c0slzu3e68jl1",
          expected: {
            organizationName: "Igneo Infrastructure Partners",
            fundId: null,
            vehicleName: "Global Diversified Infrastructure Fund (GDIF)",
            stake: null,
            investmentYear: 2020,
            exitYear: null,
            isActive: true,
          },
          set: {
            fundId: null,
            stake: "50%",
            investmentYear: 2020,
            exitYear: null,
            isActive: true,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Masdar",
          vehicleName: "Direct ownership",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "50%",
            investmentYear: 2024,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpdates: [
          {
            match: {
              investmentFirm: "Igneo Infrastructure Partners",
              ownershipVehicle: "Global Diversified Infrastructure Fund (GDIF)",
            },
            set: { stake: "50%" },
          },
        ],
        ownerUpserts: [
          {
            investmentFirm: "Masdar",
            ownershipVehicle: "Direct ownership",
            investmentYear: 2024,
            stake: "50%",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva108n010nm8lztvho67ta",
      name: "EdgeConneX",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:07.649Z",
      expectedDescriptionSha256:
        "9bea34cd352919275bde147a3bb7cb3afae4c9ab8d0a647a3f4581309230c754",
      narrativeAppend:
        "In July 2026, CPP Investments closed a $1.75 billion investment alongside EQT to support digital-infrastructure expansion led by EdgeConneX, whose platform spans more than 20 countries and has over 10 GW of secured and prospective capacity.",
      sources: [july2026DealSources.edgeConnex],
      milestones: [
        milestone(
          "WB-2026-07-03-009",
          "July 3, 2026",
          "2026-07-03",
          "CPP Investments closed a $1.75 billion investment alongside EQT to support global digital-infrastructure growth led by EdgeConneX.",
          "FINANCING",
        ),
      ],
    },
    {
      id: "cmnva122e013um8lzwra570xs",
      name: "Ubiquity",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:25.927Z",
      expectedDescriptionSha256:
        "f071712744581f9875912e04d2b61ee1a6457991442a2b201ebd72db689ba1fe",
      narrativeAppend:
        "In July 2026, Ubiquity agreed to sell its Southern California fiber-to-the-premises network to Intrepid Fiber Networks; the transaction remains pending and does not change Ubiquity's current sponsor ownership before closing.",
      sources: [july2026DealSources.ubiquity],
      milestones: [
        milestone(
          "WB-2026-07-03-016",
          "July 3, 2026",
          "2026-07-03",
          "Agreed to sell its Southern California fiber network to Intrepid Fiber Networks, subject to closing.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva10og011dm8lziivuyec5",
      name: "Cardinal Midstream Partners",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:03.849Z",
      expectedDescriptionSha256:
        "6901e2b0ad863f24abd33fc139061e4f5bd2e851700ca196f7011f074c7bb091",
      narrativeAppend:
        "In July 2026, Cardinal Midstream agreed to sell its Delaware Basin and New Mexico gathering-and-processing assets to San Mateo Midstream for $752 million; EnCap Flatrock ownership remains in place until the sale closes.",
      sources: [july2026DealSources.cardinal],
      milestones: [
        milestone(
          "WB-2026-07-03-021",
          "July 3, 2026",
          "2026-07-03",
          "Agreed to sell Cardinal Delaware Basin and Cardinal New Mexico to San Mateo Midstream for $752 million, subject to closing.",
          "DIVESTITURE",
        ),
      ],
    },
    {
      id: "cmnva0s6p00mvm8lz161gv8op",
      name: "Altius Renewable Royalties Corp.",
      country: "Canada / United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:04:41.237Z",
      expectedDescriptionSha256:
        "8bfe8d692138273fe7d44df883f092219fa338aeff436e6d98d5dc6b43c8c048",
      narrativeAppend:
        "In July 2026, Northampton agreed to sell its 43% interest in ARR to Altius Minerals for $168 million, which would increase Altius Minerals from 57% to 100% at closing; the existing 57%/43% ownership remains recorded until completion.",
      sources: [july2026DealSources.greatBay],
      milestones: [
        milestone(
          "WB-2026-07-10-001",
          "July 10, 2026",
          "2026-07-10",
          "Northampton agreed to sell its 43% ARR interest to Altius Minerals for $168 million; Altius Minerals' increase from 57% to 100% remains pending completion.",
          "ACQUISITION",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertOrganization",
          name: "Altius Minerals",
          expected: { exists: false },
          set: { types: ["CORPORATE"], status: "PUBLISHED" },
        },
        {
          kind: "updatePeriod",
          periodId: "cmoelan4c00ge1elz9tdg1ces",
          expected: {
            organizationName: "Northampton",
            fundId: null,
            vehicleName:
              "Royal Aggregator LP (affiliate of Northampton Capital Partners LLC; “Purchaser”)",
            stake: null,
            investmentYear: 2024,
            exitYear: null,
            isActive: true,
          },
          set: {
            fundId: null,
            stake: "43%",
            investmentYear: 2024,
            exitYear: null,
            isActive: true,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Altius Minerals",
          vehicleName: "Retained ownership",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "57%",
            investmentYear: 2018,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpdates: [
          {
            match: {
              investmentFirm: "Northampton",
              ownershipVehicle: "Royal Aggregator LP",
            },
            set: { stake: "43%" },
          },
        ],
        ownerUpserts: [
          {
            investmentFirm: "Altius Minerals",
            ownershipVehicle: "Retained ownership",
            investmentYear: 2018,
            stake: "57%",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva0tr000pmm8lz3r3h486l",
      name: "Great Bay Renewables",
      country: "United States / Canada",
      ...publishedActive,
      updatedAt: "2026-04-25T21:01:13.093Z",
      expectedDescriptionSha256:
        "f2e061689e30422910ea10458b8f64ed3243e2c5da1d7a756b3f73557fcbdce6",
      narrativeAppend:
        "By July 2026, Great Bay held royalty interests associated with almost 9 GW of renewable projects and was owned 50/50 by Apollo-managed funds and Altius Renewable Royalties; announced transactions would replace Apollo with Northampton at closing while ARR remains the other 50% owner.",
      sources: [july2026DealSources.greatBay],
      milestones: [
        milestone(
          "WB-2026-07-10-001",
          "July 10, 2026",
          "2026-07-10",
          "Apollo agreed to sell its 50% Great Bay interest to Northampton for approximately $390 million; the owner change remains pending completion.",
          "DIVESTITURE",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertOrganization",
          name: "Altius Renewable Royalties Corp.",
          expected: { exists: false },
          set: { types: ["CORPORATE"], status: "PUBLISHED" },
        },
        {
          kind: "updatePeriod",
          periodId: "cmoel66jr00dkvflz480r7hn8",
          expected: {
            organizationName: "Apollo Global Management",
            fundId: null,
            vehicleName: "Apollo Infrastructure Funds",
            stake: null,
            investmentYear: 2020,
            exitYear: null,
            isActive: true,
          },
          set: {
            fundId: null,
            stake: "50%",
            investmentYear: 2020,
            exitYear: null,
            isActive: true,
          },
        },
        {
          kind: "upsertPeriod",
          organizationName: "Altius Renewable Royalties Corp.",
          vehicleName: "Direct membership interest",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "50%",
            investmentYear: 2020,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpdates: [
          {
            match: { investmentFirm: "Apollo Global Management" },
            set: { stake: "50%" },
          },
        ],
        ownerUpserts: [
          {
            investmentFirm: "Altius Renewable Royalties Corp.",
            ownershipVehicle: "Direct membership interest",
            investmentYear: 2020,
            stake: "50%",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva0z9l00yvm8lzx4xyjdme",
      name: "Copia Power",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:15.715Z",
      expectedDescriptionSha256:
        "6598b57bf3b59489e35cbf6b821535effe183d532f4b784e259dd8263da0aee8",
      narrativeAppend:
        "In July 2026, EQT Infrastructure VII agreed to acquire Copia Power from Carlyle; the platform had 2.6 GW operating or under construction and a data-center-focused pipeline supported by more than 25 GW of solar and storage plus 7 GW of gas generation. Carlyle remains the current owner until closing.",
      sources: [july2026DealSources.copia],
      milestones: [
        milestone(
          "WB-2026-07-10-002",
          "July 10, 2026",
          "2026-07-10",
          "EQT Infrastructure VII agreed to acquire Copia Power from Carlyle, subject to closing.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0ntv00g3m8lzjejtj0ji",
      name: "Sabey Data Centers",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:04:28.587Z",
      expectedDescriptionSha256:
        "cba18d1f2669eca5ad04cc9d18d59b7854372de46e83fd000df32a05434b5242",
      narrativeAppend:
        "In July 2026, Ares Secondaries funds made a minority equity investment in Sabey Data Center Properties, which operated six energized campuses totaling approximately 251 MW and more than four million square feet.",
      sources: [july2026DealSources.sabey],
      milestones: [
        milestone(
          "WB-2026-07-10-011",
          "July 10, 2026",
          "2026-07-10",
          "Ares Secondaries funds made a minority equity investment in Sabey Data Center Properties.",
          "FINANCING",
        ),
      ],
      ownershipOperations: [
        {
          kind: "upsertPeriod",
          organizationName: "Ares Management",
          vehicleName: "Ares Secondaries funds",
          expected: { exists: false },
          set: {
            fundId: null,
            stake: "Minority",
            investmentYear: 2026,
            exitYear: null,
            isActive: true,
          },
        },
      ],
      seedPatch: {
        ownerUpserts: [
          {
            investmentFirm: "Ares Management",
            ownershipVehicle: "Ares Secondaries funds",
            investmentYear: 2026,
            stake: "Minority",
            status: "Active",
          },
        ],
      },
    },
    {
      id: "cmnva0txl00pym8lztee54mui",
      name: "Summit Ridge Energy",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:01:16.268Z",
      expectedDescriptionSha256:
        "2bb91383fc5f04272084c343a82addeb09b108166d59f8caf67bab70475b7951",
      narrativeAppend:
        "In July 2026, GIP Mid-Market Funds agreed to acquire a majority and controlling interest in Summit Ridge Energy, whose portfolio comprised more than 275 solar and storage facilities serving over 60,000 customers; Apollo remains the current owner until closing.",
      sources: [july2026DealSources.summit],
      milestones: [
        milestone(
          "WB-2026-07-17-002",
          "July 17, 2026",
          "2026-07-17",
          "GIP Mid-Market Funds agreed to acquire a majority and controlling interest in Summit Ridge Energy, subject to closing.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva0y4j00wum8lznfqkmf5b",
      name: "ClearGen Holdings",
      country: "United States",
      ...publishedActive,
      updatedAt: "2026-04-25T21:02:17.246Z",
      expectedDescriptionSha256:
        "ec86326612987af4b90441bffd26968efcb6a7d192eba1e640adf6b11bf09abe",
      narrativeAppend:
        "In July 2026, ClearGen acquired all equity interests in ten operating behind-the-meter solar projects totaling 19 MW across California, Colorado, Florida, Massachusetts, and New Jersey.",
      sources: [july2026DealSources.clearGen],
      milestones: [
        milestone(
          "WB-2026-07-17-006",
          "July 17, 2026",
          "2026-07-17",
          "Acquired ten operating behind-the-meter solar projects totaling 19 MW across five U.S. states.",
          "ACQUISITION",
        ),
      ],
    },
    {
      id: "cmnva13c90162m8lzay2ksmem",
      name: "Liberty Tire Recycling",
      country: "United States / Canada",
      ...publishedActive,
      updatedAt: "2026-04-25T21:03:51.627Z",
      expectedDescriptionSha256:
        "4dfbd03b7ff4850286cb8d8099c6d95b1ce66c7aa6471052e2ee580532210571",
      narrativeAppend:
        "In July 2026, Liberty Tire Recycling completed the acquisitions of All American Tire, Colt Tire Recycling, and Genan Inc., expanding collection and recycling operations across Gulf Coast markets.",
      sources: [july2026DealSources.liberty],
      milestones: [
        milestone(
          "WB-2026-07-17-008",
          "July 17, 2026",
          "2026-07-17",
          "Completed the acquisitions of All American Tire, Colt Tire Recycling, and Genan Inc. to expand Gulf Coast operations.",
          "ACQUISITION",
        ),
      ],
    },
  ] satisfies readonly July2026CompanyUpdate[],
} as const;

const seedCategory: Record<
  LiveMilestoneCategory,
  NonNullable<PortCo["milestones"]>[number]["category"]
> = {
  FOUNDING: "Founding",
  ACQUISITION: "Acquisition",
  FINANCING: "Financing",
  EXPANSION: "Expansion",
  MANAGEMENT: "Management",
  DIVESTITURE: "Divestiture",
  IPO: "IPO",
  OTHER: "Other",
};

function ownerMatches(owner: PortCoOwner, patch: SeedOwnerPatch): boolean {
  return (
    owner.investmentFirm === patch.match.investmentFirm &&
    (patch.match.ownershipVehicle === undefined ||
      owner.ownershipVehicle === patch.match.ownershipVehicle)
  );
}

function applySeedPatch(
  company: PortCo,
  update: July2026CompanyUpdate,
): PortCo {
  const seedPatch = update.seedPatch;
  const milestones = [...(company.milestones ?? [])];
  for (const item of update.milestones) {
    if (
      !milestones.some(
        (existing) =>
          existing.date === item.date && existing.event === item.event,
      )
    ) {
      milestones.push({
        date: item.date,
        event: item.event,
        category: seedCategory[item.category],
      });
    }
  }

  const sources = [...(company.sources ?? [])];
  for (const item of update.sources) {
    if (!sources.some((existing) => existing.url === item.url)) {
      sources.push({
        label: `${item.label} — ${company.name}`,
        url: item.url,
        type: item.type,
        purpose: item.purpose,
        evidenceLabel: item.evidenceLabel,
      });
    }
  }

  const owners = [...(company.owners ?? [])];
  for (const patch of seedPatch?.ownerUpdates ?? []) {
    const index = owners.findIndex((owner) => ownerMatches(owner, patch));
    if (index === -1) {
      throw new Error(
        `July 2026 seed owner patch did not match ${company.name}: ${patch.match.investmentFirm}`,
      );
    }
    owners[index] = { ...owners[index], ...patch.set };
  }
  for (const owner of seedPatch?.ownerUpserts ?? []) {
    const index = owners.findIndex(
      (existing) =>
        existing.investmentFirm === owner.investmentFirm &&
        existing.ownershipVehicle === owner.ownershipVehicle,
    );
    if (index === -1) owners.push({ ...owner });
    else owners[index] = { ...owners[index], ...owner };
  }

  const narrative = update.narrativeAppend.trim();
  const description = company.description.trimEnd().endsWith(narrative)
    ? company.description
    : `${company.description.trimEnd()} ${narrative}`;

  return {
    ...company,
    description,
    status: seedPatch?.status ?? company.status,
    milestones,
    sources,
    owners,
  };
}

export function applyJuly2026PortfolioDealUpdates(
  companies: readonly PortCo[],
): PortCo[] {
  const byKey = new Map(
    july2026PortfolioDealUpdateManifest.companies.map((update) => [
      `${update.seedPatch?.name ?? update.name}\u0000${update.country}`,
      update,
    ]),
  );
  const applied = new Set<string>();

  const result = companies.map((company) => {
    const key = `${company.name}\u0000${company.country}`;
    const update = byKey.get(key);
    if (!update) return company;
    if (applied.has(update.id))
      throw new Error(`Duplicate July 2026 seed match for ${company.name}`);
    applied.add(update.id);
    return applySeedPatch(company, update);
  });

  const missing = july2026PortfolioDealUpdateManifest.companies.filter(
    (update) => !applied.has(update.id),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing July 2026 seed companies: ${missing.map((update) => update.name).join(", ")}`,
    );
  }
  return result;
}
