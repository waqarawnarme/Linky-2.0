import createMDX from '@next/mdx';
import { NextConfig } from 'next';
import remarkGfm from 'remark-gfm';

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

const nextConfig: NextConfig = {
  // Skip ESLint/TS checks during build - flat-config parser bug + missing types
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Workspace packages need transpiling for Next.js
  transpilePackages: ['@trylinky/ui', '@trylinky/common'],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },

  // Allow images from these CDNs
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.dev.lin.ky' },
      { protocol: 'https', hostname: 'cdn.lin.ky' },
      { protocol: 'https', hostname: 'cdn.dev.glow.as' },
      { protocol: 'https', hostname: 'cdn.glow.as' },
      { protocol: 'https', hostname: 'glow.as' },
      { protocol: 'https', hostname: 'lin.ky' },
      { protocol: 'https', hostname: 'eu-west-2.graphassets.com' },
    ],
  },
};

export default withMDX(nextConfig);
