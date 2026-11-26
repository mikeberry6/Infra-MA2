// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";
import { describe, expect, it, vi } from "vitest";
import EmailDesignGalleryPage from "./page";

vi.mock("@/modules/briefings/publication", () => ({
  listPublishedBriefingEditions: async () => ["2026-11-21", "2026-05-09"],
}));
vi.mock("./EmailStudio", () => ({
  default: ({ edition, layouts }: { edition: string; layouts: { original: string } }) =>
    <div data-original-edition={edition} dangerouslySetInnerHTML={{ __html: layouts.original }} />,
}));

describe("email design gallery", () => {
  it("pairs twelve distinct, linked studies with a control taken from the latest published email", async () => {
    const page = await EmailDesignGalleryPage({ searchParams: Promise.resolve({}) });
    const { document } = parseHTML(renderToStaticMarkup(page));
    const original = document.querySelector('[data-original-edition="2026-11-21"]')!;
    expect(original.querySelectorAll("[data-deal-id]")).toHaveLength(14);
    expect(original.textContent).not.toContain("Previous edition");
    for (const link of original.querySelectorAll("a[href]")) {
      expect(link.getAttribute("href")).toMatch(/^(https?:|mailto:|tel:)/);
    }
    const references = document.querySelectorAll("#design-references article");
    const urls = Array.from(references, entry => entry.querySelector("a")!.href);
    expect(references).toHaveLength(12);
    expect(new Set(urls).size).toBe(12);
    for (const entry of references) {
      expect(entry.firstElementChild!.textContent!.trim().length).toBeGreaterThan(10);
    }
  });

  it("rejects a dated archive file outside the published list", async () => {
    await expect(EmailDesignGalleryPage({ searchParams: Promise.resolve({ edition: "2026-11-14" }) }))
      .rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });
});
