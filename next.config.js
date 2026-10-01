/**
 * Next.js configuration
 * Adds a custom domain (example.com) and redirects from the simple domain (turkish-tier-list.vercel.app) to the custom one.
 */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.example.com', 'images.example.com'],
  },
};
