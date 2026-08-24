import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

type MarketingPasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function MarketingPasswordInput({
  className,
  ...props
}: MarketingPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mkt-login-password-wrap">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={['mkt-login-input', 'mkt-login-input-password', className].filter(Boolean).join(' ')}
      />
      <button
        type="button"
        className="mkt-login-password-toggle"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
