/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Raise the body-size limit for Route Handlers to 50 MB so large audio
    // files (e.g. 4-minute MP3s ~6 MB) can be uploaded via the admin panel.
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
