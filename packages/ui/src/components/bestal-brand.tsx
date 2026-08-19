import { cn } from '@bestal/shared-utils';
import { Check, ShieldCheck } from 'lucide-react';

export const DEFAULT_BESTAL_LOGO_SRC = '/New logo (1).svg';

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
  logoSrc = DEFAULT_BESTAL_LOGO_SRC,
  compact = false,
  variant = 'light',
  className,
  wordmarkClassName,
}: BesTalBrandProps) {
  if (logoSrc) {
    const logoImage = (
      <img
        src={logoSrc}
        alt="BesTal"
        className={cn(
          'bestal-brand-image shrink-0 object-contain object-left',
          compact ? 'h-7 w-auto max-w-[7.5rem]' : 'h-2-8rem w-auto max-w-[9.5rem]',
        )}
      />
    );

    if (compact) {
      return (
        <span className={cn('inline-flex items-center', className)} title="BesTal">
          {logoImage}
        </span>
      );
    }

    return (
      <div className={cn('bestal-brand flex min-w-0 items-center', className)}>
        {logoImage}
      </div>
    );
  }

  const icon = (
    <span className="bestal-brand-icon" aria-hidden="true">
      <Check className="bestal-brand-check" strokeWidth={3} />
    </span>
  );

  if (compact) {
    return (
      <span className={cn('inline-flex items-center', className)} title="BesTal">
        {icon}
      </span>
    );
  }

  return (
    <div className={cn('bestal-brand flex min-w-0 items-center gap-2', className)}>
      {icon}
      <BesTalWordmark variant={variant} className={wordmarkClassName} />
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
    <img
      src={logoSrc}
      alt=""
      className={cn(
        'shrink-0 object-contain object-left',
        compact ? 'h-7 w-auto max-w-[7.5rem]' : 'h-8 w-auto max-w-[9.5rem]',
      )}
    />
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
