import type { Metadata } from 'next';

const siteUrl = 'https://danielherdenez.com';
const imageUrl = `${siteUrl}/og-image.png`;

export function createPageMetadata({ path, title, description }: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path === '/' ? '' : path}`,
      siteName: 'Daniel Herdenez',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: 'Daniel Herdenez — Product Manager' }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
