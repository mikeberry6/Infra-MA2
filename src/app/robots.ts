import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/base-path";
import { publicUrl } from "@/lib/public-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [withBasePath("/admin/"), withBasePath("/api/")],
    },
    sitemap: publicUrl("/sitemap.xml"),
  };
}
