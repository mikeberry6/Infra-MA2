import { z } from "zod";
import { RESEARCH_EVENTS, RESEARCH_PAGES, RESEARCH_VITALS } from "@/lib/research-metrics";

const eventCounts = z.partialRecord(z.enum(RESEARCH_EVENTS), z.number().int().min(1).max(250));
const vitals = z.partialRecord(z.enum(RESEARCH_VITALS), z.number().min(0).max(120_000));
const metricBatch = z.strictObject({
  page: z.enum(RESEARCH_PAGES),
  viewport: z.enum(["mobile", "desktop"]),
  counts: eventCounts.optional(),
  vitals: vitals.optional(),
});

export async function POST(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || (origin !== url.origin && (!host || origin !== `${url.protocol}//${host}`))) {
    return new Response(null, { status: 403 });
  }
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });

  try {
    const decoder = new TextDecoder();
    let bytes = 0;
    let body = "";
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.length;
      if (bytes > 1024) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    const parsed = metricBatch.safeParse(JSON.parse(body + decoder.decode()));
    if (!parsed.success || (!parsed.data.counts && !parsed.data.vitals)) {
      return new Response(null, { status: 400 });
    }
    console.info("infrasight_research_metrics", JSON.stringify(parsed.data));
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
