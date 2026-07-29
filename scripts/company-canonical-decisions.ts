import type {
  CompanyScalarUpdates,
  ExplicitRelationDeletes,
} from "../src/modules/companies/canonical-cleanup";

export interface ReviewedMergeSpec {
  kind: "MERGE";
  reviewKey: string;
  candidateIds: string[];
  canonicalId: string;
  retiredIds: string[];
  canonicalUpdates: CompanyScalarUpdates;
  explicitRelationDeleteIds: ExplicitRelationDeletes;
  rationale: string;
  sources: string[];
}

export interface ReviewedKeepSeparateSpec {
  kind: "KEEP_SEPARATE";
  reviewKey: string;
  candidateIds: string[];
  companyUpdates: Array<{
    id: string;
    changes: CompanyScalarUpdates;
  }>;
  explicitRelationDeleteIds: ExplicitRelationDeletes;
  rationale: string;
  sources: string[];
}

export type ReviewedCompanyDecisionSpec =
  | ReviewedMergeSpec
  | ReviewedKeepSeparateSpec;

function deletes(
  input: Partial<ExplicitRelationDeletes> = {},
): ExplicitRelationDeletes {
  return {
    ownershipPeriods: input.ownershipPeriods ?? [],
    milestones: input.milestones ?? [],
    managementRoles: input.managementRoles ?? [],
    citations: input.citations ?? [],
    newsMentions: input.newsMentions ?? [],
  };
}

/**
 * Every live heuristic cluster is explicit. KEEP_SEPARATE is a first-class
 * decision, so adding a candidate or omitting a false positive invalidates the
 * approval rather than silently changing the scope.
 */
export const REVIEWED_COMPANY_DECISION_SPECS: ReviewedCompanyDecisionSpec[] = [
  {
    kind: "MERGE",
    reviewKey: "01-alpha-generation",
    candidateIds: [
      "cmnva0slh00nmm8lzew8x0vm3",
      "cmoqbxfm6004k171f6yqbqr3i",
    ],
    canonicalId: "cmnva0slh00nmm8lzew8x0vm3",
    retiredIds: ["cmoqbxfm6004k171f6yqbqr3i"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "ArcLight formed Alpha Generation, LLC (AlphaGen) as one platform. Both rows represent that same platform and their attached facts belong on the legal-name record.",
    sources: [
      "https://www.alphagen.com/newsroom/press-releases/arclight-creates-alphagen-to-manage-one-of-the-largest-power-infrastructure-portfolios-in-the-united-states/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "02-astp",
    candidateIds: [
      "cmnva0yw700y8m8lz066tfhwl",
      "cmoqbyrxz00ep171f0j0xkh9o",
    ],
    canonicalId: "cmnva0yw700y8m8lz066tfhwl",
    retiredIds: ["cmoqbyrxz00ep171f0j0xkh9o"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "The names expand to the same student-transportation operator, with matching founding, operating footprint, and CVC DIF acquisition evidence.",
    sources: [
      "https://www.cvc.com/media/news/2025/cvc-dif-agrees-to-acquire-premier-us-student-transportation-operator-astp-from-access-holdings/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "03-boldyn-networks",
    candidateIds: [
      "cmoqbx3az001x171fmlp3rf24",
      "cmnva0nf200fgm8lzckud2zgk",
    ],
    canonicalId: "cmoqbx3az001x171fmlp3rf24",
    retiredIds: ["cmnva0nf200fgm8lzckud2zgk"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Boldyn describes one worldwide platform whose U.S. operations sit inside the combined business. The broad platform record survives while the U.S. financing evidence is preserved as attached history.",
    sources: [
      "https://www.boldyn.com/about-us",
      "https://www.boldyn.com/us/company-values-history",
      "https://www.manulifeim.com/institutional/global/en/about-us/press-releases/cpp-investments-aimco-and-manulife-im-increase-commitment-to-boldyn-networks-to-support-continued-growth-in-the-us",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "04-cleco",
    candidateIds: [
      "cmnva0ng800fim8lz95b1no81",
      "cmoqbxwj50084171fwym9a80l",
    ],
    canonicalId: "cmnva0ng800fim8lz95b1no81",
    retiredIds: ["cmoqbxwj50084171fwym9a80l"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Cleco Corporation is the historical name; Cleco Corporate Holdings LLC is the current holding company and the appropriate survivor for the shared group history.",
    sources: [
      "https://www.cleco.com/about/our-company",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "05-coastal-gaslink",
    candidateIds: [
      "cmnva0psl00jcm8lzi01srw0p",
      "cmoqc06f300pj171fz77p460g",
    ],
    canonicalId: "cmnva0psl00jcm8lzi01srw0p",
    retiredIds: ["cmoqc06f300pj171fz77p460g"],
    canonicalUpdates: {
      name: "Coastal GasLink Pipeline",
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoel9zxu00970slzkgbd4oi4"],
    }),
    rationale:
      "Both rows describe the same 670-km pipeline. The KKR/AIMCo sale was announced in 2019 and completed in 2020, so the reviewed 2020 ownership row replaces the conflicting 2019 row.",
    sources: [
      "https://www.coastalgaslink.com/whats-new/news-stories/2019/Partial-Monetization-of-CGL-Announced/",
      "https://www.coastalgaslink.com/about/faqs/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "06-convergent-energy-and-power",
    candidateIds: [
      "cmoqbyx6l00fv171f32ezu2ch",
      "cmnva0o2700ghm8lzwp37rpx9",
    ],
    canonicalId: "cmoqbyx6l00fv171f32ezu2ch",
    retiredIds: ["cmnva0o2700ghm8lzwp37rpx9"],
    canonicalUpdates: {
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoqc2xqb01dn171fzwydfbat"],
    }),
    rationale:
      "The records describe the same ECP-owned platform. Its public operating scope spans the United States and Canada; the redundant generic ECP ownership row is removed in favor of the more specific record.",
    sources: [
      "https://www.ecpgp.com/equity/portfolio/convergent",
      "https://convergentep.com/news/ecp",
      "https://convergentep.com/canada",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "07-coolco",
    candidateIds: [
      "cmnva12qt0152m8lzwh32rl0d",
      "cmoqbzq6100m1171fx36pzrsj",
    ],
    canonicalId: "cmnva12qt0152m8lzwh32rl0d",
    retiredIds: ["cmoqbzq6100m1171fx36pzrsj"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoqc3on801kc171fck2z0e2z"],
    }),
    rationale:
      "Both rows are the same Cincinnati district-energy business. The explanatory parenthetical is not a separate entity, and the second Harrison Street ownership row is redundant.",
    sources: [
      "https://coolco.com/about-us/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "08-dcli",
    candidateIds: [
      "cmnva0qc300k8m8lz0ukvcrlw",
      "cmoqbzgu500k1171fs4ccuw39",
    ],
    canonicalId: "cmnva0qc300k8m8lz0ukvcrlw",
    retiredIds: ["cmoqbzgu500k1171fs4ccuw39"],
    canonicalUpdates: {
      name: "Direct ChassisLink, Inc. (DCLI)",
    },
    explicitRelationDeleteIds: deletes(),
    rationale:
      "DCLI and Direct ChassisLink, Inc. are the abbreviation and legal name for the same chassis operating company; the record with the complete three-owner evidence survives.",
    sources: [
      "https://dcli.com/",
      "https://dcli.com/investor-information/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "09-extenet",
    candidateIds: [
      "cmnva0mwt00elm8lz2xp3ijr4",
      "cmoqc0y7100vi171flkm8xuz4",
    ],
    canonicalId: "cmnva0mwt00elm8lz2xp3ijr4",
    retiredIds: ["cmoqc0y7100vi171flkm8xuz4"],
    canonicalUpdates: {
      name: "Extenet (formerly ExteNet Systems)",
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoqc4sgr01uk171f6n908ew6"],
    }),
    rationale:
      "ExteNet Systems officially rebranded as Extenet in 2022. The legacy row carries the richer history, but the current brand is made canonical and the redundant Stonepeak row is removed.",
    sources: [
      "https://extenet.com/extenet-systems-is-now-extenet/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "10-gct-global-container-terminals",
    candidateIds: [
      "cmoqbxwza0088171ffl39qhda",
      "cmnva13lf016gm8lz8ws9mnx2",
      "cmoqc0put00tn171ffyt56gok",
    ],
    canonicalId: "cmoqbxwza0088171ffl39qhda",
    retiredIds: [
      "cmnva13lf016gm8lz8ws9mnx2",
      "cmoqc0put00tn171ffyt56gok",
    ],
    canonicalUpdates: {
      country: "Canada",
      countryTags: ["Canada"],
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: [
        "cmoqc4l8k01sn171foat95hlb",
        "cmoqc4lc401so171flf7yqc1n",
      ],
      milestones: [
        "cmp1h8uy302qjw41f0zw51f56",
        "cmp1h8uy302qkw41fidslg10a",
      ],
    }),
    rationale:
      "The three records are one corporate operator across a changing footprint. After the 2023 U.S. terminal sale, Canada is the current operating country; the U.S. history remains in milestones. Incomplete duplicate ownership rows are removed.",
    sources: [
      "https://globalterminals.com/ifm-investors-bci-join-ontario-teachers-equity-partners-gct-global-container-terminals-inc/",
      "https://globalterminals.com/gct-successfully-concludes-sale-of-new-york-terminals-to-cma-cgm/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "11-gulf-coast-express",
    candidateIds: [
      "cmnva0rsh00m5m8lzrh4iikgq",
      "cmoqbxg4x004p171fzy5wwte4",
    ],
    canonicalId: "cmnva0rsh00m5m8lzrh4iikgq",
    retiredIds: ["cmoqbxg4x004p171fzy5wwte4"],
    canonicalUpdates: {
      name: "Gulf Coast Express Pipeline LLC (GCX)",
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoel6csn0026w2lziqq2ot9a"],
    }),
    rationale:
      "The records identify the same Texas pipeline. The legal-name row survives, with GCX retained as an alias; the reviewed 2025 ArcLight ownership row replaces the undated duplicate.",
    sources: [
      "https://www.kindermorgan.com/Operations/Natural-Gas/Index",
    ],
  },
  {
    kind: "KEEP_SEPARATE",
    reviewKey: "12-jw-water-and-robson-utilities",
    candidateIds: [
      "cmnva0z1n00yim8lzbh3yfx1c",
      "cmoqbytnp00f3171fjyn934yg",
    ],
    companyUpdates: [
      {
        id: "cmnva0z1n00yim8lzbh3yfx1c",
        changes: {
          name: "Robson Utilities Portfolio",
          description:
            "Robson Utilities Portfolio comprises eight regulated water and wastewater utilities in Arizona acquired by CVC DIF through DIF Infrastructure VII in 2024. CVC DIF reported that these utilities served more than 41,000 customers at signing. The assets were acquired alongside, but are legally and operationally distinct from, JW Water Holdings; JW Water was expected to manage the combined 18-utility platform after closing.",
          yearFounded: null,
        },
      },
    ],
    explicitRelationDeleteIds: deletes({
      milestones: [
        "cmp1h7z0701d1w41f22qym0tf",
        "cmp1h7z0701d2w41f8mub017r",
      ],
    }),
    rationale:
      "CVC DIF documented concurrent but distinct acquisitions: JW Water's 10 utilities and eight Robson utilities. The combined-platform row is normalized to the Robson portfolio rather than destructively merged into JW Water.",
    sources: [
      "https://www.cvc.com/media/news/2024/2024-11-21-cvc-dif-acquires-a-portfolio-of-us-regulated-water-and-wastewater-utilities/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "13-landmark-dividend",
    candidateIds: [
      "cmoqbx33h001v171f207gs2e3",
      "cmnva0zyr0105m8lz7mzz7ea2",
    ],
    canonicalId: "cmoqbx33h001v171f207gs2e3",
    retiredIds: ["cmnva0zyr0105m8lz7mzz7ea2"],
    canonicalUpdates: {
      yearFounded: 2010,
    },
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Both rows are Landmark Dividend LLC. The richer legal-name record survives, and its unsupported 2002 founding year is corrected to the sourced 2010 date.",
    sources: [
      "https://www.digitalbridge.com/news/2024-04-02-adia-completes-acquisition-of-40-stake-in-landmark-dividend-alongside-digitalbridge",
      "https://ir.digitalbridge.com/node/10936/html",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "14-luminace",
    candidateIds: [
      "cmoqby8li00ao171flqpuqq6j",
      "cmnva0nyo00gbm8lz6vln8d8d",
    ],
    canonicalId: "cmoqby8li00ao171flqpuqq6j",
    retiredIds: ["cmnva0nyo00gbm8lz6vln8d8d"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Luminace is the public brand for Luminace Holdings, LLC. The brand record carries the richer evidence while the legal form remains represented in its source history.",
    sources: [
      "https://luminace.com/applicant-data-protection-policy-and-privacy-notice/",
      "https://bep.brookfield.com/sites/brookfield-bep-v2/files/Brookfield-BEP-IR-V2/form-20-fs/bep-2025-annual-20-f.pdf",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "15-northview-energy",
    candidateIds: [
      "cmoqbxxhq008d171ffvxr3rv9",
      "cmnva0xvs00wgm8lzqdgowwv1",
    ],
    canonicalId: "cmoqbxxhq008d171ffvxr3rv9",
    retiredIds: ["cmnva0xvs00wgm8lzqdgowwv1"],
    canonicalUpdates: {
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: [
        "cmoel70350073wrlz8oui1pyf",
        "cmoel704s0074wrlz2ivmvgau",
      ],
    }),
    rationale:
      "Both rows represent the same 2026 Brookfield/BCI/NBIM platform. The complete one-third ownership records survive, and the country scope reflects the U.S. seed portfolio and U.S./Canada mandate.",
    sources: [
      "https://bep.brookfield.com/press-releases/bepc/bci-norges-bank-investment-management-and-brookfield-partner-launch-northview",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "16-pattern-energy",
    candidateIds: [
      "cmnva0stf00nzm8lz2pthnja0",
      "cmoqbyqsa00ef171fswry13u5",
    ],
    canonicalId: "cmnva0stf00nzm8lz2pthnja0",
    retiredIds: ["cmoqbyqsa00ef171fswry13u5"],
    canonicalUpdates: {
      name: "Pattern Energy Group LP (Pattern Energy)",
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoel649600bkvflzwjj5wony"],
    }),
    rationale:
      "Pattern's official announcement identifies Pattern Energy Group LP and Pattern Energy as the same operating entity. The duplicate APG consortium row is removed in favor of the more precise transaction record.",
    sources: [
      "https://patternenergy.com/pattern-energy-announces-closing-of-equity-investment-from-consortium-headed-by-apg-and-art/",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "17-pearl-ruby-solar",
    candidateIds: [
      "cmnva0tjn00p9m8lz7d3k3svi",
      "cmoqbxnxb006a171fwojc3elz",
    ],
    canonicalId: "cmnva0tjn00p9m8lz7d3k3svi",
    retiredIds: ["cmoqbxnxb006a171fwojc3elz"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Both records describe Argo's same 114-MW, 134-site Pearl/Ruby distributed-solar portfolio investment announced in 2019.",
    sources: [
      "https://www.prnewswire.com/news-releases/marathon-capital-announces-argos-investment-in-a-114-mw-distributed-solar-portfolio-300790298.html",
    ],
  },
  {
    kind: "KEEP_SEPARATE",
    reviewKey: "18-puget-energy-and-pse",
    candidateIds: [
      "cmnva0pnm00j4m8lzk4vmiuoa",
      "cmnva0pr700jam8lzjb1yb2n1",
    ],
    companyUpdates: [
      {
        id: "cmnva0pr700jam8lzjb1yb2n1",
        changes: {
          name: "Puget Energy",
        },
      },
    ],
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Puget Energy is the holding company and Puget Sound Energy is its regulated utility subsidiary. Their similar names do not establish one legal entity, so both records remain and the parent record is named precisely.",
    sources: [
      "https://www.pse.com/-/media/PDFs/PugetEnergy/PE-10K-20231231.pdf",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "19-skyservice-us",
    candidateIds: [
      "cmnva0ols00hem8lz203dcggi",
      "cmoqc03lb00ow171fge71941i",
    ],
    canonicalId: "cmnva0ols00hem8lz203dcggi",
    retiredIds: ["cmoqc03lb00ow171fge71941i"],
    canonicalUpdates: {
      name: "Skyservice US",
    },
    explicitRelationDeleteIds: deletes({
      ownershipPeriods: ["cmoqc40h101na171fjdhwhdmi"],
      milestones: [
        "cmp1h8kjl028uw41fjz8278sh",
        "cmp1h8khi028pw41fv9ssaqmd",
        "cmp1h8khi028qw41fewk0zs4a",
      ],
    }),
    rationale:
      "The rows describe the same U.S. FBO business formerly known as Leading Edge Jet Center. The current Skyservice US name survives; redundant investment/founding events and the contradicted 2019 standalone-founding claim are removed.",
    sources: [
      "https://www.ainonline.com/aviation-news/business-aviation/2021-11-10/canadas-skyservice-expands-us",
    ],
  },
  {
    kind: "MERGE",
    reviewKey: "20-transportation-equipment-network",
    candidateIds: [
      "cmnva0pwi00jjm8lzomcojs56",
      "cmoqbzvsz00n9171f6oiy98aw",
    ],
    canonicalId: "cmnva0pwi00jjm8lzomcojs56",
    retiredIds: ["cmoqbzvsz00n9171f6oiy98aw"],
    canonicalUpdates: {},
    explicitRelationDeleteIds: deletes(),
    rationale:
      "Transportation Equipment Network and TEN are the full name and abbreviation for the same I Squared trailer-leasing platform.",
    sources: [
      "https://isquaredcapital.com/news/i-squared-portfolio-companies-transportation-equipment-network-ten-and-tip-canada-combine-operations-now-the-second-largest-full-service-trailer-lessor-in-north-america/",
    ],
  },
  {
    kind: "KEEP_SEPARATE",
    reviewKey: "21-medcraft-and-montecito-portfolios",
    candidateIds: [
      "cmoqbzd9p00j9171fy63wi359",
      "cmnva11ml0133m8lzhltgjdef",
    ],
    companyUpdates: [
      {
        id: "cmoqbzd9p00j9171fy63wi359",
        changes: {
          name: "MedCraft Medical Outpatient Portfolio",
        },
      },
      {
        id: "cmnva11ml0133m8lzhltgjdef",
        changes: {
          name: "Montecito Medical Outpatient Portfolio",
        },
      },
    ],
    explicitRelationDeleteIds: deletes(),
    rationale:
      "These are distinct 2025 Fengate acquisitions: 24 MedCraft facilities in two states and 16 Montecito facilities across 10 states. Similar asset class and sponsor do not justify a merge.",
    sources: [
      "https://fengate.com/news/fengate-expands-healthcare-infrastructure-portfolio-with-acquisition-of-24-u-s-outpatient-facilities",
      "https://fengate.com/news/fengate-acquires-16-medical-outpatient-facilities-in-the-united-states",
    ],
  },
];
