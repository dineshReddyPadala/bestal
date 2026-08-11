import { Button, Dialog, Input } from '@bestal/ui';
import { useState } from 'react';

type ReasonPromptInput = {
  title: string;
  description?: string;
  confirmLabel: string;
  reasonLabel?: string;
  reasonRequired?: boolean;
  reasonPlaceholder?: string;
  destructive?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

type ReasonPromptState = ReasonPromptInput & { open: boolean };

function emptyState(): ReasonPromptState {
  return {
    open: false,
    title: '',
    confirmLabel: 'Confirm',
    onConfirm: () => undefined,
  };
}

export function useReasonPrompt() {
  const [state, setState] = useState<ReasonPromptState>(emptyState);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function requestReason(input: ReasonPromptInput) {
    setReason('');
    setError(null);
    setState({ ...input, open: true });
  }

  function close() {
    if (busy) return;
    setState(emptyState());
    setReason('');
    setError(null);
  }

  async function handleConfirm() {
    const trimmed = reason.trim();
    if (state.reasonRequired && !trimmed) {
      setError('Please enter a reason');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await state.onConfirm(trimmed);
      setState(emptyState());
      setReason('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      setError(message);
      state.onError?.(message);
    } finally {
      setBusy(false);
    }
  }

  const dialog = (
    <Dialog
      open={state.open}
      onClose={close}
      title={state.title}
      description={state.description}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className={state.destructive ? 'bg-red-600 hover:bg-red-700' : undefined}
            onClick={() => void handleConfirm()}
            disabled={busy}
          >
            {busy ? 'Working…' : state.confirmLabel}
          </Button>
        </>
      }
    >
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">{state.reasonLabel ?? 'Reason'}</span>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={state.reasonPlaceholder ?? 'Enter reason…'}
          autoFocus
        />
      </label>
      {error ? (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </Dialog>
  );

  return { requestReason, reasonDialog: dialog };
}
