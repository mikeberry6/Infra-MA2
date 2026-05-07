-- Prune residual citation rows from duplicate/variant company records that
-- merge into the same visible PortCo scorecards.
--
-- The first pruning migration removes the seed-listed noisy URLs. These rows
-- catch older live-database citations that were already consolidated into the
-- canonical ExteNet and Vantage scorecards by previous migrations.

WITH pruned_sources(company_name, url) AS (
  VALUES
  ('Extenet', 'https://extenet.com/about-us/our-story/'),
  ('Extenet', 'https://www.stblaw.com/about-us/news/view/2015/07/29/digital-bridge-and-stonepeak-infrastructure-partners-to-recapitalize-extenet-systems'),
  ('Extenet', 'https://extenet.com/extenet-systems-announces-successful-closing-of-manulife-investment/'),
  ('Extenet', 'https://extenet.com/extenet-systems-is-now-extenet/'),
  ('ExteNet Systems', 'https://www.prnewswire.com/news-releases/manulife-investment-management-completes-strategic-investment-in-extenet-systems-301288019.html'),
  ('ExteNet Systems', 'https://extenet.com/about-us/our-story/'),
  ('ExteNet Systems', 'https://www.stblaw.com/about-us/news/view/2015/07/29/digital-bridge-and-stonepeak-infrastructure-partners-to-recapitalize-extenet-systems'),
  ('ExteNet Systems', 'https://extenet.com/extenet-systems-announces-successful-closing-of-manulife-investment/'),
  ('ExteNet Systems', 'https://extenet.com/extenet-systems-is-now-extenet/'),
  ('Vantage Data Centers', 'https://vantage-dc.com/company/'),
  ('Vantage Data Centers', 'https://ir.digitalbridge.com/node/9926/html'),
  ('Vantage Data Centers', 'https://vantage-dc.com/news/vantage-data-centers-completes-9-2-billion-equity-investment-led-by-digitalbridge-and-silver-lake/')
)
DELETE FROM "Citation" c
USING "Company" co, "Source" s, pruned_sources p
WHERE c."companyId" = co."id"
  AND c."sourceId" = s."id"
  AND co."name" = p.company_name
  AND s."url" = p.url;
