import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import Script from "next/script";

import { JsonLd } from "@/components/seo/json-ld";
import { LayoutChrome } from "@/components/layout/layout-chrome";
import {
  buildSiteMetadata,
  getOrganizationSameAs,
  SITE_ALTERNATE_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORGANIZATION_EMAIL
} from "@/lib/seo/metadata";
import { buildCanonicalUrl, getCanonicalSiteUrl } from "@/lib/seo/site-url";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3"
});

export const metadata: Metadata = buildSiteMetadata();

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const canonicalSiteUrl = getCanonicalSiteUrl();
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;
  const organizationId = buildCanonicalUrl("/#organization");
  const websiteId = buildCanonicalUrl("/#website");
  const sameAsProfiles = getOrganizationSameAs();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAME,
      url: canonicalSiteUrl,
      description: SITE_DESCRIPTION,
      email: SITE_ORGANIZATION_EMAIL,
      logo: {
        "@type": "ImageObject",
        url: buildCanonicalUrl("/icon"),
        width: 512,
        height: 512
      },
      ...(sameAsProfiles.length > 0 ? { sameAs: sameAsProfiles } : {})
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAME,
      url: canonicalSiteUrl,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: {
        "@id": organizationId
      }
    }
  ];

  return (
    <html className={`${spaceGrotesk.variable} ${sourceSans.variable}`} lang="en">
      <body className="font-body text-base text-ink antialiased">
        <JsonLd data={structuredData} />
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.2),_transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-grid-fade bg-[length:48px_48px] opacity-[0.03]" />
          <LayoutChrome />
          <main className="relative mx-auto flex w-full max-w-7xl min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
