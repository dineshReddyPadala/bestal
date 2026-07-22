import { Button, Dialog } from '@bestal/ui';
import { useState } from 'react';
import { type ConfirmState, emptyConfirm } from './ActionMenu';

export function useConfirmAction() {
  const [confirm, setConfirm] = useState<ConfirmState>(emptyConfirm());
  const [busy, setBusy] = useState(false);

  function requestConfirm(input: Omit<ConfirmState, 'open'>) {
    setConfirm({ ...input, open: true });
  }

  function closeConfirm() {
    if (busy) return;
    setConfirm(emptyConfirm());
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      await confirm.onConfirm();
      setConfirm(emptyConfirm());
    } finally {
      setBusy(false);
    }
  }

  const dialog = (
    <Dialog
      open={confirm.open}
      onClose={closeConfirm}
      title={confirm.title}
      description={confirm.description}
      footer={
        <>
          <Button variant="outline" onClick={closeConfirm} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className={confirm.destructive ? 'bg-red-600 hover:bg-red-700' : undefined}
            onClick={() => void handleConfirm()}
            disabled={busy}
          >
            {busy ? 'Working…' : confirm.confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">This action can be reviewed in audit logs.</p>
    </Dialog>
  );

  return { requestConfirm, confirmDialog: dialog };
}
