import { Button, Dialog, Select } from '@bestal/ui';
import { useMemo, useState } from 'react';
import { useClientsList } from '../../hooks/api/useClients';
import { useShortlistMutations, useShortlistsList } from '../../hooks/api/useShortlists';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { CandidateListItem } from '../../lib/api/types';

type SalesAddToShortlistDialogProps = {
  open: boolean;
  candidate: CandidateListItem | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

export function SalesAddToShortlistDialog({
  open,
  candidate,
  onClose,
  onSuccess,
}: SalesAddToShortlistDialogProps) {
  const [clientId, setClientId] = useState('');
  const [shortlistId, setShortlistId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: clientsData } = useClientsList({ limit: 100, status: 'ACTIVE' });
  const parsedClientId = clientId ? Number(clientId) : 0;
  const { data: shortlistsData } = useShortlistsList(
    parsedClientId > 0 ? { clientId: parsedClientId, limit: 50 } : undefined,
  );
  const mutations = useShortlistMutations();

  const clients = clientsData?.data ?? [];
  const shortlists = shortlistsData?.data ?? [];

  const candidateName = useMemo(() => {
    if (!candidate) return '';
    return `${candidate.firstName} ${candidate.lastName}`.trim();
  }, [candidate]);

  const reset = () => {
    setClientId('');
    setShortlistId('');
    setNewTitle('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!candidate) return;
    if (!parsedClientId) {
      setError('Select a client');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let listId = shortlistId ? Number(shortlistId) : 0;
      if (!listId) {
        const title = newTitle.trim() || `Shortlist — ${candidateName}`;
        const created = await mutations.create.mutateAsync({
          clientId: parsedClientId,
          title,
        });
        listId = created.id;
      }
      await mutations.addCandidate.mutateAsync({
        shortlistId: listId,
        body: { candidateId: candidate.id },
      });
      onSuccess?.(`Added ${candidateName} to shortlist`);
      handleClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add to client shortlist"
      description={candidate ? `Candidate: ${candidateName}` : undefined}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Client</label>
          <Select value={clientId} onChange={(e) => {
            setClientId(e.target.value);
            setShortlistId('');
          }}>
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {parsedClientId > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium">Shortlist</label>
            <Select value={shortlistId} onChange={(e) => setShortlistId(e.target.value)}>
              <option value="">Create new shortlist</option>
              {shortlists.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.title} ({s.candidateCount})
                </option>
              ))}
            </Select>
          </div>
        )}

        {parsedClientId > 0 && !shortlistId && (
          <div>
            <label className="mb-1 block text-sm font-medium">New shortlist title</label>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={`Shortlist — ${candidateName}`}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving || !candidate}>
            {saving ? 'Saving…' : 'Add to shortlist'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
