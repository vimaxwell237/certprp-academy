const CANONICAL_SITE_URL = "https://www.certprep.it.com"

function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, "")
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/"
  }

  return `/${pathname.replace(/^\/+/, "").replace(/\/+$/, "")}`
}

export function getCanonicalSiteUrl() {
  return normalizeSiteUrl(CANONICAL_SITE_URL)
}

export function getCanonicalMetadataBase() {
  return new URL(getCanonicalSiteUrl())
}

export function buildCanonicalUrl(pathname: string) {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname
  }

  return `${getCanonicalSiteUrl()}${normalizePathname(pathname)}`
}
