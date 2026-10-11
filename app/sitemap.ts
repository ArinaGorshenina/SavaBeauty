import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: "https://sava-beauty.ru", changeFrequency: "monthly", priority: 1 }]; }
