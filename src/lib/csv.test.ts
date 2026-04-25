import { describe, it, expect } from "vitest";
import { toCsv, parseCsv } from "./csv";

describe("toCsv", () => {
  it("returns empty string for empty array with no columns", () => {
    expect(toCsv([])).toBe("");
  });

  it("returns header-only when given empty rows and explicit columns", () => {
    expect(toCsv([], ["a", "b"])).toBe("a,b\n");
  });

  it("serializes a basic row", () => {
    expect(toCsv([{ name: "Alice", age: 30 }])).toBe("name,age\nAlice,30\n");
  });

  it("quotes fields containing commas", () => {
    const out = toCsv([{ x: "a,b" }]);
    expect(out).toBe('x\n"a,b"\n');
  });

  it("escapes embedded double quotes by doubling them", () => {
    const out = toCsv([{ x: 'she said "hi"' }]);
    expect(out).toBe('x\n"she said ""hi"""\n');
  });

  it("quotes fields containing newlines", () => {
    const out = toCsv([{ x: "line1\nline2" }]);
    expect(out).toBe('x\n"line1\nline2"\n');
  });

  it("joins array values with semicolons", () => {
    const out = toCsv([{ tags: ["infra", "digital"] }]);
    expect(out).toBe("tags\ninfra; digital\n");
  });

  it("serializes null/undefined as empty string", () => {
    const out = toCsv([{ a: null, b: undefined, c: "x" }]);
    expect(out).toBe("a,b,c\n,,x\n");
  });

  it("respects explicit column order", () => {
    const out = toCsv([{ a: 1, b: 2, c: 3 }], ["c", "a"]);
    expect(out).toBe("c,a\n3,1\n");
  });
});

describe("parseCsv", () => {
  it("returns empty array for empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });

  it("parses a basic CSV", () => {
    expect(parseCsv("name,age\nAlice,30\nBob,25\n")).toEqual([
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ]);
  });

  it("handles quoted fields with commas", () => {
    expect(parseCsv('x\n"a,b"\n')).toEqual([{ x: "a,b" }]);
  });

  it("handles escaped double quotes", () => {
    expect(parseCsv('x\n"she said ""hi"""\n')).toEqual([{ x: 'she said "hi"' }]);
  });

  it("handles embedded newlines in quoted fields", () => {
    expect(parseCsv('x\n"line1\nline2"\n')).toEqual([{ x: "line1\nline2" }]);
  });

  it("handles CRLF line endings", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([{ a: "1", b: "2" }]);
  });

  it("pads missing trailing columns with empty strings", () => {
    expect(parseCsv("a,b,c\n1,2\n")).toEqual([{ a: "1", b: "2", c: "" }]);
  });
});

describe("toCsv + parseCsv round-trip", () => {
  it("preserves values containing commas, quotes, and newlines", () => {
    const rows = [
      { name: "Alice", note: "has, comma" },
      { name: 'Bob "the boss"', note: "multi\nline" },
      { name: "Carol", note: "plain" },
    ];
    const round = parseCsv(toCsv(rows));
    expect(round).toEqual([
      { name: "Alice", note: "has, comma" },
      { name: 'Bob "the boss"', note: "multi\nline" },
      { name: "Carol", note: "plain" },
    ]);
  });
});
