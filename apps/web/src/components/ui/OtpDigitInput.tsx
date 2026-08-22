import { cn } from '@bestal/shared-utils';
import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const DEFAULT_LENGTH = 6;

type OtpDigitInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
  label?: string;
  required?: boolean;
};

function sanitizeOtp(value: string, length: number): string {
  return value.replace(/\D/g, '').slice(0, length);
}

export function OtpDigitInput({
  value,
  onChange,
  length = DEFAULT_LENGTH,
  disabled = false,
  error,
  autoFocus = true,
  label = 'Verification code',
  required = true,
}: OtpDigitInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputRefs.current[0]?.focus();
  }, [autoFocus, disabled]);

  function updateValue(next: string) {
    onChange(sanitizeOtp(next, length));
  }

  function focusIndex(index: number) {
    const clamped = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  }

  function handleDigitChange(index: number, raw: string) {
    const sanitized = sanitizeOtp(raw, length);

    if (sanitized.length > 1) {
      updateValue(sanitized);
      focusIndex(Math.min(sanitized.length, length) - 1);
      return;
    }

    const digit = sanitized;
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    updateValue(nextDigits.join(''));

    if (digit && index < length - 1) {
      focusIndex(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        updateValue(nextDigits.join(''));
        return;
      }
      if (index > 0) {
        focusIndex(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const sanitized = sanitizeOtp(pasted, length);
    updateValue(sanitized);
    focusIndex(sanitized.length >= length ? length - 1 : sanitized.length);
  }

  return (
    <div className="mkt-login-field">
      <span className="mkt-login-label">
        {label}
        {required ? <span className="mkt-login-required">*</span> : null}
      </span>

      <div className="mkt-otp-input-group" role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            maxLength={1}
            value={digit}
            disabled={disabled}
            className={cn('mkt-otp-digit', error && 'mkt-otp-digit-error')}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.currentTarget.select()}
          />
        ))}
      </div>

      {error ? <span className="mkt-login-field-error">{error}</span> : null}
    </div>
  );
}
