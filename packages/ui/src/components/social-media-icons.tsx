import { Lightbulb, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SOCIAL_ICONS = [
  { label: 'LinkedIn', src: '/linkedin.png' },
  { label: 'Facebook', src: '/facebook.png' },
  { label: 'Instagram', src: '/instagram.png' },
] as const;

const SOCIAL_TOAST_TITLE = 'Follow our journey...';
const SOCIAL_TOAST_MESSAGE = 'Our social links are coming soon! Stay tuned.';
const SOCIAL_TOAST_DURATION_MS = 6000;

type SocialMediaIconsProps = {
  className?: string;
};

export function SocialMediaIcons({ className = 'mkt-ft-social' }: SocialMediaIconsProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const timerRef = useRef<number | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToastVisible(false);
  }, []);

  const showToast = useCallback(() => {
    setToastKey((key) => key + 1);
    setToastVisible(true);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      timerRef.current = null;
    }, SOCIAL_TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return (
    <>
      <div className="mkt-ft-social-wrap">
        <p className="mkt-ft-social-label">Follow us on:</p>
        <div className={className} aria-label="Social media">
          {SOCIAL_ICONS.map(({ label, src }) => (
            <button
              key={label}
              type="button"
              className="mkt-ft-social-btn"
              aria-label={label}
              title={label}
              onClick={showToast}
            >
              <img src={src} alt="" width={24} height={24} />
            </button>
          ))}
        </div>
      </div>
      {toastVisible && typeof document !== 'undefined'
        ? createPortal(
            <div className="mkt-social-toast-host" role="status" aria-live="polite">
              <div className="mkt-social-toast-card">
                <div className="mkt-social-toast-header">
                  <div className="mkt-social-toast-icon-wrap" aria-hidden="true">
                    <Lightbulb className="mkt-social-toast-icon" strokeWidth={2} />
                  </div>
                  <p className="mkt-social-toast-title">{SOCIAL_TOAST_TITLE}</p>
                  <button
                    type="button"
                    className="mkt-social-toast-dismiss"
                    aria-label="Dismiss"
                    onClick={dismissToast}
                  >
                    <X className="mkt-social-toast-dismiss-icon" strokeWidth={2} />
                  </button>
                </div>
                <p className="mkt-social-toast-message">{SOCIAL_TOAST_MESSAGE}</p>
                <div className="mkt-social-toast-progress-track" aria-hidden="true">
                  <div
                    key={toastKey}
                    className="mkt-social-toast-progress-bar"
                    style={{ animationDuration: `${SOCIAL_TOAST_DURATION_MS}ms` }}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
