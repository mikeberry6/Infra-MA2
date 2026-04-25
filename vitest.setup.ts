import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL doesn't auto-cleanup with vitest the way it does with jest.
afterEach(() => {
  cleanup();
});
