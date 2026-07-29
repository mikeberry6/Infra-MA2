// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  ImportRequestError,
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ROWS,
  parseImportRequest,
} from "./request";

const REQUEST_URL = "https://example.test/api/imports/deals";
const OPTIONS = { bodyKey: "deals" };

function requestWithBody(
  body: BodyInit | null,
  contentType: string,
  headers: Record<string, string> = {},
): Request {
  return new Request(REQUEST_URL, {
    method: "POST",
    body,
    headers: {
      "content-type": contentType,
      ...headers,
    },
  });
}

function jsonRequest(
  value: unknown,
  headers: Record<string, string> = {},
): Request {
  return requestWithBody(
    JSON.stringify(value),
    "application/json; charset=utf-8",
    headers,
  );
}

function multipartRequest(
  files: Array<{ file: File; field?: string }>,
  extraFields: Record<string, string> = {},
): Request {
  const formData = new FormData();
  for (const { file, field = "file" } of files) {
    formData.append(field, file);
  }
  for (const [name, value] of Object.entries(extraFields)) {
    formData.append(name, value);
  }
  return new Request(REQUEST_URL, {
    method: "POST",
    body: formData,
  });
}

async function expectRequestError(
  promise: Promise<unknown>,
  code: ImportRequestError["code"],
  status: ImportRequestError["status"],
): Promise<ImportRequestError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ImportRequestError);
    expect(error).toMatchObject({ code, status });
    expect((error as Error).message).not.toMatch(
      /SyntaxError|stack|at parse|unexpected token at position/i,
    );
    return error as ImportRequestError;
  }

  throw new Error(`Expected ${code} to be thrown`);
}

describe("parseImportRequest JSON", () => {
  it("accepts a direct JSON array and annotates rows starting at one", async () => {
    const parsed = await parseImportRequest(
      jsonRequest([
        { legacyId: "deal-1", __row: 999 },
        { legacyId: "deal-2" },
      ]),
      OPTIONS,
    );

    expect(parsed).toMatchObject({
      format: "json",
      rows: [
        { legacyId: "deal-1", __row: 1 },
        { legacyId: "deal-2", __row: 2 },
      ],
    });
    expect(parsed.byteLength).toBeGreaterThan(0);
    expect(parsed.fileName).toBeUndefined();
  });

  it("accepts an object containing the configured body key", async () => {
    const parsed = await parseImportRequest(
      jsonRequest({ deals: [{ legacyId: "deal-1" }] }),
      OPTIONS,
    );

    expect(parsed.rows).toEqual([{ legacyId: "deal-1", __row: 1 }]);
  });

  it("accepts structured JSON media types", async () => {
    const request = requestWithBody(
      JSON.stringify([{ legacyId: "deal-1" }]),
      "application/vnd.infrasight+json",
    );

    await expect(parseImportRequest(request, OPTIONS)).resolves.toMatchObject({
      format: "json",
    });
  });

  it("accepts exactly the maximum number of rows", async () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS }, (_, index) => ({
      legacyId: `deal-${index}`,
    }));

    const parsed = await parseImportRequest(jsonRequest(rows), OPTIONS);

    expect(parsed.rows).toHaveLength(MAX_IMPORT_ROWS);
    expect(parsed.rows.at(-1)?.__row).toBe(MAX_IMPORT_ROWS);
  });

  it("rejects imports over the row limit", async () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, index) => ({
      legacyId: `deal-${index}`,
    }));

    await expectRequestError(
      parseImportRequest(jsonRequest(rows), OPTIONS),
      "TOO_MANY_ROWS",
      413,
    );
  });

  it("rejects malformed JSON without exposing parser details", async () => {
    await expectRequestError(
      parseImportRequest(
        requestWithBody('{"deals":[}', "application/json"),
        OPTIONS,
      ),
      "MALFORMED_JSON",
      400,
    );
  });

  it.each([
    { label: "missing body key", value: { funds: [] } },
    { label: "non-array body key", value: { deals: {} } },
    { label: "primitive body", value: "deals" },
  ])("rejects an invalid JSON shape: $label", async ({ value }) => {
    await expectRequestError(
      parseImportRequest(jsonRequest(value), OPTIONS),
      "INVALID_JSON_SHAPE",
      400,
    );
  });

  it.each([null, "row", 42, ["nested"]])(
    "rejects a non-object JSON row: %j",
    async (row) => {
      await expectRequestError(
        parseImportRequest(jsonRequest([row]), OPTIONS),
        "INVALID_JSON_ROW",
        400,
      );
    },
  );

  it("rejects an empty JSON row collection", async () => {
    await expectRequestError(
      parseImportRequest(jsonRequest({ deals: [] }), OPTIONS),
      "EMPTY_IMPORT",
      400,
    );
  });

  it.each(["", " \r\n\t "])(
    "rejects an empty JSON request body",
    async (body) => {
      await expectRequestError(
        parseImportRequest(
          requestWithBody(body, "application/json"),
          OPTIONS,
        ),
        "EMPTY_IMPORT",
        400,
      );
    },
  );
});

describe("parseImportRequest request limits and media types", () => {
  it("rejects a declared body size over 5 MiB before reading the body", async () => {
    await expectRequestError(
      parseImportRequest(
        jsonRequest([{ legacyId: "deal-1" }], {
          "content-length": String(MAX_IMPORT_BYTES + 1),
        }),
        OPTIONS,
      ),
      "IMPORT_TOO_LARGE",
      413,
    );
  });

  it("rejects a malformed Content-Length header", async () => {
    await expectRequestError(
      parseImportRequest(
        jsonRequest([{ legacyId: "deal-1" }], {
          "content-length": "unknown",
        }),
        OPTIONS,
      ),
      "INVALID_CONTENT_LENGTH",
      400,
    );
  });

  it("checks actual body bytes when Content-Length is absent", async () => {
    const request = requestWithBody(
      " ".repeat(MAX_IMPORT_BYTES + 1),
      "application/json",
    );

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "IMPORT_TOO_LARGE",
      413,
    );
  });

  it.each(["text/csv", "text/plain", "application/octet-stream", ""])(
    "rejects unsupported request media type %j",
    async (contentType) => {
      const request = contentType
        ? requestWithBody("legacyId\ndeal-1", contentType)
        : new Request(REQUEST_URL, {
            method: "POST",
            body: "legacyId\ndeal-1",
          });

      await expectRequestError(
        parseImportRequest(request, OPTIONS),
        "UNSUPPORTED_MEDIA_TYPE",
        415,
      );
    },
  );
});

describe("parseImportRequest multipart CSV", () => {
  it("parses strict CSV and annotates logical data rows starting at two", async () => {
    const csv =
      '\ufeff legacyId ,notes\r\ndeal-1,"first line\nsecond line"\r\ndeal-2,"said ""yes"""\r\n';
    const request = multipartRequest([
      {
        file: new File([csv], "deals.csv", { type: "text/csv" }),
      },
    ]);

    const parsed = await parseImportRequest(request, OPTIONS);

    expect(parsed).toEqual({
      format: "csv",
      byteLength: new TextEncoder().encode(csv).byteLength,
      fileName: "deals.csv",
      rows: [
        {
          legacyId: "deal-1",
          notes: "first line\nsecond line",
          __row: 2,
        },
        {
          legacyId: "deal-2",
          notes: 'said "yes"',
          __row: 3,
        },
      ],
    });
  });

  it("accepts a .csv extension when the browser omits the file MIME type", async () => {
    const request = multipartRequest([
      { file: new File(["legacyId\ndeal-1"], "DEALS.CSV") },
    ]);

    await expect(parseImportRequest(request, OPTIONS)).resolves.toMatchObject({
      format: "csv",
      rows: [{ legacyId: "deal-1", __row: 2 }],
    });
  });

  it("accepts exactly 500 CSV data rows", async () => {
    const csv = [
      "legacyId",
      ...Array.from(
        { length: MAX_IMPORT_ROWS },
        (_, index) => `deal-${index}`,
      ),
    ].join("\n");
    const request = multipartRequest([
      { file: new File([csv], "deals.csv", { type: "text/csv" }) },
    ]);

    const parsed = await parseImportRequest(request, OPTIONS);

    expect(parsed.rows).toHaveLength(MAX_IMPORT_ROWS);
    expect(parsed.rows.at(-1)?.__row).toBe(MAX_IMPORT_ROWS + 1);
  });

  it("rejects more than 500 CSV data rows", async () => {
    const csv = [
      "legacyId",
      ...Array.from(
        { length: MAX_IMPORT_ROWS + 1 },
        (_, index) => `deal-${index}`,
      ),
    ].join("\n");
    const request = multipartRequest([
      { file: new File([csv], "deals.csv", { type: "text/csv" }) },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "TOO_MANY_ROWS",
      413,
    );
  });

  it.each([
    { label: "blank header", csv: "legacyId,,notes\ndeal-1,,hello" },
    { label: "duplicate header", csv: "legacyId,legacyId\ndeal-1,x" },
    {
      label: "case-insensitive duplicate header",
      csv: "legacyId,LEGACYID\ndeal-1,x",
    },
    { label: "reserved header", csv: "legacyId,__row\ndeal-1,8" },
  ])("rejects a $label", async ({ csv }) => {
    const request = multipartRequest([
      { file: new File([csv], "deals.csv", { type: "text/csv" }) },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "INVALID_CSV_HEADERS",
      400,
    );
  });

  it.each([
    { label: "unclosed quoted field", csv: 'legacyId,notes\ndeal-1,"open' },
    {
      label: "quote inside an unquoted field",
      csv: 'legacyId,notes\ndeal-1,mis"placed',
    },
    {
      label: "text after a closing quote",
      csv: 'legacyId,notes\ndeal-1,"closed"extra',
    },
    {
      label: "space after a closing quote",
      csv: 'legacyId,notes\ndeal-1,"closed" ',
    },
  ])("rejects $label", async ({ csv }) => {
    const request = multipartRequest([
      { file: new File([csv], "deals.csv", { type: "text/csv" }) },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "MALFORMED_CSV",
      400,
    );
  });

  it.each([
    {
      label: "missing column",
      csv: "legacyId,notes\ndeal-1",
    },
    {
      label: "extra column",
      csv: "legacyId,notes\ndeal-1,hello,extra",
    },
  ])("rejects a row with a $label", async ({ csv }) => {
    const request = multipartRequest([
      { file: new File([csv], "deals.csv", { type: "text/csv" }) },
    ]);

    const error = await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "CSV_ROW_WIDTH_MISMATCH",
      400,
    );
    expect(error.message).toContain("row 2");
  });

  it("rejects a header-only CSV", async () => {
    const request = multipartRequest([
      { file: new File(["legacyId,notes\n"], "deals.csv", { type: "text/csv" }) },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "EMPTY_IMPORT",
      400,
    );
  });

  it("rejects invalid UTF-8", async () => {
    const invalidUtf8 = new Uint8Array([0xc3, 0x28]);
    const request = multipartRequest([
      {
        file: new File([invalidUtf8], "deals.csv", { type: "text/csv" }),
      },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "UNREADABLE_IMPORT",
      400,
    );
  });
});

describe("parseImportRequest multipart envelope and JSON files", () => {
  it("accepts a JSON file and applies the configured body key", async () => {
    const content = JSON.stringify({
      deals: [{ legacyId: "deal-1" }],
    });
    const request = multipartRequest([
      {
        file: new File([content], "deals.json", {
          type: "application/json",
        }),
      },
    ]);

    await expect(parseImportRequest(request, OPTIONS)).resolves.toEqual({
      format: "json",
      byteLength: new TextEncoder().encode(content).byteLength,
      fileName: "deals.json",
      rows: [{ legacyId: "deal-1", __row: 1 }],
    });
  });

  it("rejects an empty file", async () => {
    const request = multipartRequest([
      { file: new File([], "deals.csv", { type: "text/csv" }) },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "EMPTY_IMPORT",
      400,
    );
  });

  it("rejects a multipart request without the configured file field", async () => {
    const request = multipartRequest([], { note: "no file" });

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "MISSING_IMPORT_FILE",
      400,
    );
  });

  it("rejects multiple import files", async () => {
    const request = multipartRequest([
      { file: new File(["id\n1"], "one.csv", { type: "text/csv" }) },
      { file: new File(["id\n2"], "two.csv", { type: "text/csv" }) },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "MISSING_IMPORT_FILE",
      400,
    );
  });

  it("supports a configured multipart field name", async () => {
    const request = multipartRequest([
      {
        field: "upload",
        file: new File(["legacyId\ndeal-1"], "deals.csv", {
          type: "text/csv",
        }),
      },
    ]);

    await expect(
      parseImportRequest(request, { bodyKey: "deals", fileField: "upload" }),
    ).resolves.toMatchObject({
      rows: [{ legacyId: "deal-1", __row: 2 }],
    });
  });

  it.each([
    {
      label: "unknown extension and MIME type",
      file: new File(["id\n1"], "deals.txt", { type: "text/plain" }),
    },
    {
      label: "conflicting extension and MIME type",
      file: new File(["[]"], "deals.csv", { type: "application/json" }),
    },
  ])("rejects a file with $label", async ({ file }) => {
    const request = multipartRequest([{ file }]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "UNSUPPORTED_FILE_TYPE",
      415,
    );
  });

  it("rejects malformed multipart framing", async () => {
    const request = requestWithBody(
      "--broken\r\nnot multipart",
      "multipart/form-data; boundary=missing",
    );

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "MALFORMED_MULTIPART",
      400,
    );
  });

  it("enforces the actual multipart request size", async () => {
    const request = multipartRequest([
      {
        file: new File(["x".repeat(MAX_IMPORT_BYTES)], "deals.csv", {
          type: "text/csv",
        }),
      },
    ]);

    await expectRequestError(
      parseImportRequest(request, OPTIONS),
      "IMPORT_TOO_LARGE",
      413,
    );
  });
});
