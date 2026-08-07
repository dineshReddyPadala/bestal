import { Button, Input } from '@bestal/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortalLogin } from '../../contexts/AuthContext';
import { isSelfServicePortal } from '../../lib/auth-portal-config';
import type { Portal } from '../../lib/api/types';

type PortalLoginFormProps = {
  portal: Portal;
  defaultEmail: string;
  footerLink?: { label: string; href: string };
};

export function PortalLoginForm({
  portal,
  defaultEmail,
  footerLink,
}: PortalLoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('Password123!');
  const { handleLogin, error, submitting } = usePortalLogin(portal);
  const forgotPasswordHref = isSelfServicePortal(portal)
    ? `/${portal.toLowerCase()}/forgot-password`
    : undefined;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleLogin(email, password);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {forgotPasswordHref && (
          <p className="text-right">
            <Link
              to={forgotPasswordHref}
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>

      {footerLink && (
        <p className="text-center text-sm text-muted-foreground">
          <Link to={footerLink.href} className="font-medium text-brand hover:underline">
            {footerLink.label}
          </Link>
        </p>
      )}
    </form>
  );
}
