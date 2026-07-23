export type ProductEventProperties = {
  search_submitted: {
    surface: "global_nav" | "search_page";
  };
  filter_applied: {
    entity: "deals" | "funds" | "portfolio" | "news";
    filter:
      | "category"
      | "confidence"
      | "country"
      | "date_window"
      | "entity"
      | "firm"
      | "region"
      | "sector"
      | "size"
      | "source"
      | "status"
      | "strategy"
      | "structure"
      | "year";
  };
  drawer_opened: {
    entity: "deal" | "fund" | "company" | "news";
  };
  source_link_clicked: {
    entity: "deal" | "fund" | "company" | "news";
  };
  weekly_email_opened: {
    surface: "deal_database";
  };
  research_contact_initiated: {
    surface: "footer" | "deal_database" | "fund_database" | "portfolio_database" | "one_off_requests";
  };
  export_started: {
    entity: "deals" | "funds" | "portfolio";
  };
};

export type ProductEventName = keyof ProductEventProperties;

export type SanitizedProductEvent = {
  [Name in ProductEventName]: {
    name: Name;
    properties: ProductEventProperties[Name];
  }
}[ProductEventName];

const ALLOWED_VALUES = {
  search_submitted: {
    surface: new Set(["global_nav", "search_page"]),
  },
  filter_applied: {
    entity: new Set(["deals", "funds", "portfolio", "news"]),
    filter: new Set([
      "category",
      "confidence",
      "country",
      "date_window",
      "entity",
      "firm",
      "region",
      "sector",
      "size",
      "source",
      "status",
      "strategy",
      "structure",
      "year",
    ]),
  },
  drawer_opened: {
    entity: new Set(["deal", "fund", "company", "news"]),
  },
  source_link_clicked: {
    entity: new Set(["deal", "fund", "company", "news"]),
  },
  weekly_email_opened: {
    surface: new Set(["deal_database"]),
  },
  research_contact_initiated: {
    surface: new Set(["footer", "deal_database", "fund_database", "portfolio_database", "one_off_requests"]),
  },
  export_started: {
    entity: new Set(["deals", "funds", "portfolio"]),
  },
} satisfies Record<ProductEventName, Record<string, ReadonlySet<string>>>;

function isPlainProperties(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Runtime enforcement keeps accidental record names, IDs, URLs, queries, and
 * other free text out of analytics even when a caller bypasses TypeScript.
 */
export function sanitizeProductEvent(
  name: string,
  properties: unknown,
): SanitizedProductEvent | null {
  if (!(name in ALLOWED_VALUES) || !isPlainProperties(properties)) return null;
  const contract = ALLOWED_VALUES[name as ProductEventName] as Record<string, ReadonlySet<string>>;
  const expectedKeys = Object.keys(contract).sort();
  const suppliedKeys = Object.keys(properties).sort();
  if (
    suppliedKeys.length !== expectedKeys.length
    || suppliedKeys.some((key, index) => key !== expectedKeys[index])
  ) return null;

  for (const key of expectedKeys) {
    const value = properties[key];
    if (typeof value !== "string" || !contract[key].has(value)) return null;
  }

  return { name, properties } as SanitizedProductEvent;
}

export function redactTelemetryUrl(rawUrl: string): string {
  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(rawUrl);
  try {
    const url = new URL(rawUrl, "https://infrasight.invalid");
    const adminSegment = url.pathname.indexOf("/admin");
    if (adminSegment >= 0) {
      const segmentEnd = adminSegment + "/admin".length;
      const boundary = url.pathname[segmentEnd];
      if (boundary === undefined || boundary === "/") {
        url.pathname = `${url.pathname.slice(0, adminSegment)}/admin`;
      }
    }
    url.search = "";
    url.hash = "";
    return isAbsolute ? url.toString() : url.pathname;
  } catch {
    return "/";
  }
}

export function redactTelemetryEvent<T extends { url: string }>(event: T): T {
  return { ...event, url: redactTelemetryUrl(event.url) };
}
