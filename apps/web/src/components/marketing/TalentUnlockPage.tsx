import {
  BarChart3,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

type TalentUnlockDialogProps = {
  open: boolean;
  discipline: string;
  onClose: () => void;
};

export function TalentUnlockDialog({ open, discipline, onClose }: TalentUnlockDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="mkt-talent-unlock"
      role="dialog"
      aria-modal="true"
      aria-labelledby="talent-unlock-title"
      onClick={onClose}
    >
      <div className="mkt-talent-unlock-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="mkt-talent-unlock-close" aria-label="Close" onClick={onClose}>
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>

        <div className="mkt-talent-unlock-hero" aria-hidden="true">
          <div className="mkt-talent-unlock-glow" />
          <span className="mkt-talent-unlock-spark mkt-talent-unlock-spark--1">✦</span>
          <span className="mkt-talent-unlock-spark mkt-talent-unlock-spark--2">✦</span>
          <div className="mkt-talent-unlock-hero-row">
            <span className="mkt-talent-unlock-tile">
              <User className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="mkt-talent-unlock-shield">
              <Shield className="mkt-talent-unlock-shield-icon" strokeWidth={1.75} />
              <Lock className="mkt-talent-unlock-lock-icon" strokeWidth={2.25} />
            </div>
            <span className="mkt-talent-unlock-tile">
              <BarChart3 className="h-5 w-5" strokeWidth={2.25} />
            </span>
          </div>
        </div>

        <div className="mkt-talent-unlock-body">
          <h1 id="talent-unlock-title">
            Unlock detailed talent insights
          </h1>
          <p>
            To aceess more about this decipline and pre vetted talent details, please login or reach out to our team.
          </p>

          <div className="mkt-talent-unlock-features">
            <div className="mkt-talent-unlock-feature">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
              <span>Verified &amp; pre vetted talent profiles</span>
            </div>
            <div className="mkt-talent-unlock-feature">
              <User className="h-5 w-5" strokeWidth={2.25} />
              <span>Detailed skills, experience &amp; more</span>
            </div>
            <div className="mkt-talent-unlock-feature">
              <Users className="h-5 w-5" strokeWidth={2.25} />
              <span>Specialist community insights</span>
            </div>
          </div>

          <div className="mkt-talent-unlock-actions">
            <Link
              to={`/login/engineers?discipline=${encodeURIComponent(discipline)}`}
              className="mkt-btn mkt-btn-secondary mkt-talent-unlock-btn"
            >
              <Lock className="h-4 w-4" strokeWidth={2.25} />
              Log in
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-primary mkt-talent-unlock-btn">
              <Mail className="h-4 w-4" strokeWidth={2.25} />
              Reach out to us
            </Link>
          </div>

          <p className="mkt-talent-unlock-secure">
            <Lock className="h-3.5 w-3.5" strokeWidth={2.25} />
           Your information is secure with us.
          </p>
        </div>
      </div>
    </div>
  );
}
