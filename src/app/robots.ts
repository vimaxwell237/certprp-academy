import type { MetadataRoute } from "next"

import { isSearchIndexingEnabled } from "@/lib/seo/metadata"
import { ROBOT_ALLOW_PATHS, ROBOT_DISALLOW_PATHS } from "@/lib/seo/routes"
import { getCanonicalSiteUrl } from "@/lib/seo/site-url"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalSiteUrl()

  if (!isSearchIndexingEnabled()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/"
        }
      ],
      host: baseUrl
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ROBOT_ALLOW_PATHS,
        disallow: ROBOT_DISALLOW_PATHS
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
