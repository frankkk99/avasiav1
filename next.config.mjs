/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/admin/avdb-scan": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/admin/upload18/resolve": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/playback/start": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/playback/[session]": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
