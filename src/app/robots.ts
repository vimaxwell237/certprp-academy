import type { MetadataRoute } from "next"

import { getAppBaseUrl } from "@/lib/app-url"
import { isSearchIndexingEnabled } from "@/lib/seo/metadata"
import { ROBOT_ALLOW_PATHS, ROBOT_DISALLOW_PATHS } from "@/lib/seo/routes"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppBaseUrl()

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
