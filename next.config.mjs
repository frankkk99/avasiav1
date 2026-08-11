/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/admin/avdb-scan": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
