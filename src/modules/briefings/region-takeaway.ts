const monthDay = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const regionNames = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" });
const smallNumbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const deals = (count: number) => count === 1 ? "deal" : "deals";

export function regionTakeaway(rows: readonly { label: string; total: number }[], cutoffDate: string): string {
  if (!rows.length) return "";
  const through = monthDay.format(new Date(cutoffDate + "T00:00:00Z"));
  const ranked = rows.filter(row => row.total > 0).sort((a, b) => b.total - a.total);
  if (!ranked.length) return `The regional chart recorded no YTD deals through ${through}.`;
  const [first, second] = ranked;
  if (!second) return `${first.label} recorded ${first.total} YTD ${deals(first.total)} through ${through}.`;
  const namesAt = (total: number) => regionNames.format(ranked.filter(row => row.total === total).map(row => row.label));
  if (first.total === second.total) {
    return `${namesAt(first.total)} tied for the lead through ${through} with ${first.total} ${deals(first.total)} each.`;
  }
  const gap = first.total - second.total;
  const difference = `${smallNumbers[gap] ?? gap} ${deals(gap)}`;
  if (ranked[2]?.total === second.total) {
    return `${first.label} led with ${first.total} deals through ${through}, ${difference} ahead of ${namesAt(second.total)} (${second.total} each).`;
  }
  return `${first.label} led ${second.label} by ${difference} through ${through}, ${first.total} to ${second.total}.`;
}
