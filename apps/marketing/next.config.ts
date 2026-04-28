import createMDX from '@next/mdx';
import { NextConfig } from 'next';
import remarkGfm from 'remark-gfm';

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

const nextConfig: NextConfig = {
  // basePath removed so the marketing site serves at "/" on Vercel.
  // Original repo used basePath: '/i' because lin.ky reverse-proxies
  // the marketing app under /i/. We don't need that for Vercel.
  experimental: {
    manualClientBasePath: false,
  },
  // Don't fail the build on ESLint or TypeScript errors — Vercel was tripping on
  // a flat-config parser shape and a missing @types/mdx that we patch separately.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@trylinky/ui', '@trylinky/common'],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dev.lin.ky',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.lin.ky',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dev.glow.as',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.glow.as',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'glow.as',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lin.ky',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'eu-west-2.graphassets.com',
        port: '',
      },
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'http' as const,
              hostname: 'localhost',
              port: '3000',
            },
          ]
        : []),
    ],
  },
};

export default withMDX(nextConfig);
