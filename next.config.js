/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      // Redirect .in domain to .com (preserves path and query string)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'aistorystudio.in',
          },
        ],
        destination: 'https://aistorystudio.com/:path*',
        permanent: true, // 301 redirect (good for SEO)
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.aistorystudio.in',
          },
        ],
        destination: 'https://aistorystudio.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.aistorystudio.com',
          },
        ],
        destination: 'https://aistorystudio.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 