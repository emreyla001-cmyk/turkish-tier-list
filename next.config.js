/**
 * Next.js configuration
 * Adds a custom domain (example.com) and redirects from the simple domain (turkish-tier-list.vercel.app) to the custom one.
 */
module.exports = {
  reactStrictMode: true,
  // Enable image optimization for external sources if needed
  images: {
    domains: ['cdn.example.com', 'images.example.com'],
  },
  // Custom base path or rewrites can be added here
  async redirects() {
    return [
      {
        source: '/(.*)',
        // Replace with your actual custom domain
        destination: 'https://example.com/:path*',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'turkish-tier-list.vercel.app',
          },
        ],
      },
    ];
  },
};
