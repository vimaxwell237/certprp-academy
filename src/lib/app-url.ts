function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

function buildDeploymentUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function getAppBaseUrl() {
  // Client-side auth flows should use the current site origin instead of
  // relying on server-only env vars that are not exposed in the browser.
  if (typeof window !== "undefined" && window.location.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  const configuredUrl =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;

  const vercelProductionUrl = buildDeploymentUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  const vercelDeploymentUrl = buildDeploymentUrl(process.env.VERCEL_URL);
  const resolvedUrl =
    configuredUrl ?? vercelProductionUrl ?? vercelDeploymentUrl ?? "http://localhost:3000";

  return normalizeBaseUrl(resolvedUrl);
}

export function buildAppUrl(pathname: string) {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }

  const baseUrl = getAppBaseUrl();

  return `${baseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
