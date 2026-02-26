#!/usr/bin/env python3
"""
Filter LinkedIn company posts to keep only news and press release content.

Usage:
    python3 scripts/filter_linkedin_posts.py

Reads:  scripts/linkedin_raw_posts.json
Writes: scripts/linkedin_filtered_posts.json

Filtering strategy:
  - INCLUDE posts matching infrastructure-deal / news / PR keywords
  - EXCLUDE posts matching casual / engagement / hiring patterns
  - Posts that match an exclude pattern are dropped even if they also
    match an include keyword (exclude takes priority)
"""

import json
import os
import re
import sys
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, "linkedin_raw_posts.json")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "linkedin_filtered_posts.json")

# ---------------------------------------------------------------------------
# Keyword lists
# ---------------------------------------------------------------------------

# Posts containing ANY of these patterns are considered news / PR candidates
INCLUDE_PATTERNS = [
    r"\bannounce[ds]?\b",
    r"\bacquisition\b",
    r"\bacquire[ds]?\b",
    r"\bpartnership\b",
    r"\bpartner(?:ed|ing)\b",
    r"\blaunch(?:ed|es|ing)?\b",
    r"\binvest(?:ed|ing|ment|s)?\b",
    r"\bclos(?:ed|ing|e)\b",
    r"\bdeal\b",
    r"\bfund(?:ing|raise|ed)?\b",
    r"\binfrastructure\b",
    r"\bportfolio\b",
    r"\bpress release\b",
    r"\bnews\b",
    r"\bmilestone\b",
    r"\bawarded\b",
    r"\bselected\b",
    r"\bappointed\b",
    r"\braised\b",
    r"\bcommitted\b",
    r"\bsecured\b",
    r"\bcompleted\b",
    r"\bsigned\b",
    r"\btransaction\b",
    r"\bmerger\b",
    r"\bjoint venture\b",
    r"\bIPO\b",
    r"\bdivestiture\b",
    r"\bdivest(?:ed|ing)?\b",
    r"\brecapitalization\b",
    r"\brefinanc(?:ed|ing)\b",
    r"\bplatform\b",
    r"\bbolt[- ]?on\b",
    r"\badd[- ]?on\b",
    r"\bfinal close\b",
    r"\bfirst close\b",
    r"\bcapital raise\b",
    r"\bcapital commitment\b",
    r"\benergy transition\b",
    r"\brenderable energy\b",
    r"\brenewable\b",
    r"\bdigital infrastructure\b",
    r"\bdata cent(?:er|re)\b",
    r"\bfiber\b",
    r"\btelecom\b",
    r"\btransportation\b",
    r"\butilities?\b",
    r"\bwater\b",
    r"\bmidstream\b",
    r"\bpipeline\b",
    r"\bregulatory\b",
    r"\bapproval\b",
    r"\bESG\b",
    r"\bsustainab(?:le|ility)\b",
    r"\b(?:billion|million|bn|mn)\b",
    r"\$[\d,.]+\s*(?:billion|million|bn|mn|B|M)\b",
]

# Posts matching ANY of these are dropped (casual / engagement / hiring)
EXCLUDE_PATTERNS = [
    r"\b(?:we(?:'re| are) hiring|job opening|open position|apply now|join our team)\b",
    r"\bhappy (?:holidays?|new year|thanksgiving|christmas|diwali|eid)\b",
    r"\bcongratulations?\b.*\b(?:promotion|new role|anniversary|birthday)\b",
    r"\b(?:poll|vote|survey|quiz)\b",
    r"\b(?:employee spotlight|team spotlight|meet the team|get to know)\b",
    r"\b(?:throwback thursday|tbt|flashback friday|fbf)\b",
    r"\b(?:work(?:ing)? from home|remote work tips|office tour)\b",
    r"\b(?:intern(?:ship)?s?\b.*(?:apply|open|welcome))",
    r"\b(?:happy hour|team outing|office party|company retreat)\b",
    r"\b(?:motivational monday|wellness wednesday|fun friday)\b",
    r"(?:like|comment|share|repost) (?:if|to) ",
]

INCLUDE_RE = [re.compile(p, re.IGNORECASE) for p in INCLUDE_PATTERNS]
EXCLUDE_RE = [re.compile(p, re.IGNORECASE) for p in EXCLUDE_PATTERNS]


def extract_text(post: dict) -> str:
    """Pull all text content from a post object."""
    parts = []
    for key in ("text", "postText", "commentary", "title", "description",
                "content", "body", "message", "summary"):
        val = post.get(key)
        if isinstance(val, str) and val.strip():
            parts.append(val.strip())
    # Also check nested article data
    article = post.get("article") or post.get("sharedContent") or {}
    if isinstance(article, dict):
        for key in ("title", "subtitle", "description", "text"):
            val = article.get(key)
            if isinstance(val, str) and val.strip():
                parts.append(val.strip())
    return "\n".join(parts)


def is_news_or_pr(text: str) -> bool:
    """Return True if the text looks like news / press release content."""
    if not text:
        return False

    # Check excludes first (they override includes)
    for pat in EXCLUDE_RE:
        if pat.search(text):
            return False

    # Check includes
    for pat in INCLUDE_RE:
        if pat.search(text):
            return True

    return False


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: Input file not found: {INPUT_FILE}")
        print("Run scripts/run_apify_scraper.py first to download the raw data.")
        sys.exit(1)

    with open(INPUT_FILE) as f:
        posts = json.load(f)

    print(f"Loaded {len(posts)} raw posts")
    print()

    filtered = []
    fund_total = Counter()
    fund_kept = Counter()

    for post in posts:
        fund_name = post.get("_fundName", "Unknown")
        fund_total[fund_name] += 1

        text = extract_text(post)
        if is_news_or_pr(text):
            filtered.append(post)
            fund_kept[fund_name] += 1

    # Save filtered output
    with open(OUTPUT_FILE, "w") as f:
        json.dump(filtered, f, indent=2, ensure_ascii=False)

    # Print summary
    print(f"Filtered: {len(filtered)} / {len(posts)} posts kept")
    print(f"Saved to: {OUTPUT_FILE}")
    print()
    print(f"{'Fund Name':<50} {'Kept':>5} / {'Total':>5}")
    print("-" * 65)

    # Sort by fund name
    all_funds = sorted(set(list(fund_total.keys()) + list(fund_kept.keys())))
    for fund in all_funds:
        total = fund_total.get(fund, 0)
        kept = fund_kept.get(fund, 0)
        print(f"{fund:<50} {kept:>5} / {total:>5}")

    # Funds with zero posts scraped
    funds_with_posts = set(fund_total.keys())
    print()
    print(f"Funds with scraped posts: {len(funds_with_posts)}")
    print(f"Funds with news/PR posts: {len(fund_kept)}")


if __name__ == "__main__":
    main()
