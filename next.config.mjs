import path from "path";

const shouldForceWwwRedirect =
  process.env.FORCE_WWW_REDIRECT === "true" || Boolean(process.env.VERCEL_ENV);

const lowMemoryBuild =
  process.env.LOW_MEMORY_BUILD === "true" || process.env.NAMECHEAP_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(process.cwd()),
  eslint: {
    ignoreDuringBuilds: lowMemoryBuild
  },
  typescript: {
    ignoreBuildErrors: lowMemoryBuild
  },
  experimental: {
    cpus: lowMemoryBuild ? 1 : undefined,
    webpackMemoryOptimizations: lowMemoryBuild
  },
  async redirects() {
    if (!shouldForceWwwRedirect) {
      return [];
    }

    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "certprep.it.com"
          }
        ],
        destination: "https://www.certprep.it.com/:path*",
        permanent: true
      }
    ];
  },
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://r.stripe.com",
      "frame-src 'self' https://checkout.stripe.com",
      "form-action 'self' https://checkout.stripe.com"
    ].join("; ");

    const headers = [
      {
        key: "X-Frame-Options",
        value: "DENY"
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff"
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()"
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin"
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "off"
      }
    ];

    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Content-Security-Policy",
        value: contentSecurityPolicy
      });
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload"
      });
    }

    return [
      {
        source: "/:path*",
        headers
      }
    ];
  },
  webpack: (config, { dev }) => {
    if (dev && process.platform === "win32") {
      config.cache = {
        type: "memory"
      };
    }

    return config;
  }
};

export default nextConfig;
