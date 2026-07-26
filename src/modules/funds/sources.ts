export interface FundSourceLink {
  url: string;
  hostname: string;
  label: string;
  isPrimary: boolean;
}

function parsePublicSourceUrl(rawUrl: string): { url: string; key: string; hostname: string } | null {
  const candidate = rawUrl.trim();
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return {
      url: parsed.href,
      key: parsed.href,
      hostname: parsed.hostname.replace(/^www\./i, ""),
    };
  } catch {
    return null;
  }
}

/** Keep the reviewed primary source first and show each supporting URL once. */
export function buildFundSourceLinks(
  primarySourceUrl: string | null,
  sourceUrls: string[],
): FundSourceLink[] {
  const links: FundSourceLink[] = [];
  const seen = new Set<string>();

  if (primarySourceUrl) {
    const primary = parsePublicSourceUrl(primarySourceUrl);
    if (primary) {
      seen.add(primary.key);
      links.push({
        url: primary.url,
        hostname: primary.hostname,
        label: "Primary source",
        isPrimary: true,
      });
    }
  }

  for (const rawUrl of sourceUrls) {
    const supporting = parsePublicSourceUrl(rawUrl);
    if (!supporting || seen.has(supporting.key)) continue;
    seen.add(supporting.key);
    const supportingCount = links.filter((link) => !link.isPrimary).length + 1;
    links.push({
      url: supporting.url,
      hostname: supporting.hostname,
      label: `Supporting source ${supportingCount}`,
      isPrimary: false,
    });
  }

  return links;
}
