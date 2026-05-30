import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
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

export const metadata: Metadata = {
  title: 'Daniel Herdenez — Product Manager',
  description: 'Product Manager building AI-native workflow platforms. Currently at MindTechSourcing.',
  openGraph: {
    title: 'Daniel Herdenez — Product Manager',
    description: 'Product Manager building AI-native workflow platforms. Currently at MindTechSourcing.',
    url: 'https://danielherdenez.com',
    siteName: 'Daniel Herdenez',
    images: [
      {
        url: 'https://danielherdenez.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Daniel Herdenez — Product Manager',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daniel Herdenez — Product Manager',
    description: 'Product Manager building AI-native workflow platforms. Currently at MindTechSourcing.',
    images: ['https://danielherdenez.com/og-image.png'],
  },
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
