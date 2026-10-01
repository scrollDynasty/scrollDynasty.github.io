import type { NextConfig } from "next";

// Static export for GitHub Pages: no server, so no image optimizer and no custom
// response headers — images in /public are served as-is and kept small by hand.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactCompiler: true,
};

export default nextConfig;
