import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-24">
      <div className="max-w-xl text-center">
        <p
          className="font-mono uppercase tracking-wider mb-8"
          style={{ fontSize: '13px', color: 'var(--fg-2)' }}
        >
          Error · 404
        </p>
        <h1
          className="font-serif mb-6"
          style={{
            fontSize: 'clamp(48px, 10vw, 72px)',
            lineHeight: 1.05,
            color: 'var(--fg-0)',
          }}
        >
          Page not found.
        </h1>
        <p
          className="mb-12"
          style={{
            fontSize: '18px',
            lineHeight: 1.55,
            color: 'var(--fg-1)',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="font-mono inline-block transition-colors duration-150 hover:opacity-80"
          style={{
            fontSize: '13px',
            color: 'var(--accent-fg)',
          }}
        >
          Back to home →
        </Link>
      </div>
    </main>
  );
}
