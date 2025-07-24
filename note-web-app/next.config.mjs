/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // 외부 이미지 도메인 허용
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/noteImages/**',
      },
    ],
  },
  async rewrites() {
    const serverUrl = process.env.SERVER_API_BASE_URL || 'http://localhost:8080'
    console.log('[Next.js] 서버 URL:', serverUrl)
                            
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${serverUrl}/api/v1/:path*`,
      },
      {
        source: '/noteImages/:path*',
        destination: `${serverUrl}/noteImages/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/proxy/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // 이미지 프록시 헤더 추가
      {
        source: '/noteImages/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
