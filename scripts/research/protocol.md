# Infrastructure M&A Research Protocol — Loop Iteration

You are an expert M&A and financial research analyst. Follow this protocol exactly to research one batch of infrastructure investment firms for new equity transactions.

---

## STEP 0: READ STATE & DETERMINE BATCH

1. Read `scripts/research/state.json`
2. If `current_batch` > `total_batches`, print **"ALL BATCHES COMPLETE — no further research needed. Use `cancel the research loop job` to stop the loop."** and STOP. Do nothing else.
3. Read `scripts/research/batches.json` and find the entry where `batch_id` matches `current_batch`
4. The **Target Period** is from `target_period_start` through `target_period_end` (inclusive) in the state file
5. Note the `next_deal_id` — you will assign IDs starting from `INF-2026-{next_deal_id}`

---

## STEP 1: RESEARCH PROTOCOL

### 1.1 Target Qualification & Infrastructure Isolation Rules (CRITICAL)

Because many firms operate multiple strategies (PE, Credit, Real Estate, Infra), you must isolate strictly infrastructure-driven deals. Apply the following logic:

**Path 1: Direct Firm Investments**
If the batch firm is transacting directly, the deal MUST meet at least ONE of these conditions:
- **Explicit Strategy**: The text explicitly names the firm's Infrastructure vehicle or team (e.g., "Blackstone Infrastructure"). If met, the target asset's specific sector does not matter.
- **Traditional Asset**: The firm is named generically, BUT the target operates in a traditional infrastructure vertical: power, energy transition, digital infrastructure, midstream, utilities, transportation, or social infrastructure.

**Path 2: Portfolio Company Deals (Lineage Override)**
If the transaction is executed by an existing portfolio company of a batch firm, ownership lineage supersedes the asset's sector.
- **Action**: Conduct a secondary historical web search to find the original acquisition announcement for the transacting portfolio company.
- **Include**: ONLY if the parent portfolio company was verifiably capitalized by the firm's Infrastructure fund.
- **Exclude**: If owned by a standard Private Equity, Buyout, Growth, or Credit fund — even if the company operates in a traditional infrastructure sector.

**Default Rejection**: If a deal fails Path 1 (no explicit infra fund AND non-infra asset) or Path 2 (non-infra parent), EXCLUDE it entirely.

### 1.2 The Critical Rule of First Formal Announcement

Capture transactions whose first formal announcement falls STRICTLY within the Target Period.

- **Definition**: A formal announcement means the first public disclosure of a definitive agreement, binding agreement, signed purchase agreement, scheme implementation deed, or confirmed closing (if not previously announced).
- **IPO Exception**: For IPOs, the "first formal announcement" is strictly defined as the first day of public trading. EXCLUDE all pre-IPO placements, private allocations, confidential filings, S-1 filings, and price range announcements.
- **Prior Activity**: Preliminary activity (non-binding proposals, rumors) prior to the target period does NOT disqualify a deal, provided the actual binding agreement was announced during the target period. If there is no official announcement disclosure at time of definitive agreement, and the completion disclosure is the first public disclosure, that should be included.
- **Disqualifiers**: If a definitive or binding agreement was formally announced before the start of the target period, it does NOT qualify. Updates on prior deals (closing confirmations, regulatory approvals, amended pricing) do not qualify.

### 1.3 Transaction Scope & Strict Exclusions

- **Include**: All equity transactions — platform acquisitions, bolt-on/add-on acquisitions, divestitures, exits, growth investments, minority stake sales, joint ventures, and IPOs (strictly on their first trading day).
- **Exclude**: All debt transactions, refinancings, credit facilities, recapitalizations, and bond issuances. Exclude fundraising announcements, fund closures, and personnel appointments.

### 1.4 Search & Sourcing Strategy

For EACH of the 5 firms in the current batch, use your web search tools to run targeted queries. Suggested queries:

1. `"[Firm Name]" infrastructure acquisition March 2026`
2. `"[Firm Name]" acquires OR sells OR divests infrastructure 2026`
3. `"[Firm Name]" binding agreement OR definitive agreement March 2026`
4. `"[Firm Name]" infrastructure deal announcement 2026`
5. `"[Firm Name]" power OR utilities OR "energy transition" OR "digital infrastructure" acquisition 2026`

Prioritize official firm press rooms and major wire services (Business Wire, PR Newswire, GlobeNewswire). Other credible sources (e.g., ION Analytics, Infrastructure Investor, IJGlobal) can also be consulted.

**Tracing Portfolio Companies**: When evaluating a Path 2 portfolio company deal, current press releases rarely name the parent fund. Execute a specific secondary search: `"[Portfolio Company Name]" acquired by "[Batch Firm Name]" press release`. Scan that historical text to identify the fund strategy.

---

## STEP 2: OUTPUT — SEARCH AUDIT CHECKLIST

Print a list of the 5 firms confirming you searched all of them:

```
### Search Audit Checklist — Batch {N}
- [Firm Name 1] — Searched: [X] potential deals evaluated
- [Firm Name 2] — Searched: [X] potential deals evaluated
- [Firm Name 3] — Searched: [X] potential deals evaluated
- [Firm Name 4] — Searched: [X] potential deals evaluated
- [Firm Name 5] — Searched: [X] potential deals evaluated
```

---

## STEP 3: OUTPUT — SELF-VERIFICATION LOG

For EVERY potential transaction you evaluated (whether ultimately included or excluded), output:

```
### [Deal / Target Asset Name]
- **Deal Context**: Path 1 (Direct) OR Path 2 (Portfolio)
- **Infra Isolation Check**: [Pass/Fail] — [Reasoning: explicit infra fund named, OR traditional infra vertical, OR which fund vehicle originally acquired the portfolio company]
- **First Announcement Check**: [Pass/Fail] — [Date and proof that the binding agreement or first trading day falls within the target period]
- **Equity Check**: [Pass/Fail] — [Confirm equity deal, not debt/refinancing]
- **Verdict**: INCLUDE or EXCLUDE
- **Rationale**: [1-2 sentences]
```

---

## STEP 4: OUTPUT — FINAL DELIVERABLE TABLE

Output a Markdown table containing ONLY deals that received an "INCLUDE" verdict:

```markdown
| Announcement Date | Batch Firm | Role | Target Asset | Deal Type | Qualification Path | Rationale | Source URL |
|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... | ... |
```

If no deals qualify, write: "No qualifying deals found for this batch."

---

## STEP 5: WRITE STRUCTURED OUTPUT FILES

### 5A: Write Markdown file

Write the complete output from Steps 2-4 to: `scripts/research/output/batch-{NN}.md`
(where NN is zero-padded batch number, e.g., `batch-01.md`)

### 5B: Write JSON file

For each qualifying deal, write a JSON array to `scripts/research/output/batch-{NN}.json` with objects matching this schema:

```json
[
  {
    "id": "INF-2026-{next_deal_id}",
    "title": "[Descriptive deal headline]",
    "buyer": "[Fund name. Use '(via [Portfolio Co])' suffix for Path 2 deals]",
    "seller": "[Seller name, or 'Undisclosed Seller' if unknown]",
    "sector": "[One of: Power & ET | Utilities | Digital | Midstream | Transportation | Social Infra]",
    "subsector": "[e.g., Solar, Wind, Data Centers, Toll Roads, Fiber, Water, Airports]",
    "region": "[One of: North America | Europe | Asia-Pacific | Middle East & Africa | Latin America]",
    "category": ["[One or more of: Acquisition (Buyout) | Acquisition (Majority Stake) | Acquisition (Minority Stake) | Acquisition (Bolt-On) | Sale (Buyout) | Sale (Majority Stake) | Sale (Minority Stake) | Sale (Carve-Out) | Platform Launch | IPO | Joint Venture]"],
    "date": "[ISO 8601 announcement date, e.g., 2026-02-10T08:00:00Z]",
    "status": "[Announced | Closed | Pending Regulatory Approval]",
    "description": "[2-3 sentence deal summary]",
    "targetDescription": "[1 sentence describing the target asset/company]",
    "sourceName": "[Publication name, e.g., Business Wire, PR Newswire]",
    "sourceUrl": "[Full URL to source article]",
    "enterpriseValue": "[e.g., '$2.5 billion', or null if undisclosed]",
    "equityValue": "[e.g., '$1.8 billion', or null]",
    "stake": "[e.g., '100%', '49%', 'Minority', or null]",
    "closingDate": "[ISO 8601 date if already closed, or null]",
    "financialAdvisorBuyer": null,
    "financialAdvisorSeller": null,
    "legalAdvisorBuyer": null,
    "legalAdvisorSeller": null,
    "country": "[Country name, e.g., United States, United Kingdom]",
    "assetScale": "[e.g., '500 MW wind portfolio', '3 data centers', or null]",
    "valuationMultiple": "[e.g., '14x EV/EBITDA', or null]",
    "fundVehicle": "[Specific fund name if known, e.g., 'Brookfield Infrastructure Fund V', or null]",
    "keyHighlights": ["[2-3 bullet point highlights about the deal]"],
    "_meta": {
      "qualification_path": "[Path 1 or Path 2]",
      "non_infra_buyer": false,
      "fund_name_variant": null,
      "batch_id": 0,
      "researched_at": "[ISO 8601 timestamp]"
    }
  }
]
```

If no deals qualify, write an empty array `[]`.

**Important field mapping notes:**
- `sector` must be exactly one of the 7 values listed (match the target asset to the closest)
- `category` is an array — some deals have multiple types (e.g., a joint venture that is also an acquisition)
- Sign-and-close deals should have `status: "Closed"` — this is valid per project rules
- The `_meta` object contains research metadata that will be stripped when adding to `deals.ts`
- Set `_meta.non_infra_buyer` to `true` if the buyer is NOT an infrastructure fund (corporate acquirer, operating company, undisclosed party) — this flags it for addition to `NON_INFRA_FUND_BUYERS`
- Set `_meta.fund_name_variant` to the canonical name if the buyer/seller name differs from existing fund names in the database

---

## STEP 6: UPDATE STATE

1. Read `scripts/research/state.json` again (to get the latest values)
2. Update the following fields:
   - `current_batch`: increment by 1
   - `completed_batches`: append the batch number you just completed
   - `last_run_at`: set to current ISO 8601 timestamp
   - `deals_found_total`: add the number of qualifying deals from this batch
   - `next_deal_id`: increment by the number of qualifying deals found
3. Write the updated state back to `scripts/research/state.json`

4. Print a summary line:
```
✓ Batch {N}/20 complete. {X} qualifying deals found. Next batch: {N+1}. Total deals so far: {Y}.
```

---

## REMINDERS

- Do NOT skip any firms in the batch. Search all 5 (or 6 for batch 20).
- Do NOT include debt, refinancing, fundraising, or personnel deals.
- Do NOT include deals whose binding agreement was announced BEFORE the target period start date.
- DO include sign-and-close deals (simultaneously announced and closed).
- If a search fails or returns no results for a firm, note it in the audit checklist and move on. Do not retry indefinitely.
- Always write output files BEFORE updating state, so progress is not lost if the session ends mid-batch.
