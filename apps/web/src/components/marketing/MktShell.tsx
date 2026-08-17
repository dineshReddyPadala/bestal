import type { ReactNode } from 'react';

type MktShellProps = {
  children: ReactNode;
  className?: string;
};

/** Centered marketing page container with consistent horizontal padding. */
export function MktShell({ children, className = '' }: MktShellProps) {
  return <div className={`mkt-shell ${className}`.trim()}>{children}</div>;
}
