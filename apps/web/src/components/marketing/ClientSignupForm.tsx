import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { ForwardArrow } from '../ui/ForwardArrow';
import { OtpDigitInput } from '../ui/OtpDigitInput';
import { requestClientSignupOtp, verifyClientSignupOtp } from '../../lib/api/clients';
import {
  clientSignupDetailsSchema,
  clientSignupOtpSchema,
  type ClientSignupDetailsValues,
  type ClientSignupOtpValues,
} from '../../lib/schemas/client-signup';
import { CLIENT_LOGIN_PATH } from '../../lib/login-portals';

type ClientSignupFormProps = {
  discipline?: string | null;
  onSuccess: () => void;
  compact?: boolean;
};

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="mkt-login-label">
      {children}
      <span className="mkt-login-required" aria-hidden="true">
        *
      </span>
    </span>
  );
}

export function ClientSignupForm({
  discipline,
  onSuccess,
  compact = false,
}: ClientSignupFormProps) {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpExpiresInMinutes, setOtpExpiresInMinutes] = useState(10);
  const [pendingDetails, setPendingDetails] = useState<ClientSignupDetailsValues | null>(null);

  const detailsForm = useForm<ClientSignupDetailsValues>({
    resolver: zodResolver(clientSignupDetailsSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactDesignation: '',
    },
  });

  const otpForm = useForm<ClientSignupOtpValues>({
    resolver: zodResolver(clientSignupOtpSchema),
    defaultValues: { otp: '' },
  });

  const loginHref =
    discipline != null && discipline !== ''
      ? `${CLIENT_LOGIN_PATH}?discipline=${encodeURIComponent(discipline)}`
      : CLIENT_LOGIN_PATH;

  async function onVerifyDetails(values: ClientSignupDetailsValues) {
    setSubmitError(null);
    try {
      const result = await requestClientSignupOtp(values);
      setPendingDetails(values);
      setOtpExpiresInMinutes(result.expiresInMinutes);
      setStep('otp');
      otpForm.reset({ otp: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not send verification code.');
    }
  }

  async function onVerifyAndCreate(values: ClientSignupOtpValues) {
    if (!pendingDetails) {
      setSubmitError('Please complete your details first.');
      setStep('details');
      return;
    }
    setSubmitError(null);
    try {
      await verifyClientSignupOtp({
        contactEmail: pendingDetails.contactEmail,
        otp: values.otp,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    }
  }

  if (step === 'otp' && pendingDetails) {
    return (
      <form
        className={compact ? 'mkt-login-form' : 'mkt-login-form mkt-signup-form'}
        onSubmit={otpForm.handleSubmit(onVerifyAndCreate)}
      >
        {submitError && <div className="mkt-login-error">{submitError}</div>}

        <p className="mkt-login-hint">
          Enter the verification code sent to{' '}
          <span className="mkt-login-hint-strong">{pendingDetails.contactEmail}</span>. It expires
          in {otpExpiresInMinutes} minutes.
        </p>

        <Controller
          name="otp"
          control={otpForm.control}
          render={({ field }) => (
            <OtpDigitInput
              value={field.value}
              onChange={field.onChange}
              disabled={otpForm.formState.isSubmitting}
              error={otpForm.formState.errors.otp?.message}
            />
          )}
        />

        <button
          type="submit"
          className="mkt-btn mkt-btn-primary mkt-login-submit"
          disabled={otpForm.formState.isSubmitting}
        >
          {otpForm.formState.isSubmitting ? 'Creating account…' : 'Verify and create'}
          {!otpForm.formState.isSubmitting && <ForwardArrow className="h-4 w-4" />}
        </button>

        <button
          type="button"
          className="mkt-btn mkt-btn-ghost w-full text-sm"
          disabled={otpForm.formState.isSubmitting}
          onClick={() => {
            setStep('details');
            setSubmitError(null);
          }}
        >
          Back to details
        </button>

        <p className="mkt-signup-signin-prompt">
          <span className="mkt-signup-signin-text">Already have an account?</span>{' '}
          <Link to={loginHref} className="mkt-signup-signin-link">
            Sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form
      className={compact ? 'mkt-login-form' : 'mkt-login-form mkt-signup-form'}
      onSubmit={detailsForm.handleSubmit(onVerifyDetails)}
    >
      {submitError && <div className="mkt-login-error">{submitError}</div>}

      <label className="mkt-login-field">
        <RequiredLabel>Company name</RequiredLabel>
        <input
          type="text"
          autoComplete="organization"
          required
          className="mkt-login-input"
          {...detailsForm.register('companyName')}
        />
        {detailsForm.formState.errors.companyName && (
          <span className="mkt-login-field-error">
            {detailsForm.formState.errors.companyName.message}
          </span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Primary contact name</RequiredLabel>
        <input
          type="text"
          autoComplete="name"
          required
          className="mkt-login-input"
          {...detailsForm.register('contactName')}
        />
        {detailsForm.formState.errors.contactName && (
          <span className="mkt-login-field-error">
            {detailsForm.formState.errors.contactName.message}
          </span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Designation</RequiredLabel>
        <input
          type="text"
          autoComplete="organization-title"
          required
          className="mkt-login-input"
          placeholder="e.g. VP Engineering, Talent Lead"
          {...detailsForm.register('contactDesignation')}
        />
        {detailsForm.formState.errors.contactDesignation && (
          <span className="mkt-login-field-error">
            {detailsForm.formState.errors.contactDesignation.message}
          </span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Official email</RequiredLabel>
        <input
          type="email"
          autoComplete="email"
          required
          className="mkt-login-input"
          {...detailsForm.register('contactEmail')}
        />
        {detailsForm.formState.errors.contactEmail && (
          <span className="mkt-login-field-error">
            {detailsForm.formState.errors.contactEmail.message}
          </span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Phone number</RequiredLabel>
        <input
          type="tel"
          autoComplete="tel"
          required
          className="mkt-login-input"
          {...detailsForm.register('contactPhone')}
        />
        {detailsForm.formState.errors.contactPhone && (
          <span className="mkt-login-field-error">
            {detailsForm.formState.errors.contactPhone.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        className="mkt-btn mkt-btn-primary mkt-login-submit"
        disabled={detailsForm.formState.isSubmitting}
      >
        {detailsForm.formState.isSubmitting ? 'Sending code…' : 'Generate OTP'}
        {!detailsForm.formState.isSubmitting && <ForwardArrow className="h-4 w-4" />}
      </button>

      <p className="mkt-signup-signin-prompt">
        <span className="mkt-signup-signin-text">Already have an account?</span>{' '}
        <Link to={loginHref} className="mkt-signup-signin-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
