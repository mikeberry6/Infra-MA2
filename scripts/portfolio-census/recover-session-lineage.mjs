#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultManagerUniversePath = path.resolve(
  scriptDirectory,
  "../research/manager-universe.json",
);

const CHAT_URL_PATTERN = /https:\/\/chatgpt\.com\/c\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const RAW_PATH_PATTERN = /(?:\/Users\/[^\\\s"']+\/)?audits\/portfolio-census\/\d{4}-\d{2}-\d{2}\/raw\/[A-Za-z0-9._/-]+\.txt/g;

function parseArgs(argv) {
  const options = {
    archivePath: null,
    managerUniversePath: defaultManagerUniversePath,
    outputPath: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--archive") options.archivePath = argv[++index];
    else if (argument.startsWith("--archive=")) options.archivePath = argument.slice("--archive=".length);
    else if (argument === "--manager-universe") options.managerUniversePath = argv[++index];
    else if (argument.startsWith("--manager-universe=")) {
      options.managerUniversePath = argument.slice("--manager-universe=".length);
    } else if (argument === "--out") options.outputPath = argv[++index];
    else if (argument.startsWith("--out=")) options.outputPath = argument.slice("--out=".length);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.archivePath) throw new Error("--archive is required");
  return options;
}

function topLevelPayloadType(line) {
  const match = line.match(/^\{"timestamp":"[^"]+","type":"([^"]+)","payload":\{"type":"([^"]+)"/);
  return match ? { recordType: match[1], payloadType: match[2] } : null;
}

function timestampFromLine(line) {
  return line.match(/^\{"timestamp":"([^"]+)"/)?.[1] ?? null;
}

function commandSegment(line, command) {
  const offset = line.indexOf(command);
  if (offset < 0) return null;
  const tail = line.slice(offset);
  const nextCommandOffset = tail.slice(command.length).search(/portfolio:census:[a-z-]+/);
  return nextCommandOffset < 0
    ? tail
    : tail.slice(0, command.length + nextCommandOffset);
}

function managerIndexFromCommand(line, command) {
  const segment = commandSegment(line, command);
  const match = segment?.match(/--manager-index(?:=|\s+)(\d{1,3})/);
  return match ? Number(match[1]) : null;
}

function normalizedRawPaths(line) {
  return [...new Set((line.match(RAW_PATH_PATTERN) ?? []).map((value) => {
    const auditOffset = value.indexOf("audits/portfolio-census/");
    return auditOffset >= 0 ? value.slice(auditOffset) : value;
  }))];
}

function structuredCurrentChatUrl(line) {
  const marker = '"_meta":{"browser_use":{"url":"';
  const offset = line.lastIndexOf(marker);
  if (offset < 0) return null;
  const tail = line.slice(offset + marker.length);
  const match = tail.match(/^https:\/\/chatgpt\.com\/c\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  return match?.[0] ?? null;
}

function activeCurrentChatUrl(line) {
  const structuredUrl = structuredCurrentChatUrl(line);
  if (structuredUrl) return structuredUrl;
  if (!line.includes("chatgpt.com/c/")) return null;
  const reportsCurrentTab = line.includes("tab.url()") || line.includes("await tab.url()");
  const navigatesDirectly = /\.goto\(['"]https:\/\/chatgpt\.com\/c\//.test(line);
  if (!reportsCurrentTab && !navigatesDirectly) return null;
  return (line.match(CHAT_URL_PATTERN) ?? []).at(-1) ?? null;
}

function navigatesToFreshChat(line) {
  return /\.goto\(['"]https:\/\/chatgpt\.com\/?['"]\)/.test(line);
}

function textBlocksFromRecord(record, shape) {
  if (shape.recordType === "event_msg" && shape.payloadType === "mcp_tool_call_end") {
    return (record.payload?.result?.Ok?.content ?? [])
      .map((block) => block?.text)
      .filter((value) => typeof value === "string");
  }
  if (shape.recordType !== "response_item") return [];
  const output = record.payload?.output;
  if (typeof output === "string") return [output];
  if (!Array.isArray(output)) return [];
  return output
    .map((block) => block?.text)
    .filter((value) => typeof value === "string");
}

function decodedTextVariants(text) {
  const variants = [text];
  let value = text;
  for (let pass = 0; pass < 3; pass += 1) {
    const decoded = value
      .replace(/\\\\n/g, "\n")
      .replace(/\\\\r/g, "\r")
      .replace(/\\\\t/g, "\t")
      .replace(/\\\\"/g, '"')
      .replace(/\\\\\\\\/g, "\\");
    if (decoded === value) break;
    variants.push(decoded);
    value = decoded;
  }
  return variants;
}

function sidebarLinksFromLine(line, shape) {
  if (!line.includes("/url: /c/")) return [];
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    return [];
  }
  const links = [];
  const pattern = /link "([^"\n]+)"[^\n]*\n\s+- \/url: \/c\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g;
  for (const block of textBlocksFromRecord(record, shape)) {
    for (const variant of decodedTextVariants(block)) {
      for (const match of variant.matchAll(pattern)) {
        links.push({
          title: match[1].replace(/, unread$/i, "").trim(),
          url: `https://chatgpt.com/c/${match[2]}`,
        });
      }
    }
  }
  return links;
}

function managerArtifactStem(index, manager) {
  const slug = manager
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
  return `${String(index).padStart(3, "0")}-${slug}`;
}

function uniqueUrls(events) {
  const seen = new Set();
  const result = [];
  for (const event of events) {
    if (seen.has(event.url)) continue;
    seen.add(event.url);
    result.push(event.url);
  }
  return result;
}

export async function scanSessionArchive(archivePath) {
  const urlEvents = [];
  const starts = [];
  const failures = [];
  const ingests = [];
  const artifactUrlEvents = [];
  const chatObservations = [];
  let activeChatUrl = null;

  const input = fs.createReadStream(archivePath, { encoding: "utf8" });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });

  for await (const line of lines) {
    const shape = topLevelPayloadType(line);
    if (!shape) continue;
    const timestamp = timestampFromLine(line);
    if (!timestamp) continue;

    if (
      shape.recordType === "response_item"
      && shape.payloadType === "custom_tool_call"
      && line.includes("PORTFOLIO_CENSUS_ACCEPTANCE_AUDIT")
    ) {
      break;
    }

    for (const link of sidebarLinksFromLine(line, shape)) {
      chatObservations.push({ timestamp, ...link });
    }

    if (shape.recordType === "event_msg" && shape.payloadType === "mcp_tool_call_end") {
      if (navigatesToFreshChat(line)) activeChatUrl = null;
      const url = activeCurrentChatUrl(line);
      if (url) {
        activeChatUrl = url;
        urlEvents.push({ timestamp, url });
      }
      for (const rawPath of normalizedRawPaths(line)) {
        if (activeChatUrl) artifactUrlEvents.push({ timestamp, url: activeChatUrl, rawPath });
      }
      continue;
    }

    if (shape.recordType !== "response_item") continue;
    if (!["function_call", "custom_tool_call", "function_call_output", "custom_tool_call_output"].includes(shape.payloadType)) {
      continue;
    }

    if (
      ["function_call", "custom_tool_call"].includes(shape.payloadType)
      && line.includes("portfolio:census:state")
      && line.includes("--action start")
    ) {
      const managerIndex = managerIndexFromCommand(line, "portfolio:census:state");
      if (managerIndex) {
        starts.push({ timestamp, managerIndex });
        activeChatUrl = null;
      }
    }

    if (
      ["function_call", "custom_tool_call"].includes(shape.payloadType)
      && line.includes("portfolio:census:state")
      && line.includes("--action fail")
    ) {
      const managerIndex = managerIndexFromCommand(line, "portfolio:census:state");
      if (managerIndex) failures.push({ timestamp, managerIndex });
    }

    if (
      ["function_call_output", "custom_tool_call_output"].includes(shape.payloadType)
      && line.includes("portfolio:census:ingest")
      && /Ingested [^\\"]+: COMPLETE/.test(line)
    ) {
      const ingestSegment = commandSegment(line, "portfolio:census:ingest") ?? "";
      const managerIndex = managerIndexFromCommand(line, "portfolio:census:ingest");
      if (!managerIndex) continue;
      const rawPaths = normalizedRawPaths(ingestSegment);
      ingests.push({
        timestamp,
        managerIndex,
        rawPath: rawPaths.find((value) => value.includes("/raw/")) ?? null,
      });
    }
  }

  return { urlEvents, starts, failures, ingests, artifactUrlEvents, chatObservations };
}

const GENERIC_MANAGER_TOKENS = new Set([
  "asset",
  "assets",
  "capital",
  "global",
  "group",
  "infrastructure",
  "investment",
  "investments",
  "investors",
  "management",
  "manager",
  "partners",
  "partner",
]);

function normalizedTokens(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function titleMatchScore(manager, title) {
  const allManagerTokens = normalizedTokens(manager);
  const distinctiveTokens = allManagerTokens.filter((token) => !GENERIC_MANAGER_TOKENS.has(token));
  const requiredTokens = distinctiveTokens.length > 0 ? distinctiveTokens : allManagerTokens;
  const titleTokens = new Set(normalizedTokens(title));
  const matched = requiredTokens.filter((token) => titleTokens.has(token)).length;
  const tokenScore = requiredTokens.length > 0 ? matched / requiredTokens.length : 0;
  const managerAcronym = allManagerTokens.map((token) => token[0]).join("");
  const acronymScore = managerAcronym.length >= 2 && titleTokens.has(managerAcronym) ? 1 : 0;
  return Math.max(tokenScore, acronymScore);
}

const TARGET_LIKE_TITLE = /\b(census|contract|execution|holdings?|infrastructure|json|portfolio|reconciliation|repair|request|research|search|task)\b/i;
const UNRELATED_TITLE = /\b(bloodwork|cradle cap|desktop|fee ratchet|pairing code|remote setup|remote pairing)\b/i;

function isTargetLikeChat(chat) {
  return chat.titles.some((title) => TARGET_LIKE_TITLE.test(title) && !UNRELATED_TITLE.test(title));
}

function conversationOrdinal(url) {
  const id = url?.match(/\/c\/([0-9a-f]{8})-/)?.[1];
  return id ? Number.parseInt(id, 16) : null;
}

function buildChatCatalog(observations) {
  const catalog = new Map();
  for (const observation of observations) {
    const existing = catalog.get(observation.url) ?? {
      url: observation.url,
      firstSeenAt: observation.timestamp,
      lastSeenAt: observation.timestamp,
      titles: new Set(),
    };
    existing.firstSeenAt = existing.firstSeenAt < observation.timestamp
      ? existing.firstSeenAt
      : observation.timestamp;
    existing.lastSeenAt = existing.lastSeenAt > observation.timestamp
      ? existing.lastSeenAt
      : observation.timestamp;
    existing.titles.add(observation.title);
    catalog.set(observation.url, existing);
  }
  return [...catalog.values()].map((entry) => ({
    ...entry,
    titles: [...entry.titles],
    ordinal: conversationOrdinal(entry.url),
  }));
}

export function buildSessionLineage({
  archivePath,
  managers,
  urlEvents,
  starts,
  failures = [],
  ingests,
  artifactUrlEvents,
  chatObservations,
  generatedAt = new Date().toISOString(),
}) {
  const entries = managers.map((requestedManager, offset) => {
    const index = offset + 1;
    const managerIngests = ingests.filter((event) => event.managerIndex === index);
    const ingest = managerIngests.at(-1) ?? null;
    const managerStarts = starts.filter((event) => (
      event.managerIndex === index && (!ingest || event.timestamp <= ingest.timestamp)
    ));
    const startedAt = managerStarts.at(-1)?.timestamp ?? null;
    const previousIngestAt = ingests
      .filter((event) => event.timestamp < (ingest?.timestamp ?? "") && event.managerIndex !== index)
      .at(-1)?.timestamp ?? null;
    const lastFailureAt = failures
      .filter((event) => (
        event.managerIndex === index
        && event.timestamp >= (previousIngestAt ?? "")
        && event.timestamp <= (ingest?.timestamp ?? "9999-12-31T23:59:59.999Z")
      ))
      .at(-1)?.timestamp ?? null;
    const windowStart = lastFailureAt ?? previousIngestAt ?? startedAt ?? "";
    const windowEnd = ingest?.timestamp ?? "9999-12-31T23:59:59.999Z";
    const candidates = uniqueUrls(urlEvents.filter((event) => (
      event.timestamp >= windowStart && event.timestamp <= windowEnd
    )));
    const directArtifactUrls = ingest?.rawPath
      ? uniqueUrls(artifactUrlEvents.filter((event) => (
          event.rawPath === ingest.rawPath && event.timestamp <= windowEnd
        )))
      : [];

    let conversationUrl = null;
    let resolutionMethod = "UNRESOLVED";
    let confidence = "UNRESOLVED";
    if (directArtifactUrls.length > 0) {
      conversationUrl = directArtifactUrls.at(-1);
      resolutionMethod = "RAW_ARTIFACT_WRITE_URL";
      confidence = "HIGH";
    } else if (candidates.length === 1) {
      [conversationUrl] = candidates;
      resolutionMethod = "ONLY_CHAT_IN_ACCEPTED_ATTEMPT";
      confidence = "HIGH";
    } else if (candidates.length > 1) {
      conversationUrl = candidates.at(-1);
      resolutionMethod = "LAST_CHAT_IN_ACCEPTED_ATTEMPT";
      confidence = "MEDIUM";
    }

    return {
      index,
      requestedManager,
      artifactStem: managerArtifactStem(index, requestedManager),
      acceptedRawPath: ingest?.rawPath ?? null,
      ingestedAt: ingest?.timestamp ?? null,
      acceptedAttemptStartedAt: startedAt,
      recoveryWindowStartedAt: windowStart || null,
      lastFailedAttemptAt: lastFailureAt,
      conversationUrl,
      acceptedAssistantTurnId: null,
      confidence,
      resolutionMethod,
      candidateConversationUrls: candidates,
      directArtifactUrls,
      titleMatchedChats: [],
      successfulIngestCount: managerIngests.length,
    };
  });

  const chatCatalog = buildChatCatalog(chatObservations);
  const censusStartedAt = starts.map((event) => event.timestamp).sort()[0] ?? "";
  for (const entry of entries) {
    if (entry.conversationUrl) continue;
    const previousResolved = entries.slice(0, entry.index - 1).reverse().find((value) => value.conversationUrl);
    const nextResolved = entries.slice(entry.index).find((value) => value.conversationUrl);
    const lowerBound = conversationOrdinal(previousResolved?.conversationUrl) ?? Number.NEGATIVE_INFINITY;
    const upperBound = conversationOrdinal(nextResolved?.conversationUrl) ?? Number.POSITIVE_INFINITY;
    const titleMatches = chatCatalog
      .map((chat) => ({
        ...chat,
        score: Math.max(...chat.titles.map((title) => titleMatchScore(entry.requestedManager, title))),
      }))
      .filter((chat) => (
        chat.firstSeenAt >= censusStartedAt
        && chat.score >= 0.5
        && chat.ordinal > lowerBound
        && chat.ordinal < upperBound
      ))
      .sort((left, right) => right.score - left.score || right.ordinal - left.ordinal);
    entry.titleMatchedChats = titleMatches.map((chat) => ({
      conversationUrl: chat.url,
      titles: chat.titles,
      score: chat.score,
      firstSeenAt: chat.firstSeenAt,
    }));
    if (titleMatches.length > 0) {
      entry.conversationUrl = titleMatches[0].url;
      entry.resolutionMethod = "SIDEBAR_TITLE_AND_MANAGER_ORDER";
      entry.confidence = titleMatches.length === 1 ? "HIGH" : "MEDIUM";
    }
  }

  for (let offset = 0; offset < entries.length;) {
    if (entries[offset].conversationUrl) {
      offset += 1;
      continue;
    }
    const blockStart = offset;
    while (offset < entries.length && !entries[offset].conversationUrl) offset += 1;
    const block = entries.slice(blockStart, offset);
    const previousResolved = entries.slice(0, blockStart).reverse().find((value) => value.conversationUrl);
    const nextResolved = entries.slice(offset).find((value) => value.conversationUrl);
    const lowerBound = conversationOrdinal(previousResolved?.conversationUrl) ?? Number.NEGATIVE_INFINITY;
    const upperBound = conversationOrdinal(nextResolved?.conversationUrl) ?? Number.POSITIVE_INFINITY;
    const assignedUrls = new Set(entries.map((entry) => entry.conversationUrl).filter(Boolean));
    const orderedCandidates = chatCatalog
      .filter((chat) => (
        chat.firstSeenAt >= censusStartedAt
        && !assignedUrls.has(chat.url)
        && chat.ordinal > lowerBound
        && chat.ordinal < upperBound
        && isTargetLikeChat(chat)
      ))
      .sort((left, right) => left.ordinal - right.ordinal);
    if (orderedCandidates.length !== block.length) continue;
    block.forEach((entry, index) => {
      const chat = orderedCandidates[index];
      entry.conversationUrl = chat.url;
      entry.resolutionMethod = "ORDERED_TARGET_CHAT_BLOCK";
      entry.confidence = "MEDIUM";
      entry.titleMatchedChats = [{
        conversationUrl: chat.url,
        titles: chat.titles,
        score: 0,
        firstSeenAt: chat.firstSeenAt,
      }];
    });
  }

  for (const entry of entries) {
    const previousResolved = entries.slice(0, entry.index - 1).reverse().find((value) => value.conversationUrl);
    const nextResolved = entries.slice(entry.index).find((value) => value.conversationUrl);
    const lowerBound = conversationOrdinal(previousResolved?.conversationUrl) ?? Number.NEGATIVE_INFINITY;
    const upperBound = conversationOrdinal(nextResolved?.conversationUrl) ?? Number.POSITIVE_INFINITY;
    const managerTitleChats = chatCatalog
      .map((chat) => ({
        ...chat,
        score: Math.max(...chat.titles.map((title) => titleMatchScore(entry.requestedManager, title))),
      }))
      .filter((chat) => (
        chat.firstSeenAt >= censusStartedAt
        && chat.score >= 0.5
        && chat.ordinal > lowerBound
        && chat.ordinal < upperBound
      ))
      .sort((left, right) => right.score - left.score || right.ordinal - left.ordinal);
    entry.managerTitleConversationUrls = managerTitleChats.map((chat) => chat.url);
    entry.relatedConversationUrls = uniqueUrls([
      ...entry.directArtifactUrls.map((url) => ({ url })),
      ...managerTitleChats.map((chat) => ({ url: chat.url })),
      ...(entry.conversationUrl ? [{ url: entry.conversationUrl }] : []),
    ]);
    const newestManagerTitledChat = managerTitleChats.at(0);
    if (
      newestManagerTitledChat
      && conversationOrdinal(newestManagerTitledChat.url) > conversationOrdinal(entry.conversationUrl)
    ) {
      entry.conversationUrl = newestManagerTitledChat.url;
      entry.resolutionMethod = "LATEST_MANAGER_TITLED_CHAT_AFTER_DIRECT_ATTEMPT";
      entry.confidence = "MEDIUM";
    }
  }

  const confidenceCounts = entries.reduce((counts, entry) => {
    counts[entry.confidence] = (counts[entry.confidence] ?? 0) + 1;
    return counts;
  }, {});

  return {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_SESSION_LINEAGE",
    generatedAt,
    sourceArchive: path.resolve(archivePath),
    recoveryContract: {
      chatSurface: "https://chatgpt.com",
      assistantSelector: "section[data-turn=\"assistant\"]",
      capture: ["data-message-id", "textContent"],
      acceptanceRule: "Select the assistant turn or ordered assistant turns that reproduce the successfully ingested marked census envelope for this manager; validate with validate-result.ts before ingesting.",
      note: "conversationUrl is the archive-derived primary recovery chat. relatedConversationUrls preserves evidenced retry or chunk chats. Some chats were later reused for other research, so inspect every assistant turn rather than assuming the latest response is the accepted portfolio census. acceptedAssistantTurnId remains null until verified against the live signed-in ChatGPT conversation.",
    },
    summary: {
      managerCount: entries.length,
      resolvedConversationUrls: entries.filter((entry) => entry.conversationUrl).length,
      unresolvedConversationUrls: entries.filter((entry) => !entry.conversationUrl).length,
      successfulIngestEvents: ingests.length,
      confidenceCounts,
    },
    managers: entries,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const archivePath = path.resolve(options.archivePath);
  const managerUniversePath = path.resolve(options.managerUniversePath);
  const managers = JSON.parse(fs.readFileSync(managerUniversePath, "utf8"));
  if (!Array.isArray(managers) || managers.length !== 100 || managers.some((value) => typeof value !== "string")) {
    throw new Error("Manager universe must contain exactly 100 manager-name strings");
  }
  const events = await scanSessionArchive(archivePath);
  const lineage = buildSessionLineage({ archivePath, managers, ...events });
  const serialized = `${JSON.stringify(lineage, null, 2)}\n`;
  if (options.outputPath) {
    const outputPath = path.resolve(options.outputPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, serialized, "utf8");
    console.log(`Wrote ${outputPath}`);
  } else {
    process.stdout.write(serialized);
  }
  console.error(JSON.stringify(lineage.summary));
  if (lineage.summary.unresolvedConversationUrls > 0) process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
