import { afterEach, describe, expect, it, vi } from "vitest";
import { EDGAR_SOURCE_KEY, FIXTURE_SOURCE_KEY, canPublishVersion, edgarCanonicalUrl, publicSourceMetadata } from "./policy";
import { edgarTextSections, fetchEdgarCapture, fetchRecentEdgarCaptures } from "./source";

const input = { userAgent: "InfraSight validation fixtures@example.test", accession: "0001108426-25-000048" };
const primaryDocument = "pnm-20250519.htm";
const html = `<!doctype html><html><head><title>private header</title></head><body>
<p>Item 1.01 <span>Entered into an agreement</span></p>
<div style="display: none">hidden block</div><script>hidden code</script>
<ix:header>hidden XBRL</ix:header><p>An &amp; B</p><img src="http://localhost/example"/>
</body></html>`;

function submissions(form = "8-K", filename = primaryDocument, accepted = "2025-05-19T14:41:46.000Z") {
  return Response.json({ cik: "0001108426", filings: { recent: {
    accessionNumber: [input.accession], form: [form], primaryDocument: [filename], acceptanceDateTime: [accepted],
  } } });
}

function htmlResponse() {
  return new Response(html, { headers: { "content-type": "text/html; charset=UTF-8" } });
}

afterEach(() => vi.unstubAllEnvs());

describe("approved EDGAR source", () => {
  it("keeps only visible plain text sections and decodes entities", () => {
    expect(edgarTextSections(html)).toEqual(["Item 1.01 Entered into an agreement", "An & B"]);
  });

  it("coalesces fragmented inline-XBRL layout without dropping passages", () => {
    const paragraphs = Array.from({ length: 240 }, (_, index) => `Disclosure passage ${index}.`);
    const filing = paragraphs.map((paragraph) => `<div><span>${paragraph}</span></div>`).join("");
    const sections = edgarTextSections(filing);
    expect(sections.length).toBeLessThan(160);
    expect(sections.join(" ")).toBe(paragraphs.join(" "));
  });

  it("validates the issuer, form, accession and primary document before fetching", async () => {
    const fetchResponse = vi.fn<typeof fetch>().mockResolvedValueOnce(submissions()).mockResolvedValueOnce(htmlResponse());
    const pace = vi.fn().mockResolvedValue(undefined);
    const result = await fetchEdgarCapture(input, { fetchResponse, pace });
    expect(result).toMatchObject({
      sourceKey: EDGAR_SOURCE_KEY, externalKey: input.accession, primaryDocument, form: "8-K",
      publishedAt: "2025-05-19T14:41:46.000Z", sections: ["Item 1.01 Entered into an agreement", "An & B"],
    });
    expect(fetchResponse).toHaveBeenNthCalledWith(1, "https://data.sec.gov/submissions/CIK0001108426.json", expect.objectContaining({ redirect: "error" }));
    expect(fetchResponse).toHaveBeenNthCalledWith(2, "https://www.sec.gov/Archives/edgar/data/1108426/000110842625000048/pnm-20250519.htm", expect.objectContaining({ redirect: "error" }));
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it.each([ ["10-K", primaryDocument], ["8-K", "https://evil.example/document.htm"] ])(
    "rejects unsupported form or untrusted filename (%s %s)", async (form, name) => {
      const fetchResponse = vi.fn<typeof fetch>().mockResolvedValueOnce(submissions(form, name));
      await expect(fetchEdgarCapture(input, { fetchResponse, pace: async () => {} })).rejects.toThrow();
      expect(fetchResponse).toHaveBeenCalledTimes(1);
    },
  );

  it("ignores older filings while polling and keeps them available for manual capture", async () => {
    const fetchResponse = vi.fn<typeof fetch>().mockResolvedValueOnce(submissions());
    for await (const capture of fetchRecentEdgarCaptures({ ...input, now: new Date("2025-06-10T00:00:00Z") }, { fetchResponse })) {
      throw new Error(`Unexpected capture ${capture.externalKey}`);
    }
    expect(fetchResponse).toHaveBeenCalledTimes(1);
  });

  it("fails closed on policies and never exposes an arbitrary stored source URL", () => {
    const source = { sourceName: "Untrusted", canonicalUrl: edgarCanonicalUrl(input.accession) };
    expect(publicSourceMetadata(EDGAR_SOURCE_KEY, "1", source)).toEqual({ sourceName: "SEC EDGAR — TXNM Energy", sourceUrl: source.canonicalUrl });
    expect(publicSourceMetadata(EDGAR_SOURCE_KEY, "1", { ...source, canonicalUrl: `${source.canonicalUrl}?redirect=1` })?.sourceUrl).toBeNull();
    expect(publicSourceMetadata(EDGAR_SOURCE_KEY, "unapproved", source)).toBeNull();
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEWS_FIXTURE_PUBLICATION", "true");
    expect(canPublishVersion(FIXTURE_SOURCE_KEY, "1")).toBe(false);
  });
});
