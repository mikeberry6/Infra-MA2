export type ReferenceCategory = "Masthead" | "Key Themes" | "Deal cards" | "Charts";

type Reference = {
  publisher: string;
  issue: string;
  published: string;
  url: string;
  format: string;
  category: ReferenceCategory;
  takeaway: string;
  pattern: string;
};

export const references = [
  {
    publisher: "Goldman Sachs Briefings",
    issue: "Special Issue: AI and Data Centers",
    published: "2025-09-10",
    url: "https://www.goldmansachs.com/pdfs/insights/briefings/AIAndDataCenters.pdf",
    format: "Issue PDF",
    category: "Masthead",
    takeaway: "Follow the masthead with a short agenda so readers can spot the sectors they cover.",
    pattern: "masthead-agenda",
  },
  {
    publisher: "McKinsey Shortlist",
    issue: "Happy taxpayers? With better customer service, it’s possible",
    published: "2019-09-27",
    url: "https://www.mckinsey.com/~/media/McKinsey/Email/Shortlist/58/2019-09-27.ashx",
    format: "HTML email",
    category: "Masthead",
    takeaway: "Give the series name its own line. Set the coverage description and publication date underneath in smaller type.",
    pattern: "masthead-dateline",
  },
  {
    publisher: "CTVC",
    issue: "CTVC Wrapped, 2024 #227",
    published: "2024-12-23",
    url: "https://www.ctvc.co/ctvc-wrapped-2024-227-2/",
    format: "Web edition",
    category: "Masthead",
    takeaway: "Pair the issue number with the topic so readers can identify a particular edition when it is forwarded.",
    pattern: "masthead-number",
  },
  {
    publisher: "McKinsey CEO Shortlist",
    issue: "Shifting seasons",
    published: "2025-09-19",
    url: "https://www.mckinsey.com/~/media/mckinsey/email/shortlist/270/2025-09-19c.html",
    format: "HTML email",
    category: "Key Themes",
    takeaway: "Open each paragraph with a short phrase in bold. A reader scanning only those phrases should grasp both themes.",
    pattern: "themes-run-in",
  },
  {
    publisher: "The Transcript",
    issue: "Powering Forward",
    published: "2026-09-28",
    url: "https://thetranscript.substack.com/p/09-28-2026-powering-forward",
    format: "Web edition",
    category: "Key Themes",
    takeaway: "Put the week's conclusions in one compact block. A thin rule marks the transition to the supporting evidence.",
    pattern: "themes-summary-rule",
  },
  {
    publisher: "Sightline Climate",
    issue: "Introducing Powerstack",
    published: "2026-03-05",
    url: "https://www.ctvc.co/introducing-powerstack-from-sightline-climate/",
    format: "Newsletter preview",
    category: "Key Themes",
    takeaway: "Start with the disclosed amount or capacity, then name the transaction. Readers see the scale before the commentary.",
    pattern: "themes-scale-first",
  },
  {
    publisher: "Axios Pro Rata",
    issue: "Choose your own Metsera",
    published: "2025-11-07",
    url: "https://www.axios.com/newsletters/axios-pro-rata-590f58fb-177a-4d05-ac52-e02515252512",
    format: "Web edition",
    category: "Deal cards",
    takeaway: "Give the lead transaction room for a sentence of context, then place shorter entries together under a shared heading.",
    pattern: "deals-lead-transaction",
  },
  {
    publisher: "Carbon Brief",
    issue: "CB+ launch | Iran ‘accelerates’ transition | OpenAI-UAE deal",
    published: "2026-11-03",
    url: "https://www.carbonbrief.org/daily-briefing-cb-launch-iran-accelerates-transition-openai-uae-deal/",
    format: "Web edition",
    category: "Deal cards",
    takeaway: "Put attribution on a small line beside the headline and keep the summary separate. Readers can trace a claim while scanning.",
    pattern: "deals-source-line",
  },
  {
    publisher: "StrictlyVC",
    issue: "November 1, 2019",
    published: "2019-11-01",
    url: "https://strictlyvc.com/2020/04/26/november-1-2019/",
    format: "Web edition",
    category: "Deal cards",
    takeaway: "Group funding rounds by size. Within a sector, give deals with disclosed values a clear place at the top.",
    pattern: "deals-size-groups",
  },
  {
    publisher: "Apollo Daily Spark",
    issue: "5,426 Data Centers in the US",
    published: "2025-10-26",
    url: "https://www.apolloacademy.com/5426-data-centers-in-the-us/",
    format: "Web edition",
    category: "Charts",
    takeaway: "Use the leading number in the headline. The chart can then show how much separates the leader from its peers.",
    pattern: "charts-finding-title",
  },
  {
    publisher: "State Street",
    issue: "Energy-led risks under watch",
    published: "2026-03-13",
    url: "https://www.ssga.com/us/en/institutional/insights/mind-on-the-market-13-march-2026",
    format: "Weekly market commentary",
    category: "Charts",
    takeaway: "Pair the source with the observation date beneath the figures so a forwarded chart still has its reporting cutoff.",
    pattern: "charts-as-of",
  },
  {
    publisher: "Datawrapper Weekly Chart",
    issue: "Low wages across Europe",
    published: "2025-07-17",
    url: "https://www.datawrapper.de/blog/low-wages-europe",
    format: "Web edition",
    category: "Charts",
    takeaway: "Define the measure before comparing categories. For YTD rankings, spell out what each bar counts and the period it covers.",
    pattern: "charts-defined-measure",
  },
] as const satisfies readonly Reference[];
