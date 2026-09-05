import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MotionProvider from '@/components/shared/motion-provider';
import { createPageMetadata } from '@/lib/metadata';
import './globals.css';

const geistSans = localFont({
  src: [
    { path: '../../public/fonts/Geist-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Geist-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: [
    { path: '../../public/fonts/GeistMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/GeistMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});

const instrumentSerif = localFont({
  src: [
    { path: '../../public/fonts/InstrumentSerif-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = createPageMetadata({
  path: '/',
  title: 'Daniel Herdenez — Product Manager · AI & SaaS',
  description:
    'Product Manager building AI-native workflow platforms and SaaS products. Currently at MindTechSourcing, shipping tools that make teams faster.',
});

// Single value, not the `media: '(prefers-color-scheme: dark)'` form. Dark is the
// universal default here regardless of OS preference (DESIGN.md, Conventions), so
// a media-matched theme-color would paint light browser chrome around a dark page.
export const viewport: Viewport = {
  themeColor: '#0E0E0F',
};

const themeScript = `(function(){try{var s=localStorage.getItem('dh-theme');if(s==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <meta name="color-scheme" content="dark light" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","wz89d5olqa");`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
