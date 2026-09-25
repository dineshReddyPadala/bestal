interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span className={className ?? 'brand'} aria-label="BesTal Solutions home">
      <svg viewBox="0 0 150 200" fill="none" aria-hidden="true">
        <path d="M20 30 L108 100 L20 170 L50 100 Z" fill="#151132" />
        <path d="M55 55 L130 100 L55 145 L82 100 Z" fill="#5B4BE8" />
      </svg>
      BesTal
    </span>
  );
}
