import { cn } from '@bestal/shared-utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useDashboardShell } from '../contexts/dashboard-shell-context.js';

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

const dashboardButtonInteraction =
  'transition-[color,background-color,box-shadow,border-color,outline-color] hover:shadow-[0_2px_8px_rgba(11,92,99,0.14)] hover:ring-1 hover:ring-[var(--shell-button-active)]/30 active:bg-[var(--shell-button-active)] active:text-white active:shadow-none active:ring-0';

const dashboardVariantClasses: Record<ButtonVariant, string> = {
  primary:
    `bg-brand text-white shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${dashboardButtonInteraction}`,
  secondary:
    `bg-secondary text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${dashboardButtonInteraction}`,
  outline:
    `border border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${dashboardButtonInteraction} active:border-[var(--shell-button-active)]`,
  ghost: `text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${dashboardButtonInteraction}`,
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
  const inDashboardShell = useDashboardShell();
  const classes = cn(
    'inline-flex items-center justify-center rounded-md disabled:pointer-events-none disabled:opacity-50',
    inDashboardShell ? dashboardVariantClasses[variant] : variantClasses[variant],
    !inDashboardShell && 'transition-colors',
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
