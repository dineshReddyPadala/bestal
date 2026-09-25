interface SectionHeadProps {
  kicker?: string;
  kickerClassName?: string;
  title: string;
  description?: string;
}

export function SectionHead({ kicker, kickerClassName, title, description }: SectionHeadProps) {
  return (
    <div className="sechead">
      {kicker ? <span className={kickerClassName ?? 'k'}>{kicker}</span> : null}
      <h2 style={{ marginTop: kicker ? 8 : 0 }}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
