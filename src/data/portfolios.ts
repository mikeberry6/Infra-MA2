// Portfolio company data — audited and verified March 2026
// Maps fund IDs to their portfolio companies
// Only includes companies verified via web research as correctly mapped to each fund
import type { PortfolioCompany } from "./funds";

export const PORTFOLIO_DATA: Record<string, PortfolioCompany[]> = {
  // ── 3i Group ──────────────────────────────────────────────
  "FUND-001": [
    { name: "Belfast City Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "Regional airport serving Belfast and Northern Ireland." },
    { name: "DNS:NET", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "German fiber-optic internet and telecommunications provider." },
    { name: "ESVAGT", sector: "Transportation", subsector: "Offshore Marine Services", region: "Europe", country: "Denmark", description: "Offshore support vessel operator serving wind and oil & gas sectors." },
    { name: "Global Cloud Xchange (FLAG)", sector: "Communications", subsector: "Subsea Cables", region: "Global", country: "India", description: "Subsea cable and managed network services operator." },
    { name: "Future Biogas", sector: "Renewables / Energy Transition", subsector: "Biogas", region: "Europe", country: "United Kingdom", description: "Operator of anaerobic digestion biogas plants across the UK." },
    { name: "Infinis", sector: "Renewables / Energy Transition", subsector: "Landfill Gas", region: "Europe", country: "United Kingdom", description: "UK's largest generator of electricity from captured landfill methane." },
    { name: "Joulz", sector: "Utilities", subsector: "Energy Infrastructure Services", region: "Europe", country: "Netherlands", description: "Dutch energy infrastructure services company." },
    { name: "Oystercatcher", sector: "Midstream / Energy", subsector: "Tank Storage", region: "Asia-Pacific", country: "Singapore", description: "Tank storage holding company (Advario Singapore)." },
    { name: "SRL Traffic Systems", sector: "Transportation", subsector: "Traffic Management", region: "Europe", country: "United Kingdom", description: "UK provider of temporary traffic management solutions." },
  ],
  "FUND-002": [
    { name: "Regional Rail", sector: "Transportation", subsector: "Short-Line Rail", region: "North America", country: "United States", description: "North American short-line railroad platform." },
  ],

  // ── Amber Infrastructure ──────────────────────────────────
  "FUND-009": [
    { name: "Tideway (Thames Tideway Tunnel)", sector: "Water", subsector: "Wastewater", region: "Europe", country: "United Kingdom", description: "Major London sewer infrastructure project." },
    { name: "Diabolo Rail Link", sector: "Transportation", subsector: "Rail", region: "Europe", country: "Belgium", description: "Rail link connecting Brussels Airport to the national rail network." },
    { name: "BeNEX", sector: "Transportation", subsector: "Rolling Stock", region: "Europe", country: "Germany", description: "Rolling stock leasing and rail franchise investor in Germany." },
    { name: "Cadent Gas", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "United Kingdom", description: "UK gas distribution network (minority stake)." },
  ],

  // ── Ardian ────────────────────────────────────────────────
  "FUND-027": [
    { name: "SAVE (Venice Marco Polo Airport)", sector: "Transportation", subsector: "Airports", region: "Europe", country: "Italy", description: "Operator of Venice Marco Polo Airport." },
  ],

  // ── Blackstone ────────────────────────────────────────────
  "FUND-055": [
    { name: "AirTrunk", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Australia", description: "Asia-Pacific hyperscale data center platform.", coInvestors: ["CPP Investments"] },
    { name: "Carrix / SSA Marine", sector: "Transportation", subsector: "Port Terminals", region: "North America", country: "United States", description: "One of the largest privately held marine terminal operators in the world." },
    { name: "Cheniere Energy Partners", sector: "Midstream / Energy", subsector: "LNG Export", region: "North America", country: "United States", description: "Major US LNG export terminal operator at Sabine Pass and Corpus Christi." },
    { name: "FirstEnergy", sector: "Utilities", subsector: "Electric Utility", region: "North America", country: "United States", description: "Major US electric utility holding company serving customers across the Midwest and Mid-Atlantic." },
    { name: "Invenergy Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "One of the largest privately held renewable energy companies in North America." },
    { name: "NiSource (NIPSCO)", sector: "Utilities", subsector: "Gas & Electric Utility", region: "North America", country: "United States", description: "Minority stake in regulated gas and electric utility operating primarily in Indiana." },
    { name: "QTS Realty Trust", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Major US data center platform." },
    { name: "Tallgrass Energy", sector: "Midstream / Energy", subsector: "Pipelines", region: "North America", country: "United States", description: "US midstream energy company operating natural gas pipelines and processing." },
  ],

  // ── Brookfield Asset Management ───────────────────────────
  "FUND-058": [
    { name: "Data4 Group", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "France", description: "European data center platform." },
    { name: "HomeServe", sector: "Utilities", subsector: "Home Services", region: "Europe", country: "United Kingdom", description: "Home repairs and improvements services company.", coInvestors: ["Brookfield Infrastructure Partners"] },
    { name: "Triton International", sector: "Transportation", subsector: "Container Leasing", region: "Global", country: "Bermuda", description: "World's largest intermodal container lessor.", coInvestors: ["Brookfield Infrastructure Partners"] },
    { name: "Colonial Pipeline", sector: "Midstream / Energy", subsector: "Pipelines", region: "North America", country: "United States", description: "Major US refined products pipeline system.", coInvestors: ["Brookfield Infrastructure Partners"] },
  ],
  "FUND-059": [
    { name: "AusNet Services", sector: "Utilities", subsector: "Electricity Transmission & Distribution", region: "Asia-Pacific", country: "Australia", description: "Major Australian electricity transmission and distribution company." },
    { name: "Enercare", sector: "Utilities", subsector: "Home Services", region: "North America", country: "Canada", description: "Canadian home and commercial services company.", coInvestors: ["Brookfield Infrastructure Partners"] },
  ],
  "FUND-060": [
    { name: "Neoen", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Global", country: "France", description: "Global independent renewable energy producer." },
  ],

  // ── EIG Global Energy Partners ────────────────────────────
  "FUND-084": [
    { name: "MidOcean Energy", sector: "Midstream / Energy", subsector: "LNG", region: "Global", country: "United States", description: "LNG-focused platform company formed by EIG." },
    { name: "Repsol Upstream (stake)", sector: "Midstream / Energy", subsector: "Oil & Gas E&P", region: "Global", country: "Spain", description: "25% stake in Repsol's global upstream business." },
  ],

  // ── EnCap Investments ─────────────────────────────────────
  "FUND-086": [
    { name: "Lucid Energy Group", sector: "Midstream / Energy", subsector: "Gas Gathering & Processing", region: "North America", country: "United States", description: "Permian Basin natural gas gathering and processing company." },
  ],

  // ── Energy Capital Partners ───────────────────────────────
  "FUND-090": [
    { name: "Convergent Energy + Power", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "North America", country: "United States", description: "US energy storage developer and operator." },
  ],

  // ── Energy Infrastructure Partners ────────────────────────
  "FUND-091": [
    { name: "Alpiq", sector: "Utilities", subsector: "Electric Utility", region: "Europe", country: "Switzerland", description: "Swiss electricity generation and trading company." },
  ],

  // ── EQT Infrastructure ───────────────────────────────────
  "FUND-093": [
    { name: "EdgeConneX", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Global", country: "United States", description: "Global edge data center provider.", coInvestors: ["Sixth Street"] },
  ],

  // ── Equitix ──────────────────────────────────────────────
  "FUND-096": [
    { name: "Cross London Trains (Thameslink rolling stock)", sector: "Transportation", subsector: "Rolling Stock", region: "Europe", country: "United Kingdom", description: "Rolling stock leasing for Thameslink services.", coInvestors: ["Dalmore Capital"] },
    { name: "Moray East Offshore Wind Farm", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "United Kingdom", description: "950 MW offshore wind farm in the Moray Firth, Scotland." },
  ],

  // ── Generate Capital ─────────────────────────────────────
  "FUND-101": [
    { name: "Nexamp", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "US community solar and clean energy company." },
  ],

  // ── IFM Investors ────────────────────────────────────────
  "FUND-114": [
    { name: "Anglian Water", sector: "Water", subsector: "Water & Wastewater", region: "Europe", country: "United Kingdom", description: "UK's largest water and wastewater company by geographic area." },
    { name: "Aqualia (FCC Aqualia)", sector: "Water", subsector: "Water & Wastewater", region: "Europe", country: "Spain", description: "Major Spanish water services company." },
    { name: "Buckeye Partners", sector: "Midstream / Energy", subsector: "Pipelines & Terminals", region: "North America", country: "United States", description: "US midstream pipeline and terminal operator." },
    { name: "Colonial Pipeline (stake)", sector: "Midstream / Energy", subsector: "Pipelines", region: "North America", country: "United States", description: "Minority stake in major US refined products pipeline system." },
    { name: "Indiana Toll Road", sector: "Transportation", subsector: "Toll Roads", region: "North America", country: "United States", description: "157-mile toll road across northern Indiana." },
    { name: "Impala Terminals", sector: "Transportation", subsector: "Ports & Terminals", region: "Global", country: "Switzerland", description: "Global port and terminal operator." },
    { name: "Manchester Airports Group", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "Operator of Manchester, London Stansted, and East Midlands airports." },
    { name: "NSW Ports", sector: "Transportation", subsector: "Ports", region: "Asia-Pacific", country: "Australia", description: "Operator of Port Botany and Port Kembla in New South Wales." },
    { name: "Naturgy (stake)", sector: "Utilities", subsector: "Gas & Electric Utility", region: "Europe", country: "Spain", description: "Minority stake in major Spanish gas and electricity utility." },
    { name: "Vienna Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "Austria", description: "Austria's largest airport." },
    { name: "Globalvia", sector: "Transportation", subsector: "Toll Roads", region: "Global", country: "Spain", description: "Global transport infrastructure concessions company." },
    { name: "M6 Toll", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "United Kingdom", description: "UK's first toll motorway in the West Midlands." },
  ],
  "FUND-115": [
    { name: "Ausgrid", sector: "Utilities", subsector: "Electricity Distribution", region: "Asia-Pacific", country: "Australia", description: "Australia's largest electricity distributor." },
    { name: "Brisbane Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Major Australian international airport." },
    { name: "Melbourne Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Australia's second-busiest airport." },
    { name: "NSW Ports (shared)", sector: "Transportation", subsector: "Ports", region: "Asia-Pacific", country: "Australia", description: "Shared interest in Port Botany and Port Kembla." },
    { name: "Perth Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Major Western Australian airport." },
    { name: "Port of Brisbane", sector: "Transportation", subsector: "Ports", region: "Asia-Pacific", country: "Australia", description: "Queensland's largest multi-cargo port." },
  ],

  // ── InfraRed Capital Partners ─────────────────────────────
  "FUND-125": [
    { name: "Affinity Water", sector: "Water", subsector: "Water Supply", region: "Europe", country: "United Kingdom", description: "UK's largest water-only supply company." },
    { name: "High Speed 1 (HS1)", sector: "Transportation", subsector: "Rail", region: "Europe", country: "United Kingdom", description: "High-speed rail link from London St Pancras to the Channel Tunnel." },
  ],
  "FUND-126": [
    { name: "Beatrice Offshore Wind Farm", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "United Kingdom", description: "588 MW offshore wind farm in the Moray Firth, Scotland." },
    { name: "Solwaybank Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "Onshore wind farm in Dumfries and Galloway, Scotland." },
  ],

  // ── Infratil ──────────────────────────────────────────────
  "FUND-129": [
    { name: "CDC Data Centres", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Australia", description: "Australian data center platform." },
    { name: "Gurīn Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "Singapore", description: "Southeast Asian renewable energy platform." },
    { name: "Longroad Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "US renewable energy developer and operator." },
    { name: "One NZ (formerly Vodafone NZ)", sector: "Communications", subsector: "Telecommunications", region: "Asia-Pacific", country: "New Zealand", description: "New Zealand telecommunications provider." },
    { name: "RetireAustralia", sector: "Social Infrastructure", subsector: "Retirement Living", region: "Asia-Pacific", country: "Australia", description: "Australian retirement village operator." },
    { name: "Wellington International Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "New Zealand", description: "New Zealand's third-busiest airport." },
  ],

  // ── KKR ───────────────────────────────────────────────────
  "FUND-133": [
    { name: "Archipelago (subsea cables)", sector: "Communications", subsector: "Subsea Cables", region: "Asia-Pacific", country: "Singapore", description: "Subsea cable platform." },
    { name: "Buzz Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber broadband platform." },
    { name: "FiberCop (TIM)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Italy", description: "Italian last-mile fiber network." },
    { name: "Telxius Towers (Telefónica)", sector: "Communications", subsector: "Towers", region: "Global", country: "Spain", description: "European and LatAm telecom tower portfolio." },
    { name: "USN (fiber broadband)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber broadband provider." },
    { name: "Viridor", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "United Kingdom", description: "UK waste management and recycling company." },
  ],

  // ── Macquarie Asset Management ────────────────────────────
  "FUND-145": [
    { name: "Cadent Gas", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "United Kingdom", description: "UK's largest gas distribution network." },
  ],

  // ── Meridiam ──────────────────────────────────────────────
  "FUND-157": [
    { name: "Dakar Bus Rapid Transit", sector: "Transportation", subsector: "Bus Rapid Transit", region: "Middle East & Africa", country: "Senegal", description: "First 100% electric BRT system in sub-Saharan Africa." },
  ],

  // ── PSP Investments ───────────────────────────────────────
  "FUND-177": [
    { name: "Entropy Inc.", sector: "Renewables / Energy Transition", subsector: "Carbon Capture", region: "North America", country: "Canada", description: "Canadian carbon capture and storage technology company." },
  ],

  // ── Schroders Greencoat ───────────────────────────────────
  "FUND-185": [
    { name: "Andershaw Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "Onshore wind farm in South Lanarkshire, Scotland." },
    { name: "Braes of Doune Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "Onshore wind farm near Stirling, Scotland." },
    { name: "Clyde Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "One of the UK's largest onshore wind farms in South Lanarkshire." },
    { name: "Corriegarth Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "Onshore wind farm in the Scottish Highlands." },
    { name: "Glass Moor Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "Onshore wind farm in Cambridgeshire." },
    { name: "Rhyl Flats Offshore Wind Farm", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "United Kingdom", description: "Offshore wind farm in the Irish Sea off North Wales." },
    { name: "South Kyle Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "United Kingdom", description: "Onshore wind farm in East Ayrshire, Scotland." },
  ],
  "FUND-186": [
    { name: "Cordal Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "Ireland", description: "Onshore wind farm in County Kerry, Ireland." },
    { name: "Galway Wind Park", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "Ireland", description: "Onshore wind farm in County Galway, Ireland." },
    { name: "Killala Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "Ireland", description: "Onshore wind farm in County Mayo, Ireland." },
    { name: "Raheenleagh Wind Farm", sector: "Renewables / Energy Transition", subsector: "Onshore Wind", region: "Europe", country: "Ireland", description: "Onshore wind farm in County Wicklow, Ireland." },
  ],

  // ── Tiger Infrastructure Partners ─────────────────────────
  "FUND-204": [
    { name: "Granite Comfort", sector: "Utilities", subsector: "HVAC", region: "North America", country: "United States", description: "US HVAC services company." },
    { name: "International Aerospace Coatings (IAC)", sector: "Transportation", subsector: "Aviation Services", region: "Global", country: "Ireland", description: "Global aircraft painting company." },
    { name: "MNC Transportation", sector: "Transportation", subsector: "Bus Services", region: "North America", country: "United States", description: "US school bus transportation." },
    { name: "Modern Aviation", sector: "Transportation", subsector: "FBO / Aviation", region: "North America", country: "United States", description: "US fixed-base aviation operator." },
    { name: "NorthLink Aviation", sector: "Transportation", subsector: "Aviation Services", region: "North America", country: "United States", description: "US aviation services company." },
    { name: "Qwello", sector: "Transportation", subsector: "EV Charging", region: "Europe", country: "Germany", description: "German urban EV charging." },
    { name: "Raptor Waste Solutions", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "North America", country: "United States", description: "US waste management company." },
    { name: "Stellium Datacenters", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "France", description: "French data center company." },
    { name: "Strategic Venue Partners", sector: "Digital Infrastructure", subsector: "Venue Connectivity", region: "North America", country: "United States", description: "US venue WiFi and connectivity." },
  ],

  // ── TPG ───────────────────────────────────────────────────
  "FUND-205": [
    { name: "Avaada Energy", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Asia-Pacific", country: "India", description: "Indian solar energy platform." },
    { name: "Clearway Energy Group", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "US clean energy company.", coInvestors: ["Global Infrastructure Partners"] },
  ],

  // ── True Green Capital ────────────────────────────────────
  "FUND-209": [
    { name: "True Green Solar Portfolio (US C&I)", sector: "Renewables / Energy Transition", subsector: "Distributed Solar", region: "North America", country: "United States", description: "Over 600 MW distributed, commercial, and industrial solar across 18+ US states." },
    { name: "True Green Community Solar Portfolio", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "Community solar portfolio in partnership with Qcells." },
  ],

  // ── ADIA ──────────────────────────────────────────────────
  "FUND-218": [
    { name: "London Gatwick Airport (co-invest)", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "UK's second busiest airport (15% stake).", coInvestors: ["Global Infrastructure Partners"] },
    { name: "Thames Water (minority)", sector: "Water", subsector: "Water & Wastewater", region: "Europe", country: "United Kingdom", description: "UK's largest water and wastewater company (9.9% stake)." },
  ],

  // ── APG Asset Management ──────────────────────────────────
  "FUND-220": [
    { name: "euNetworks", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "European fiber infrastructure company.", coInvestors: ["Stonepeak"] },
  ],

  // ── BCI ───────────────────────────────────────────────────
  "FUND-222": [
    { name: "Puget Sound Energy", sector: "Utilities", subsector: "Electric & Gas Utilities", region: "North America", country: "United States", description: "Washington state regulated utility." },
    { name: "Thames Water (minority)", sector: "Water", subsector: "Water & Wastewater", region: "Europe", country: "United Kingdom", description: "UK's largest water and wastewater company." },
    { name: "Open Grid Europe (minority)", sector: "Midstream / Energy", subsector: "Gas Transmission", region: "Europe", country: "Germany", description: "German gas transmission system operator." },
  ],

  // ── AustralianSuper ───────────────────────────────────────
  "FUND-224": [
    { name: "Ausgrid (minority)", sector: "Utilities", subsector: "Electricity Distribution", region: "Asia-Pacific", country: "Australia", description: "Australia's largest electricity distributor." },
    { name: "IFM (Melbourne Airport, via IFM)", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Co-investment in Melbourne Airport via IFM Investors." },
    { name: "NSW Ports (minority)", sector: "Transportation", subsector: "Ports", region: "Asia-Pacific", country: "Australia", description: "Minority stake in Port Botany and Port Kembla." },
    { name: "Perth Airport (minority)", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Major Western Australian airport." },
    { name: "WestConnex (Sydney motorway)", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Australia", description: "Sydney's largest motorway project." },
    { name: "Peel Ports (UK)", sector: "Transportation", subsector: "Ports", region: "Europe", country: "United Kingdom", description: "UK port group." },
  ],

  // ── IMCO ──────────────────────────────────────────────────
  "FUND-226": [
    { name: "euNetworks", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "European fiber infrastructure company.", coInvestors: ["Stonepeak", "APG Asset Management"] },
  ],

  // ── GIC ───────────────────────────────────────────────────
  "FUND-236": [
    { name: "Ausgrid", sector: "Utilities", subsector: "Electricity Distribution", region: "Asia-Pacific", country: "Australia", description: "Australia's largest electricity distributor.", coInvestors: ["AustralianSuper"] },
    { name: "Greenko Group", sector: "Renewables / Energy Transition", subsector: "Diversified Renewables", region: "Asia-Pacific", country: "India", description: "India's leading renewable energy company." },
    { name: "Jio Platforms", sector: "Digital Infrastructure", subsector: "Digital Services", region: "Asia-Pacific", country: "India", description: "India's largest digital services and telecoms platform." },
    { name: "London Heathrow Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "UK's largest airport by passenger volume." },
    { name: "IndoSpace", sector: "Transportation", subsector: "Industrial & Logistics Parks", region: "Asia-Pacific", country: "India", description: "India's largest industrial and logistics real estate platform." },
    { name: "Equinix xScale Data Centres", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Global", country: "United States", description: "Hyperscale data center joint venture with Equinix." },
    { name: "SATS Ltd", sector: "Transportation", subsector: "Airport Services", region: "Asia-Pacific", country: "Singapore", description: "Asia's leading provider of airport ground handling and food solutions." },
    { name: "Sempra Infrastructure", sector: "Midstream / Energy", subsector: "LNG", region: "North America", country: "United States", description: "US LNG export and energy infrastructure." },
    { name: "Southern Cross Airports (Sydney)", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Ownership interest in Sydney Airport." },
    { name: "Summit Digitel (Reliance Jio Towers)", sector: "Digital Infrastructure", subsector: "Towers", region: "Asia-Pacific", country: "India", description: "India's largest telecom tower company." },
    { name: "Duke Energy Indiana", sector: "Utilities", subsector: "Electric Utility", region: "North America", country: "United States", description: "Regulated electric utility serving Indiana." },
    { name: "ITC Holdings Corp", sector: "Utilities", subsector: "Transmission", region: "North America", country: "United States", description: "US independent electric transmission company." },
    { name: "APT Pipelines (APA Group)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Asia-Pacific", country: "Australia", description: "Major Australian gas pipeline and infrastructure operator." },
    { name: "Channel Infrastructure", sector: "Midstream / Energy", subsector: "Fuel Infrastructure", region: "Asia-Pacific", country: "New Zealand", description: "New Zealand fuel import terminal and infrastructure." },
    { name: "Equis Energy", sector: "Renewables / Energy Transition", subsector: "Diversified Renewables", region: "Asia-Pacific", country: "Singapore", description: "Asia-Pacific renewable energy platform." },
  ],
};
