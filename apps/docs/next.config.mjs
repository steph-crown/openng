import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/index.mdx", destination: "/llms.mdx" },
      { source: "/:path+.mdx", destination: "/llms.mdx/:path+" },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
