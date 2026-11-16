import { createHash, randomUUID } from "node:crypto";
import { parse, type DefaultTreeAdapterTypes } from "parse5";
import { z } from "zod";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { processingFingerprint, type ProcessingSettings } from "./models";
import {
  EDGAR_ACCESSION_PATTERN,
  EDGAR_CIK,
  EDGAR_FORMS,
  EDGAR_SOURCE_KEY,
  FIXTURE_SOURCE_KEY,
  edgarCanonicalUrl,
  sourcePolicy,
} from "./policy";

const sectionSchema = z.string().trim().min(1).max(4_000);
export const sourceSectionsSchema = z.array(sectionSchema).min(1).max(160);

const captureIdentity = {
  deliveryKey: z.string().trim().min(1).max(128),
  publishedAt: z.iso.datetime({ offset: true }),
  sections: sourceSectionsSchema,
};

const fixtureCaptureSchema = z.strictObject({
  ...captureIdentity,
  sourceKey: z.literal(FIXTURE_SOURCE_KEY),
  externalKey: z.string().regex(/^[\w.:-]{1,128}$/),
  amendsExternalKey: z.string().regex(/^[\w.:-]{1,128}$/).optional(),
});

export const fixtureCapturesSchema = z.array(fixtureCaptureSchema).min(1).max(50);

const filingName = z.string().regex(/^[a-z\d_][a-z\d._-]{0,126}\.html?$/i);
const edgarCaptureSchema = z.strictObject({
  ...captureIdentity,
  sourceKey: z.literal(EDGAR_SOURCE_KEY),
  externalKey: z.string().regex(EDGAR_ACCESSION_PATTERN),
  form: z.enum(EDGAR_FORMS),
  primaryDocument: filingName,
  amendsExternalKey: z.string().regex(EDGAR_ACCESSION_PATTERN).optional(),
});

export const captureSchema = z.discriminatedUnion("sourceKey", [fixtureCaptureSchema, edgarCaptureSchema]);
export type SourceCapture = z.infer<typeof captureSchema>;

export function newsWorkKey(versionId: string, storyId: string | null, stage: string, settings: ProcessingSettings): string {
  return [versionId, storyId ?? "document", stage, processingFingerprint(settings)].join(":");
}

function normalizeSection(text: string): string {
  return text.normalize("NFC").replace(/[\u0000\u200B\uFEFF]/g, "").replace(/\s+/gu, " ").trim();
}

export async function captureDocument(prisma: PrismaClient, input: SourceCapture, settings: ProcessingSettings) {
  const capture = captureSchema.parse(input);
  const policy = sourcePolicy(capture.sourceKey);
  if (!policy?.retainPlainText) throw new Error("Source policy prohibits capture.");
  const sections = sourceSectionsSchema.parse(capture.sections.map(normalizeSection));
  if (sections.length > policy.maxSections || sections.some((text) => text.length > policy.maxSectionCharacters)
    || sections.reduce((total, text) => total + text.length, 0) > policy.maxCharacters) {
    throw new Error("Source text exceeds the approved capture size.");
  }
  const publishedAt = new Date(capture.publishedAt);
  const metadata = capture.sourceKey === EDGAR_SOURCE_KEY
    ? { cik: EDGAR_CIK, form: capture.form, primaryDocument: capture.primaryDocument } : undefined;
  const contentHash = createHash("sha256").update(JSON.stringify({ publishedAt, sections, metadata })).digest("hex");
  const canonicalUrl = capture.sourceKey === EDGAR_SOURCE_KEY ? edgarCanonicalUrl(capture.externalKey) : "";
  const externalKey = capture.sourceKey === EDGAR_SOURCE_KEY
    ? `${capture.externalKey}/${capture.primaryDocument}` : capture.externalKey;

  // A serializable transaction ensures simultaneous corrections observe a single
  // source history and that the capture, delivery receipt and work agree.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const delivery = await tx.newsDelivery.findUnique({
          where: { sourceKey_deliveryKey: { sourceKey: capture.sourceKey, deliveryKey: capture.deliveryKey } },
          select: { document: { select: { externalKey: true } }, version: { select: { id: true, contentHash: true } } },
        });
        if (delivery && (delivery.document.externalKey !== externalKey || delivery.version.contentHash !== contentHash)) {
          throw new Error("Delivery identity already exists with different source content.");
        }
        const document = await tx.newsSourceDocument.upsert({
          where: { sourceKey_externalKey: { sourceKey: capture.sourceKey, externalKey } },
          create: { sourceKey: capture.sourceKey, externalKey, sourceName: policy.sourceName, canonicalUrl },
          update: {},
          select: { id: true },
        });
        const storedVersion = await tx.newsSourceVersion.findUnique({
          where: { documentId_contentHash: { documentId: document.id, contentHash } },
        });
        let version = storedVersion;
        if (!version) {
          const prior = await tx.newsSourceVersion.findFirst({
            where: { documentId: document.id },
            orderBy: [{ capturedAt: "desc" }, { id: "desc" }],
            select: { id: true },
          });
          let amendsVersionId = prior?.id;
          if (!prior && capture.amendsExternalKey) {
            const original = await tx.newsSourceVersion.findFirst({
              where: { document: { sourceKey: capture.sourceKey, externalKey: capture.sourceKey === EDGAR_SOURCE_KEY
                ? { startsWith: `${capture.amendsExternalKey}/` } : capture.amendsExternalKey } },
              orderBy: [{ capturedAt: "desc" }, { id: "desc" }],
              select: { id: true },
            });
            if (!original) throw new Error("The amendment references an uncaptured document.");
            amendsVersionId = original.id;
          }
          version = await tx.newsSourceVersion.create({
            data: { documentId: document.id, contentHash, policyVersion: policy.version, publishedAt, sections, metadata, amendsVersionId },
          });
        }
        if (!delivery) {
          await tx.newsDelivery.create({ data: {
            sourceKey: capture.sourceKey, deliveryKey: capture.deliveryKey, documentId: document.id, versionId: version.id,
          } });
        }
        const key = newsWorkKey(version.id, null, "SCREEN", settings);
        await tx.newsWork.upsert({ where: { key }, update: {}, create: {
          key, versionId: version.id, stage: "SCREEN", config: settings,
        } });
        return { documentId: document.id, versionId: version.id, newDelivery: !delivery, newVersion: !storedVersion };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (attempt === 3 || !(error instanceof Prisma.PrismaClientKnownRequestError)
        || !["P2002", "P2034"].includes(error.code)) throw error;
    }
  }
  throw new Error("Source capture retry limit reached.");
}

export async function queueVersionForReprocessing(
  prisma: PrismaClient,
  versionId: string,
  settings: ProcessingSettings,
) {
  const version = await prisma.newsSourceVersion.findUnique({
    where: { id: versionId },
    select: { policyVersion: true, document: { select: { sourceKey: true } } },
  });
  if (!version || version.document.sourceKey !== EDGAR_SOURCE_KEY
    || !sourcePolicy(EDGAR_SOURCE_KEY, version.policyVersion)?.sendToOpenAi) {
    throw new Error("The supplied version is not an approved EDGAR capture.");
  }
  const key = newsWorkKey(versionId, null, "SCREEN", settings);
  const work = await prisma.newsWork.upsert({
    where: { key },
    create: { key, versionId, stage: "SCREEN", config: settings },
    update: {},
    select: { id: true, status: true },
  });
  if (work.status === "FAILED" || work.status === "SUCCEEDED") {
    throw new Error("This processing configuration already ran. Set a new NEWS_PROCESSING_VERSION to replay.");
  }
  return work;
}

const skipTags = new Set(["head", "script", "style", "template", "noscript", "iframe", "svg", "ix:hidden", "ix:header"]);
const sectionTags = new Set(["address", "blockquote", "br", "div", "dd", "dt", "h1", "h2", "h3", "h4", "h5", "h6", "li", "p", "pre", "tr"]);

export function edgarTextSections(html: string): string[] {
  const parts: string[] = [];
  const pending: string[] = [];
  const flush = () => {
    const section = normalizeSection(pending.join(""));
    if (section.length > 0) {
      let remaining = section;
      while (remaining.length > 4_000) {
        const space = remaining.lastIndexOf(" ", 4_000);
        const splitAt = space > 0 ? space : 4_000;
        parts.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt).trimStart();
      }
      if (remaining) parts.push(remaining);
    }
    pending.length = 0;
  };

  // Iterative traversal keeps deeply nested untrusted HTML off the call stack.
  const stack: { node: DefaultTreeAdapterTypes.Node; closing?: boolean }[] = [{ node: parse(html) }];
  while (stack.length > 0) {
    const { node, closing } = stack.pop()!;
    if ("value" in node) pending.push(node.value);
    if ("tagName" in node) {
      if (skipTags.has(node.tagName) || node.attrs.some(({ name, value }) => name === "hidden"
        || (name === "aria-hidden" && value === "true")
        || (name === "style" && /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\b/i.test(value)))) continue;
      if (sectionTags.has(node.tagName)) flush();
      if (closing && (node.tagName === "td" || node.tagName === "th")) pending.push(" | ");
    }
    if (closing || !("childNodes" in node)) continue;
    stack.push({ node, closing: true });
    for (let index = node.childNodes.length - 1; index >= 0; index--) stack.push({ node: node.childNodes[index] });
  }
  flush();

  const policy = sourcePolicy(EDGAR_SOURCE_KEY);
  if (!policy || parts.length <= policy.maxSections) return sourceSectionsSchema.parse(parts);

  // Inline XBRL filings can expose hundreds of short table cells and layout blocks.
  // Keep their text in order while reducing the number of evidence sections.
  const grouped: string[] = [];
  let current = "";
  for (const part of parts) {
    if (current && current.length + part.length + 1 > 1_200) {
      grouped.push(current);
      current = part;
    } else {
      current = current ? `${current} ${part}` : part;
    }
  }
  if (current) grouped.push(current);
  return sourceSectionsSchema.parse(grouped);
}

const submissionsSchema = z.object({
  cik: z.string(),
  filings: z.object({ recent: z.object({
    accessionNumber: z.array(z.string()),
    acceptanceDateTime: z.array(z.string()),
    form: z.array(z.string()),
    primaryDocument: z.array(z.string()),
  }) }),
});

async function readEdgar(
  url: string,
  userAgent: string,
  maxBytes: number,
  contentType: RegExp,
  fetchResponse: typeof fetch,
): Promise<string> {
  const response = await fetchResponse(url, {
    cache: "no-store",
    headers: { "User-Agent": userAgent },
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`EDGAR returned HTTP ${response.status}.`);
  }
  if (!contentType.test(response.headers.get("content-type") ?? "") || !response.body) {
    await response.body?.cancel();
    throw new Error("EDGAR returned an unexpected response format.");
  }
  const reader = response.body.getReader();
  const decode = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new Error("EDGAR response exceeded the capture limit.");
      }
      text += decode.decode(chunk.value, { stream: true });
    }
    return text + decode.decode();
  } finally {
    reader.releaseLock();
  }
}

type EdgarOptions = {
  fetchResponse?: typeof fetch;
  pace?: () => Promise<void>;
};

const paceEdgar = () => new Promise<void>((resolve) => setTimeout(resolve, 1_000));
type Submissions = z.infer<typeof submissionsSchema>["filings"]["recent"];

async function edgarSubmissions(userAgent: string, fetchResponse: typeof fetch): Promise<Submissions> {
  if (!sourcePolicy(EDGAR_SOURCE_KEY)?.retainPlainText) throw new Error("This EDGAR source policy is disabled.");
  if (!/^.{2,160}\s[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userAgent)) {
    throw new Error("SEC_USER_AGENT must identify the application and contain a contact email address.");
  }
  const body = await readEdgar(`https://data.sec.gov/submissions/CIK${EDGAR_CIK}.json`, userAgent, 3_000_000,
    /^application\/json\b/i, fetchResponse);
  const submissions = submissionsSchema.parse(JSON.parse(body));
  if (submissions.cik.padStart(10, "0") !== EDGAR_CIK) throw new Error("Unexpected issuer in EDGAR submissions.");
  const recent = submissions.filings.recent;
  if ([recent.acceptanceDateTime, recent.form, recent.primaryDocument].some(({ length }) => length !== recent.accessionNumber.length)) {
    throw new Error("EDGAR returned misaligned submission columns.");
  }
  return recent;
}

async function edgarFiling(
  recent: Submissions,
  index: number,
  input: { userAgent: string; deliveryKey?: string },
  fetchResponse: typeof fetch,
): Promise<SourceCapture> {
  const externalKey = z.string().regex(EDGAR_ACCESSION_PATTERN).parse(recent.accessionNumber[index]);
  const form = z.enum(EDGAR_FORMS).parse(recent.form[index]);
  const primaryDocument = filingName.parse(recent.primaryDocument[index]);
  const publishedAt = new Date(z.iso.datetime({ offset: true }).parse(recent.acceptanceDateTime[index])).toISOString();
  const url = new URL(primaryDocument, edgarCanonicalUrl(externalKey)).href;
  const html = await readEdgar(url, input.userAgent, 3_000_000, /^text\/html\b/i, fetchResponse);
  return edgarCaptureSchema.parse({
    sourceKey: EDGAR_SOURCE_KEY,
    deliveryKey: input.deliveryKey ?? randomUUID(),
    externalKey,
    form,
    publishedAt,
    primaryDocument,
    sections: edgarTextSections(html),
  });
}

export async function fetchEdgarCapture(
  input: { accession: string; userAgent: string; deliveryKey?: string },
  { fetchResponse = fetch, pace = paceEdgar }: EdgarOptions = {},
): Promise<SourceCapture> {
  if (!EDGAR_ACCESSION_PATTERN.test(input.accession)) throw new Error("An approved EDGAR accession is required.");
  const recent = await edgarSubmissions(input.userAgent, fetchResponse);
  const index = recent.accessionNumber.indexOf(input.accession);
  if (!z.enum(EDGAR_FORMS).safeParse(recent.form[index]).success) {
    throw new Error("This accession is outside the approved EDGAR issuer and form scope.");
  }
  await pace();
  return edgarFiling(recent, index, input, fetchResponse);
}

export async function* fetchRecentEdgarCaptures(
  input: { userAgent: string; now?: Date },
  { fetchResponse = fetch, pace = paceEdgar }: EdgarOptions = {},
): AsyncGenerator<SourceCapture> {
  const now = input.now ?? new Date();
  const earliest = now.getTime() - 14 * 86_400_000;
  const recent = await edgarSubmissions(input.userAgent, fetchResponse);
  const approved = z.enum(EDGAR_FORMS);
  const indexes = recent.form.flatMap((form, index) => {
    if (!approved.safeParse(form).success) return [];
    const accepted = Date.parse(z.iso.datetime({ offset: true }).parse(recent.acceptanceDateTime[index]));
    return accepted >= earliest && accepted <= now.getTime() ? [index] : [];
  }).reverse();
  if (indexes.length > 20) throw new Error("EDGAR polling scope exceeds 20 filings. Capture the approved accessions directly.");
  for (const index of indexes) {
    await pace();
    yield await edgarFiling(recent, index, input, fetchResponse);
  }
}
