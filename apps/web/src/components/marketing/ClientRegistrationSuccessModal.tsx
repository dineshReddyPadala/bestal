import { Check, FileText, Lock, Mail, Shield, User, X } from 'lucide-react';
import { useEffect } from 'react';

type ClientRegistrationSuccessModalProps = {
  onClose: () => void;
};

export function ClientRegistrationSuccessModal({ onClose }: ClientRegistrationSuccessModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="mkt-signup-success-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-success-title"
      onClick={onClose}
    >
      <div className="mkt-signup-success-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="mkt-signup-success-close" aria-label="Close" onClick={onClose}>
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>

        <div className="mkt-signup-success-hero" aria-hidden="true">
          <span className="mkt-signup-success-spark mkt-signup-success-spark--1">✦</span>
          <span className="mkt-signup-success-spark mkt-signup-success-spark--2">✦</span>
          <div className="mkt-signup-success-hero-badge">
            <FileText className="mkt-signup-success-doc-icon" strokeWidth={1.75} />
            <span className="mkt-signup-success-check-badge">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          </div>
        </div>

        <div className="mkt-signup-success-body">
          <h1 id="signup-success-title">Registration received</h1>
          <div className="mkt-signup-success-rule" aria-hidden="true" />

          <div className="mkt-signup-success-items">
            <div className="mkt-signup-success-item">
              <span className="mkt-signup-success-item-icon">
                <Mail className="h-5 w-5" strokeWidth={2} />
              </span>
              <p>
                Thank you for registering. We sent a confirmation email to your inbox.
              </p>
            </div>

            <div className="mkt-signup-success-divider" aria-hidden="true">
              <span />
            </div>

            <div className="mkt-signup-success-item">
              <span className="mkt-signup-success-item-icon mkt-signup-success-item-icon--shield">
                <Shield className="h-5 w-5" strokeWidth={2} />
                <User className="mkt-signup-success-item-icon-user" strokeWidth={2.25} />
              </span>
              <p>
                Your account is pending review. You will be able to sign in once a BesTal
                administrator activates your company account.
              </p>
            </div>
          </div>

          <p className="mkt-signup-success-privacy">
            <Lock className="h-3.5 w-3.5" strokeWidth={2.25} />
            We respect your privacy. Your data is safe with us.
          </p>
        </div>
      </div>
    </div>
  );
}
