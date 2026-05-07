-- Add Boralex as a Brookfield / La Caisse portfolio company.
-- The transaction was announced on March 25, 2026 and was expected to close
-- by Q4 2026, with Brookfield owning 70% and La Caisse owning 30% post-close.

INSERT INTO "Organization" ("id", "name", "types", "status", "createdAt", "updatedAt")
VALUES
  ('org_brookfield_asset_management', 'Brookfield Asset Management', ARRAY['FUND_MANAGER']::"OrgType"[], 'PUBLISHED', now(), now()),
  ('org_la_caisse_cdpq', 'La Caisse de dépôt (CDPQ)', ARRAY['FUND_MANAGER']::"OrgType"[], 'PUBLISHED', now(), now())
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Company" (
  "id",
  "name",
  "sector",
  "subsector",
  "region",
  "country",
  "countryTags",
  "description",
  "companyStatus",
  "website",
  "yearFounded",
  "headquarters",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES (
  'company_boralex_inc_2026',
  'Boralex Inc.',
  'POWER_ET',
  'Renewable power generation and development',
  'GLOBAL',
  'United States / Canada / France / United Kingdom',
  ARRAY['United States', 'Canada'],
  'Boralex develops, builds, owns, and operates renewable power and energy storage assets across Canada, the United States, France, and the United Kingdom. Its customers and counterparties include utilities, corporate offtakers, public procurement entities, and power-market participants that buy contracted renewable electricity, capacity, and related environmental attributes. The business is asset-heavy because value depends on wind, solar, hydroelectric, and battery storage facilities plus a development pipeline rather than on advisory or services revenue alone. Boralex reported 3,783 MW of installed capacity as of December 31, 2025 and an 8.2 GW portfolio of projects in development and construction. Brookfield and La Caisse announced a definitive agreement in March 2026 to acquire Boralex in an all-cash take-private transaction, with Brookfield expected to hold 70% and La Caisse expected to increase its ownership to 30% after closing; the transaction was expected to close by Q4 2026 subject to shareholder, court, regulatory, and other customary approvals.',
  'ACTIVE',
  'https://www.boralex.com/',
  1990,
  'Quebec; United States; France; United Kingdom',
  'PUBLISHED',
  now(),
  now()
)
ON CONFLICT ("name", "country") DO UPDATE SET
  "sector" = EXCLUDED."sector",
  "subsector" = EXCLUDED."subsector",
  "region" = EXCLUDED."region",
  "countryTags" = EXCLUDED."countryTags",
  "description" = EXCLUDED."description",
  "companyStatus" = EXCLUDED."companyStatus",
  "website" = EXCLUDED."website",
  "yearFounded" = EXCLUDED."yearFounded",
  "headquarters" = EXCLUDED."headquarters",
  "updatedAt" = now();

INSERT INTO "OwnershipPeriod" (
  "id",
  "companyId",
  "organizationId",
  "fundId",
  "vehicleName",
  "stake",
  "investmentYear",
  "isActive",
  "createdAt"
)
VALUES
  (
    'ownership_boralex_brookfield_2026',
    (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'),
    (SELECT "id" FROM "Organization" WHERE "name" = 'Brookfield Asset Management'),
    NULL,
    'Brookfield flagship infrastructure strategy',
    '70% pro forma post-close',
    2026,
    true,
    now()
  ),
  (
    'ownership_boralex_cdpq_2026',
    (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'),
    (SELECT "id" FROM "Organization" WHERE "name" = 'La Caisse de dépôt (CDPQ)'),
    (SELECT "id" FROM "Fund" WHERE "fundName" = 'CDPQ Infrastructure'),
    'CDPQ Infrastructure',
    '30% pro forma post-close; shareholder/lender since 2017',
    2017,
    true,
    now()
  )
ON CONFLICT ("companyId", "organizationId") DO UPDATE SET
  "fundId" = EXCLUDED."fundId",
  "vehicleName" = EXCLUDED."vehicleName",
  "stake" = EXCLUDED."stake",
  "investmentYear" = EXCLUDED."investmentYear",
  "isActive" = EXCLUDED."isActive";

INSERT INTO "Milestone" ("id", "companyId", "date", "event", "category", "sortDate")
VALUES
  ('milestone_boralex_founding_1990', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), '1990', 'Boralex was founded in Quebec as a renewable energy producer.', 'FOUNDING', '1990-01-01'),
  ('milestone_boralex_cdpq_2017', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), '2017', 'La Caisse began supporting Boralex as a shareholder and lender, according to the March 2026 transaction announcement.', 'FINANCING', '2017-01-01'),
  ('milestone_boralex_scale_2025', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), 'Dec 31, 2025', 'Boralex reported 3,783 MW of installed capacity and an 8.2 GW development and construction portfolio.', 'OTHER', '2025-12-31'),
  ('milestone_boralex_agreement_2026', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), 'Mar 25, 2026', 'Brookfield and La Caisse announced a definitive agreement to acquire Boralex for C$37.25 per share in cash.', 'ACQUISITION', '2026-03-25'),
  ('milestone_boralex_ownership_2026', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), 'Mar 25, 2026', 'The transaction announcement stated that La Caisse would own 30% and Brookfield would own 70% of Boralex after closing.', 'FINANCING', '2026-03-25'),
  ('milestone_boralex_expected_close_2026', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), 'Q4 2026', 'The parties expected the Boralex take-private transaction to close by Q4 2026, subject to required approvals and other customary closing conditions.', 'OTHER', '2026-10-01')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Person" ("id", "name")
VALUES
  ('person_patrick_decostre', 'Patrick Decostre'),
  ('person_stephane_milot', 'Stéphane Milot')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ManagementRole" ("id", "personId", "companyId", "title")
VALUES
  ('role_boralex_patrick_decostre', 'person_patrick_decostre', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), 'President and Chief Executive Officer'),
  ('role_boralex_stephane_milot', 'person_stephane_milot', (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'), 'Executive Vice President and Chief Financial Officer (interim)')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Source" ("id", "label", "url", "type", "createdAt")
VALUES
  ('source_boralex_home', 'Boralex — Boralex Inc.', 'https://www.boralex.com/', 'WEBSITE', now()),
  ('source_boralex_deal_release', 'Announcement date source — Brookfield Asset Management / La Caisse — Boralex Inc.', 'https://www.boralex.com/en/press-releases/boralex-enters-definitive-agreement-be-acquired-brookfield-alongside-la-caisse', 'PRESS_RELEASE', now()),
  ('source_boralex_lacaisse_release', 'Announcement date source — La Caisse — Boralex Inc.', 'https://www.lacaisse.com/en/news/pressreleases/boralex-enters-definitive-agreement-be-acquired-brookfield-alongside-caisse', 'PRESS_RELEASE', now()),
  ('source_boralex_2025_results', 'Scale source — Boralex Inc.', 'https://us.boralex.com/en/press-releases/boralex-annual-results-2025', 'PRESS_RELEASE', now()),
  ('source_boralex_decostre', 'Management source — Boralex Inc.', 'https://www.boralex.com/en/investors/our-governance/patrick-decostre', 'WEBSITE', now()),
  ('source_boralex_cfo_transition', 'CFO transition source — Boralex Inc.', 'https://us.boralex.com/en/press-releases/boralex-announces-departure-its-chief-financial-officer', 'PRESS_RELEASE', now())
ON CONFLICT ("url") DO UPDATE SET
  "label" = EXCLUDED."label",
  "type" = EXCLUDED."type";

INSERT INTO "Citation" ("id", "sourceId", "companyId")
VALUES
  ('citation_boralex_home', (SELECT "id" FROM "Source" WHERE "url" = 'https://www.boralex.com/'), (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom')),
  ('citation_boralex_deal_release', (SELECT "id" FROM "Source" WHERE "url" = 'https://www.boralex.com/en/press-releases/boralex-enters-definitive-agreement-be-acquired-brookfield-alongside-la-caisse'), (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom')),
  ('citation_boralex_lacaisse_release', (SELECT "id" FROM "Source" WHERE "url" = 'https://www.lacaisse.com/en/news/pressreleases/boralex-enters-definitive-agreement-be-acquired-brookfield-alongside-caisse'), (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom')),
  ('citation_boralex_2025_results', (SELECT "id" FROM "Source" WHERE "url" = 'https://us.boralex.com/en/press-releases/boralex-annual-results-2025'), (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom')),
  ('citation_boralex_decostre', (SELECT "id" FROM "Source" WHERE "url" = 'https://www.boralex.com/en/investors/our-governance/patrick-decostre'), (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom')),
  ('citation_boralex_cfo_transition', (SELECT "id" FROM "Source" WHERE "url" = 'https://us.boralex.com/en/press-releases/boralex-announces-departure-its-chief-financial-officer'), (SELECT "id" FROM "Company" WHERE "name" = 'Boralex Inc.' AND "country" = 'United States / Canada / France / United Kingdom'))
ON CONFLICT ("id") DO NOTHING;
