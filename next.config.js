/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Resolve the multiple lockfile warning
  outputFileTracingRoot: process.cwd()
}

module.exports = nextConfig