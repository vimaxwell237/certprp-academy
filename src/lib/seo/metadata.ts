import type { Metadata } from "next"

import { buildAppUrl, getAppBaseUrl } from "@/lib/app-url"

const DEFAULT_SOCIAL_IMAGE_PATH = "/opengraph-image"
const DEFAULT_TWITTER_IMAGE_PATH = "/twitter-image"

export const SITE_NAME = "CertPrep Academy"
export const SITE_TITLE = "CCNA Training Platform"
export const SITE_DESCRIPTION =
  "CertPrep Academy helps learners prepare for CCNA with structured lessons, subnetting practice, labs, quizzes, and AI tutor support."
export const SITE_KEYWORDS = [
  "CCNA training",
  "CCNA course",
  "networking certification",
  "subnetting practice",
  "CCNA labs",
  "CCNA practice exams",
  "Cisco CCNA",
  "IT certification training"
]

export function getMetadataBase() {
  return new URL(getAppBaseUrl())
}

function normalizeMetadataPath(path: string) {
  if (!path || path === "/") {
    return "/"
  }

  return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`
}

function resolveIndexingOverride() {
  const override = process.env.SITE_INDEXING_ENABLED ?? process.env.NEXT_PUBLIC_SITE_INDEXING

  if (override === "true") {
    return true
  }

  if (override === "false") {
    return false
  }

  return null
}

export function isSearchIndexingEnabled() {
  const override = resolveIndexingOverride()

  if (override !== null) {
    return override
  }

  if (process.env.VERCEL_ENV === "preview") {
    return false
  }

  return !getAppBaseUrl().includes("localhost")
}

function buildOpenGraphImages(alt: string) {
  return [
    {
      url: buildAppUrl(DEFAULT_SOCIAL_IMAGE_PATH),
      width: 1200,
      height: 630,
      alt
    }
  ]
}

function buildRobots(noIndex: boolean): Metadata["robots"] {
  const shouldIndex = isSearchIndexingEnabled() && !noIndex

  if (shouldIndex) {
    return {
      index: true,
      follow: true
    }
  }

  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
}

export function buildSiteMetadata(): Metadata {
  const fullTitle = `${SITE_TITLE} | ${SITE_NAME}`

  return {
    metadataBase: getMetadataBase(),
    applicationName: SITE_NAME,
    title: {
      default: fullTitle,
      template: `%s | ${SITE_NAME}`
    },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    category: "education",
    alternates: {
      canonical: "/"
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description: SITE_DESCRIPTION,
      url: "/",
      locale: "en_US",
      images: buildOpenGraphImages(SITE_NAME)
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: SITE_DESCRIPTION,
      images: [buildAppUrl(DEFAULT_TWITTER_IMAGE_PATH)]
    },
    robots: buildRobots(false),
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION
        ? {
            "msvalidate.01": process.env.BING_SITE_VERIFICATION
          }
        : undefined
    }
  }
}

export function buildPageMetadata(input: {
  title: string
  description: string
  path: string
  keywords?: string[]
  noIndex?: boolean
  socialImageAlt?: string
}): Metadata {
  const fullTitle = `${input.title} | ${SITE_NAME}`
  const normalizedPath = normalizeMetadataPath(input.path)
  const socialImageAlt = input.socialImageAlt ?? fullTitle

  return {
    title: input.title,
    description: input.description,
    keywords: [...new Set([...SITE_KEYWORDS, ...(input.keywords ?? [])])],
    alternates: {
      canonical: normalizedPath
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description: input.description,
      url: normalizedPath,
      locale: "en_US",
      images: buildOpenGraphImages(socialImageAlt)
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [buildAppUrl(DEFAULT_TWITTER_IMAGE_PATH)]
    },
    robots: buildRobots(Boolean(input.noIndex))
  }
}

export function buildNoIndexMetadata(input: {
  title: string
  description: string
  path: string
  keywords?: string[]
}) {
  return buildPageMetadata({
    ...input,
    noIndex: true
  })
}
