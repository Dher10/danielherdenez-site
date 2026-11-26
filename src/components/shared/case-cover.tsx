import { getImageProps } from 'next/image';

interface Source {
  src: string;
  width: number;
  height: number;
}

/**
 * Art-directed case cover: below 768px a crop of the phone capture at full
 * prose width, the desktop capture above. Only the selected source is
 * downloaded. Used by both PitchCraft cases.
 */
export default function CaseCover({ alt, desktop, phone }: { alt: string; desktop: Source; phone: Source }) {
  const {
    props: { srcSet: desktopSet, sizes: desktopSizes },
  } = getImageProps({
    alt,
    src: desktop.src,
    width: desktop.width,
    height: desktop.height,
    sizes: '(min-width: 1024px) 832px, calc(100vw - 96px)',
  });
  const {
    props: { srcSet: phoneSet, sizes: phoneSizes, ...rest },
  } = getImageProps({
    alt,
    src: phone.src,
    width: phone.width,
    height: phone.height,
    sizes: 'calc(100vw - 64px)',
  });
  return (
    <picture>
      {/* Each <source> needs its own sizes; without it the browser assumes
          100vw and fetches an oversized rendition. */}
      <source
        media="(min-width: 768px)"
        srcSet={desktopSet}
        sizes={desktopSizes}
        width={desktop.width}
        height={desktop.height}
      />
      <source
        media="(max-width: 767px)"
        srcSet={phoneSet}
        sizes={phoneSizes}
        width={phone.width}
        height={phone.height}
      />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps in rest */}
      <img {...rest} loading="eager" fetchPriority="high" />
    </picture>
  );
}
