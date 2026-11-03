// Frozen canonical legacy IDs. New archive files must pass the reviewed import workflow.
// Never regenerate identities from card position or deduplicate solely by source URL.
import canonicalDeals from "./weekly-briefing-canonical.json";
import type { Deal } from "./deals";

export const weeklyBriefingDeals: Deal[] = canonicalDeals as Deal[];
