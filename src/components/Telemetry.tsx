"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { redactTelemetryEvent } from "@/lib/analytics-contract";

export function Telemetry() {
  return (
    <>
      <Analytics beforeSend={(event: BeforeSendEvent) => redactTelemetryEvent(event)} />
      <SpeedInsights beforeSend={(event) => redactTelemetryEvent(event)} />
    </>
  );
}
