import type { Metadata } from 'next';

const siteUrl = 'https://danielherdenez.com';
const defaultImage = { path: '/og-image.png', alt: 'Daniel Herdenez — Product Manager' };

export function createPageMetadata({ path, title, description, image = defaultImage }: {
  path: string;
  title: string;
  description: string;
  /** Social card, 1200 × 630. Defaults to the site-wide image. */
  image?: { path: string; alt: string };
}): Metadata {
  const imageUrl = `${siteUrl}${image.path}`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path === '/' ? '' : path}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path === '/' ? '' : path}`,
      siteName: 'Daniel Herdenez',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: image.alt }],
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
