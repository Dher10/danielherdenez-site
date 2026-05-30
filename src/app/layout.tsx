import type { Metadata } from 'next';
import localFont from 'next/font/local';
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
  description: 'Product Manager building AI-native workflow platforms.',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
