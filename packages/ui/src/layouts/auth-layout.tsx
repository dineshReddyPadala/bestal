import { cn } from '@bestal/shared-utils';
import { type ReactNode } from 'react';
import { Card, CardContent } from '../components/card.js';
import { BesTalBrand } from '../components/bestal-brand.js';

export type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  brandLogoSrc?: string;
};

export function AuthLayout({
  children,
  title = 'Welcome back',
  subtitle,
  className,
  brandLogoSrc,
}: AuthLayoutProps) {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header className="shell-header-h flex shrink-0 items-center border-b border-border bg-card px-4 sm:px-6">
        <a href="/" className="inline-flex items-center">
          <BesTalBrand logoSrc={brandLogoSrc} wordmarkClassName="text-base" />
        </a>
      </header>

      <main className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex flex-1 items-center justify-center px-4 py-5 sm:px-6 sm:py-8">
          <div className={cn('w-full max-w-md', className)}>
            <div className="mb-5 text-center sm:mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            <Card className="shadow-elevated">
              <CardContent className="p-5 sm:p-6">{children}</CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
