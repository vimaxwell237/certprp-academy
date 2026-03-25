import type { MetadataRoute } from "next"

import { buildAppUrl } from "@/lib/app-url"
import { isSearchIndexingEnabled } from "@/lib/seo/metadata"
import { INDEXABLE_MARKETING_PAGES } from "@/lib/seo/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) {
    return []
  }

  const now = new Date()

  return INDEXABLE_MARKETING_PAGES.map((page) => ({
    url: buildAppUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }))
}
