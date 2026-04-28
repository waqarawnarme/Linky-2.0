import './globals.css';
import MarketingFooter from '@/components/marketing-footer';
import MarketingNavigation from '@/components/marketing-navigation';
import { Button } from '@trylinky/ui';
import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import Script from 'next/script';
import { ReactNode } from 'react';

// Path to the editor app — no signup/login required to enter.
// When the frontend app is deployed, point this at its editor route.
const EDITOR_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/edit`
  : '/edit';

const seasonFont = localFont({
  src: './ssn.woff2',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Linky - A delightfully rich link-in-bio.',
  description:
    'Create your own dynamic link in bio page effortlessly with Linky, the personal page builder designed to help you stand out and connect with your audience.',
  metadataBase: new URL('https://lin.ky'),
  openGraph: {
    images: [
      {
        url: 'https://lin.ky/assets/og.png',
      },
    ],
    type: 'website',
    url: 'https://lin.ky',
    title: 'Linky',
    description:
      'Create your own dynamic link in bio page effortlessly with Linky, the personal page builder designed to help you stand out and connect with your audience.',
    siteName: 'Linky',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trylinky',
    creator: '@trylinky',
    images: 'https://lin.ky/assets/og.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={seasonFont.className}>
      <head>
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="uOVisnglxzaKbI/UovGA7w"
            defer={true}
          />
        )}
      </head>
      <body className="min-h-screen">
        <MarketingNavigation>
          <>
            <Link href={EDITOR_URL}>
              <Button className="block rounded-full">Open editor</Button>
            </Link>
          </>
        </MarketingNavigation>
        <main className="min-h-full">{children}</main>
        <MarketingFooter />
      </body>

      <Analytics />
    </html>
  );
}
