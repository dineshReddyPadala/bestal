import type { ReactNode } from 'react';
import { SplitLoginLayout } from '../marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../marketing/SplitLoginPanel';

type AdminAuthPageShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  wide?: boolean;
};

export function AdminAuthPageShell({
  children,
  title = 'Admin Portal',
  subtitle,
  wide = false,
}: AdminAuthPageShellProps) {
  return (
    <SplitLoginLayout>
      <SplitLoginPanel title={title} subtitle={subtitle} wide={wide}>
        {children}
      </SplitLoginPanel>
    </SplitLoginLayout>
  );
}
