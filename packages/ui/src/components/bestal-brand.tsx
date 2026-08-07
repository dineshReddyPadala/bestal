import { cn } from '@bestal/shared-utils';
import { ShieldCheck } from 'lucide-react';

export type BesTalBrandProps = {
  logoSrc?: string;
  compact?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

export function BesTalWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold leading-none tracking-tight', className)}>
      <span className="text-foreground">Bes</span>
      <span className="text-[#E8941A]">Tal</span>
    </span>
  );
}

export function BesTalBrand({ logoSrc, compact = false, className, wordmarkClassName }: BesTalBrandProps) {
  const logoSize = compact ? 'h-8 w-8' : 'h-8 w-8';

  const logo = logoSrc ? (
    <img
      src={logoSrc}
      alt=""
      className={cn('shrink-0 rounded-lg object-contain', logoSize)}
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

  if (compact) {
    return (
      <span className={cn('inline-flex items-center', className)} title="BesTal">
        {logo}
      </span>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      {logo}
      <BesTalWordmark className={cn('truncate text-[15px] leading-none', wordmarkClassName)} />
    </div>
  );
}
