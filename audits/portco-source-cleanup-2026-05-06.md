# PortCo Source Cleanup - 2026-05-06

## Scope

Reviewed PortCo seed-data sources for high-confidence duplicate cleanup while adding scorecard source categorization.

Cleanup rule used in this pass: remove only exact duplicate `label` + `url` rows within the same PortCo. Same-URL rows with different labels were kept unless the duplicated row clearly added no distinct evidence.

## Removed

| Company | URL | Removed row | Reason |
| --- | --- | --- | --- |
| Monterra Energy | `https://www.kkr.com/businesses/infrastructure` | `Kkr - Monterra Energy` | Exact duplicate label and URL; one identical KKR infrastructure source remains. |
| BIG Fiber | `https://bigfiber.com/` | `Bigfiber - BIG Fiber` | Exact duplicate label and URL; one identical BIG Fiber homepage source remains. |

## Reviewed And Kept

These same-URL candidates were intentionally kept because the labels refer to distinct owner, sponsor, or evidence context, or because the duplicate page is being used to support separate scorecard facts.

| Company | URL | Kept labels | Reason |
| --- | --- | --- | --- |
| Arevon Energy, Inc. | `https://www.prnewswire.com/news-releases/arevon-energy-inc-formed-through-combination-of-capital-dynamics-us-clean-energy-infrastructure-team-members-and-arevon-asset-management-301356809.html` | ADIA announcement; APG announcement | Same transaction source supports two named investors. |
| Chicago Parking Meters, LLC | `https://metroplanning.org/projects/innovative-infrastructure-delivery-chicago-parking-meter-analysis/` | MSIP close; ADIA close; Allianz close | Same concession history source supports multiple ownership entries. |
| Hudson Transmission Project | `https://www.oregon.gov/energy/facilities-safety/facilities/Facilities%20library/2026-02-27-CRTAPPDoc01-02-pASC-Organizational-Expertise-Exhibit.pdf` | Argo investment; APG investment | Same public filing supports multiple investor references. |
| LBJ Express | `https://www.fhwa.dot.gov/ipd/project_profiles/tx_lbj_express.aspx` | Meridiam close; APG close | Same public project profile supports multiple ownership references. |
| Invenergy AMPCI Thermal Power | `https://www.infrabridge.com/our-portfolio` | DigitalBridge investment; InfraBridge investment | Same portfolio page reflects predecessor/current platform naming. |
| InTransit BC | `https://www.lexpert.ca/big-deals/ravco-intransit-bc-and-the-gvta-enter-into-p3/345743` | BCI close; CDPQ close | Same transaction source supports multiple investors. |
| Northview Energy | `https://bep.brookfield.com/press-releases/bep/bci-norges-bank-investment-management-and-brookfield-partner-launch-northview` | BCI announcement; Brookfield announcement | Same platform launch source supports multiple investors. |
| Portland Natural Gas Transmission System | `https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/` | BlackRock close; MSIP close | Same seller announcement supports multiple buyers. |
| Misae Solar Park | `https://www.misaesolar.com/misae-solar-park` | CIP investment; Misae project profile | Same page supports both ownership context and asset detail. |
| ConGlobal | `https://www.infrabridge.com/our-portfolio` | InfraBridge profile; InfraBridge investment | Same portfolio page supports company profile and ownership context. |
| ExteNet Systems | `https://www.prnewswire.com/news-releases/chicago-region-extenet-systems-completes-recapitalization-300180129.html` | DigitalBridge close; Stonepeak close | Same recapitalization source supports multiple investors. |
| Conterra Networks | `https://www.prnewswire.com/news-releases/apg-and-fiera-infrastructure-complete-purchase-of-conterra-networks-301323439.html` | APG close; PR Newswire transaction source | One row is owner-specific; one is general transaction evidence. |
| Aurora Sustainable Lands | `https://aurorasustainablelands.com/about/` | Company profile; EIG investment | Same page supports company profile and sponsor context. |
| Oncor Electric Delivery Company LLC | `https://www.torys.com/work/2008/11/ea6d722d-2ece-417f-92ad-29261e2fc82b` | GIC close; OMERS close | Same transaction source supports multiple investors. |
| Tallgrass Energy | `https://www.blackstone.com/news/press/blackstone-infrastructure-partners-closes-purchase-of-controlling-interest-in-tallgrass-energy/` | Blackstone close; GIC close | Same transaction source supports multiple investors. |
| ALLETE, Inc. | `https://investor.allete.com/news-releases/news-release-details/allete-enters-agreement-be-acquired-partnership-led-canada` | CPP announcement; GIP announcement | Same announcement source supports multiple investors. |
| ALLETE, Inc. | `https://investor.allete.com/news-releases/news-release-details/allete-announces-completion-acquisition-cpp-investments-and` | CPP close; GIP close | Same close source supports multiple investors. |
| Rio Grande LNG | `https://investors.next-decade.com/news-releases/news-release-details/nextdecade-announces-positive-final-investment-decision-rio` | GIP close; GIC close | Same financing/ownership source supports multiple investors. |
| Vanguard Renewables | `https://www.vanguardrenewables.com/our-story` | Company profile; GIP/BlackRock investment | Same page supports company profile and sponsor context. |
| Generate Capital | `https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions` | AustralianSuper close; CBRE IM close | Same financing source supports multiple investors. |
| Duquesne Light Company | `https://duquesnelight.com/company/about/investors` | GIC investment; APG investment | Same investor page supports multiple ownership references. |
| Puget Sound Energy | `https://www.sec.gov/Archives/edgar/data/81100/000119312509027209/dex991.htm` | AIMCo close; BCI close | Same SEC exhibit supports multiple investors. |
| NineDot Energy | `https://www.businesswire.com/news/home/20240110676731/en/NineDot-Energy-Raises-%24225-Million-in-Equity-Financing-to-Build-and-Operate-Distributed-Battery-Energy-Storage-Projects` | Manulife investment; Carlyle Infrastructure investment | Same equity financing source supports multiple investors. |
| Ports America | `https://www.prnewswire.com/news-releases/cpp-investments-to-acquire-ports-america-interest-from-oaktree-301387716.html` | CPP ownership history; CPP announcement | Same page supports ownership history and announcement timing. |

## Guardrail

No source was removed if it appeared to be the only support for ownership, investment year, current owner, asset scale, financing, management, regulatory status, or a milestone.
