import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap for the public marketing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/signup`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
