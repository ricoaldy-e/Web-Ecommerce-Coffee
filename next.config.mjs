/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, noimageindex, nofollow" },
          { key: "Cache-Control", value: "private, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ],
      },
    ]
  },
}

export default nextConfig