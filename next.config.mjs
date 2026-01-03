/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  devIndicators: false,
  // Disable error overlay
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async rewrites() {
    return [
      // Proxy auth and API routes to backend to keep cookies same-site during dev
      { source: '/auth/:path*', destination: 'http://localhost:3000/auth/:path*' },
      { source: '/folders/:path*', destination: 'http://localhost:3000/folders/:path*' },
      { source: '/files/:path*', destination: 'http://localhost:3000/files/:path*' },
      { source: '/sharing/:path*', destination: 'http://localhost:3000/sharing/:path*' },
      { source: '/trash/:path*', destination: 'http://localhost:3000/trash/:path*' },
      { source: '/search/:path*', destination: 'http://localhost:3000/search/:path*' },
      { source: '/shares/:path*', destination: 'http://localhost:3000/shares/:path*' },
      { source: '/uploads/:path*', destination: 'http://localhost:3000/uploads/:path*' },
      // Fallback: proxy anything under /api to backend
      { source: '/api/:path*', destination: 'http://localhost:3000/:path*' },
    ]
  },
}

export default nextConfig
