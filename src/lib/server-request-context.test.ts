import { describe, expect, it } from "vitest";
import {
  getServerRequestContext,
  isServerRequestId,
  REQUEST_ID_HEADER,
  runWithServerRequestContext,
  serverRequestIdFromHeaders,
} from "@/lib/server-request-context";

describe("server request context", () => {
  it("retains a middleware-issued UUID and rejects arbitrary inbound text", () => {
    const issued = "123e4567-e89b-42d3-a456-426614174000";
    expect(serverRequestIdFromHeaders(new Headers({ [REQUEST_ID_HEADER]: issued.toUpperCase() })))
      .toBe(issued);

    const generated = serverRequestIdFromHeaders(new Headers({
      [REQUEST_ID_HEADER]: "person@example.com?token=private",
    }));
    expect(isServerRequestId(generated)).toBe(true);
    expect(generated).not.toContain("private");
  });

  it("isolates concurrent asynchronous request contexts and clears them afterward", async () => {
    const first = "11111111-1111-4111-8111-111111111111";
    const second = "22222222-2222-4222-8222-222222222222";
    let releaseFirst!: () => void;
    let releaseSecond!: () => void;
    const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const secondGate = new Promise<void>((resolve) => { releaseSecond = resolve; });

    const firstResult = runWithServerRequestContext(
      new Headers({ [REQUEST_ID_HEADER]: first }),
      async () => {
        await firstGate;
        return getServerRequestContext()?.requestId;
      },
    );
    const secondResult = runWithServerRequestContext(
      new Headers({ [REQUEST_ID_HEADER]: second }),
      async () => {
        await secondGate;
        return getServerRequestContext()?.requestId;
      },
    );

    releaseSecond();
    expect(await secondResult).toBe(second);
    releaseFirst();
    expect(await firstResult).toBe(first);
    expect(getServerRequestContext()).toBeUndefined();
  });
});
