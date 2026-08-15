Your JSON code block was malformed because it began inside the `evidence` array and omitted the required top-level opening fields. Do not research again.

Return a new complete response with exactly one fenced `json` object followed by at most three Markdown bullets. The JSON object must be under 3,500 characters and parse with `JSON.parse`. Use short strings, no inline citations, no extra fields, at most three milestones, and at most six evidence rows. Every required top-level key from the original schema must be present.

Preserve these supported conclusions:

- `decision`: `PROPOSED_CORRECTION`; `confidence`: `HIGH`.
- Canonical company remains Thunderbird Renewables in the United States; SkyVest is the management platform, Phoenix is separate, and Lakefield/Shiloh IV are underlying assets.
- `ArcLight Capital` is the existing ArcLight Capital Partners owner, not a second owner.
- Current owner: ArcLight Capital Partners / ArcLight Infrastructure Partners Fund VIII; entry date `2025-02-21`; entry year `2025`; manager-level stake `NOT_PUBLICLY_DISCLOSED`; `CLOSED_ACTIVE`.
- No former owners and no pending ownership transaction.
- Headquarters, standalone website, founding year, and manager-level stake are not publicly disclosed.
- Scale: 309 MW. Milestones: Lakefield 50% close on 2025-02-21; Shiloh IV 100% close on 2025-03-12; remaining Lakefield 50% close on 2025-07-01. Those percentages are project-level only.
- No Thunderbird-level exit or signed pending sale was found through 2026-08-15.
- Recommended action: reject the queued duplicate `ADD_OWNER`; correct entry year, headquarters, description, milestones, and citations in place.

Use no more than these six direct evidence URLs:

1. https://arclight.com/investments/
2. https://arclight.com/portfolio-services/
3. https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf
4. https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250303-5288
5. https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250313-5247
6. https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250708-5177

The response must begin with the complete JSON object at `asOfDate` and end that object only after `recommendedListAction`. Do not repeat the prior partial response.
