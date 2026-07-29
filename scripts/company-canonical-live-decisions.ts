import type {
  CitationPrimaryResolution,
  CompanyScalarUpdates,
  ExplicitRelationDeletes,
} from "../src/modules/companies/canonical-cleanup";
import {
  REVIEWED_COMPANY_DECISION_SPECS,
  type ReviewedCompanyDecisionSpec,
  type ReviewedKeepSeparateSpec,
  type ReviewedMergeSpec,
} from "./company-canonical-decisions";

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

function reviewedDecision(
  reviewKey: string,
): ReviewedCompanyDecisionSpec {
  const decision = REVIEWED_COMPANY_DECISION_SPECS.find(
    (candidate) => candidate.reviewKey === reviewKey,
  );
  if (!decision) {
    throw new Error(`Missing reviewed company decision ${reviewKey}`);
  }
  return decision;
}

function merge(
  reviewKey: string,
  input: {
    candidateIds: string[];
    canonicalId: string;
    retiredIds: string[];
    canonicalUpdates?: CompanyScalarUpdates;
    citationPrimaryResolution: CitationPrimaryResolution;
    explicitRelationDeleteIds?: ExplicitRelationDeletes;
    rationale?: string;
  },
): ReviewedMergeSpec {
  const reviewed = reviewedDecision(reviewKey);
  if (reviewed.kind !== "MERGE") {
    throw new Error(`Reviewed company decision ${reviewKey} is not a merge`);
  }
  return {
    ...reviewed,
    candidateIds: input.candidateIds,
    canonicalId: input.canonicalId,
    retiredIds: input.retiredIds,
    canonicalUpdates:
      input.canonicalUpdates ?? reviewed.canonicalUpdates,
    citationPrimaryResolution: input.citationPrimaryResolution,
    explicitRelationDeleteIds:
      input.explicitRelationDeleteIds ?? deletes(),
    rationale: input.rationale ?? reviewed.rationale,
  };
}

function keepSeparate(
  reviewKey: string,
  input: {
    candidateIds: string[];
    companyUpdates: ReviewedKeepSeparateSpec["companyUpdates"];
    explicitRelationDeleteIds?: ExplicitRelationDeletes;
    rationale?: string;
  },
): ReviewedKeepSeparateSpec {
  const reviewed = reviewedDecision(reviewKey);
  if (reviewed.kind !== "KEEP_SEPARATE") {
    throw new Error(
      `Reviewed company decision ${reviewKey} is not keep-separate`,
    );
  }
  return {
    ...reviewed,
    candidateIds: input.candidateIds,
    companyUpdates: input.companyUpdates,
    explicitRelationDeleteIds:
      input.explicitRelationDeleteIds ?? deletes(),
    rationale: input.rationale ?? reviewed.rationale,
  };
}

/**
 * The Vercel production database was independently seeded, so its row IDs
 * differ from the primary Neon branch. These decisions bind the same reviewed
 * entity outcomes to that live dataset's complete 17-cluster snapshot.
 */
export const REVIEWED_LIVE_COMPANY_DECISION_SPECS:
  ReviewedCompanyDecisionSpec[] = [
    merge("01-alpha-generation", {
      candidateIds: [
        "cmrxpj46m00g5ivhe8bi5r2wb",
        "cmrxpj67d00iyivhe208h0356",
      ],
      canonicalId: "cmrxpj46m00g5ivhe8bi5r2wb",
      retiredIds: ["cmrxpj67d00iyivhe208h0356"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpok3m06uvivhedx08v81i",
        demotePrimaryIds: ["cmrxpoys707gkivhe04ebogtv"],
      },
    }),
    merge("02-astp", {
      candidateIds: [
        "cmrxpjcqb00t3ivhe6qiqp9nq",
        "cmrxpjct700t4ivhe097ggvuj",
      ],
      canonicalId: "cmrxpjct700t4ivhe097ggvuj",
      retiredIds: ["cmrxpjcqb00t3ivhe6qiqp9nq"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpqfj709kpivhesf14lc0y",
        demotePrimaryIds: ["cmrxpqffc09khivheazdltp8f"],
      },
    }),
    merge("03-boldyn-networks", {
      candidateIds: [
        "cmrxpj4cg00gbivhe0f3aiyud",
        "cmrxpjkje014zivhe0c68yrfp",
      ],
      canonicalId: "cmrxpj4cg00gbivhe0f3aiyud",
      retiredIds: ["cmrxpjkje014zivhe0c68yrfp"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpol6k06wkivhem3ymce9b",
        demotePrimaryIds: ["cmrxps36i0c22ivhe43k410jn"],
      },
    }),
    merge("04-cleco", {
      candidateIds: [
        "cmrxpj8iu00miivhefl7xhjri",
        "cmrxpjkkg0151ivhenxskmy7x",
      ],
      canonicalId: "cmrxpjkkg0151ivhenxskmy7x",
      retiredIds: ["cmrxpj8iu00miivhefl7xhjri"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxps3e10c2givheaxyj7554",
        demotePrimaryIds: ["cmrxppfyh086fivhexvrn436e"],
      },
    }),
    merge("05-coastal-gaslink", {
      candidateIds: [
        "cmrxpj4e100geivhe4lo6qn4w",
        "cmrxpjjse013tivhew5dent2f",
      ],
      canonicalId: "cmrxpj4e100geivhe4lo6qn4w",
      retiredIds: ["cmrxpjjse013tivhew5dent2f"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpoln006x8ivhen2ho9pvw",
        demotePrimaryIds: ["cmrxprwwb0bseivhejq02q10z"],
      },
      rationale:
        "Both rows describe the same 670-km pipeline. The richer project record survives under the current operating name, with the distinct 2020 KKR and AIMCo ownership evidence preserved.",
    }),
    merge("07-coolco", {
      candidateIds: [
        "cmrxpjhii010civhek48qprav",
        "cmrxpjhj5010divhe5p72rvmt",
      ],
      canonicalId: "cmrxpjhii010civhek48qprav",
      retiredIds: ["cmrxpjhj5010divhe5p72rvmt"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxprgjy0b3wivhe3frgetlq",
        demotePrimaryIds: ["cmrxprgne0b43ivheghlut91u"],
      },
      explicitRelationDeleteIds: deletes({
        ownershipPeriods: ["cmrxpk3fn01z4ivhedhc0jgxg"],
      }),
    }),
    merge("08-dcli", {
      candidateIds: [
        "cmrxpjg8u00ydivhe473ah8ub",
        "cmrxpjoz401c3ivhemhei5kyo",
      ],
      canonicalId: "cmrxpjoz401c3ivhemhei5kyo",
      retiredIds: ["cmrxpjg8u00ydivhe473ah8ub"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpt3zr0dm7ivhe6keodcop",
        demotePrimaryIds: ["cmrxpr7b00apxivhexgwolru7"],
      },
      rationale:
        "DCLI and Direct ChassisLink, Inc. are the abbreviation and legal name for the same chassis operating company. The legal-name record survives and the non-duplicate ownership and operating evidence is consolidated into it.",
    }),
    merge("09-extenet", {
      candidateIds: [
        "cmrxpjdak00twivheazjbfqum",
        "cmrxpjnj4019sivheei4wmjpj",
      ],
      canonicalId: "cmrxpjdak00twivheazjbfqum",
      retiredIds: ["cmrxpjnj4019sivheei4wmjpj"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpqj2i09q3ivhenku9n5rp",
        demotePrimaryIds: ["cmrxpssae0d4aivhe0pgwug8c"],
      },
    }),
    merge("10-gct-global-container-terminals", {
      candidateIds: [
        "cmrxpj8l000mmivhe1cfe4xs6",
        "cmrxpjmcu017xivheetlsltdn",
      ],
      canonicalId: "cmrxpj8l000mmivhe1cfe4xs6",
      retiredIds: ["cmrxpjmcu017xivheetlsltdn"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxppgnd087givhezj6ym2im",
        demotePrimaryIds: ["cmrxpsiyb0cptivhevuvikr8y"],
      },
      explicitRelationDeleteIds: deletes({
        milestones: [
          "cmrxpmjxf050fivhep3941ukk",
          "cmrxpmjy0050givhe7ca2z1da",
        ],
      }),
      rationale:
        "Both records are the same corporate operator. The legal-name record survives with Canada as its current operating country; exact duplicate ownership rows and two redundant transaction milestones are removed.",
    }),
    merge("11-gulf-coast-express", {
      candidateIds: [
        "cmrxpj6cn00j3ivhegemd6wso",
        "cmrxpjln4016sivhe00yic3tw",
      ],
      canonicalId: "cmrxpjln4016sivhe00yic3tw",
      retiredIds: ["cmrxpj6cn00j3ivhegemd6wso"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpsd5f0cgwivhelaebmxrx",
        demotePrimaryIds: ["cmrxpozb607heivheuwzramgc"],
      },
      rationale:
        "The records identify the same Texas pipeline. The legal-name row survives with GCX retained as an alias, and the distinct 2025 ArcLight and Mubadala ownership evidence is preserved.",
    }),
    keepSeparate("12-jw-water-and-robson-utilities", {
      candidateIds: [
        "cmrxpjd0700thivhe6wdzyicz",
        "cmrxpjd0s00tiivheuomhxk0o",
      ],
      companyUpdates: [
        {
          id: "cmrxpjd0s00tiivheuomhxk0o",
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
          "cmrxplf5a03nsivheee986n5l",
          "cmrxplf5s03ntivhe0g2f54jl",
        ],
      }),
    }),
    merge("16-pattern-energy", {
      candidateIds: [
        "cmrxpj5g400htivhen2tours6",
        "cmrxpjckv00stivhese6a2evl",
      ],
      canonicalId: "cmrxpj5g400htivhen2tours6",
      retiredIds: ["cmrxpjckv00stivhese6a2evl"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpospb077nivheedvux7lq",
        demotePrimaryIds: ["cmrxpqdtt09i8ivhe8gl2jd3f"],
      },
      rationale:
        "Pattern's official announcement identifies Pattern Energy Group LP and Pattern Energy as the same operating entity. The records are consolidated while preserving the distinct APG and CPP Investments ownership evidence.",
    }),
    merge("17-pearl-ruby-solar", {
      candidateIds: [
        "cmrxpj5xm00igivhejhjldefv",
        "cmrxpj7cn00koivhe1netbo47",
      ],
      canonicalId: "cmrxpj5xm00igivhejhjldefv",
      retiredIds: ["cmrxpj7cn00koivhe1netbo47"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpowcv07cyivhelph8w7hd",
        demotePrimaryIds: ["cmrxpp6s807sbivheqfw0494s"],
      },
    }),
    keepSeparate("18-puget-energy-and-pse", {
      candidateIds: [
        "cmrxpj4fp00ghivhebe9bfh5k",
        "cmrxpjkcr014rivhero16klvt",
      ],
      companyUpdates: [
        {
          id: "cmrxpj4fp00ghivhebe9bfh5k",
          changes: {
            name: "Puget Energy",
          },
        },
      ],
    }),
    merge("19-skyservice-us", {
      candidateIds: [
        "cmrxpjje30136ivheq0equtbk",
        "cmrxpjjen0137ivheavgfck2x",
      ],
      canonicalId: "cmrxpjjen0137ivheavgfck2x",
      retiredIds: ["cmrxpjje30136ivheq0equtbk"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxprtll0bnkivheey40twgq",
        demotePrimaryIds: ["cmrxprthz0bneivhe9jaqhrnj"],
      },
      explicitRelationDeleteIds: deletes({
        milestones: [
          "cmrxpm5ki04iuivhez5wfy037",
          "cmrxpm5eu04ipivhe6ycg8322",
          "cmrxpm5fe04iqivhe0tyefhng",
        ],
      }),
    }),
    merge("20-transportation-equipment-network", {
      candidateIds: [
        "cmrxpjibj011kivheeiracbrz",
        "cmrxpjlqb016uivhebyrmz01k",
      ],
      canonicalId: "cmrxpjlqb016uivhebyrmz01k",
      retiredIds: ["cmrxpjibj011kivheeiracbrz"],
      citationPrimaryResolution: {
        keepPrimaryId: "cmrxpsdkb0chjivheii29pm3d",
        demotePrimaryIds: ["cmrxprlk30bbjivhe3q3radua"],
      },
    }),
    keepSeparate("21-medcraft-and-montecito-portfolios", {
      candidateIds: [
        "cmrxpjfs500xmivheiqodqkfz",
        "cmrxpjfsr00xnivhemb529yxo",
      ],
      companyUpdates: [
        {
          id: "cmrxpjfs500xmivheiqodqkfz",
          changes: {
            name: "MedCraft Medical Outpatient Portfolio",
          },
        },
        {
          id: "cmrxpjfsr00xnivhemb529yxo",
          changes: {
            name: "Montecito Medical Outpatient Portfolio",
          },
        },
      ],
    }),
  ];
