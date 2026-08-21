import type { ReactNode } from 'react';
import { SplitLoginLayout } from '../marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../marketing/SplitLoginPanel';

type StaffAuthPageShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  wide?: boolean;
  backLink?: { href: string; label?: string };
};

export function StaffAuthPageShell({
  children,
  title = 'Admin Portal',
  subtitle,
  wide = false,
  backLink,
}: StaffAuthPageShellProps) {
  return (
    <SplitLoginLayout>
      <SplitLoginPanel title={title} subtitle={subtitle} wide={wide} backLink={backLink}>
        {children}
      </SplitLoginPanel>
    </SplitLoginLayout>
  );
}

/** @deprecated Use StaffAuthPageShell */
export const AdminAuthPageShell = StaffAuthPageShell;
