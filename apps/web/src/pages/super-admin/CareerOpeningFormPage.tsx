import { Button, Input, PageHeader, Select } from '@bestal/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCareerOpening, useCareerOpeningMutations } from '../../hooks/api/useCareerOpenings';
import type { CareerOpeningPayload, CareerOpeningStatus } from '../../lib/api/career-openings';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../../components/ui/ToastHost';

const TEXTAREA_CLASS =
  'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60';

const EMPTY_FORM: CareerOpeningPayload = {
  title: '',
  skillCommunity: '',
  location: '',
  remote: false,
  jobLevel: '',
  experience: '',
  aboutRole: '',
  responsibilities: [],
  requirements: [],
  status: 'DRAFT',
};

function linesToText(items: string[]): string {
  return items.join('\n');
}

function textToLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function SuperAdminCareerOpeningFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const openingId = isNew ? 0 : Number(id);
  const navigate = useNavigate();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { data, isLoading } = useCareerOpening(openingId);
  const mutations = useCareerOpeningMutations();

  const [form, setForm] = useState<CareerOpeningPayload>(EMPTY_FORM);
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data || isNew) return;
    setForm({
      title: data.title,
      skillCommunity: data.skillCommunity,
      location: data.location,
      remote: data.remote,
      jobLevel: data.jobLevel,
      experience: data.experience,
      aboutRole: data.aboutRole,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      status: data.status,
    });
    setResponsibilitiesText(linesToText(data.responsibilities));
    setRequirementsText(linesToText(data.requirements));
  }, [data, isNew]);

  function set<K extends keyof CareerOpeningPayload>(key: K, value: CareerOpeningPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const responsibilities = textToLines(responsibilitiesText);
    const requirements = textToLines(requirementsText);
    if (responsibilities.length === 0) {
      showError('Add at least one responsibility');
      return;
    }
    if (requirements.length === 0) {
      showError('Add at least one requirement');
      return;
    }

    const payload: CareerOpeningPayload = {
      ...form,
      title: form.title.trim(),
      skillCommunity: form.skillCommunity.trim(),
      location: form.location.trim(),
      jobLevel: form.jobLevel.trim(),
      experience: form.experience.trim(),
      aboutRole: form.aboutRole.trim(),
      responsibilities,
      requirements,
    };

    setBusy(true);
    try {
      if (isNew) {
        await mutations.create.mutateAsync(payload);
        show('Career opening created');
      } else {
        await mutations.update.mutateAsync({ id: openingId, body: payload });
        show('Career opening updated');
      }
      navigate('/super-admin/career-openings');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <PageHeader title={isNew ? 'Post career opening' : 'Edit career opening'} />
      <form onSubmit={onSubmit} className="max-w-3xl space-y-4 p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Job title</span>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Job level</span>
            <Input
              value={form.jobLevel}
              onChange={(e) => set('jobLevel', e.target.value)}
              placeholder="Senior level"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Experience</span>
            <Input
              value={form.experience}
              onChange={(e) => set('experience', e.target.value)}
              placeholder="7+ years"
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Location</span>
            <Input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Hyderabad, India"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Skill community</span>
            <Input
              value={form.skillCommunity}
              onChange={(e) => set('skillCommunity', e.target.value)}
              placeholder="Full-Stack Development"
              required
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(e) => set('remote', e.target.checked)}
          />
          Remote friendly
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Status</span>
          <Select
            value={form.status}
            onChange={(e) => set('status', e.target.value as CareerOpeningStatus)}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only published openings appear on the public careers page.
          </p>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">About the role</span>
          <textarea
            className={TEXTAREA_CLASS}
            value={form.aboutRole}
            onChange={(e) => set('aboutRole', e.target.value)}
            required
            minLength={10}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Key responsibilities</span>
          <textarea
            className={TEXTAREA_CLASS}
            value={responsibilitiesText}
            onChange={(e) => setResponsibilitiesText(e.target.value)}
            placeholder="One responsibility per line"
            required
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">What to bring</span>
          <textarea
            className={TEXTAREA_CLASS}
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
            placeholder="One requirement per line"
            required
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Post opening' : 'Save'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/super-admin/career-openings')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
