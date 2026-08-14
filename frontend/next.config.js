/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.itch.io' },
      { protocol: 'https', hostname: 'img.itch.zone' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: '**.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent Clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enforce HTTPS (2 years, include subdomains)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Control referrer info
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable unnecessary browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()' },
          // Basic XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://accounts.google.com https://*.vercel.app https://*.vercel-storage.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https: http:",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://accounts.google.com",
            ].join('; '),
          },
        ],
      },
      // API routes - no caching sensitive data
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
