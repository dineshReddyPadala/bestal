import { cn } from '@bestal/shared-utils';
import { Check, ShieldCheck } from 'lucide-react';

export type BesTalBrandProps = {
  logoSrc?: string;
  compact?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
  wordmarkClassName?: string;
};

export function BesTalWordmark({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <span className={cn('bestal-brand-wordmark', className)}>
      <span className={variant === 'dark' ? 'bestal-brand-bes-dark' : 'bestal-brand-bes-light'}>
        Bes
      </span>
      <span className="bestal-brand-tal">Tal</span>
    </span>
  );
}

export function BesTalBrand({
  logoSrc,
  compact = false,
  variant = 'light',
  className,
  wordmarkClassName,
}: BesTalBrandProps) {
  const logo = logoSrc ? (
    <img
      src={logoSrc}
      alt=""
      className={cn('bestal-brand-image shrink-0 rounded-lg object-contain', compact ? 'h-8 w-8' : 'h-8 w-8')}
    />
  ) : (
    <span className="bestal-brand-icon" aria-hidden="true">
      <Check className="bestal-brand-check" strokeWidth={3} />
    </span>
  );

  if (compact) {
    return (
      <span className={cn('inline-flex items-center', className)} title="BesTal">
        {logoSrc ? (
          logo
        ) : (
          <span className="bestal-brand-icon" aria-hidden="true">
            <Check className="bestal-brand-check" strokeWidth={3} />
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={cn('bestal-brand flex min-w-0 items-center gap-2', className)}>
      {logo}
      {!logoSrc && <BesTalWordmark variant={variant} className={wordmarkClassName} />}
      {logoSrc && (
        <span className={cn('font-semibold leading-none tracking-tight', wordmarkClassName)}>
          <span className="text-foreground">Bes</span>
          <span className="text-[#E8941A]">Tal</span>
        </span>
      )}
    </div>
  );
}

/** Legacy icon mark for dashboard shells that still use ShieldCheck. */
export function BrandMark({
  logoSrc,
  compact = false,
  className,
}: Pick<BesTalBrandProps, 'logoSrc' | 'compact' | 'className'>) {
  const logoSize = compact ? 'h-8 w-8' : 'h-8 w-8';

  const logo = logoSrc ? (
    <img src={logoSrc} alt="" className={cn('shrink-0 rounded-lg object-contain', logoSize)} />
  ) : (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg bg-brand text-white',
        logoSize,
      )}
    >
      <ShieldCheck className="h-4 w-4" />
    </span>
  );

  return (
    <span className={cn('inline-flex items-center', className)} title="BesTal">
      {logo}
    </span>
  );
}
