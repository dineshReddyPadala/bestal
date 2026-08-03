import { cn } from '@bestal/shared-utils';
import { type HTMLAttributes } from 'react';

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border text-foreground',
  success: 'border-transparent bg-success-soft text-brand',
  warning: 'border-transparent bg-amber-50 text-amber-800',
  destructive: 'border-transparent bg-red-50 text-red-700',
  navy: 'border-transparent bg-brand-light text-brand',
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
