import { cn } from '@bestal/shared-utils';
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
  subtitle = 'Sign in to your Bestal account',
  className,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="bg-navy px-6 py-4">
        <a href="/" className="text-lg font-bold text-white">
          Bestal
        </a>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className={cn('w-full max-w-md', className)}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="p-8">{children}</CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need help?{' '}
            <a href="/contact" className="font-medium text-brand hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
