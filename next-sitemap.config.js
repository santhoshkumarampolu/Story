/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://aistorystudio.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/api/*',
    '/auth',
    '/auth/*',
    '/dashboard',
    '/dashboard/*',
    '/editor',
    '/editor/*',
    '/test-*',
    '/admin',
    '/admin/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/editor/', '/auth/'],
      },
    ],
    additionalSitemaps: [
      'https://aistorystudio.com/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority for important pages
    const priorities = {
      '/': 1.0,
      '/pricing': 0.9,
      '/features': 0.8,
    };
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};