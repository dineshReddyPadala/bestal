import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, PageHeader } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CsvImportScreen } from '../../components/import/CsvImportScreen';
import { CandidateEntryMethodChooser } from '../../components/forms/CandidateEntryMethodChooser';
import { CandidateWizard } from '../../components/forms/CandidateWizard';
import type {
  CandidateWizardUploads,
  CandidateWizardValues,
} from '../../components/forms/candidate-wizard-schema';
import {
  getInitialStepIndexForEntryMethod,
  mapWizardToApiCreateBody,
  type CandidateEntryMethod,
} from '../../components/forms/candidate-wizard-schema';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useCandidateMutations } from '../../hooks/api/useCandidates';
import { uploadCandidateFile } from '../../lib/api/candidates';

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return '/admin';
  return '/recruiter';
}

export function AddCandidatePage() {
  const navigate = useNavigate();
  const basePath = usePortalBasePath();
  const { message, show } = useDemoToast();
  const { create } = useCandidateMutations();
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [entryMethod, setEntryMethod] = useState<CandidateEntryMethod | null>(null);

  async function handleSubmit(values: CandidateWizardValues, uploads: CandidateWizardUploads) {
    try {
      const created = await create.mutateAsync(mapWizardToApiCreateBody(values));

      const uploadJobs: Promise<unknown>[] = [];
      if (uploads.profileImage) {
        uploadJobs.push(uploadCandidateFile(created.id, 'profile-image', uploads.profileImage));
      }
      if (uploads.resume) {
        uploadJobs.push(uploadCandidateFile(created.id, 'resume', uploads.resume));
      }
      if (uploads.introVideo) {
        uploadJobs.push(uploadCandidateFile(created.id, 'intro-video', uploads.introVideo));
      }
      if (uploadJobs.length > 0) {
        await Promise.all(uploadJobs);
      }

      setSubmittedId(created.id);
      show(
        uploadJobs.length > 0
          ? 'Candidate created and files uploaded to storage'
          : 'Candidate created successfully',
      );
      setTimeout(() => navigate(`${basePath}/candidates/${created.id}`), 1200);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to create candidate');
    }
  }

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title="Add Candidate"
        description="Add a new candidate to the talent pool"
        breadcrumbs={
          <Link to={`${basePath}/candidates`} className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to candidates
          </Link>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {submittedId !== null ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-emerald-600">Candidate created successfully</p>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting to candidate profile…</p>
            </CardContent>
          </Card>
        ) : entryMethod === null ? (
          <Card className="mx-auto max-w-4xl">
            <CardContent className="p-6">
              <CandidateEntryMethodChooser
                onSelect={setEntryMethod}
                onCancel={() => navigate(`${basePath}/candidates`)}
              />
            </CardContent>
          </Card>
        ) : entryMethod === 'csv' ? (
          <Card className="mx-auto max-w-6xl">
            <CardContent className="p-6">
              <CsvImportScreen
                embedded
                cancelPath={`${basePath}/candidates`}
                title="Import CSV"
                description="Upload a spreadsheet, validate rows, and bulk import candidates into your pipeline."
                onBack={() => setEntryMethod(null)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto max-w-4xl">
            <CardContent className="p-6">
              <CandidateWizard
                key={entryMethod}
                entryMethod={entryMethod}
                initialStepIndex={getInitialStepIndexForEntryMethod(entryMethod)}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`${basePath}/candidates`)}
                onChangeEntryMethod={() => setEntryMethod(null)}
                onToast={show}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
