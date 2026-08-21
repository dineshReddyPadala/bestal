import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';
import { registerClient } from '../../lib/api/clients';
import {
  clientSignupFormSchema,
  type ClientSignupFormValues,
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientSignupFormValues>({
    resolver: zodResolver(clientSignupFormSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ClientSignupFormValues) {
    setSubmitError(null);
    try {
      await registerClient(values);
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  }

  const loginHref =
    discipline != null && discipline !== ''
      ? `${CLIENT_LOGIN_PATH}?discipline=${encodeURIComponent(discipline)}`
      : CLIENT_LOGIN_PATH;

  return (
    <form
      className={compact ? 'mkt-login-form' : 'mkt-login-form mkt-signup-form'}
      onSubmit={handleSubmit(onSubmit)}
    >
      {submitError && <div className="mkt-login-error">{submitError}</div>}

      <label className="mkt-login-field">
        <RequiredLabel>Company name</RequiredLabel>
        <input
          type="text"
          autoComplete="organization"
          required
          className="mkt-login-input"
          {...register('companyName')}
        />
        {errors.companyName && (
          <span className="mkt-login-field-error">{errors.companyName.message}</span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Primary contact name</RequiredLabel>
        <input
          type="text"
          autoComplete="name"
          required
          className="mkt-login-input"
          {...register('contactName')}
        />
        {errors.contactName && (
          <span className="mkt-login-field-error">{errors.contactName.message}</span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Primary contact email</RequiredLabel>
        <input
          type="email"
          autoComplete="email"
          required
          className="mkt-login-input"
          {...register('contactEmail')}
        />
        {errors.contactEmail && (
          <span className="mkt-login-field-error">{errors.contactEmail.message}</span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Primary contact phone</RequiredLabel>
        <input
          type="tel"
          autoComplete="tel"
          required
          className="mkt-login-input"
          {...register('contactPhone')}
        />
        {errors.contactPhone && (
          <span className="mkt-login-field-error">{errors.contactPhone.message}</span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Password</RequiredLabel>
        <input
          type="password"
          autoComplete="new-password"
          required
          className="mkt-login-input"
          {...register('password')}
        />
        {errors.password && (
          <span className="mkt-login-field-error">{errors.password.message}</span>
        )}
      </label>

      <label className="mkt-login-field">
        <RequiredLabel>Re-enter password</RequiredLabel>
        <input
          type="password"
          autoComplete="new-password"
          required
          className="mkt-login-input"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <span className="mkt-login-field-error">{errors.confirmPassword.message}</span>
        )}
      </label>

      <button
        type="submit"
        className="mkt-btn mkt-btn-primary mkt-login-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting…' : 'Create account'}
        {!isSubmitting && <ForwardArrow className="h-4 w-4" />}
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
