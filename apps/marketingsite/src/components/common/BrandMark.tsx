import logoSrc from '@/assets/bestal-logo.png';

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span className={className ?? 'brand'}>
      <img src={logoSrc} alt="BesTal Solutions" />
    </span>
  );
}
