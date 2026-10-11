import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: "https://sava-beauty.ru", changeFrequency: "monthly", priority: 1 }]; }
