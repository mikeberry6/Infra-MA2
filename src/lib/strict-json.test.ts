import { describe, expect, it } from "vitest";
import { parseStrictJson } from "@/lib/strict-json";

describe("strict JSON parser", () => {
  it("returns ordinary nested JSON values", () => {
    expect(parseStrictJson(
      '{"object":{"text":"line\\nvalue","unicode":"\\u00d8"},"array":[true,false,null,-1.5e2]}',
    )).toEqual({
      object: { text: "line\nvalue", unicode: "Ø" },
      array: [true, false, null, -150],
    });
  });

  it("rejects duplicate keys at any depth, including escaped equivalents", () => {
    expect(() => parseStrictJson('{"selectedGroupKey":"a","selectedGroupKey":"b"}'))
      .toThrow("duplicate object key");
    expect(() => parseStrictJson('{"item":{"scope":1,"\\u0073cope":2}}'))
      .toThrow("duplicate object key");
  });

  it.each([
    '{"trailing":true,}',
    "[1,]",
    '{"unterminated":"value}',
    '{"number":01}',
    "true false",
  ])("continues to reject malformed JSON: %s", (source) => {
    expect(() => parseStrictJson(source)).toThrow("Strict JSON parsing failed");
  });

  it("rejects unreasonably deep input before exhausting the call stack", () => {
    const source = `${"[".repeat(514)}null${"]".repeat(514)}`;
    expect(() => parseStrictJson(source)).toThrow("nesting exceeds 512 levels");
  });
});
