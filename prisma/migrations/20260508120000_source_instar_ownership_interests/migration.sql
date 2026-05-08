-- Source Instar ownership interests for current active portfolio companies.
-- The existing scorecard already renders OwnershipPeriod.stake; this migration
-- backfills stake text and attaches ownership-specific citation labels.

WITH stake_facts(company_name, stake) AS (
  VALUES
    ('AMPORTS, Inc.', '100% equity interest'),
    ('Creative Energy', '50% equity interest'),
    ('Greenwood Mushrooms Development Corp. (Windmill Farms)', 'Partnered with management; exact % not publicly disclosed'),
    ('Groupe Somavrac Inc.', 'Instar-led consortium acquired 100%; Instar share not disclosed'),
    ('JET Infrastructure', 'Wholly owned Instar platform; co-investor split not disclosed'),
    ('LS Networks', '100% equity interest'),
    ('Pilot Water Solutions', 'Minority ownership with strong governance rights'),
    ('PRT Growing Services Ltd.', 'Acquired from TriWest; exact % not publicly disclosed'),
    ('Skyservice Business Aviation Inc.', 'Majority equity ownership interest'),
    ('Skyservice US', 'Instar portfolio company; exact % not publicly disclosed'),
    ('Skyservice US (formerly Leading Edge Jet Center)', 'Instar portfolio company; exact % not publicly disclosed'),
    ('Steel Reef Infrastructure Corp.', '20.6% initial stake; expanded ownership in 2020, current % not disclosed'),
    ('Windmill Farms', 'Partnered with management; exact % not publicly disclosed')
)
UPDATE "OwnershipPeriod" op
SET "stake" = stake_facts.stake
FROM "Company" c, "Organization" o, stake_facts
WHERE op."companyId" = c."id"
  AND op."organizationId" = o."id"
  AND c."name" = stake_facts.company_name
  AND o."name" IN ('Instar', 'Instar Asset Management', 'InstarAGF Asset Management')
  AND op."isActive" = true;

WITH source_facts(id, label, url, source_type) AS (
  VALUES
    ('source_instar_amports_ownership', 'Investment date source — Instar — AMPORTS, Inc.', 'https://www.globenewswire.com/news-release/2018/04/03/1459589/0/en/InstarAGF-Asset-Management-Acquires-AMPORTS-Inc.html', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_creative_energy_ownership', 'Investment date source — Instar — Creative Energy', 'https://www.globenewswire.com/news-release/2018/02/13/1340017/0/en/InstarAGF-Essential-Infrastructure-Fund-Partners-with-Creative-Energy.html', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_greenwood_windmill_ownership', 'Investment date source — Instar — Windmill Farms / Greenwood Mushrooms', 'https://instarinvest.com/2022/06/instar-partners-with-leading-controlled-environment-agricultural-producers/', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_somavrac_ownership', 'Investment date source — Instar — Groupe Somavrac Inc.', 'https://instarinvest.com/instar-acquires-groupe-somavrac-to-support-continued-growth/', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_jet_infrastructure_ownership', 'Investment date source — Instar — JET Infrastructure', 'https://www.globenewswire.com/news-release/2018/12/19/1669169/0/en/InstarAGF-Asset-Management-Acquires-Jet-Fuel-Pipeline-and-Terminal-Assets-in-United-States.html', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_ls_networks_ownership', 'Announcement source — Instar — LS Networks', 'https://www.globenewswire.com/news-release/2020/10/15/2109210/0/en/InstarAGF-Agrees-to-Acquire-LS-Networks.html', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_pilot_water_esg_2025', 'Current ownership source — Instar — Pilot Water Solutions', 'https://instarinvest.com/assets/files/INSTAR_ESG_2025_Web_HighRes.pdf', 'PRESENTATION'::"SourceType"),
    ('source_instar_prt_ownership', 'Investment date source — Instar — PRT Growing Services Ltd.', 'https://instarinvest.com/2021/04/instaragf-acquires-prt-growing/', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_skyservice_ownership', 'Investment date source — Instar — Skyservice Business Aviation Inc.', 'https://www.globenewswire.com/news-release/2017/09/18/1124082/0/en/InstarAGF-Essential-Infrastructure-Fund-Partners-With-Skyservice.html', 'PRESS_RELEASE'::"SourceType"),
    ('source_instar_fact_sheet_q3_2025', 'Current ownership source — Instar Fact Sheet Q3 2025', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'PRESENTATION'::"SourceType"),
    ('source_instar_steel_reef_ownership', 'Investment date source — Instar — Steel Reef Infrastructure Corp.', 'https://boereport.com/2016/04/21/instaragf-essential-infrastructure-fund-invests-75-million-in-steel-reef-infrastructure-corp/', 'PRESS_RELEASE'::"SourceType")
),
deduped_sources AS (
  SELECT DISTINCT ON (url)
    id,
    label,
    url,
    source_type
  FROM source_facts
  ORDER BY url, id
)
INSERT INTO "Source" ("id", "label", "url", "type", "createdAt")
SELECT id, label, url, source_type, now()
FROM deduped_sources
ON CONFLICT ("url") DO UPDATE SET
  "label" = EXCLUDED."label",
  "type" = EXCLUDED."type";

WITH citation_facts(company_name, url, citation_id, evidence_label) AS (
  VALUES
    ('AMPORTS, Inc.', 'https://www.globenewswire.com/news-release/2018/04/03/1459589/0/en/InstarAGF-Asset-Management-Acquires-AMPORTS-Inc.html', 'citation_instar_amports_ownership', 'Instar 100% equity interest'),
    ('Creative Energy', 'https://www.globenewswire.com/news-release/2018/02/13/1340017/0/en/InstarAGF-Essential-Infrastructure-Fund-Partners-with-Creative-Energy.html', 'citation_instar_creative_energy_ownership', 'Instar 50% equity interest'),
    ('Greenwood Mushrooms Development Corp. (Windmill Farms)', 'https://instarinvest.com/2022/06/instar-partners-with-leading-controlled-environment-agricultural-producers/', 'citation_instar_greenwood_ownership', 'Instar partnership with management; ownership percentage not disclosed'),
    ('Groupe Somavrac Inc.', 'https://instarinvest.com/instar-acquires-groupe-somavrac-to-support-continued-growth/', 'citation_instar_somavrac_ownership', 'Instar-led consortium acquired entire Somavrac group'),
    ('JET Infrastructure', 'https://www.globenewswire.com/news-release/2018/12/19/1669169/0/en/InstarAGF-Asset-Management-Acquires-Jet-Fuel-Pipeline-and-Terminal-Assets-in-United-States.html', 'citation_instar_jet_infrastructure_ownership', 'Instar wholly owned JET Infrastructure platform'),
    ('LS Networks', 'https://www.globenewswire.com/news-release/2020/10/15/2109210/0/en/InstarAGF-Agrees-to-Acquire-LS-Networks.html', 'citation_instar_ls_networks_ownership', 'Instar agreement to acquire 100% of LS Networks'),
    ('Pilot Water Solutions', 'https://instarinvest.com/assets/files/INSTAR_ESG_2025_Web_HighRes.pdf', 'citation_instar_pilot_water_current_ownership', 'Instar minority ownership with strong governance rights'),
    ('PRT Growing Services Ltd.', 'https://instarinvest.com/2021/04/instaragf-acquires-prt-growing/', 'citation_instar_prt_ownership', 'Instar acquisition from TriWest; ownership percentage not disclosed'),
    ('Skyservice Business Aviation Inc.', 'https://www.globenewswire.com/news-release/2017/09/18/1124082/0/en/InstarAGF-Essential-Infrastructure-Fund-Partners-With-Skyservice.html', 'citation_instar_skyservice_ownership', 'Instar majority equity ownership interest'),
    ('Skyservice US', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'citation_instar_skyservice_us_ownership', 'Instar portfolio company; Skyservice US exact ownership percentage not disclosed'),
    ('Skyservice US (formerly Leading Edge Jet Center)', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'citation_instar_skyservice_us_lejc_ownership', 'Instar portfolio company formerly known as LEJC; exact ownership percentage not disclosed'),
    ('Steel Reef Infrastructure Corp.', 'https://boereport.com/2016/04/21/instaragf-essential-infrastructure-fund-invests-75-million-in-steel-reef-infrastructure-corp/', 'citation_instar_steel_reef_initial_ownership', 'Instar initial 20.6% Steel Reef stake'),
    ('Steel Reef Infrastructure Corp.', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'citation_instar_steel_reef_expanded_ownership', 'Instar expanded ownership in Steel Reef through Fund II'),
    ('Windmill Farms', 'https://instarinvest.com/2022/06/instar-partners-with-leading-controlled-environment-agricultural-producers/', 'citation_instar_windmill_ownership', 'Instar partnership with Windmill management; ownership percentage not disclosed')
)
UPDATE "Citation" existing
SET
  "purpose" = 'OWNERSHIP_INVESTMENT'::"CitationPurpose",
  "evidenceLabel" = citation_facts.evidence_label
FROM citation_facts
JOIN "Company" c
  ON c."name" = citation_facts.company_name
JOIN "Source" s
  ON s."url" = citation_facts.url
WHERE existing."companyId" = c."id"
  AND existing."sourceId" = s."id";

WITH citation_facts(company_name, url, citation_id, evidence_label) AS (
  VALUES
    ('AMPORTS, Inc.', 'https://www.globenewswire.com/news-release/2018/04/03/1459589/0/en/InstarAGF-Asset-Management-Acquires-AMPORTS-Inc.html', 'citation_instar_amports_ownership', 'Instar 100% equity interest'),
    ('Creative Energy', 'https://www.globenewswire.com/news-release/2018/02/13/1340017/0/en/InstarAGF-Essential-Infrastructure-Fund-Partners-with-Creative-Energy.html', 'citation_instar_creative_energy_ownership', 'Instar 50% equity interest'),
    ('Greenwood Mushrooms Development Corp. (Windmill Farms)', 'https://instarinvest.com/2022/06/instar-partners-with-leading-controlled-environment-agricultural-producers/', 'citation_instar_greenwood_ownership', 'Instar partnership with management; ownership percentage not disclosed'),
    ('Groupe Somavrac Inc.', 'https://instarinvest.com/instar-acquires-groupe-somavrac-to-support-continued-growth/', 'citation_instar_somavrac_ownership', 'Instar-led consortium acquired entire Somavrac group'),
    ('JET Infrastructure', 'https://www.globenewswire.com/news-release/2018/12/19/1669169/0/en/InstarAGF-Asset-Management-Acquires-Jet-Fuel-Pipeline-and-Terminal-Assets-in-United-States.html', 'citation_instar_jet_infrastructure_ownership', 'Instar wholly owned JET Infrastructure platform'),
    ('LS Networks', 'https://www.globenewswire.com/news-release/2020/10/15/2109210/0/en/InstarAGF-Agrees-to-Acquire-LS-Networks.html', 'citation_instar_ls_networks_ownership', 'Instar agreement to acquire 100% of LS Networks'),
    ('Pilot Water Solutions', 'https://instarinvest.com/assets/files/INSTAR_ESG_2025_Web_HighRes.pdf', 'citation_instar_pilot_water_current_ownership', 'Instar minority ownership with strong governance rights'),
    ('PRT Growing Services Ltd.', 'https://instarinvest.com/2021/04/instaragf-acquires-prt-growing/', 'citation_instar_prt_ownership', 'Instar acquisition from TriWest; ownership percentage not disclosed'),
    ('Skyservice Business Aviation Inc.', 'https://www.globenewswire.com/news-release/2017/09/18/1124082/0/en/InstarAGF-Essential-Infrastructure-Fund-Partners-With-Skyservice.html', 'citation_instar_skyservice_ownership', 'Instar majority equity ownership interest'),
    ('Skyservice US', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'citation_instar_skyservice_us_ownership', 'Instar portfolio company; Skyservice US exact ownership percentage not disclosed'),
    ('Skyservice US (formerly Leading Edge Jet Center)', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'citation_instar_skyservice_us_lejc_ownership', 'Instar portfolio company formerly known as LEJC; exact ownership percentage not disclosed'),
    ('Steel Reef Infrastructure Corp.', 'https://boereport.com/2016/04/21/instaragf-essential-infrastructure-fund-invests-75-million-in-steel-reef-infrastructure-corp/', 'citation_instar_steel_reef_initial_ownership', 'Instar initial 20.6% Steel Reef stake'),
    ('Steel Reef Infrastructure Corp.', 'https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf', 'citation_instar_steel_reef_expanded_ownership', 'Instar expanded ownership in Steel Reef through Fund II'),
    ('Windmill Farms', 'https://instarinvest.com/2022/06/instar-partners-with-leading-controlled-environment-agricultural-producers/', 'citation_instar_windmill_ownership', 'Instar partnership with Windmill management; ownership percentage not disclosed')
)
INSERT INTO "Citation" ("id", "sourceId", "companyId", "purpose", "evidenceLabel")
SELECT
  citation_facts.citation_id,
  s."id",
  c."id",
  'OWNERSHIP_INVESTMENT'::"CitationPurpose",
  citation_facts.evidence_label
FROM citation_facts
JOIN "Company" c
  ON c."name" = citation_facts.company_name
JOIN "Source" s
  ON s."url" = citation_facts.url
WHERE NOT EXISTS (
  SELECT 1
  FROM "Citation" existing
  WHERE existing."companyId" = c."id"
    AND existing."sourceId" = s."id"
)
ON CONFLICT ("id") DO UPDATE SET
  "sourceId" = EXCLUDED."sourceId",
  "companyId" = EXCLUDED."companyId",
  "purpose" = EXCLUDED."purpose",
  "evidenceLabel" = EXCLUDED."evidenceLabel";
