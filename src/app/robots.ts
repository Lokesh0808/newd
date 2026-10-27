import type { MetadataRoute } from "next";

/**
 * robots.txt — allow the public marketing pages, keep the app private.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: ["/api/", "/dashboard", "/resume", "/interview", "/settings"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
