import Link from 'next/link';

interface MonogramProps {
  href?: string;
  className?: string;
}

export default function Monogram({ href = '/', className = 'monogram' }: MonogramProps) {
  return (
    <Link href={href} className={className} aria-label="Daniel Herdenez — home">
      d
    </Link>
  );
}
