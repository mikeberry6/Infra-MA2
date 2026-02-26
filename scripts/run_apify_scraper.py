#!/usr/bin/env python3
"""
Run the API Maestro LinkedIn Company Posts Scraper on Apify.

Usage:
    export APIFY_TOKEN="apify_api_..."
    python3 scripts/run_apify_scraper.py

This script:
1. Sends 100 LinkedIn company slugs to the apimaestro/linkedin-company-posts
   actor (no cookies required), one company per actor run
2. Runs companies in concurrent batches to stay within Apify limits
3. Downloads the full dataset as JSON
4. Saves it to scripts/linkedin_raw_posts.json
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

APIFY_TOKEN = os.environ.get("APIFY_TOKEN")
if not APIFY_TOKEN:
    print("ERROR: Set APIFY_TOKEN environment variable first.")
    print('  export APIFY_TOKEN="apify_api_..."')
    sys.exit(1)

# Actor: API Maestro LinkedIn Company Posts Scraper (No Cookies)
ACTOR_ID = "apimaestro~linkedin-company-posts"
BASE_URL = "https://api.apify.com/v2"

# All 100 LinkedIn company slugs
COMPANY_URLS = [
    "https://www.linkedin.com/company/3i-group-plc",
    "https://www.linkedin.com/company/acadia-infrastructure",
    "https://www.linkedin.com/company/actis",
    "https://www.linkedin.com/company/adia",
    "https://www.linkedin.com/company/allianz-global-investors",
    "https://www.linkedin.com/company/amber-infrastructure-limited",
    "https://www.linkedin.com/company/ancala-partners",
    "https://www.linkedin.com/company/antin-infrastructure-partners",
    "https://www.linkedin.com/company/apg-asset-management",
    "https://www.linkedin.com/company/apollo-global-management-inc",
    "https://www.linkedin.com/company/ara-partners",
    "https://www.linkedin.com/company/arclight-capital-partners",
    "https://www.linkedin.com/company/ardian",
    "https://www.linkedin.com/company/ares-management",
    "https://www.linkedin.com/company/argo-infrastructure-partners",
    "https://www.linkedin.com/company/astatine-investment-partners",
    "https://www.linkedin.com/company/asterion-industrial-partners",
    "https://www.linkedin.com/company/australiansuper",
    "https://www.linkedin.com/company/axium-infrastructure",
    "https://www.linkedin.com/company/basalt-infrastructure-partners",
    "https://www.linkedin.com/company/british-columbia-investment-management-corporation-bci",
    "https://www.linkedin.com/company/bernhard-capital-partners-llc",
    "https://www.linkedin.com/company/blackrock",
    "https://www.linkedin.com/company/blackstonegroup",
    "https://www.linkedin.com/company/brookfield-asset-management",
    "https://www.linkedin.com/company/the-carlyle-group",
    "https://www.linkedin.com/company/cbreim",
    "https://www.linkedin.com/company/cdpq",
    "https://www.linkedin.com/company/charlesbank-capital-partners",
    "https://www.linkedin.com/company/cimgroup",
    "https://www.linkedin.com/company/copenhagen-infrastructure-partners-k-s",
    "https://www.linkedin.com/company/cppinvestmentsinvestissementsrpc",
    "https://www.linkedin.com/company/cube-infrastructure-managers",
    "https://www.linkedin.com/company/cvc-capital-partners",
    "https://www.linkedin.com/company/dif-capital-partners",
    "https://www.linkedin.com/company/digital-bridge-group",
    "https://www.linkedin.com/company/dwsgroup",
    "https://www.linkedin.com/company/eig-partners",
    "https://www.linkedin.com/company/ember-infrastructure",
    "https://www.linkedin.com/company/encap-investments-lp",
    "https://www.linkedin.com/company/ecpgp",
    "https://www.linkedin.com/company/energy-infrastructure-partners-ag",
    "https://www.linkedin.com/company/eqt-group",
    "https://www.linkedin.com/company/equitix",
    "https://www.linkedin.com/company/fengate-asset-management",
    "https://www.linkedin.com/company/generatecapital",
    "https://www.linkedin.com/company/gic",
    "https://www.linkedin.com/company/global-infrastructure-partners",
    "https://www.linkedin.com/company/goldman-sachs",
    "https://www.linkedin.com/company/harbert-management-corporation",
    "https://www.linkedin.com/company/harrison-street",
    "https://www.linkedin.com/company/h-i-g--capital",
    "https://www.linkedin.com/company/i-squared-capital",
    "https://www.linkedin.com/company/icon-infrastructure-llp",
    "https://www.linkedin.com/company/ifminvestors",
    "https://www.linkedin.com/company/igneo-infrastructure-partners",
    "https://www.linkedin.com/company/investment-management-corporation-of-ontario",
    "https://www.linkedin.com/company/infrabridgegroup",
    "https://www.linkedin.com/company/infrared-capital-partners-ltd",
    "https://www.linkedin.com/company/ofi-infravia",
    "https://www.linkedin.com/company/infratil",
    "https://www.linkedin.com/company/jpmorganassetmanagement",
    "https://www.linkedin.com/company/kimmeridge",
    "https://www.linkedin.com/company/kkr",
    "https://www.linkedin.com/showcase/macquarie-asset-management",
    "https://www.linkedin.com/company/meag",
    "https://www.linkedin.com/company/meridiam",
    "https://www.linkedin.com/company/mirova",
    "https://www.linkedin.com/company/morgan-stanley-infrastructure-partners",
    "https://www.linkedin.com/company/mubadala",
    "https://www.linkedin.com/company/northleaf-capital-partners",
    "https://www.linkedin.com/company/novainfrastructure",
    "https://www.linkedin.com/company/nuveen",
    "https://www.linkedin.com/company/oaktree-capital-management",
    "https://www.linkedin.com/company/omers-infrastructure",
    "https://www.linkedin.com/company/otpp",
    "https://www.linkedin.com/company/pantheon-ventures",
    "https://www.linkedin.com/company/partners-group",
    "https://www.linkedin.com/company/patria-investments",
    "https://www.linkedin.com/company/patrizia-se",
    "https://www.linkedin.com/company/psp-investments",
    "https://www.linkedin.com/company/qic",
    "https://www.linkedin.com/company/quinbrook-infrastructure-partners",
    "https://www.linkedin.com/company/ridgemont-equity-partners",
    "https://www.linkedin.com/company/ridgewood-infrastructure",
    "https://www.linkedin.com/company/riverstoneholdings",
    "https://www.linkedin.com/company/schroders-greencoat",
    "https://www.linkedin.com/company/sixthstreet",
    "https://www.linkedin.com/company/stepstone-group",
    "https://www.linkedin.com/company/stonepeakpartners",
    "https://www.linkedin.com/company/swiss-life-asset-management",
    "https://www.linkedin.com/company/temasek-holdings",
    "https://www.linkedin.com/company/tigerinfrastructurepartners",
    "https://www.linkedin.com/company/tpg-capital",
    "https://www.linkedin.com/company/ubs-asset-management",
    "https://www.linkedin.com/company/vauban-infrastructure-partners",
    "https://www.linkedin.com/company/vision-ridge-partners-llc",
    "https://www.linkedin.com/company/wafra",
    "https://www.linkedin.com/company/wren-house-infrastructure-management-limited",
    "https://www.linkedin.com/company/tallvine",
]

# Map LinkedIn URL slug -> original fund name for downstream matching
URL_TO_FUND = {
    "3i-group-plc": "3i Infrastructure",
    "acadia-infrastructure": "Acadia Infrastructure Capital",
    "actis": "Actis",
    "adia": "ADIA Infrastructure",
    "allianz-global-investors": "Allianz Global Investors",
    "amber-infrastructure-limited": "Amber Infrastructure",
    "ancala-partners": "Ancala Partners",
    "antin-infrastructure-partners": "Antin Infrastructure Partners",
    "apg-asset-management": "APG Infrastructure",
    "apollo-global-management-inc": "Apollo Global Management",
    "ara-partners": "Ara Partners",
    "arclight-capital-partners": "ArcLight Capital",
    "ardian": "Ardian",
    "ares-management": "Ares Management",
    "argo-infrastructure-partners": "Argo Infrastructure Partners",
    "astatine-investment-partners": "Astatine Investment Partners",
    "asterion-industrial-partners": "Asterion Industrial Partners",
    "australiansuper": "Australian Super",
    "axium-infrastructure": "Axium Infrastructure",
    "basalt-infrastructure-partners": "Basalt Infrastructure Partners",
    "british-columbia-investment-management-corporation-bci": "BCI",
    "bernhard-capital-partners-llc": "Bernhard Capital Partners",
    "blackrock": "BlackRock",
    "blackstonegroup": "Blackstone",
    "brookfield-asset-management": "Brookfield Asset Management",
    "the-carlyle-group": "Carlyle Infrastructure",
    "cbreim": "CBRE Investment Management",
    "cdpq": "CDPQ",
    "charlesbank-capital-partners": "Charlesbank Capital Partners",
    "cimgroup": "CIM Group",
    "copenhagen-infrastructure-partners-k-s": "Copenhagen Infrastructure Partners",
    "cppinvestmentsinvestissementsrpc": "CPP Investments",
    "cube-infrastructure-managers": "Cube Infrastructure Managers",
    "cvc-capital-partners": "CVC",
    "dif-capital-partners": "DIF",
    "digital-bridge-group": "DigitalBridge",
    "dwsgroup": "DWS Infrastructure",
    "eig-partners": "EIG Global Energy Partners",
    "ember-infrastructure": "Ember Infrastructure",
    "encap-investments-lp": "EnCap Investments",
    "ecpgp": "Energy Capital Partners",
    "energy-infrastructure-partners-ag": "Energy Infrastructure Partners",
    "eqt-group": "EQT Infrastructure",
    "equitix": "Equitix",
    "fengate-asset-management": "Fengate Asset Management",
    "generatecapital": "Generate Capital",
    "gic": "GIC",
    "global-infrastructure-partners": "Global Infrastructure Partners",
    "goldman-sachs": "Goldman Sachs Asset Management",
    "harbert-management-corporation": "Harbert Management Corp",
    "harrison-street": "Harrison Street",
    "h-i-g--capital": "H.I.G. Capital",
    "i-squared-capital": "I Squared Capital",
    "icon-infrastructure-llp": "iCON Infrastructure",
    "ifminvestors": "IFM Investors",
    "igneo-infrastructure-partners": "Igneo Infrastructure Partners",
    "investment-management-corporation-of-ontario": "IMCO",
    "infrabridgegroup": "InfraBridge",
    "infrared-capital-partners-ltd": "InfraRed Capital Partners",
    "ofi-infravia": "InfraVia Capital Partners",
    "infratil": "Infratil",
    "jpmorganassetmanagement": "J.P. Morgan Asset Management",
    "kimmeridge": "Kimmeridge Energy",
    "kkr": "KKR",
    "macquarie-asset-management": "Macquarie Asset Management",
    "meag": "MEAG",
    "meridiam": "Meridiam",
    "mirova": "Mirova",
    "morgan-stanley-infrastructure-partners": "Morgan Stanley Infrastructure Partners",
    "mubadala": "Mubadala",
    "northleaf-capital-partners": "Northleaf Capital",
    "novainfrastructure": "NOVA Infrastructure",
    "nuveen": "Nuveen Infrastructure",
    "oaktree-capital-management": "Oaktree Capital",
    "omers-infrastructure": "OMERS Infrastructure",
    "otpp": "Ontario Teachers Pension Plan",
    "pantheon-ventures": "Pantheon Ventures",
    "partners-group": "Partners Group",
    "patria-investments": "Patria Investments",
    "patrizia-se": "Patrizia",
    "psp-investments": "PSP Investments",
    "qic": "QIC Global Infrastructure",
    "quinbrook-infrastructure-partners": "Quinbrook Infrastructure Partners",
    "ridgemont-equity-partners": "Ridgemont Equity Partners",
    "ridgewood-infrastructure": "Ridgewood Infrastructure",
    "riverstoneholdings": "Riverstone Holdings",
    "schroders-greencoat": "Schroders Greencoat",
    "sixthstreet": "Sixth Street",
    "stepstone-group": "StepStone Group",
    "stonepeakpartners": "Stonepeak",
    "swiss-life-asset-management": "Swiss Life Asset Managers",
    "temasek-holdings": "Temasek",
    "tigerinfrastructurepartners": "Tiger Infrastructure Partners",
    "tpg-capital": "TPG",
    "ubs-asset-management": "UBS Asset Management",
    "vauban-infrastructure-partners": "Vauban Infrastructure Partners",
    "vision-ridge-partners-llc": "Vision Ridge Partners",
    "wafra": "Wafra",
    "wren-house-infrastructure-management-limited": "Wren House Infrastructure",
    "tallvine": "Tallvine",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "linkedin_raw_posts.json")

# How many actor runs to have in-flight at once
CONCURRENCY = 5


def api_request(method, path, body=None):
    """Make a request to the Apify API."""
    url = f"{BASE_URL}{path}"
    sep = "&" if "?" in url else "?"
    url += f"{sep}token={APIFY_TOKEN}"

    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if body else {}

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"HTTP Error {e.code}: {e.reason}")
        print(f"Response body: {error_body}")
        raise


def slug_from_url(url):
    """Extract the company slug from a LinkedIn URL."""
    return url.rstrip("/").split("/")[-1]


def start_run(slug):
    """Start an actor run for a single company and return run metadata."""
    actor_input = {
        "identifier": slug,
        "page_number": 1,
    }
    result = api_request("POST", f"/acts/{ACTOR_ID}/runs", body=actor_input)
    return {
        "slug": slug,
        "run_id": result["data"]["id"],
        "dataset_id": result["data"]["defaultDatasetId"],
    }


def poll_run(run_info):
    """Poll until an actor run finishes. Returns the final status."""
    run_id = run_info["run_id"]
    while True:
        resp = api_request("GET", f"/actor-runs/{run_id}")
        status = resp["data"]["status"]
        if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            return status
        time.sleep(10)


def download_dataset(dataset_id):
    """Download all items from an Apify dataset."""
    return api_request("GET", f"/datasets/{dataset_id}/items?limit=2000")


def process_batch(urls):
    """Process a batch of URLs concurrently: start runs, poll, download."""
    # Start all runs in this batch
    runs = []
    for url in urls:
        slug = slug_from_url(url)
        fund = URL_TO_FUND.get(slug, slug)
        print(f"  Starting run for {fund} ({slug})...")
        try:
            run_info = start_run(slug)
            runs.append(run_info)
        except Exception as e:
            print(f"  ERROR starting run for {slug}: {e}")
            continue

    # Poll all runs until complete
    items = []
    for run_info in runs:
        slug = run_info["slug"]
        fund = URL_TO_FUND.get(slug, slug)
        print(f"  Waiting for {fund}...", end="", flush=True)
        status = poll_run(run_info)
        print(f" {status}")

        if status == "SUCCEEDED":
            dataset_items = download_dataset(run_info["dataset_id"])
            # Enrich with fund name
            for item in dataset_items:
                item["_fundName"] = fund
                item["_slug"] = slug
            items.extend(dataset_items)
            print(f"    -> {len(dataset_items)} posts")
        else:
            print(f"    -> SKIPPED (status: {status})")

    return items


def main():
    print(f"Starting LinkedIn Company Posts Scraper...")
    print(f"  Actor: {ACTOR_ID}")
    print(f"  Companies: {len(COMPANY_URLS)}")
    print(f"  Concurrency: {CONCURRENCY}")
    print()

    # Process in concurrent batches
    all_items = []
    total = len(COMPANY_URLS)
    for i in range(0, total, CONCURRENCY):
        batch = COMPANY_URLS[i:i + CONCURRENCY]
        batch_num = (i // CONCURRENCY) + 1
        total_batches = (total + CONCURRENCY - 1) // CONCURRENCY
        print(f"Batch {batch_num}/{total_batches} ({len(batch)} companies):")
        items = process_batch(batch)
        all_items.extend(items)
        print(f"  Batch total: {len(items)} posts")
        print()

    print(f"Total: {len(all_items)} posts from {len(COMPANY_URLS)} companies")

    # Save to file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)
    print(f"Saved to {OUTPUT_FILE}")
    print()
    print("Done! Now run: python3 scripts/filter_linkedin_posts.py")


if __name__ == "__main__":
    main()
