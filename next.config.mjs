/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development";
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(isDevelopment ? ["'unsafe-eval'"] : []),
  "https://*.clerk.accounts.dev",
  "https://clerk.fizioterapia-ime.vercel.app",
].join(" ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' https://accounts.clerk.com",
      `script-src ${scriptSources}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev https://api.resend.com https://*.sanity.io",
      "media-src 'self' blob: https:",
      "worker-src 'self' blob:",
      "frame-src 'self' https://*.clerk.accounts.dev",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const noIndexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
];

const privateRouteSources = [
  "/admin-:path*",
  "/owner-hidden/:path*",
  "/physiotherapist-dashboard/:path*",
  "/physiotherapist-portal/:path*",
  "/patient-dashboard/:path*",
  "/patient-portal/:path*",
  "/patient-progress/:path*",
  "/patient-session/:path*",
  "/patient-contact/:path*",
  "/patient-access/:path*",
  "/p/:path*",
  "/sign-in/:path*",
  "/sign-up/:path*",
  "/api/:path*",
  "/app-preview/:path*",
  "/pilot-:path*",
  "/launch-checklist/:path*",
  "/final-handoff/:path*",
  "/mobile-submission/:path*",
  "/qa-checklist/:path*",
  "/product-flow/:path*",
  "/clinical-recommendations/:path*",
  "/ai-check/:path*",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      ...privateRouteSources.map((source) => ({ source, headers: noIndexHeaders })),
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
