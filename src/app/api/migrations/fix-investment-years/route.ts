import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time migration: fix investmentYear on OwnershipPeriod records.
// These corrections were verified against milestone evidence across 3 audit passes.

const CORRECTIONS: { name: string; country: string; correctYear: number }[] = [
  { name: "AES Indiana", country: "United States", correctYear: 2024 },
  { name: "AES Ohio", country: "United States", correctYear: 2024 },
  { name: "AgeCare Facilities Portfolio", country: "Canada", correctYear: 2020 },
  { name: "Alabama Fiber Networks", country: "United States", correctYear: 2022 },
  { name: "Aleatica, S.A.B. de C.V.", country: "Mexico", correctYear: 2015 },
  { name: "Alberta Schools Alternative Procurement I", country: "Canada", correctYear: 2008 },
  { name: "Altavair, L.P. / Altitude Aircraft Leasing", country: "United States", correctYear: 2018 },
  { name: "Alturus", country: "United States", correctYear: 2020 },
  { name: "Altus Power", country: "United States", correctYear: 2025 },
  { name: "American Corporate Airport Partners, LLC", country: "United States", correctYear: 2020 },
  { name: "Amp Energy", country: "Canada", correctYear: 2021 },
  { name: "AMPORTS, Inc.", country: "United States", correctYear: 2018 },
  { name: "Antelope Valley Water Bank", country: "United States", correctYear: 2007 },
  { name: "Anthony Henday Drive Southeast", country: "Canada", correctYear: 2010 },
  { name: "ARB Midstream", country: "United States", correctYear: 2017 },
  { name: "Arcwood Environmental", country: "United States", correctYear: 2024 },
  { name: "Aspen Midstream II", country: "United States", correctYear: 2017 },
  { name: "Avolta Renewable Holdings, LLC", country: "United States", correctYear: 2022 },
  { name: "Axium Great Plains Wind LLC", country: "United States", correctYear: 2015 },
  { name: "Ag Partners Capital", country: "United States", correctYear: 2021 },
  { name: "BayWa r.e. AG", country: "United States / Mexico", correctYear: 2021 },
  { name: "Beanfield Metroconnect", country: "Canada", correctYear: 2019 },
  { name: "Bluebird Fiber", country: "United States", correctYear: 2019 },
  { name: "Boldyn Networks", country: "United States / Canada", correctYear: 2021 },
  { name: "Boldyn Networks (US)", country: "United States", correctYear: 2021 },
  { name: "Bruce Power", country: "Canada", correctYear: 2003 },
  { name: "Bullrock Energy Ventures", country: "United States", correctYear: 2023 },
  { name: "Byrd Ranch", country: "United States", correctYear: 2019 },
  { name: "Caballero Battery Storage", country: "United States", correctYear: 2023 },
  { name: "Caledonia Generating LLC", country: "United States", correctYear: 2018 },
  { name: "Canadian Breaks", country: "United States", correctYear: 2019 },
  { name: "Cartier Energy Holding", country: "United States", correctYear: 2022 },
  { name: "Cascade Power Project", country: "Canada", correctYear: 2020 },
  { name: "Centersquare", country: "United States / Canada", correctYear: 2023 },
  { name: "Central 70", country: "United States", correctYear: 2018 },
  { name: "Central Utility Block (Heartland Petrochemical Complex)", country: "Canada", correctYear: 2018 },
  { name: "Chesapeake toll road network", country: "United States", correctYear: 2020 },
  { name: "Cirba Solutions", country: "United States", correctYear: 2022 },
  { name: "Cityside Networks", country: "United States", correctYear: 2023 },
  { name: "CitySwitch", country: "United States", correctYear: 2021 },
  { name: "CleanCapital", country: "United States", correctYear: 2018 },
  { name: "CleanCapital Holdings, LLC", country: "United States", correctYear: 2021 },
  { name: "Cleco Corporation", country: "United States", correctYear: 2016 },
  { name: "Coastal GasLink Pipeline", country: "Canada", correctYear: 2019 },
  { name: "Coastal Waste & Recycling", country: "United States", correctYear: 2023 },
  { name: "Cologix", country: "United States / Canada", correctYear: 2017 },
  { name: "CoolCo", country: "United States", correctYear: 2019 },
  { name: "Copper Crossing Solar Project", country: "United States", correctYear: 2019 },
  { name: "Cornerstone Generation", country: "United States", correctYear: 2022 },
  { name: "Corporation", country: "United States", correctYear: 2021 },
  { name: "Deerfield Wind Facility", country: "United States", correctYear: 2022 },
  { name: "Direct ChassisLink, Inc.", country: "United States", correctYear: 2023 },
  { name: "District Energy System", country: "United States", correctYear: 2020 },
  { name: "Dry Lake II Wind Farm", country: "United States", correctYear: 2019 },
  { name: "Edgewater Midstream", country: "United States", correctYear: 2020 },
  { name: "EDPR U.S. Wind Portfolio", country: "United States", correctYear: 2015 },
  { name: "Edwards Sanborn 1A", country: "United States", correctYear: 2022 },
  { name: "Edwards Sanborn 1A & 1B", country: "United States", correctYear: 2022 },
  { name: "Enbridge Onshore Renewables JV", country: "United States / Canada", correctYear: 2018 },
  { name: "Eni Plenitude S.p.A. Società Benefit", country: "United States", correctYear: 2024 },
  { name: "Environmental Infrastructure Partners", country: "United States", correctYear: 2024 },
  { name: "Epirus", country: "United States", correctYear: 2022 },
  { name: "eStruxture Data Centers", country: "Canada", correctYear: 2017 },
  { name: "Ezee Fiber", country: "United States", correctYear: 2021 },
  { name: "First Student", country: "United States / Canada", correctYear: 2021 },
  { name: "FlexiVan", country: "United States", correctYear: 2020 },
  { name: "Freeport Energy Center", country: "United States", correctYear: 2020 },
  { name: "Fresno State University Heating and Cooling Plant", country: "United States", correctYear: 2022 },
  { name: "GATX / Wells Fargo Rail Joint Venture", country: "United States / Canada", correctYear: 2025 },
  { name: "Gateway Fiber", country: "United States", correctYear: 2022 },
  { name: "Gemini Solar + Storage", country: "United States", correctYear: 2022 },
  { name: "Generate Upcycle", country: "United States / Canada", correctYear: 2022 },
  { name: "Greenfield Midstream", country: "United States", correctYear: 2017 },
  { name: "GridPoint", country: "United States", correctYear: 2022 },
  { name: "Habitat Solar", country: "United States", correctYear: 2020 },
  { name: "Harvestone Low Carbon Partners", country: "United States", correctYear: 2022 },
  { name: "HEN Infrastructure, LLC", country: "United States", correctYear: 2021 },
  { name: "Holtwood and Safe Harbor Hydroelectric Facilities", country: "United States", correctYear: 2014 },
  { name: "Howard Energy Partners", country: "United States / Mexico", correctYear: 2022 },
  { name: "HTEC", country: "United States / Canada", correctYear: 2021 },
  { name: "Hunt Energy Network, LLC", country: "United States", correctYear: 2021 },
  { name: "i3 Broadband", country: "United States", correctYear: 2020 },
  { name: "Impulsora del Desarrollo y el Empleo en América Latina, S.A.B. de C.V. (IDEAL)", country: "Mexico", correctYear: 2016 },
  { name: "Invenergy Renewables LLC", country: "United States", correctYear: 2013 },
  { name: "JH Transport Portfolio", country: "United States", correctYear: 2021 },
  { name: "Jimmie Creek Hydroelectric Project", country: "Canada", correctYear: 2014 },
  { name: "K2 Wind Facility", country: "Canada", correctYear: 2016 },
  { name: "Kalaeloa Partners, L.P.", country: "United States", correctYear: 2023 },
  { name: "Kelso Valley Wind, Solar & Water", country: "United States", correctYear: 2008 },
  { name: "Kindle Energy", country: "United States", correctYear: 2022 },
  { name: "Kings Mountain Energy Center", country: "United States", correctYear: 2017 },
  { name: "KIO Networks", country: "Mexico", correctYear: 2021 },
  { name: "Landmark Dividend", country: "United States", correctYear: 2021 },
  { name: "Legence", country: "United States", correctYear: 2022 },
  { name: "Lineage", country: "United States", correctYear: 2020 },
  { name: "Long Beach Container Terminal", country: "United States", correctYear: 2019 },
  { name: "Long Beach Courthouse", country: "United States", correctYear: 2010 },
  { name: "Longwood Medical Area Energy System", country: "United States", correctYear: 2018 },
  { name: "M6 Midstream", country: "United States", correctYear: 2022 },
  { name: "Madison Energy Infrastructure", country: "United States", correctYear: 2023 },
  { name: "Manchester Energy", country: "United States", correctYear: 2022 },
  { name: "Maurepas Pipeline", country: "United States", correctYear: 2018 },
  { name: "Monterra Energy", country: "Mexico", correctYear: 2018 },
  { name: "Navisun LLC", country: "United States", correctYear: 2021 },
  { name: "Neon Renewables", country: "United States", correctYear: 2020 },
  { name: "Netrality Data Centers", country: "United States", correctYear: 2019 },
  { name: "NewLevel", country: "United States", correctYear: 2017 },
  { name: "NewLevel II, L.P.", country: "United States", correctYear: 2021 },
  { name: "NewLevel III, L.P.", country: "United States", correctYear: 2022 },
  { name: "Nexamp", country: "United States", correctYear: 2021 },
  { name: "Nitrogen Renewables", country: "United States", correctYear: 2019 },
  { name: "North Tarrant Express Segment 3", country: "United States", correctYear: 2013 },
  { name: "North Tarrant Express Segments 1 and 2", country: "United States", correctYear: 2009 },
  { name: "Northern Star Generation", country: "United States", correctYear: 2014 },
  { name: "NorthLink Aviation", country: "United States", correctYear: 2021 },
  { name: "NorthRiver Midstream Inc.", country: "Canada", correctYear: 2019 },
  { name: "Novva Data Centers", country: "United States", correctYear: 2022 },
  { name: "Odell Wind Facility", country: "United States", correctYear: 2022 },
  { name: "Odfjell Terminals US", country: "United States", correctYear: 2019 },
  { name: "Ontario Wind", country: "Canada", correctYear: 2022 },
  { name: "Oryx Midstream", country: "United States", correctYear: 2019 },
  { name: "Pacifico Sur", country: "Mexico", correctYear: 2018 },
  { name: "Pilot Water Solutions", country: "United States", correctYear: 2019 },
  { name: "Plenary Americas", country: "United States / Canada", correctYear: 2020 },
  { name: "Port of Miami Tunnel", country: "United States", correctYear: 2014 },
  { name: "Ports America", country: "United States", correctYear: 2021 },
  { name: "PowerHouse Data Centers", country: "United States", correctYear: 2021 },
  { name: "Prairie Switch Wind", country: "United States", correctYear: 2022 },
  { name: "Puget Energy / Puget Sound Energy", country: "United States", correctYear: 2008 },
  { name: "Puget Sound Energy", country: "United States", correctYear: 2009 },
  { name: "Rainy River Solar Project", country: "Canada", correctYear: 2014 },
  { name: "Rangeland Midstream Canada", country: "Canada", correctYear: 2022 },
  { name: "Redaptive", country: "United States", correctYear: 2022 },
  { name: "ReGenerate Energy Holdings, LLC", country: "United States", correctYear: 2021 },
  { name: "Rockpoint Gas Storage", country: "United States / Canada", correctYear: 2014 },
  { name: "Rocky Mountain Midstream", country: "United States", correctYear: 2020 },
  { name: "Rowan Digital Infrastructure", country: "United States", correctYear: 2020 },
  { name: "Sabre Industries", country: "United States", correctYear: 2021 },
  { name: "Sakwi Creek Hydro Project", country: "Canada", correctYear: 2013 },
  { name: "Scout Clean Energy", country: "United States", correctYear: 2022 },
  { name: "Sea-to-Sky Highway", country: "Canada", correctYear: 2010 },
  { name: "Skyservice US", country: "United States", correctYear: 2019 },
  { name: "Slate Creek Wind Project", country: "United States", correctYear: 2016 },
  { name: "Smoky Mountain Hydroelectric Facilities", country: "United States", correctYear: 2012 },
  { name: "SOLCAP (KeyState Renewables JVs)", country: "United States", correctYear: 2021 },
  { name: "Soltage", country: "United States", correctYear: 2023 },
  { name: "Sorel-Tracy Detention Centre", country: "Canada", correctYear: 2013 },
  { name: "South Fraser Perimeter Road P3 Project", country: "Canada", correctYear: 2016 },
  { name: "Southgate Solar Project", country: "Canada", correctYear: 2015 },
  { name: "Steel Reef Infrastructure Corp.", country: "Canada", correctYear: 2016 },
  { name: "STG Logistics", country: "United States", correctYear: 2022 },
  { name: "Student Transportation of America and Canada", country: "United States / Canada", correctYear: 2004 },
  { name: "Sugar Creek", country: "United States", correctYear: 2022 },
  { name: "SwyftFiber", country: "United States", correctYear: 2023 },
  { name: "Tarana Wireless", country: "United States", correctYear: 2022 },
  { name: "Terra-Gen", country: "United States", correctYear: 2020 },
  { name: "TerraForm Power", country: "United States / Canada", correctYear: 2017 },
  { name: "Terreva Renewables", country: "United States / Canada", correctYear: 2022 },
  { name: "The Dupuy Group", country: "United States", correctYear: 2022 },
  { name: "TowerCom", country: "United States", correctYear: 2020 },
  { name: "Transurban Chesapeake", country: "United States", correctYear: 2020 },
  { name: "Ubiquity", country: "United States", correctYear: 2022 },
  { name: "Undine", country: "United States", correctYear: 2017 },
  { name: "Unison Site Management", country: "United States", correctYear: 2017 },
  { name: "University of Kentucky On-Campus Housing Portfolio", country: "United States", correctYear: 2021 },
  { name: "Urban Grid", country: "United States", correctYear: 2022 },
  { name: "US Signal", country: "United States", correctYear: 2022 },
  { name: "USD Group LLC", country: "North America", correctYear: 2014 },
  { name: "Vantage Data Centers", country: "United States / Canada", correctYear: 2017 },
  { name: "Vantage Data Centers North America", country: "United States / Canada", correctYear: 2020 },
  { name: "Vantage SDC", country: "United States / Canada", correctYear: 2020 },
  { name: "VIP Rail", country: "Canada", correctYear: 2019 },
  { name: "Vision RNG", country: "United States", correctYear: 2021 },
  { name: "VLS Environmental Solutions", country: "United States", correctYear: 2022 },
  { name: "VoltaGrid", country: "United States", correctYear: 2020 },
  { name: "WANRack", country: "United States", correctYear: 2021 },
  { name: "Waste Resource Management", country: "United States", correctYear: 2023 },
  { name: "Westlands Solar Park (incl. Aquamarine Solar)", country: "United States", correctYear: 2020 },
  { name: "Wind Energy Transmission Texas, LLC (WETT)", country: "United States", correctYear: 2020 },
  { name: "Wind Facility", country: "United States", correctYear: 2024 },
  { name: "Windmill Farms", country: "Canada", correctYear: 2022 },
  { name: "Windsor Solar Project", country: "Canada", correctYear: 2015 },
  { name: "Wolf Midstream", country: "Canada", correctYear: 2015 },
  { name: "Woodlawn Residential Commons", country: "United States", correctYear: 2018 },
  { name: "YHU Infrastructure Partners", country: "Canada", correctYear: 2023 },
];

export async function GET() {
  return new Response(
    `<!DOCTYPE html>
<html><head><title>Fix Investment Years</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui; background: #09090B; color: #fff; padding: 2rem; }
  button { background: #818CF8; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; }
  button:disabled { opacity: 0.5; }
  pre { background: #18181B; padding: 1rem; border-radius: 6px; overflow: auto; font-size: 13px; }
</style></head><body>
<h1>Fix Investment Years Migration</h1>
<p>This will update ${CORRECTIONS.length} ownership period records in the live database.</p>
<button id="btn" onclick="run()">Run Migration</button>
<pre id="out">Ready. Click the button to start.</pre>
<script>
async function run() {
  const btn = document.getElementById('btn');
  const out = document.getElementById('out');
  btn.disabled = true;
  out.textContent = 'Running...';
  try {
    const res = await fetch(window.location.href, { method: 'POST' });
    const data = await res.json();
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }
  btn.disabled = false;
}
</script></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}

export async function POST() {
  try {
    let updated = 0;
    let notFound = 0;
    const errors: string[] = [];

    for (const correction of CORRECTIONS) {
      // Find company by name + country, fallback to name only
      let company = await prisma.company.findFirst({
        where: { name: correction.name, country: correction.country },
        select: { id: true },
      });

      if (!company) {
        company = await prisma.company.findFirst({
          where: { name: correction.name },
          select: { id: true },
        });
      }

      if (!company) {
        notFound++;
        errors.push(`Not found: ${correction.name}`);
        continue;
      }

      // Find all ownership periods for this company and update each individually
      // (updateMany uses transactions internally which Neon HTTP doesn't support)
      const periods = await prisma.ownershipPeriod.findMany({
        where: { companyId: company.id },
        select: { id: true },
      });

      for (const period of periods) {
        await prisma.ownershipPeriod.update({
          where: { id: period.id },
          data: { investmentYear: correction.correctYear },
        });
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      corrections: CORRECTIONS.length,
      ownershipPeriodsUpdated: updated,
      notFound,
      errors,
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 },
    );
  }
}
