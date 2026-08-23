/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT_BUILD === "1";

const nextConfig = {
  devIndicators: false,
  // EdgeOne Pages 要求静态导出；本地开发（dev）保持默认服务器模式
  ...(isExport ? { output: "export", trailingSlash: true } : {}),
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
