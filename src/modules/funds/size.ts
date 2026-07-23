const EXPLICIT_TBD = /^TBD$/i;
const LEGACY_BRACKETED_TBD = /^\[\s*TBD\s*\]$/i;

// Keep the display value flexible enough for the currencies used by the fund
// database, but require both a monetary basis and a scaled amount. A bare
// number (or a value such as "$500") is ambiguous and should be reviewed.
const CURRENCY_BASIS = /(?:[$£€¥₹]|\b(?:AED|ARS|AUD|BRL|CAD|CHF|CLP|CNY|COP|CZK|DKK|EUR|GBP|HKD|HUF|IDR|ILS|INR|JPY|KRW|MAD|MXN|MYR|NOK|NZD|PEN|PHP|PLN|QAR|RMB|RON|SAR|SEK|SGD|THB|TRY|TWD|USD|VND|ZAR)\b|\b(?:dollars?|euros?|pounds?|yen|yuan|renminbi|rupees?)\b)/i;
const SCALED_AMOUNT = /\d(?:[\d,.]*\d)?\s*(?:k|m|mm|mn|b|bn|t|tn|thousand|million|billion|trillion)\b\+?/i;
const FULL_AMOUNT = /(?:\d{1,3}(?:,\d{3})+|\d{5,})(?:\.\d+)?/;

export const FUND_SIZE_VALIDATION_MESSAGE =
  "Size must include a disclosed currency amount or be TBD";

/**
 * Canonicalize administrator/import input without rewriting disclosed display
 * formats. `[TBD]` remains accepted as a legacy input but is persisted as TBD.
 */
export function normalizeFundSize(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (EXPLICIT_TBD.test(normalized) || LEGACY_BRACKETED_TBD.test(normalized)) {
    return "TBD";
  }
  return normalized;
}

/**
 * A publishable size is either the canonical TBD marker (including the legacy
 * bracketed spelling after normalization) or a currency-denominated amount
 * with an explicit magnitude/full monetary value.
 */
export function isValidFundSize(value: string): boolean {
  const normalized = normalizeFundSize(value);
  if (normalized === "TBD") return true;

  const disclosed = /^\[.*\]$/.test(normalized)
    ? normalized.slice(1, -1).trim()
    : normalized;

  return CURRENCY_BASIS.test(disclosed)
    && (SCALED_AMOUNT.test(disclosed) || FULL_AMOUNT.test(disclosed));
}
