import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vps.jamesboogie.com" },
      { protocol: "https", hostname: "jamesboogie.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
      { protocol: "https", hostname: "i3.wp.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Content Security Policy
            // Optimized for Next.js + WooCommerce GraphQL
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vps.jamesboogie.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              "img-src 'self' blob: data: https://vps.jamesboogie.com https://jamesboogie.com https://*.wp.com https://images.unsplash.com https://secure.gravatar.com https://www.google.com https://maps.gstatic.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://unpkg.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://vps.jamesboogie.com https://apiv2.jne.co.id:10205 https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com",
              "frame-src 'self' https://www.google.com https://www.googletagmanager.com https://www.facebook.com",
              "media-src 'self' https://vps.jamesboogie.com",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          }
        ],
      },
    ];
  },
};

export default nextConfig;
