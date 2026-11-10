export const RESEARCH_EVENTS = ["search_success", "search_empty", "record_open", "source_click", "briefing_click"] as const;
export const RESEARCH_PAGES = ["tracker", "search", "funds", "portfolio", "news", "dashboard", "deal-profile", "fund-profile", "company-profile", "sponsor-profile", "compare"] as const;
export const RESEARCH_VITALS = ["LCP", "INP", "CLS"] as const;

export type ResearchEvent = (typeof RESEARCH_EVENTS)[number];
export type ResearchPage = (typeof RESEARCH_PAGES)[number];
export type ResearchVital = (typeof RESEARCH_VITALS)[number];
