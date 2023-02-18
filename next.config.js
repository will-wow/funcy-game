/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Don't parse typescript.js as it's already been transpiled
    // This silences a `Critical dependency: the request of a dependency is an expression` warning.
    config.module.noParse ??= [];
    config.module.noParse.push(
      require.resolve("@ts-morph/common/dist/typescript.js")
    );
    return config;
  },
};

module.exports = nextConfig;
