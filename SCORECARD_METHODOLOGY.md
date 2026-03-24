# Portfolio Company Scorecard — Research & Enrichment Methodology

> **Purpose:** This document defines the step-by-step process for researching, enriching, and auditing portfolio company scorecards. Every enriched PortCo entry in `src/data/portcos/companies.ts` must meet these standards. This methodology should be followed by any agent (human or AI) working on scorecards.

---

## Phase 1: Source Collection (Before Writing Anything)

For each portfolio company, gather **primary sources first, then secondary**. Do NOT write any data until sources are collected and cross-referenced.

### 1A. Primary Sources (Mandatory — Check All)

| Source Type | Where to Find | What to Extract |
|---|---|---|
| **Fund Manager Portfolio Page** | GP's website → Portfolio section (e.g., `3i-infrastructure.com/portfolio/`) | Official description, investment date, fund vehicle, sector classification, ownership stake %, status (active/realized) |
| **Company Website** | Direct URL, usually linked from fund portfolio page | Description, headquarters, founding year, management team (Leadership/About page), service areas |
| **Fund Press Releases / News** | GP's website → News/Media section | Transaction details, deal value, investment rationale, co-investors, advisors |
| **Regulatory Filings (if public fund)** | SEC EDGAR (US), Companies House (UK), SEDAR (Canada) | Investor presentations, annual reports with portfolio details |

### 1B. Secondary Sources (Cross-Reference & Enrich)

| Source Type | Where to Find | What to Extract |
|---|---|---|
| **Infrastructure Investor / PERE / IJGlobal** | Industry trade press | Deal details, fund strategy context, competitive landscape |
| **Bloomberg / Reuters / WSJ** | Financial press | Transaction values, strategic rationale, market context |
| **Wikipedia** | If article exists | Founding history, milestones, corporate lineage |
| **LinkedIn** | Company page → People | Current C-suite roster verification |
| **Pitchbook / Preqin** | If accessible | Fund vintage, strategy, co-investors, deal multiples |

### 1C. Source Quality Rules

- **Minimum 3 sources per company**, ideally 4-5
- **At least 1 must be from the fund manager** (portfolio page, press release, or investor presentation)
- **At least 1 must be from the company itself** (website, press release)
- **At least 1 independent third-party source** (news article, Wikipedia, industry publication)
- **Never rely solely on AI training knowledge** — every fact must be traceable to a URL
- **If a source contradicts the fund's official page, the fund page takes precedence** for investment-specific facts (date, vehicle, strategy)
- **Dates must be verified** from at least 2 sources before including in milestones

---

## Phase 2: Data Population (Field-by-Field)

### 2A. Core Fields

| Field | Standard | Common Pitfalls |
|---|---|---|
| `name` | Official legal/trade name as used by the fund manager. Include parenthetical disambiguation if needed (e.g., `"Puget Sound Energy (PSE)"`) | Don't use abbreviations unless the company itself brands that way |
| `investmentFirm` | For single investor: fund manager name. For multiple: `"Firm A / Firm B"`. Include ownership % if publicly disclosed: `"CDPQ (30%) / DigitalBridge"` | Don't confuse parent company with fund manager (e.g., "CVC" vs "DIF Capital Partners") |
| `sector` | Must be one of the `PortCoSector` union types. Match to the fund's own sector classification first | Don't create new sectors — map to closest existing type |
| `subsector` | Free text, more specific than sector. Use industry-standard terms | Be consistent across similar companies (e.g., "Data Centers" not "Data Centre Operations") |
| `ownershipVehicle` | Exact fund name (must match a `fundName` in `src/data/funds.ts` for strategy badges to render) | Verify the match exists in funds.ts — if not, no strategy badges will appear |
| `status` | `"Active"` if fund still holds the asset. `"Realized"` if exited/sold | Check the fund's portfolio page — most distinguish current vs past/realized portfolio |
| `investmentYear` | Year the fund **first** invested (not subsequent follow-ons). Must align with the investment milestone in the timeline | For consortium deals, use the year the specific fund's investment closed |

### 2B. Description (80-120 words, 2-3 sentences)

**Sentence 1: What the company does and its market position.**
> "[Company] is a [market position descriptor] [what it does] serving [customers/markets] across [geography]."

**Sentence 2: Quantifiable scale and operational scope.**
> "The company operates [X assets/facilities/km of network] with [Y employees/customers/capacity], generating approximately [$Z] in annual revenue."

**Sentence 3: Investment context.**
> "[Fund] invested in [year] to [strategic rationale — e.g., accelerate expansion, support energy transition, fund recapitalization]."

**Rules:**
- Every quantitative claim must come from a source (revenue, employees, capacity, customers)
- Use the fund's own language for investment rationale when available
- Do NOT include speculative or forward-looking statements
- Do NOT copy-paste from sources — synthesize in your own words
- For parent/subsidiary distinctions: clearly state which entity the PortCo represents (e.g., "the Environmental Services division of GFL" not just "GFL Environmental")

### 2C. Management (C-Suite Only)

**Include:**
- CEO, CFO, COO, CTO, CRO, CMO (any "Chief X Officer")
- President (but NOT Vice President)
- Co-CEOs, Interim-CEOs (with title noted)

**Exclude:**
- Vice President, SVP, EVP
- General Counsel
- Controller
- Director-level
- Board members (unless also serving as executive)

**Verification:**
- Cross-reference company website "Leadership" page with LinkedIn
- If company website is outdated, LinkedIn is more current
- Title format: Use the company's own title format (e.g., "Founder & Chief Executive Officer" not just "CEO")

### 2D. Milestones (5-8 minimum, reverse chronological in display)

**Required milestone types:**
1. **Founding** — When and where the company was established, by whom
2. **Investment Event** — When the fund acquired/invested. This MUST use category `"Financing"` and the date must align with `investmentYear`. If the investment was an acquisition, you can use `"Acquisition"` but the event text must mention the fund name (for the drawer's investment callout highlighting to work)
3. **At least 1 operational milestone** — Expansion, major contract, capacity addition
4. **Exit milestone** (if `status: "Realized"`) — Sale date, buyer, price if disclosed

**Recommended additional types:**
- Major acquisitions (bolt-ons, platform acquisitions)
- Management changes (CEO transitions)
- Capital raises / refinancings
- Regulatory milestones (license awards, rate case outcomes for utilities)
- IPO or public market events

**Date format:** Use `"Month Year"` (e.g., `"July 2023"`) when known, or `"Year"` (e.g., `"2010"`) when only year is available. Use `"Q1 2024"` only when quarter is the best available precision.

**Event text rules:**
- 1-2 sentences maximum
- Include deal values when publicly disclosed
- Include counterparty names (who was acquired, who was the seller, who was the advisor)
- For the investment milestone specifically: mention the fund name AND any co-investors

### 2E. Sources

**Format:** `{ label: "Descriptive Label", url: "https://..." }`

**Label convention:**
- Fund page: `"[Fund Manager] — [Company] Portfolio Page"`
- Company site: `"[Company] — About / History / Leadership"`
- News: `"[Publication] — [Headline Summary]"`
- Wikipedia: `"Wikipedia — [Article Title]"`

**URL rules:**
- Must be live/accessible (no paywalled content without noting it)
- No URL shorteners
- Prefer HTTPS
- If a URL is likely to change (e.g., news article), prefer the most stable version

---

## Phase 3: Cross-Reference Validation

Before finalizing any scorecard, verify:

| Check | How |
|---|---|
| `investmentYear` matches milestone date | The investment/acquisition milestone's date year must equal `investmentYear` |
| `ownershipVehicle` exists in funds.ts | Run: `funds.find(f => f.fundName === company.ownershipVehicle)` — if null, no strategy badges render |
| `status` matches fund's portfolio classification | Active = fund still holds it. Realized = fund has exited |
| Management is current | Check company website / LinkedIn for recent departures |
| No confusion between parent and subsidiary | If the PortCo is a division/carve-out, description must clarify this |
| `headquarters` is the company's HQ, not the fund's | Common mistake: listing the GP's office instead of the portfolio company's location |
| Milestones are in proper category | "Financing" for capital raises/investments, "Acquisition" for buying companies, "Expansion" for organic growth |

---

## Phase 4: Audit Checklist (For Reviewing Existing Scorecards)

When auditing a scorecard that was previously enriched, check each of these:

- [ ] **Description accuracy**: Does the description match what the company actually does? (Web search to verify)
- [ ] **Description specificity**: Are the quantitative claims (revenue, employees, customers, capacity) verifiable from sources?
- [ ] **Investment firm correctness**: Is this the right fund manager? (Not confusing parent/sub, not using an outdated name)
- [ ] **Investment year accuracy**: Does it match the actual transaction close date?
- [ ] **Status correctness**: Is the fund still invested, or has it exited?
- [ ] **Management currency**: Are the listed executives still in their roles? Any CEO changes?
- [ ] **Milestone accuracy**: Do the dates and events check out? Any fabricated milestones?
- [ ] **Source validity**: Do the URLs work? Do they support the claims in the scorecard?
- [ ] **Parent/subsidiary confusion**: Is this the right entity? (e.g., GFL Environmental Services ≠ GFL Environmental Inc.)
- [ ] **Sector/subsector accuracy**: Does the company's actual business match the assigned sector?

---

## Known Pitfalls & Anti-Patterns

1. **AI hallucination of milestones**: LLMs will confidently fabricate specific dates and events. Every milestone must be traceable to a source URL.
2. **Parent/subsidiary confusion**: GFL Environmental Inc. (TSX-listed public company) vs. GFL Environmental Services (Apollo/BC Partners carve-out). Always verify which entity the fund actually owns.
3. **Stale management data**: Executives change frequently. A scorecard from 6 months ago may already be wrong.
4. **Revenue/employee figures**: These change annually. Use "approximately" and cite the year of the figure.
5. **Fund name variants**: "CVC (CVC DIF)" vs "CVC DIF" vs "DIF Capital Partners" — use the canonical name from funds.ts.
6. **Mixing up investment date with company founding date**: The fund's entry date is NOT when the company was founded.
7. **Confusing announced vs closed dates**: Use the actual close date for the investment milestone, not the announcement date.
8. **Non-infrastructure fund buyers appearing as investmentFirm**: Corporate acquirers, operating companies should not be listed as infrastructure fund managers.
