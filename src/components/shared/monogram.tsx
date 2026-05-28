interface MonogramProps {
  href?: string;
  className?: string;
}

export default function Monogram({ href = '#top', className = 'monogram' }: MonogramProps) {
  return (
    <a href={href} className={className} aria-label="Daniel Herdenez — home">
      d
    </a>
  );
}
