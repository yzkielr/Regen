/** @type {import('next').NextConfig} */
const nextConfig = {
  // Include registered PDF files in production/serverless route bundles.
  outputFileTracingIncludes: {
    '/coa/*/document/*': ['./lab-documents/coa/**/*.pdf'],
  },
  async headers() {
    return [{
      source: '/admin/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'same-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    }, {
      source: '/coa/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, noimageindex' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
      ],
    }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
