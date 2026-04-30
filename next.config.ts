import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `contingency` is a `file:` dep pointing at ../../core/contingency-rs/pkg.
  // `.npmrc` sets `install-links=true` so npm copies (not symlinks) it into
  // node_modules, which keeps Turbopack's watch set inside this directory.
  transpilePackages: ["contingency"],
};

export default nextConfig;
