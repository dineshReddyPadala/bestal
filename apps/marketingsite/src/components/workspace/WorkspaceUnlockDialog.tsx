import { useEffect } from 'react';
import { CLIENT_SIGNUP_URL, CLIENT_WORKSPACE_URL } from '@/constants/app-urls';
import { Icon } from '@/components/ui/Icon';

type WorkspaceUnlockDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function WorkspaceUnlockDialog({ open, onClose }: WorkspaceUnlockDialogProps) {
  useEffect(() => {
    if (!open) return undefined;
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
    <div className="workspace-unlock" role="dialog" aria-modal="true" aria-labelledby="workspace-unlock-title" onClick={onClose}>
      <div className="workspace-unlock-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="workspace-unlock-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="workspace-unlock-hero" aria-hidden="true">
          <div className="workspace-unlock-glow" />
          <div className="workspace-unlock-hero-row">
            <span className="workspace-unlock-tile">
              <Icon name="users" size={20} />
            </span>
            <div className="workspace-unlock-shield">
              <Icon name="shield" size={36} />
              <Icon name="lock" size={16} />
            </div>
            <span className="workspace-unlock-tile">
              <Icon name="bar_chart" size={20} />
            </span>
          </div>
        </div>

        <div className="workspace-unlock-body">
          <h2 id="workspace-unlock-title">Continue in Client Workspace</h2>
          <p>To take an action in the workspace, sign in or create a client account.</p>

          <div className="workspace-unlock-features">
            <div className="workspace-unlock-feature">
              <Icon name="check_circle" size={18} />
              <span>Delivery, teams and commercials in one place</span>
            </div>
            <div className="workspace-unlock-feature">
              <Icon name="user_check" size={18} />
              <span>Evaluated professionals and trial requests</span>
            </div>
            <div className="workspace-unlock-feature">
              <Icon name="clipboard_check" size={18} />
              <span>Approvals and engagement visibility</span>
            </div>
          </div>

          <div className="workspace-unlock-actions">
            <a className="btn outline" href={CLIENT_WORKSPACE_URL}>
              <Icon name="lock" size={16} />
              Log in
            </a>
            <a className="btn primary" href={CLIENT_SIGNUP_URL}>
              <Icon name="user_check" size={16} />
              Sign up
            </a>
          </div>

          <p className="workspace-unlock-secure">
            <Icon name="lock" size={14} />
            Your information is secure with us.
          </p>
        </div>
      </div>
    </div>
  );
}
