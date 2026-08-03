export interface AdditionSizeSnapshot {
  size: string;
  sizeUsdMm: number | null;
  sizeNativeCurrency: string | null;
  sizeNativeAmount: string | null;
}

export interface AdditionSizeGateResult {
  eligible: boolean;
  basis:
    | "DISCLOSED_USD_EQUIVALENT"
    | "DISCLOSED_USD_NATIVE_AMOUNT"
    | "NATIVE_EUR_GBP_BILLION_SCALE_INDICATION"
    | "BELOW_THRESHOLD"
    | "NO_COMPARABLE_SIZE_INDICATION";
  rationale: string;
}

function formattedThreshold(minimumUsdMm: number): string {
  return `$${(minimumUsdMm / 1_000).toLocaleString("en-US", {
    maximumFractionDigits: 3,
  })}B`;
}

export function evaluateAdditionSizeGate(
  snapshot: AdditionSizeSnapshot,
  minimumUsdMm: number,
): AdditionSizeGateResult {
  if (!Number.isFinite(minimumUsdMm) || minimumUsdMm <= 0) {
    throw new Error("minimumUsdMm must be a positive finite number");
  }
  const threshold = formattedThreshold(minimumUsdMm);
  if (snapshot.sizeUsdMm !== null) {
    const eligible = snapshot.sizeUsdMm >= minimumUsdMm;
    return {
      eligible,
      basis: eligible ? "DISCLOSED_USD_EQUIVALENT" : "BELOW_THRESHOLD",
      rationale: eligible
        ? `${snapshot.size}; structured USD size is at least ${threshold}`
        : `${snapshot.size}; structured USD size is below ${threshold}`,
    };
  }

  if (
    snapshot.sizeNativeCurrency === "USD"
    && snapshot.sizeNativeAmount !== null
  ) {
    const amountUsdMm = Number(snapshot.sizeNativeAmount) / 1_000_000;
    const eligible = Number.isFinite(amountUsdMm)
      && amountUsdMm >= minimumUsdMm;
    return {
      eligible,
      basis: eligible ? "DISCLOSED_USD_NATIVE_AMOUNT" : "BELOW_THRESHOLD",
      rationale: eligible
        ? `${snapshot.size}; disclosed USD amount is at least ${threshold}`
        : `${snapshot.size}; disclosed USD amount is below ${threshold}`,
    };
  }

  if (
    (snapshot.sizeNativeCurrency === "EUR"
      || snapshot.sizeNativeCurrency === "GBP")
    && snapshot.sizeNativeAmount !== null
  ) {
    const nativeAmountMm = Number(snapshot.sizeNativeAmount) / 1_000_000;
    if (Number.isFinite(nativeAmountMm) && nativeAmountMm >= minimumUsdMm) {
      return {
        eligible: true,
        basis: "NATIVE_EUR_GBP_BILLION_SCALE_INDICATION",
        rationale: `${snapshot.size}; disclosed ${
          snapshot.sizeNativeCurrency
        } amount is at least ${minimumUsdMm / 1_000}B`
          + " (no USD conversion asserted)",
      };
    }
  }

  const nativeBillion = snapshot.size.match(
    /([€£])\s*([0-9]+(?:\.[0-9]+)?)\s*(?:B|billion)\b/i,
  );
  if (nativeBillion) {
    const amountMm = Number(nativeBillion[2]) * 1_000;
    if (Number.isFinite(amountMm) && amountMm >= minimumUsdMm) {
      return {
        eligible: true,
        basis: "NATIVE_EUR_GBP_BILLION_SCALE_INDICATION",
        rationale: `${snapshot.size}; disclosed EUR/GBP billion-scale amount`
          + ` indicates at least ${threshold} without asserting a USD conversion`,
      };
    }
    return {
      eligible: false,
      basis: "BELOW_THRESHOLD",
      rationale: `${snapshot.size}; disclosed native-currency amount is below`
        + ` the ${threshold} indication threshold`,
    };
  }

  return {
    eligible: false,
    basis: "NO_COMPARABLE_SIZE_INDICATION",
    rationale: `${snapshot.size}; no fund-specific indication of at least`
      + ` ${threshold}`,
  };
}
