import { withWorkflow } from 'workflow/next';
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Include registered PDF files in production/serverless route bundles.
  outputFileTracingIncludes: {
    '/coa/*/document/*': ['./lab-documents/coa/**/*.pdf'],
    // sharp 0.35 loads libvips through dlopen; pnpm's native libraries need
    // explicit tracing for the email evidence renderer on Linux hosting.
    '/**': ['./node_modules/.pnpm/@img+sharp-libvips-*/node_modules/@img/**/*.so*','./public/admin-assets/pdf-assets/standard_fonts/LiberationSans-Regular.ttf','./public/admin-assets/pdf-assets/standard_fonts/LiberationSans-Bold.ttf'],
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

export default withWorkflow(nextConfig)
