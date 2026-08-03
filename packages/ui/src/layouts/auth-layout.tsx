import { cn } from '@bestal/shared-utils';
import { ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';
import { Card, CardContent } from '../components/card.js';

export type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
};

export function AuthLayout({
  children,
  title = 'Welcome back',
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <a href="/" className="inline-flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Bes<span className="font-bold">Tal</span>
          </span>
        </a>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className={cn('w-full max-w-md', className)}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <Card className="shadow-elevated">
            <CardContent className="p-8">{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
