#!/usr/bin/env python3
"""
Run the HarvestAPI LinkedIn Company Posts Scraper on Apify.

Usage:
    export APIFY_TOKEN="apify_api_..."
    python3 scripts/run_apify_scraper.py

This script:
1. Sends 100 LinkedIn company URLs to the harvestapi/linkedin-company-posts
   actor (no cookies required) in batches
2. Waits for each batch to complete
3. Downloads the full dataset as JSON
4. Saves it to scripts/linkedin_raw_posts.json
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from collections import Counter

APIFY_TOKEN = os.environ.get("APIFY_TOKEN")
if not APIFY_TOKEN:
    print("ERROR: Set APIFY_TOKEN environment variable first.")
    print('  export APIFY_TOKEN="apify_api_..."')
    sys.exit(1)

# Actor: HarvestAPI LinkedIn Company Posts Scraper (No Cookies)
ACTOR_ID = "harvestapi~linkedin-company-posts"
BASE_URL = "https://api.apify.com/v2"

# ---------------------------------------------------------------------------
# Tiered URL lists — grouped by observed posting frequency so each Apify run
# uses an appropriate "count" value.  Derived from 10-post samples in
# linkedin_raw_posts.json (date-span extrapolation to posts/week).
#
# Tier 1  (count 120) — 5+ posts/wk    —  8 companies
# Tier 2  (count  60) — 2.5-5.5/wk     — 36 companies
# Tier 3  (count  25) — 1-2.5/wk       — 21 companies
# Tier 4  (count  10) — <1/wk or zero   — 35 companies
#                                  Total: 100 companies
# ---------------------------------------------------------------------------

_LI = "https://www.linkedin.com/company"

TIERS = [
    # ── Tier 1: HIGH VOLUME (count=120) ──────────────────────────────────
    (120, [
        f"{_LI}/meridiam",
        f"{_LI}/fengate-asset-management",
        f"{_LI}/goldman-sachs",
        f"{_LI}/ifminvestors",
        f"{_LI}/ares-management",
        f"{_LI}/cimgroup",
        f"{_LI}/australiansuper",
        f"{_LI}/mubadala",
    ]),
    # ── Tier 2: MEDIUM-HIGH VOLUME (count=60) ────────────────────────────
    (60, [
        f"{_LI}/allianz-global-investors",
        f"{_LI}/qic",
        f"{_LI}/actis",
        f"{_LI}/patrizia-se",
        f"{_LI}/apollo-global-management-inc",
        f"{_LI}/the-carlyle-group",
        f"{_LI}/kkr",
        f"{_LI}/stepstone-group",
        f"{_LI}/blackstonegroup",
        f"{_LI}/meag",
        f"{_LI}/macquariegroup",
        f"{_LI}/tpg-capital",
        f"{_LI}/ardian",
        f"{_LI}/cvc-capital-partners",
        f"{_LI}/digital-bridge-group",
        f"{_LI}/eqt-group",
        f"{_LI}/nuveen",
        f"{_LI}/dwsgroup",
        f"{_LI}/mirova",
        f"{_LI}/brookfield",
        f"{_LI}/gic",
        f"{_LI}/sixthstreet",
        f"{_LI}/temasek-holdings",
        f"{_LI}/cbreim",
        f"{_LI}/pantheon-ventures",
        f"{_LI}/swiss-life-asset-management",
        f"{_LI}/harrison-street",
        f"{_LI}/oaktree-capital-management",
        f"{_LI}/cppinvestmentsinvestissementsrpc",
        f"{_LI}/charlesbank-capital-partners",
        f"{_LI}/ara-partners",
        f"{_LI}/copenhagen-infrastructure-partners-k-s",
        f"{_LI}/equitix",
        f"{_LI}/stonepeakpartners",
        f"{_LI}/patria-investments",
        f"{_LI}/tigerinfrastructurepartners",
    ]),
    # ── Tier 3: MEDIUM-LOW VOLUME (count=25) ─────────────────────────────
    (25, [
        f"{_LI}/i-squared-capital",
        f"{_LI}/ofi-infravia",
        f"{_LI}/h-i-g--capital",
        f"{_LI}/quinbrook-infrastructure-partners",
        f"{_LI}/british-columbia-investment-management-corporation-bci",
        f"{_LI}/northleaf-capital-partners",
        f"{_LI}/partners-group",
        f"{_LI}/astatine-investment-partners",
        f"{_LI}/investment-management-corporation-of-ontario",
        f"{_LI}/otpp",
        f"{_LI}/vauban-infrastructure-partners",
        f"{_LI}/ecpgp",
        f"{_LI}/amber-infrastructure-limited",
        f"{_LI}/generatecapital",
        f"{_LI}/apg-asset-management",
        f"{_LI}/cdpq",
        f"{_LI}/igneo-infrastructure-partners",
        f"{_LI}/ancala-partners",
        f"{_LI}/dif-capital-partners",
        f"{_LI}/infrared-capital-partners-ltd",
        f"{_LI}/eig-partners",
    ]),
    # ── Tier 4: LOW VOLUME (count=10) ────────────────────────────────────
    (10, [
        f"{_LI}/asterion-industrial-partners",
        f"{_LI}/infratil",
        f"{_LI}/energy-infrastructure-partners-ag",
        f"{_LI}/wafra",
        f"{_LI}/harbert-management-corporation",
        f"{_LI}/psp-investments",
        f"{_LI}/kimmeridge",
        f"{_LI}/bernhard-capital-partners-llc",
        f"{_LI}/wren-house-infrastructure-management-limited",
        f"{_LI}/cube-infrastructure-managers",
        f"{_LI}/antin-infrastructure-partners",
        f"{_LI}/ridgemont-equity-partners",
        f"{_LI}/arclight-capital-partners",
        f"{_LI}/tallvine",
        f"{_LI}/basalt-infrastructure-partners",
        f"{_LI}/axium-infrastructure",
        f"{_LI}/omers-infrastructure",
        f"{_LI}/blackrock",
        f"{_LI}/novainfrastructure",
        f"{_LI}/schroders-greencoat",
        f"{_LI}/infrabridgegroup",
        f"{_LI}/vision-ridge-partners-llc",
        f"{_LI}/jpmorganassetmanagement",
        f"{_LI}/adia",
        f"{_LI}/acadia-infrastructure",
        f"{_LI}/ridgewood-infrastructure",
        f"{_LI}/global-infrastructure-partners",
        f"{_LI}/ember-infrastructure",
        f"{_LI}/3i-infrastructure-plc",
        f"{_LI}/argo-infrastructure-partners",
        f"{_LI}/encap-investments-lp",
        f"{_LI}/icon-infrastructure-llp",
        f"{_LI}/morgan-stanley-infrastructure-partners",
        f"{_LI}/riverstoneholdings",
        f"{_LI}/ubs-asset-management",
    ]),
]

# Flat list for total count / fund-name enrichment
COMPANY_URLS = [url for _, urls in TIERS for url in urls]

# Map LinkedIn URL slug -> original fund name for downstream matching
URL_TO_FUND = {
    "3i-infrastructure-plc": "3i Infrastructure",
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
    "brookfield": "Brookfield",
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
    "macquariegroup": "Macquarie Asset Management",
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

BATCH_SIZE = 50  # URLs per actor run


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


def diagnose_actor_schema():
    """Query the actor metadata to discover the correct input parameter names.

    Returns a dict with keys 'urls_field' and 'count_field' mapping to the
    actual parameter names the actor expects, or None on failure.
    """
    print("=" * 60)
    print("DIAGNOSING ACTOR INPUT SCHEMA")
    print("=" * 60)

    try:
        actor_info = api_request("GET", f"/acts/{ACTOR_ID}")
    except Exception as exc:
        print(f"  Could not fetch actor info: {exc}")
        return None

    # The actor detail includes version info with the input schema
    versions = actor_info.get("data", {}).get("versions", [])
    latest_version = actor_info.get("data", {}).get("versions", [{}])[-1] if versions else {}
    version_number = latest_version.get("versionNumber") or actor_info.get("data", {}).get("defaultRunOptions", {}).get("build", "latest")

    # Try fetching the input schema directly from the version endpoint
    input_schema = None
    if version_number:
        try:
            version_info = api_request("GET", f"/acts/{ACTOR_ID}/versions/{version_number}")
            source = version_info.get("data", {}).get("inputSchema")
            if isinstance(source, str):
                input_schema = json.loads(source)
            elif isinstance(source, dict):
                input_schema = source
        except Exception:
            pass

    # Fallback: check if inputSchema is embedded in the actor info directly
    if not input_schema:
        for v in reversed(versions):
            source = v.get("inputSchema")
            if source:
                if isinstance(source, str):
                    input_schema = json.loads(source)
                elif isinstance(source, dict):
                    input_schema = source
                break

    if not input_schema:
        print("  WARNING: Could not retrieve input schema from Apify API.")
        print("  Will use current parameter names (targetUrls, maxPosts).")
        return None

    props = input_schema.get("properties", {})
    print(f"  Actor input schema has {len(props)} properties:")
    for name, spec in props.items():
        ptype = spec.get("type", "?")
        default = spec.get("default", "(none)")
        desc = spec.get("description", "")[:80]
        print(f"    {name:25s}  type={ptype:10s}  default={default!s:10s}  {desc}")
    print()

    # Identify the URL field (array of strings that accepts LinkedIn URLs)
    url_field = None
    count_field = None
    for name, spec in props.items():
        ptype = spec.get("type", "")
        desc = (spec.get("description", "") + " " + spec.get("title", "")).lower()
        # URL field: array type containing "url" in name or description
        if ptype == "array" and ("url" in name.lower() or "url" in desc):
            url_field = name
        # Count field: integer type with "max" or "count" or "posts" in name
        if ptype == "integer" and any(kw in name.lower() for kw in ("max", "count", "post", "limit")):
            count_field = name

    print(f"  Detected URL field:   {url_field or '(not found)'}")
    print(f"  Detected count field: {count_field or '(not found)'}")

    if url_field and count_field:
        if url_field != "targetUrls" or count_field != "maxPosts":
            print(f"  >>> MISMATCH: Script uses targetUrls/maxPosts but actor expects {url_field}/{count_field}")
        else:
            print(f"  >>> MATCH: Script parameters match actor schema.")
    print("=" * 60)
    print()

    return {"urls_field": url_field, "count_field": count_field} if url_field and count_field else None


def slug_from_url(url):
    """Extract the company slug from a LinkedIn URL."""
    return url.rstrip("/").split("/")[-1]


def run_batch(batch_urls, batch_num, total_batches, count, urls_field="targetUrls", count_field="maxPosts"):
    """Run a single batch of URLs through the actor and return dataset items."""
    actor_input = {
        urls_field: batch_urls,
        count_field: count,
    }

    print(f"Launching batch {batch_num}/{total_batches} ({len(batch_urls)} URLs, {count_field}={count})...")
    print(f"  Actor input JSON: {json.dumps(actor_input, indent=2)[:500]}")
    result = api_request("POST", f"/acts/{ACTOR_ID}/runs", body=actor_input)
    run_id = result["data"]["id"]
    dataset_id = result["data"]["defaultDatasetId"]
    print(f"  Run ID: {run_id}")
    print(f"  Dataset ID: {dataset_id}")

    # Poll until complete
    print("  Waiting for actor run to complete...")
    while True:
        run_info = api_request("GET", f"/actor-runs/{run_id}")
        status = run_info["data"]["status"]
        print(f"  Status: {status}")

        if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            break
        time.sleep(15)

    if status != "SUCCEEDED":
        print(f"ERROR: Batch {batch_num} ended with status: {status}")
        sys.exit(1)

    # Download dataset items
    print(f"  Downloading dataset items for batch {batch_num}...")
    items = api_request("GET", f"/datasets/{dataset_id}/items?limit=10000")
    print(f"  Got {len(items)} posts from batch {batch_num}")

    # Validate: check per-company post counts to detect if maxPosts was ignored
    company_counts = Counter()
    for item in items:
        author = item.get("author") or {}
        pub_id = author.get("publicIdentifier", "") if isinstance(author, dict) else ""
        company_counts[pub_id or "unknown"] += 1
    if company_counts:
        max_seen = max(company_counts.values())
        min_seen = min(company_counts.values())
        print(f"  Per-company post range: {min_seen}-{max_seen} (expected up to {count})")
        if max_seen <= 10 and count > 10:
            print(f"  WARNING: Max posts per company is {max_seen} but {count_field} was set to {count}.")
            print(f"           The actor may be ignoring the {count_field} parameter!")

    return items


def main():
    total_companies = sum(len(urls) for _, urls in TIERS)
    total_posts_budget = sum(count * len(urls) for count, urls in TIERS)

    print(f"Starting LinkedIn Company Posts Scraper...")
    print(f"  Actor: {ACTOR_ID}")
    print(f"  Companies: {total_companies}")
    print(f"  Tiers: {len(TIERS)} (counts: {', '.join(str(c) for c, _ in TIERS)})")
    print(f"  Max posts budget: {total_posts_budget}")
    print(f"  Batch size limit: {BATCH_SIZE}")
    print()

    # Diagnose actor schema to verify correct parameter names
    schema = diagnose_actor_schema()
    urls_field = schema["urls_field"] if schema else "targetUrls"
    count_field = schema["count_field"] if schema else "maxPosts"
    print(f"Using parameter names: urls={urls_field}, count={count_field}")
    print()

    # Build batches: split each tier's URLs into sub-batches of BATCH_SIZE,
    # each tagged with that tier's count value
    batches = []  # list of (count, url_list)
    for count, urls in TIERS:
        for i in range(0, len(urls), BATCH_SIZE):
            batches.append((count, urls[i:i + BATCH_SIZE]))

    total_batches = len(batches)
    print(f"  Split into {total_batches} batches")
    print()

    all_items = []
    for i, (count, batch_urls) in enumerate(batches, 1):
        items = run_batch(batch_urls, i, total_batches, count, urls_field=urls_field, count_field=count_field)
        all_items.extend(items)
        print()

    # Filter to only 2026 posts
    # HarvestAPI nests the date under postedAt.date (ISO string)
    cutoff = "2026-01-01T00:00:00"
    pre_filter_count = len(all_items)

    def get_posted_date(item):
        """Extract ISO date string from either schema."""
        posted_at = item.get("postedAt")
        if isinstance(posted_at, dict):
            return posted_at.get("date", "")
        # Fallback for flat schema
        return item.get("postedAtISO", "")

    all_items = [item for item in all_items if get_posted_date(item) >= cutoff]
    print(f"Filtered to 2026 posts: {pre_filter_count} -> {len(all_items)}")
    print()

    # Enrich each post with the fund name
    for item in all_items:
        # HarvestAPI nests author info under author.linkedinUrl / author.publicIdentifier
        author = item.get("author") or {}
        if isinstance(author, dict):
            author_url = author.get("linkedinUrl", "") or ""
            public_id = author.get("publicIdentifier", "") or ""
        else:
            author_url = ""
            public_id = ""
        # Fallback to flat fields from older schemas
        if not author_url:
            author_url = item.get("authorProfileUrl", "") or item.get("authorUrl", "") or item.get("companyUrl", "")
        slug = public_id or (slug_from_url(author_url) if author_url else "")
        item["_fundName"] = URL_TO_FUND.get(slug, slug)

    print(f"Total: {len(all_items)} posts from {len(COMPANY_URLS)} companies")

    # Save to file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)
    print(f"Saved to {OUTPUT_FILE}")
    print()
    print("Done! Now run: python3 scripts/filter_linkedin_posts.py")


if __name__ == "__main__":
    if "--diagnose-only" in sys.argv:
        schema = diagnose_actor_schema()
        if schema:
            print(f"Recommended actor_input keys: {schema}")
        else:
            print("Could not determine schema. Check actor ID and token.")
        sys.exit(0)
    main()
