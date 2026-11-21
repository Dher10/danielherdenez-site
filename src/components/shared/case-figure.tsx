import type { ReactNode } from 'react';

/**
 * A figure inside a case study: a framed visual with a mono caption.
 * The caption says what the figure shows and where the data comes from.
 */
export default function CaseFigure({
  children,
  caption,
  bare = false,
}: {
  children: ReactNode;
  caption: ReactNode;
  /** Drop the card frame, for screenshots that carry their own edges. */
  bare?: boolean;
}) {
  return (
    <figure className="case-figure">
      <div className={bare ? 'case-figure-body' : 'case-figure-body case-figure-frame'}>{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
