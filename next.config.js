/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.ytimg.com", "yt3.ggpht.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
