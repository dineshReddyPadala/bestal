import { cn } from '@bestal/shared-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders as a React Router link with button styling */
  to?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-hover shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  outline:
    'border border-border bg-background hover:bg-accent text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ghost: 'hover:bg-accent text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-medium',
  md: 'h-11 px-6 text-sm font-medium',
  lg: 'h-12 px-8 text-base font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  to,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
