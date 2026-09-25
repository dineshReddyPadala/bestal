import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'outline' | 'outline-dark' | 'gold-btn' | 'goldb' | 'blue' | 'ghost';
type Size = 'xs' | 'sm' | 'lg';

interface SharedProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type LinkButtonProps = SharedProps & { to: string; href?: undefined };
type AnchorButtonProps = SharedProps & { href: string; to?: undefined };

function classes(variant: Variant, size?: Size, className?: string): string {
  return ['btn', variant, size, className].filter(Boolean).join(' ');
}

export function Button({ variant = 'primary', size, className, children, ...props }: ButtonProps) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size, className, children, to }: LinkButtonProps) {
  return (
    <Link className={classes(variant, size, className)} to={to}>
      {children}
    </Link>
  );
}

export function ButtonAnchor({ variant = 'primary', size, className, children, href }: AnchorButtonProps) {
  return (
    <a className={classes(variant, size, className)} href={href}>
      {children}
    </a>
  );
}
