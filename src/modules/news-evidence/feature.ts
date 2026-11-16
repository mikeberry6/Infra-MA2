export function newsEvidenceEnabled(): boolean {
  return process.env.NEWS_EVIDENCE_ENABLED === "true";
}
