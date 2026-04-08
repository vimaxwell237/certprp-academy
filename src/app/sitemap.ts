import type { MetadataRoute } from "next"

import { isSearchIndexingEnabled } from "@/lib/seo/metadata"
import { INDEXABLE_MARKETING_PAGES } from "@/lib/seo/routes"
import { buildCanonicalUrl } from "@/lib/seo/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) {
    return []
  }

  const now = new Date()

  return INDEXABLE_MARKETING_PAGES.map((page) => ({
    url: buildCanonicalUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }))
}
