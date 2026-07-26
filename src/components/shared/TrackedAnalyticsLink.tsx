"use client";

import {
  type AnchorHTMLAttributes,
  type MouseEvent,
} from "react";
import { track } from "@vercel/analytics";

type AnalyticsEvent =
  | {
      name: "research_contact_initiated";
      properties: {
        placement: "fund_database_toolbar" | "portfolio_database_toolbar" | "footer" | "data_unavailable";
      };
    }
  | {
      name: "source_link_clicked";
      properties: {
        entity: "earnings" | "dashboard";
        placement: "card" | "signal" | "source_health" | "metric";
      };
    };

interface TrackedAnalyticsLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  analyticsEvent: AnalyticsEvent;
}

/**
 * Tracks a deliberately narrow set of public link interactions. The event
 * union keeps URLs, search terms, record names, and other private values out
 * of the analytics payload by construction.
 */
export function TrackedAnalyticsLink({
  analyticsEvent,
  onClick,
  ...props
}: TrackedAnalyticsLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    track(analyticsEvent.name, analyticsEvent.properties);
    onClick?.(event);
  }

  return <a {...props} onClick={handleClick} />;
}
