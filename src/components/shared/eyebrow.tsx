interface EyebrowProps {
  children: React.ReactNode;
  dot?: boolean;
}

export default function Eyebrow({ children, dot = true }: EyebrowProps) {
  return (
    <div className="eyebrow">
      {dot && <span className="dot" />}
      {children}
    </div>
  );
}
