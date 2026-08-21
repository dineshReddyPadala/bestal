import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ForwardArrow } from '../ui/ForwardArrow';
import { getMe, requestClientLoginOtp, verifyClientLoginOtp } from '../../lib/api/client';

const emailSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
});

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;

type ClientLoginFormProps = {
  successPath: string;
  signupHref: string;
  onAuthenticated: () => Promise<void>;
};

export function ClientLoginForm({
  successPath,
  signupHref,
  onAuthenticated,
}: ClientLoginFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  async function onRequestOtp(values: EmailValues) {
    setSubmitError(null);
    try {
      const result = await requestClientLoginOtp({ email: values.email.trim() });
      setPendingEmail(values.email.trim());
      setExpiresInMinutes(result.expiresInMinutes);
      setStep('otp');
      otpForm.reset({ otp: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not send verification code.');
    }
  }

  async function onVerifyOtp(values: OtpValues) {
    if (!pendingEmail) {
      setStep('email');
      return;
    }
    setSubmitError(null);
    try {
      await verifyClientLoginOtp({ email: pendingEmail, otp: values.otp });
      await getMe();
      await onAuthenticated();
      navigate(successPath);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    }
  }

  if (step === 'otp') {
    return (
      <form className="mkt-login-form" onSubmit={otpForm.handleSubmit(onVerifyOtp)}>
        {submitError && <div className="mkt-login-error">{submitError}</div>}

        <p className="mkt-login-hint">
          Enter the verification code sent to{' '}
          <span className="mkt-login-hint-strong">{pendingEmail}</span>. It expires in{' '}
          {expiresInMinutes} minutes.
        </p>

        <label className="mkt-login-field">
          <span className="mkt-login-label">
            Verification code<span className="mkt-login-required">*</span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="mkt-login-input tracking-[0.3em]"
            placeholder="000000"
            {...otpForm.register('otp')}
          />
          {otpForm.formState.errors.otp && (
            <span className="mkt-login-field-error">{otpForm.formState.errors.otp.message}</span>
          )}
        </label>

        <button
          type="submit"
          className="mkt-btn mkt-btn-primary mkt-login-submit"
          disabled={otpForm.formState.isSubmitting}
        >
          {otpForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
          {!otpForm.formState.isSubmitting && <ForwardArrow className="h-4 w-4" />}
        </button>

        <button
          type="button"
          className="mkt-btn mkt-btn-ghost w-full text-sm"
          disabled={otpForm.formState.isSubmitting}
          onClick={() => {
            setStep('email');
            setSubmitError(null);
          }}
        >
          Use a different email
        </button>

        <Link to={signupHref} className="mkt-btn mkt-login-signup">
          New to BesTal? Sign up
        </Link>
      </form>
    );
  }

  return (
    <form className="mkt-login-form" onSubmit={emailForm.handleSubmit(onRequestOtp)}>
      {submitError && <div className="mkt-login-error">{submitError}</div>}

      <label className="mkt-login-field">
        <span className="mkt-login-label">
          Email<span className="mkt-login-required">*</span>
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          className="mkt-login-input"
          {...emailForm.register('email')}
        />
        {emailForm.formState.errors.email && (
          <span className="mkt-login-field-error">{emailForm.formState.errors.email.message}</span>
        )}
      </label>

      <button
        type="submit"
        className="mkt-btn mkt-btn-primary mkt-login-submit"
        disabled={emailForm.formState.isSubmitting}
      >
        {emailForm.formState.isSubmitting ? 'Sending code…' : 'Send verification code'}
        {!emailForm.formState.isSubmitting && <ForwardArrow className="h-4 w-4" />}
      </button>

      <Link to={signupHref} className="mkt-btn mkt-login-signup">
        New to BesTal? Sign up
      </Link>
    </form>
  );
}
