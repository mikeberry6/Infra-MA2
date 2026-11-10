import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("uses the canonical production origin and deployment path consistently", async () => {
  vi.stubEnv("SITE_URL", "https://research.example");
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Infra-MA2");
  const { researchMetadata, publicMetadata } = await import("./public-metadata");
  const url = "https://research.example/Infra-MA2/deals/example";
  const image = "https://research.example/Infra-MA2/social-preview";
  expect(researchMetadata("/deals/example", "Example", "Example detail")).toMatchObject({
    alternates: { canonical: url },
    openGraph: { url, title: "Example", images: [{ url: image }] },
    twitter: { images: [image] },
  });
  expect(publicMetadata("/funds").description).not.toBe(publicMetadata("/portfolio").description);
});
