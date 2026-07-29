import { Button, Input } from '@bestal/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../lib/api/client';
import type { SelfServicePortal } from '../../lib/auth-portal-config';

type ForgotPasswordFormProps = {
  portal: SelfServicePortal;
  loginPath: string;
  defaultEmail?: string;
};

export function ForgotPasswordForm({
  portal,
  loginPath,
  defaultEmail = '',
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setDevResetToken(null);

    try {
      const result = await forgotPassword({ email, portal });
      setMessage(result.message);
      if (result.resetToken) {
        setDevResetToken(result.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link');
    } finally {
      setSubmitting(false);
    }
  }

  const resetPath = loginPath.replace('/login', '/reset-password');

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-success/10 px-3 py-2 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {devResetToken && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p className="font-medium">Development reset link</p>
          <Link
            to={`${resetPath}?token=${encodeURIComponent(devResetToken)}`}
            className="mt-1 inline-block break-all font-medium text-brand hover:underline"
          >
            {`${resetPath}?token=${devResetToken}`}
          </Link>
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
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Sending link…' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link to={loginPath} className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
