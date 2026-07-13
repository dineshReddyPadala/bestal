import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, PageHeader } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CsvImportScreen } from '../../components/import/CsvImportScreen';
import { CandidateEntryMethodChooser } from '../../components/forms/CandidateEntryMethodChooser';
import { CandidateWizard } from '../../components/forms/CandidateWizard';
import { ResumeUploadDialog } from '../../components/forms/ResumeUploadDialog';
import type {
  CandidateWizardUploads,
  CandidateWizardValues,
  CandidateWizardFormValues,
} from '../../components/forms/candidate-wizard-schema';
import {
  getInitialStepIndexForEntryMethod,
  mapWizardToApiCreateBody,
  type CandidateEntryMethod,
} from '../../components/forms/candidate-wizard-schema';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useCandidateMutations } from '../../hooks/api/useCandidates';
import { getApiErrorMessage } from '../../lib/api/errors';
import { uploadCandidateFile } from '../../lib/api/candidates';
import { ToastHost } from '../../components/ui/ToastHost';

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return '/admin';
  return '/recruiter';
}

export function AddCandidatePage() {
  const navigate = useNavigate();
  const basePath = usePortalBasePath();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { create, update } = useCandidateMutations();
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [entryMethod, setEntryMethod] = useState<CandidateEntryMethod | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [resumeBootstrap, setResumeBootstrap] = useState<{
    formValues: Partial<CandidateWizardFormValues>;
    uploads: CandidateWizardUploads;
    sessionKey: string;
    draftCandidateId: number;
  } | null>(null);

  function handleEntrySelect(method: CandidateEntryMethod) {
    if (method === 'resume') {
      setResumeDialogOpen(true);
      return;
    }
    setResumeBootstrap(null);
    setEntryMethod(method);
  }

  function handleResumeSuccess(
    file: File,
    formValues: Partial<CandidateWizardFormValues>,
    uploads: CandidateWizardUploads,
    toastMessage: string,
    draftCandidateId: number,
  ) {
    setResumeBootstrap({
      formValues,
      uploads,
      sessionKey: `${file.name}-${file.lastModified}`,
      draftCandidateId,
    });
    setEntryMethod('resume');
    setResumeDialogOpen(false);
    show(toastMessage);
  }

  async function handleSubmit(values: CandidateWizardValues, uploads: CandidateWizardUploads) {
    setSubmitError(null);
    try {
      const draftId = resumeBootstrap?.draftCandidateId;
      const saved = draftId
        ? await update.mutateAsync({
            id: draftId,
            body: mapWizardToApiCreateBody(values),
          })
        : await create.mutateAsync(mapWizardToApiCreateBody(values));

      const uploadJobs: Promise<unknown>[] = [];
      if (uploads.profileImage) {
        uploadJobs.push(uploadCandidateFile(saved.id, 'profile-image', uploads.profileImage));
      }
      // Resume already uploaded during extract-resume when starting from draft
      if (uploads.resume && !draftId) {
        uploadJobs.push(uploadCandidateFile(saved.id, 'resume', uploads.resume));
      }
      if (uploads.introVideo) {
        uploadJobs.push(uploadCandidateFile(saved.id, 'intro-video', uploads.introVideo));
      }
      if (uploadJobs.length > 0) {
        await Promise.all(uploadJobs);
      }

      setSubmittedId(saved.id);
      show(
        draftId
          ? 'Draft candidate updated successfully'
          : uploadJobs.length > 0
            ? 'Candidate created and files uploaded to storage'
            : 'Candidate created successfully',
      );
      setTimeout(() => navigate(`${basePath}/candidates/${saved.id}`), 1200);
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, 'Failed to create candidate');
      setSubmitError(errorMessage);
      showError(errorMessage);
    }
  }

  return (
    <div className="min-h-full bg-muted/10">
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
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
        <div
          className={`mx-6 mt-4 rounded-xl border px-4 py-3 text-sm ${
            variant === 'error'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
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
                onSelect={handleEntrySelect}
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
                key={
                  entryMethod === 'resume' && resumeBootstrap
                    ? `resume-${resumeBootstrap.sessionKey}`
                    : entryMethod
                }
                entryMethod={entryMethod}
                initialStepIndex={getInitialStepIndexForEntryMethod(entryMethod)}
                initialFormValues={resumeBootstrap?.formValues}
                initialUploads={resumeBootstrap?.uploads}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`${basePath}/candidates`)}
                onChangeEntryMethod={() => {
                  setResumeBootstrap(null);
                  setEntryMethod(null);
                }}
                onToast={show}
                submitError={submitError}
                isSubmitting={create.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <ResumeUploadDialog
        open={resumeDialogOpen}
        onClose={() => setResumeDialogOpen(false)}
        onSuccess={handleResumeSuccess}
      />
    </div>
  );
}
