import { describe, expect, it } from "vitest";
import { evaluateAdditionSizeGate } from "./addition-size-gate";

describe("evaluateAdditionSizeGate", () => {
  it("includes a disclosed USD amount at or above the threshold", () => {
    expect(evaluateAdditionSizeGate({
      size: "$1.4B final close",
      sizeUsdMm: 1_400,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "1400000000",
    }, 1_000)).toMatchObject({
      eligible: true,
      basis: "DISCLOSED_USD_EQUIVALENT",
    });
  });

  it("excludes disclosed USD amounts below the threshold", () => {
    expect(evaluateAdditionSizeGate({
      size: "$801M commitments",
      sizeUsdMm: 801,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "801000000",
    }, 1_000)).toMatchObject({
      eligible: false,
      basis: "BELOW_THRESHOLD",
    });
  });

  it("accepts a billion-scale EUR or GBP indication without inventing FX", () => {
    expect(evaluateAdditionSizeGate({
      size: "€2.5B target",
      sizeUsdMm: null,
      sizeNativeCurrency: "EUR",
      sizeNativeAmount: "2500000000",
    }, 1_000)).toMatchObject({
      eligible: true,
      basis: "NATIVE_EUR_GBP_BILLION_SCALE_INDICATION",
    });
    expect(evaluateAdditionSizeGate({
      size: "€3.5B final close",
      sizeUsdMm: null,
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
    }, 1_000)).toMatchObject({
      eligible: true,
      basis: "NATIVE_EUR_GBP_BILLION_SCALE_INDICATION",
    });
  });

  it("excludes undisclosed and sub-billion native amounts", () => {
    expect(evaluateAdditionSizeGate({
      size: "Undisclosed",
      sizeUsdMm: null,
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
    }, 1_000)).toMatchObject({
      eligible: false,
      basis: "NO_COMPARABLE_SIZE_INDICATION",
    });
    expect(evaluateAdditionSizeGate({
      size: "€750M final close",
      sizeUsdMm: null,
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
    }, 1_000)).toMatchObject({
      eligible: false,
    });
  });
});
