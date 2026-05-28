interface SectionHeadProps {
  index: string;
  heading: string;
}

export default function SectionHead({ index, heading }: SectionHeadProps) {
  return (
    <div className="section-head">
      <div className="index">{index}</div>
      <h2>{heading}</h2>
    </div>
  );
}
