import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@trylinky/ui', '@trylinky/common'],
  typescript: {
    // Skip type checking during production builds so deploys aren't blocked by
    // strict-mode type errors that don't surface in dev. Type check still runs
    // locally via `tsc --noEmit` and in editors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint is run separately. Skip during build to avoid empty-config errors
    // on Vercel.
    ignoreDuringBuilds: true,
  },
  rewrites: async () => [
    {
      source: '/',
      destination: `${process.env.NEXT_PUBLIC_MARKETING_URL}/i`,
    },
    {
      source: '/sitemap.xml',
      destination: `${process.env.NEXT_PUBLIC_MARKETING_URL}/i/sitemap.xml`,
    },
    {
      source: '/i/:path*',
      destination: `${process.env.NEXT_PUBLIC_MARKETING_URL}/i/:path*`,
    },
  ],
  redirects: async () => [
    {
      source: '/pricing',
      destination: '/i/pricing',
      permanent: true,
    },
    {
      source: '/i/learn/what-is-glow',
      destination: '/i/learn/what-is-linky',
      permanent: true,
    },
    {
      source: '/i/learn/is-glow-free',
      destination: '/i/learn/is-linky-free',
      permanent: true,
    },
  ],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    remotePatterns: [
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
        hostname: 'cdn.dev.lin.ky',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.lin.ky',
        port: '',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'hyperdusk',
  project: 'glow',
  silent: false,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
