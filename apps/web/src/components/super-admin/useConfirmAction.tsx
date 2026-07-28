import { Button, Dialog } from '@bestal/ui';
import { useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';
import { type ConfirmState, emptyConfirm } from './ActionMenu';

type ConfirmInput = Omit<ConfirmState, 'open'> & {
  /** Called when onConfirm throws; if omitted, error is rethrown after closing busy state. */
  onError?: (message: string) => void;
};

export function useConfirmAction() {
  const [confirm, setConfirm] = useState<ConfirmState>(emptyConfirm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onError, setOnError] = useState<((message: string) => void) | undefined>();

  function requestConfirm(input: ConfirmInput) {
    const { onError: errorHandler, ...rest } = input;
    setError(null);
    setOnError(() => errorHandler);
    setConfirm({ ...rest, open: true });
  }

  function closeConfirm() {
    if (busy) return;
    setConfirm(emptyConfirm());
    setError(null);
    setOnError(undefined);
  }

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await confirm.onConfirm();
      setConfirm(emptyConfirm());
      setOnError(undefined);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Action failed');
      setError(message);
      onError?.(message);
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
      {error ? (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </Dialog>
  );

  return { requestConfirm, confirmDialog: dialog };
}
