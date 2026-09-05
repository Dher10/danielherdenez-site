interface EyebrowProps {
  children: React.ReactNode;
  dot?: boolean;
  as?: 'div' | 'h2';
}

export default function Eyebrow({ children, dot = true, as: Tag = 'div' }: EyebrowProps) {
  return (
    <Tag className="eyebrow">
      {dot && <span className="dot" />}
      {children}
    </Tag>
  );
}
