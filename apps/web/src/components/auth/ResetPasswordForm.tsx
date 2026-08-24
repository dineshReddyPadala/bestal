import { Button, PasswordInput } from '@bestal/ui';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { resetPassword } from '../../lib/api/client';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const resetFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormProps = {
  loginPath: string;
  forgotPasswordPath: string;
};

export function ResetPasswordForm({
  loginPath,
  forgotPasswordPath,
}: ResetPasswordFormProps) {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setFieldErrors({});

    if (!token) {
      setError('Reset link is invalid or missing. Request a new password reset link.');
      return;
    }

    const parsed = resetFormSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword({
        token,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
      });
      setMessage(result.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          This reset link is invalid or has expired.
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link to={forgotPasswordPath} className="font-medium text-brand hover:underline">
            Request a new reset link
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link to={loginPath} className="font-medium text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-success/10 px-3 py-2 text-sm text-emerald-800">
            {message}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link to={loginPath} className="font-medium text-brand hover:underline">
              Continue to sign in
            </Link>
          </p>
        </div>
      )}

      {!message && (
        <>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              New password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm new password
            </label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Updating password…' : 'Reset password'}
          </Button>
        </>
      )}

      {!message && (
        <p className="text-center text-sm text-muted-foreground">
          <Link to={loginPath} className="font-medium text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      )}
    </form>
  );
}
