# PortCo Source Pruning - 2026-05-07

## Scope

Pruned 26 source-heavy PortCo scorecards from a combined 267 source rows to 147 kept rows. The pass targeted scorecards with 8+ sources and used a balanced 4-6 source target, with 7 allowed for unusually complex ownership or regulated-asset cases.

Guardrail: no source was removed when it appeared to be the only support for ownership, investment year, current owner, asset scale, financing, management, regulatory status, or a major milestone. Shared Source records were not deleted; only company Citation rows are pruned by the migration.

Follow-up check: after applying the first migration to the live database, ExteNet Systems and Vantage Data Centers still had extra visible rows because older duplicate-company citations had already been merged into their canonical scorecards. A second migration prunes those residual variant citations, and the duplicate `Extenet` seed row now relies on the canonical ExteNet Systems scorecard sources rather than adding its own repeated source block.

## Summary

| Company | Before | Kept | Removed |
| --- | ---: | ---: | ---: |
| ExteNet Systems | 16 | 6 | 10 |
| Generate Capital | 16 | 6 | 10 |
| Puget Sound Energy | 16 | 7 | 9 |
| Vantage Data Centers | 16 | 7 | 9 |
| Duquesne Light Company | 13 | 5 | 8 |
| Rio Grande LNG | 12 | 6 | 6 |
| DataBank | 11 | 6 | 5 |
| Gemini Solar + Storage | 11 | 5 | 6 |
| Phoenix Tower International | 11 | 6 | 5 |
| Brazos Midstream | 10 | 6 | 4 |
| Tallgrass Energy | 10 | 5 | 5 |
| Chicago Parking Meters, LLC | 9 | 5 | 4 |
| InTransit BC | 9 | 5 | 4 |
| Portland Natural Gas Transmission System | 9 | 5 | 4 |
| Sempra Infrastructure Partners, LP | 9 | 6 | 3 |
| Third Coast Infrastructure | 9 | 5 | 4 |
| ACES Delta | 8 | 5 | 3 |
| Aligned Data Centers | 8 | 6 | 2 |
| Atlantica Sustainable Infrastructure plc | 8 | 6 | 2 |
| Cascade Power Project | 8 | 5 | 3 |
| Catalyze | 8 | 6 | 2 |
| Compass Datacenters | 8 | 5 | 3 |
| FirstEnergy Transmission, LLC | 8 | 6 | 2 |
| Golden State Wind | 8 | 5 | 3 |
| Oncor Electric Delivery Company LLC | 8 | 6 | 2 |
| Vertical Bridge | 8 | 6 | 2 |

## ExteNet Systems

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Announcement date source - Manulife - ExteNet Systems | businesswire.com | Kept as distinct ownership or investment evidence. |
| Investment date source - DigitalBridge - ExteNet Systems | digitalbridge.com | Kept as distinct ownership or investment evidence. |
| Close date source - DigitalBridge - ExteNet Systems | prnewswire.com | Kept as distinct ownership or investment evidence. |
| Extenet - ExteNet Systems, LLC | extenet.com | Kept as the best company/profile source. |
| Close date source - Stonepeak - ExteNet Systems | prnewswire.com | Kept as distinct ownership or investment evidence. |
| Investment date source - Northleaf - ExteNet Systems | northleafcapital.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Extenet - ExteNet Systems | extenet.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Extenet - ExteNet Systems | extenet.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Close date source - Manulife - ExteNet Systems | prnewswire.com | Removed syndicated or duplicative release; primary transaction evidence retained. |
| Extenet - ExteNet Systems | extenet.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Extenet - ExteNet Systems | extenet.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Extenet - ExteNet Systems, LLC | extenet.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Extenet - ExteNet Systems, LLC | extenet.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Manulifeim - ExteNet Systems, LLC | manulifeim.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Announcement date source - Stonepeak - ExteNet Systems | prnewswire.com | Removed syndicated or duplicative release; primary transaction evidence retained. |
| Wireless Estimator - INF-2026-066 - Extenet Systems (Enterprise Fiber) | wirelessestimator.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |

## Generate Capital

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Investment date source - QIC - Generate Capital | qic.com | Kept as distinct ownership or investment evidence. |
| Generatecapital - Generate Capital | generatecapital.com | Kept as the best company/profile source. |
| Generatecapital - Generate Capital | generatecapital.com | Kept as the best company/profile source. |
| Close date source - AustralianSuper - Generate Capital | businesswire.com | Kept as distinct ownership or investment evidence. |
| Close date source - CBRE Investment Management - Generate Capital | businesswire.com | Kept as distinct ownership or investment evidence. |
| Close date source - Harbert Management Corp (Harbert Infra / Gulf Pacific) - Generate Capital | harbert.net | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Generatecapital - Generate Capital | generatecapital.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Generatecapital - Generate Capital | generatecapital.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Generatecapital - Generate Capital | generatecapital.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Bloomberg - Generate Capital | bloomberg.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Australiansuper - Generate Capital | australiansuper.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Generatecapital - Generate Capital | generatecapital.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Generatecapital - Generate Capital | generatecapital.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Business Wire - Generate Capital | businesswire.com | Removed syndicated or duplicative release; primary transaction evidence retained. |
| Generate Capital - INF-2026-139 - Equinox Growers Greenhouse Facility | generatecapital.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| GlobeNewswire - INF-2026-195 - 104 MW Community Solar Portfolio | globenewswire.com | Removed syndicated or duplicative release; primary transaction evidence retained. |

## Puget Sound Energy

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Pse - Puget Sound Energy | pse.com | Kept as the best company/profile source. |
| Close date source - OTPP - Puget Sound Energy | otpp.com | Kept as distinct ownership or investment evidence. |
| Pse - Puget Sound Energy | pse.com | Kept as operating footprint or asset-scale evidence. |
| Omers - Puget Sound Energy | omers.com | Kept as the best company/profile source. |
| Close date source - AIMCo - Puget Sound Energy | sec.gov | Kept as distinct ownership or investment evidence. |
| Close date source - BCI - Puget Sound Energy | sec.gov | Kept as distinct ownership or investment evidence. |
| Close date source - Macquarie Asset Management - Puget Sound Energy | macquarie.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Announcement source - Macquarie Asset Management - Puget Sound Energy | macquarie.com | Removed duplicate or generic profile page; stronger profile source retained. |
| GlobeNewsWire - Puget Sound Energy | globenewswire.com | Removed syndicated or duplicative release; primary transaction evidence retained. |
| Pse - Puget Sound Energy | pse.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Pse - Puget Sound Energy | pse.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Pse - Puget Sound Energy | pse.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Pugetenergy - Puget Sound Energy | pugetenergy.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Pse - Puget Sound Energy | pse.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Investment date source - OMERS - Puget Sound Energy | aimco.ca | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Assets - Puget Sound Energy | assets.ctfassets.net | Removed extra report or PDF that repeats context covered by stronger sources. |

## Vantage Data Centers

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Vantage Dc - Vantage Data Centers | vantage-dc.com | Kept as the best company/profile source. |
| Close date source - DigitalBridge - Vantage Data Centers | vantage-dc.com | Kept as distinct ownership or investment evidence. |
| Close date source - Silver Lake - Vantage Data Centers | silverlake.com | Kept as distinct ownership or investment evidence. |
| Close date source - CBRE Investment Management - Vantage Data Centers stabilized portfolio | cbrecaledon.com | Kept as distinct ownership or investment evidence. |
| Investment date source - GCM Grosvenor - Vantage Data Centers | gcmgrosvenor.com | Kept as distinct ownership or investment evidence. |
| Digitalbridge - Vantage Data Centers | digitalbridge.com | Kept as the best company/profile source. |
| Digitalbridge - Vantage Data Centers North America | digitalbridge.com | Kept as operating footprint or asset-scale evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Close date source - DigitalBridge - Vantage Data Centers | prnewswire.com | Removed syndicated or duplicative release; primary transaction evidence retained. |
| Vantage Dc - Vantage Data Centers stabilized portfolio | vantage-dc.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Investment date source - DigitalBridge - Vantage SDC | digitalbridge.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Investment date source - DigitalBridge - Vantage SDC | ir.digitalbridge.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| DigitalBridge - Vantage SDC deconsolidation | ir.digitalbridge.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| GCM Grosvenor - Vantage Data Centers partial realization | gcmgrosvenor.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Vantage Dc - Vantage Data Centers | vantage-dc.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Digitalbridge - Vantage Data Centers AI infrastructure update | ir.digitalbridge.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Vantage Dc - Vantage Data Centers offices | vantage-dc.com | Removed duplicate or generic profile page; stronger profile source retained. |

## Duquesne Light Company

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Investment date source - GIC - Duquesne Light Company | duquesnelight.com | Kept as distinct ownership or investment evidence. |
| Investment date source - APG Infrastructure - Duquesne Light Company | duquesnelight.com | Kept as distinct ownership or investment evidence. |
| Duquesnelight - Duquesne Light Company | duquesnelight.com | Kept as the best company/profile source. |
| Close date source - Macquarie Asset Management - Duquesne Light Company | puc.pa.gov | Kept as distinct ownership or investment evidence. |
| Manulifeim - Duquesne Light Holdings, Inc. | manulifeim.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Duquesnelight - Duquesne Light Company | duquesnelight.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Duquesnelight - Duquesne Light Company | duquesnelight.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Puc - Duquesne Light Company | puc.pa.gov | Removed extra report or PDF that repeats context covered by stronger sources. |
| Duquesnelight - Duquesne Light Company | duquesnelight.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Duquesnelight - Duquesne Light Company | duquesnelight.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Puc - Duquesne Light Company | puc.pa.gov | Removed extra report or PDF that repeats context covered by stronger sources. |
| Manulifeim - Duquesne Light Company | manulifeim.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Duquesnelight - Duquesne Light Holdings, Inc. | duquesnelight.com | Removed extra report or PDF that repeats context covered by stronger sources. |

## Rio Grande LNG

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Close date source - Global Infrastructure Partners - Rio Grande LNG | investors.next-decade.com | Kept as distinct ownership or investment evidence. |
| Close date source - GIC - Rio Grande LNG | investors.next-decade.com | Kept as distinct ownership or investment evidence. |
| Close date source - Mubadala - Rio Grande LNG | corporate.totalenergies.us | Kept as distinct ownership or investment evidence. |
| Next Decade - Rio Grande LNG | next-decade.com | Kept as the best company/profile source. |
| Riograndelng - Rio Grande LNG, LLC | riograndelng.com | Kept as the best company/profile source. |
| Federalregister - Rio Grande LNG, LLC | federalregister.gov | Kept as filing, regulatory, or financing evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Investment date source - GIC - Rio Grande LNG | sidley.com | Removed advisor/legal supporting page; primary sponsor, company, or filing evidence retained. |
| Investors - Rio Grande LNG | investors.next-decade.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Totalenergies - Rio Grande LNG | totalenergies.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Global Infra - Rio Grande LNG | global-infra.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Next Decade - Rio Grande LNG, LLC | next-decade.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Global Infra - Rio Grande LNG, LLC | global-infra.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## DataBank

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Databank - DataBank | databank.com | Kept as the best company/profile source. |
| Close date source - Swiss Life - DataBank | databank.com | Kept as distinct ownership or investment evidence. |
| Announcement date source - AustralianSuper - DataBank | databank.com | Kept as distinct ownership or investment evidence. |
| Investment date source - IMCO - DataBank | imcoinvest.com | Kept as distinct ownership or investment evidence. |
| Digitalbridge - DataBank | digitalbridge.com | Kept as operating footprint or asset-scale evidence. |
| Close date source - DigitalBridge - DataBank | databank.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Databank - DataBank | databank.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Announcement date source - Swiss Life - DataBank | fr.swisslife-am.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Announcement date source - AustralianSuper - DataBank | australiansuper.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Digitalbridge - DataBank | digitalbridge.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Goodman - INF-2026-162 - DataBank / Goodman Los Angeles JV (32 MW) | goodman.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Gemini Solar + Storage

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Announcement date source - APG Infrastructure - Gemini Solar + Storage | quinbrook.com | Kept as distinct ownership or investment evidence. |
| Close date source - Quinbrook - Gemini Solar + Storage | quinbrook.com | Kept as distinct ownership or investment evidence. |
| Business Wire - Gemini Solar + Storage | businesswire.com | Kept as operating footprint or asset-scale evidence. |
| Primergygemini - Gemini Solar + Storage | primergygemini.com | Kept as the best company/profile source. |
| Quinbrook - Gemini Solar + Storage | quinbrook.com | Kept as operating footprint or asset-scale evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Key - Gemini Solar + Storage | key.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Quinbrook - Gemini Solar + Storage | quinbrook.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Eia - Gemini Solar + Storage | eia.gov | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Quinbrook - Gemini Solar + Storage | quinbrook.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Primergypower - Gemini Solar + Storage | primergypower.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Primergypower - Gemini Solar + Storage | primergypower.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Phoenix Tower International

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Phoenixintnl - Phoenix Tower International | phoenixintnl.com | Kept as operating footprint or asset-scale evidence. |
| Phoenixintnl - Phoenix Tower International | phoenixintnl.com | Kept as the best company/profile source. |
| Phoenixintnl - Phoenix Tower International | phoenixintnl.com | Kept as a material milestone or transaction source. |
| Whinfra - Phoenix Tower International | whinfra.com | Kept as operating footprint or asset-scale evidence. |
| Investment date source - Wren House - Phoenix Tower International | phoenixintnl.com | Kept as distinct ownership or investment evidence. |
| Close date source - Blackstone - Phoenix Tower International | blackstone.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Close date source - Blackstone - Phoenix Tower International | phoenixintnl.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Aoshearman - Phoenix Tower International | aoshearman.com | Removed advisor/legal supporting page; primary sponsor, company, or filing evidence retained. |
| Stblaw - Phoenix Tower International | stblaw.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Phoenixintnl - Phoenix Tower International | phoenixintnl.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Phoenixintnl - Phoenix Tower International | phoenixintnl.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Brazos Midstream

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Brazosmidstream - Brazos Midstream | brazosmidstream.com | Kept as the best company/profile source. |
| Brazosmidstream - Brazos Midstream | brazosmidstream.com | Kept as operating footprint or asset-scale evidence. |
| Investment date source - EnCap Investments - Brazos Midstream | encapinvestments.com | Kept as distinct ownership or investment evidence. |
| Brazosmidstream - Brazos Midstream | brazosmidstream.com | Kept as a material milestone or transaction source. |
| Close date source - MSIP - Brazos Midstream | brazosmidstream.com | Kept as distinct ownership or investment evidence. |
| Investment date source - MSIP - Brazos Midstream | morganstanley.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Efmidstream - Brazos Midstream | efmidstream.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Brazosmidstream - Brazos Midstream | brazosmidstream.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Acquisition agreement source - MSIP - Brazos Midstream | brazosmidstream.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Brazosmidstream - Brazos Midstream | brazosmidstream.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Tallgrass Energy

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| SEC - Tallgrass Energy | sec.gov | Kept as filing, regulatory, or financing evidence. |
| Cppinvestments - Tallgrass Energy | cppinvestments.com | Kept as a material milestone or transaction source. |
| Close date source - Blackstone - Tallgrass Energy | blackstone.com | Kept as distinct ownership or investment evidence. |
| Close date source - GIC - Tallgrass Energy | blackstone.com | Kept as distinct ownership or investment evidence. |
| Tallgrass - Tallgrass Energy | tallgrass.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Tallgrassenergy - Tallgrass Energy | tallgrassenergy.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Announcement date source - Blackstone - Tallgrass Energy | blackstone.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Announcement date source - GIC - Tallgrass Energy | blackstone.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Tallgrass - Tallgrass Energy | tallgrass.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Tallgrass - Tallgrass Energy | tallgrass.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Chicago Parking Meters, LLC

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Chicago - Chicago Parking Meters, LLC | chicago.gov | Kept as the best company/profile source. |
| Close date source - MSIP - Chicago Parking Meters, LLC | metroplanning.org | Kept as distinct ownership or investment evidence. |
| Close date source - ADIA Infrastructure - Chicago Parking Meters, LLC | metroplanning.org | Kept as distinct ownership or investment evidence. |
| Close date source - Allianz Global Investors - Chicago Parking Meters, LLC | metroplanning.org | Kept as distinct ownership or investment evidence. |
| Parkchicago - Chicago Parking Meters, LLC | parkchicago.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Morganstanley - Chicago Parking Meters, LLC | morganstanley.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Morganstanley - Chicago Parking Meters, LLC | morganstanley.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Parkchicago - Chicago Parking Meters, LLC | parkchicago.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Morganstanley - Chicago Parking Meters, LLC | morganstanley.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |

## InTransit BC

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Close date source - BCI - InTransit BC | lexpert.ca | Kept as distinct ownership or investment evidence. |
| Close date source - CDPQ - InTransit BC | lexpert.ca | Kept as distinct ownership or investment evidence. |
| Bci - InTransit BC | bci.ca | Kept as the best company/profile source. |
| Translink - InTransit BC | translink.ca | Kept as the best company/profile source. |
| Translink - InTransit BC | translink.ca | Kept as operating footprint or asset-scale evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Thecdm - InTransit BC | thecdm.ca | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Ca - InTransit BC | ca.linkedin.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Cdpqinfra - InTransit BC | cdpqinfra.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Snclavalin - InTransit BC | snclavalin.com | Removed extra report or PDF that repeats context covered by stronger sources. |

## Portland Natural Gas Transmission System

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Close date source - BlackRock - Portland Natural Gas Transmission System | tcenergy.com | Kept as distinct ownership or investment evidence. |
| Close date source - MSIP - Portland Natural Gas Transmission System | tcenergy.com | Kept as distinct ownership or investment evidence. |
| Investment date source - MSIP - Portland Natural Gas Transmission System | morganstanley.com | Kept as distinct ownership or investment evidence. |
| Fitchratings - Portland Natural Gas Transmission System | fitchratings.com | Kept as the best company/profile source. |
| Pngts - Portland Natural Gas Transmission System | pngts.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Announcement date source - BlackRock - Portland Natural Gas Transmission System | tcenergy.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Northeastgas - Portland Natural Gas Transmission System | northeastgas.org | Removed extra report or PDF that repeats context covered by stronger sources. |
| Pngts - Portland Natural Gas Transmission System | pngts.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Bracewell - Portland Natural Gas Transmission System | bracewell.com | Removed advisor/legal supporting page; primary sponsor, company, or filing evidence retained. |

## Sempra Infrastructure Partners, LP

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Semprainfrastructure - Sempra Infrastructure Partners | semprainfrastructure.com | Kept as the best company/profile source. |
| Announcement date source - CPP Investments - Sempra Infrastructure Partners, LP | cppinvestments.com | Kept as distinct ownership or investment evidence. |
| Close date source - ADIA Infrastructure - Sempra Infrastructure Partners, LP | sempra.com | Kept as distinct ownership or investment evidence. |
| Close date source - KKR - Sempra Infrastructure Partners, LP | sec.gov | Kept as distinct ownership or investment evidence. |
| Investment date source - Mubadala - Sempra Infrastructure Partners, LP | mubadala.com | Kept as distinct ownership or investment evidence. |
| Investment date source - ADIA Infrastructure - Sempra Infrastructure Partners, LP | adia.ae | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Semprainfrastructure - Sempra Infrastructure Partners | semprainfrastructure.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Semprainfrastructure - Sempra Infrastructure Partners | semprainfrastructure.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Follow-on announcement source - KKR - Sempra Infrastructure Partners, LP | sempra.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Third Coast Infrastructure

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Third Coast - Third Coast Infrastructure | third-coast.com | Kept as the best company/profile source. |
| Close date source - J.P. Morgan Asset Management - Third Coast Infrastructure | third-coast.com | Kept as distinct ownership or investment evidence. |
| Close date source - ArcLight Capital Partners - Third Coast Infrastructure | prnewswire.com | Kept as distinct ownership or investment evidence. |
| Third Coast - Third Coast Infrastructure, LLC | third-coast.com | Kept as operating footprint or asset-scale evidence. |
| Am - Third Coast Infrastructure, LLC | am.jpmorgan.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Infrapppworld - Third Coast Infrastructure | infrapppworld.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Third Coast - Third Coast Infrastructure | third-coast.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Third Coast - Third Coast Infrastructure, LLC | third-coast.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Ownership source - J.P. Morgan Asset Management - Third Coast Infrastructure | pestakeholder.org | Removed lower-impact or duplicative event source; strongest related event source retained. |

## ACES Delta

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Aces Delta - ACES Delta | aces-delta.com | Kept as the best company/profile source. |
| Investment date source - GIC - ACES Delta | hvllc.com | Kept as distinct ownership or investment evidence. |
| Investment date source - AIMCo - ACES Delta | aimco.ca | Kept as distinct ownership or investment evidence. |
| Investment date source - OTPP - ACES Delta | otpp.com | Kept as distinct ownership or investment evidence. |
| Project financing source - ACES Delta | aces-delta.com | Kept as filing, regulatory, or financing evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Otpp - ACES Delta | otpp.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Aces Delta - ACES Delta | aces-delta.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Energy - ACES Delta | energy.gov | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |

## Aligned Data Centers

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Investment date source - Mubadala - Aligned Data Centers | aligneddc.com | Kept as distinct ownership or investment evidence. |
| Aligneddc - Aligned Data Centers | aligneddc.com | Kept as the best company/profile source. |
| Mubadala - Aligned Data Centers | mubadala.com | Kept as operating footprint or asset-scale evidence. |
| Announcement date source - Global Infrastructure Partners - Aligned Data Centers | aligneddc.com | Kept as distinct ownership or investment evidence. |
| Investment date source - Macquarie Asset Management - Aligned Data Centers | aligneddc.com | Kept as distinct ownership or investment evidence. |
| Announcement date source - Macquarie Asset Management - Aligned Data Centers | macquarie.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Announcement date source - Global Infrastructure Partners - Aligned Data Centers | blackrock.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Macquarie - Aligned Data Centers | macquarie.com | Removed duplicate or generic profile page; stronger profile source retained. |

## Atlantica Sustainable Infrastructure plc

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Atlantica - Atlantica Sustainable Infrastructure plc | atlantica.com | Kept as the best company/profile source. |
| Atlantica - Atlantica Sustainable Infrastructure plc | atlantica.com | Kept as operating footprint or asset-scale evidence. |
| Announcement date source - ECP - Atlantica Sustainable Infrastructure plc | ecpgp.com | Kept as distinct ownership or investment evidence. |
| Investment date source - Temasek - Atlantica Sustainable Infrastructure plc | temasek.com.sg | Kept as distinct ownership or investment evidence. |
| Close date source - ECP - Atlantica Sustainable Infrastructure plc | atlantica.com | Kept as distinct ownership or investment evidence. |
| Court approval source - ECP co-investors - Atlantica Sustainable Infrastructure plc | globenewswire.com | Kept as a material milestone or transaction source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Investment date source - ECP - Atlantica Sustainable Infrastructure plc | ecpgp.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Ecpgp - Atlantica Sustainable Infrastructure plc | ecpgp.com | Removed duplicate or generic profile page; stronger profile source retained. |

## Cascade Power Project

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Close date source - Axium Infrastructure - Cascade Power Project | axiuminfra.com | Kept as distinct ownership or investment evidence. |
| Cascadepower - Cascade Power Project | cascadepower.com | Kept as operating footprint or asset-scale evidence. |
| Kineticor - Cascade Power Project | kineticor.ca | Kept as operating footprint or asset-scale evidence. |
| Investment date source - CVC DIF - Cascade Power Project | cvcdif.com | Kept as distinct ownership or investment evidence. |
| Iaac Aeic - Cascade Power Project | iaac-aeic.gc.ca | Kept as operating footprint or asset-scale evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Axiuminfra - Cascade Power Project | axiuminfra.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Axiuminfra - Cascade Power Project | axiuminfra.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Pcl - Cascade Power Project | pcl.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |

## Catalyze

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Catalyze - Catalyze | catalyze.com | Kept as the best company/profile source. |
| Announcement date source - Actis - Catalyze | act.is | Kept as distinct ownership or investment evidence. |
| Catalyze - Catalyze | catalyze.com | Kept as operating footprint or asset-scale evidence. |
| Catalyze - Catalyze | catalyze.com | Kept as a material milestone or transaction source. |
| Investment date source - EnCap Investments - Catalyze | encapinvestments.com | Kept as distinct ownership or investment evidence. |
| Encapinvestments - Catalyze | encapinvestments.com | Kept as a material milestone or transaction source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Catalyze - Catalyze | catalyze.com | Removed duplicate or generic profile page; stronger profile source retained. |
| Encapinvestments - Catalyze | encapinvestments.com | Removed lower-impact or duplicative event source; strongest related event source retained. |

## Compass Datacenters

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Compassdatacenters - Compass Datacenters | compassdatacenters.com | Kept as the best company/profile source. |
| Compassdatacenters - Compass Datacenters | compassdatacenters.com | Kept as the best company/profile source. |
| Investment date source - OTPP - Compass Datacenters | otpp.com | Kept as distinct ownership or investment evidence. |
| Follow-on acquisition source - OTPP - Compass Datacenters | otpp.com | Kept as a material milestone or transaction source. |
| Close date source - Brookfield Asset Management - Compass Datacenters | mccarthy.ca | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Compassdatacenters - Compass Datacenters | compassdatacenters.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Otpp - Compass Datacenters | otpp.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Compassdatacenters - Compass Datacenters | compassdatacenters.com | Removed duplicate or generic profile page; stronger profile source retained. |

## FirstEnergy Transmission, LLC

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Firstenergycorp - FirstEnergy Transmission, LLC | firstenergycorp.com | Kept as the best company/profile source. |
| Close date source - Brookfield Asset Management - FirstEnergy Transmission, LLC | firstenergycorp.com | Kept as distinct ownership or investment evidence. |
| Close date source - ADIA Infrastructure - FirstEnergy Transmission, LLC | firstenergycorp.com | Kept as distinct ownership or investment evidence. |
| Interest confirmation source - ADIA Infrastructure - FirstEnergy Transmission, LLC | documents.dps.ny.gov | Kept as distinct ownership or investment evidence. |
| SEC - FirstEnergy Transmission, LLC | sec.gov | Kept as filing, regulatory, or financing evidence. |
| Brookfield - FirstEnergy Transmission, LLC | brookfield.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Firstenergycorp - FirstEnergy Transmission, LLC | firstenergycorp.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| CFIUS clearance source - ADIA Infrastructure - FirstEnergy Transmission, LLC | tradepractitioner.com | Removed advisor/legal supporting page; primary sponsor, company, or filing evidence retained. |

## Golden State Wind

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Announcement date source - CPP Investments - Golden State Wind | goldenstatewind.com | Kept as distinct ownership or investment evidence. |
| Oceanwinds - Golden State Wind | oceanwinds.com | Kept as operating footprint or asset-scale evidence. |
| Investment date source - CPP Investments - Golden State Wind | boem.gov | Kept as distinct ownership or investment evidence. |
| Boem - Golden State Wind | boem.gov | Kept as the best company/profile source. |
| Vineyardoffshore - Golden State Wind | vineyardoffshore.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Cppinvestments - Golden State Wind | cppinvestments.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Vineyardoffshore - Golden State Wind | vineyardoffshore.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |
| Vineyardoffshore - Golden State Wind | vineyardoffshore.com | Removed lower-impact supporting context; stronger source retained for the same scorecard facts. |

## Oncor Electric Delivery Company LLC

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Oncor - Oncor Electric Delivery | oncor.com | Kept as the best company/profile source. |
| Oncor - Oncor Electric Delivery | oncor.com | Kept as the best company/profile source. |
| SEC - Oncor Electric Delivery | sec.gov | Kept as filing, regulatory, or financing evidence. |
| Sempra - Oncor Electric Delivery Company LLC | sempra.com | Kept as a material milestone or transaction source. |
| Close date source - GIC - Oncor Electric Delivery Company LLC | torys.com | Kept as distinct ownership or investment evidence. |
| Close date source - OMERS - Oncor Electric Delivery Company LLC | torys.com | Kept as distinct ownership or investment evidence. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Oncor - Oncor Electric Delivery Company LLC | oncor.com | Removed extra report or PDF that repeats context covered by stronger sources. |
| Quinnemanuel - Oncor Electric Delivery Company LLC | quinnemanuel.com | Removed advisor/legal supporting page; primary sponsor, company, or filing evidence retained. |

## Vertical Bridge

### Kept

| Label | Host | Reason |
| --- | --- | --- |
| Verticalbridge - Vertical Bridge | verticalbridge.com | Kept as the best company/profile source. |
| Announcement date source - CDPQ - Vertical Bridge | prnewswire.com | Kept as distinct ownership or investment evidence. |
| Digitalbridge - Vertical Bridge | digitalbridge.com | Kept as a material milestone or transaction source. |
| Investment date source - DigitalBridge - Vertical Bridge | verticalbridge.com | Kept as distinct ownership or investment evidence. |
| Verticalbridge - Vertical Bridge | verticalbridge.com | Kept as operating footprint or asset-scale evidence. |
| Vertical Bridge - INF-2026-179 - Vertical Bridge | verticalbridge.com | Kept as the best company/profile source. |

### Removed

| Label | Host | Reason |
| --- | --- | --- |
| Ir - Vertical Bridge | ir.digitalbridge.com | Removed lower-impact or duplicative event source; strongest related event source retained. |
| Verticalbridge - Vertical Bridge | verticalbridge.com | Removed duplicate or generic profile page; stronger profile source retained. |
