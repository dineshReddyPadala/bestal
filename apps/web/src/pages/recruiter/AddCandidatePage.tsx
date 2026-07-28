import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, useDashboardHeaderLeading } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CandidateWizard } from '../../components/forms/CandidateWizard';
import type {
  CandidateWizardFormValues,
  CandidateWizardUploads,
  CandidateWizardValues,
} from '../../components/forms/candidate-wizard-schema';
import {
  mapCandidateDtoToWizardForm,
  mapWizardToApiCreateBody,
} from '../../components/forms/candidate-wizard-schema';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useCandidate, useCandidateMutations } from '../../hooks/api/useCandidates';
import { getApiErrorMessage } from '../../lib/api/errors';
import { uploadCandidateFile } from '../../lib/api/candidates';
import { ToastHost } from '../../components/ui/ToastHost';

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/super-admin')) return '/super-admin';
  if (pathname.startsWith('/admin')) return '/admin';
  return '/recruiter';
}

export function AddCandidatePage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const editId = routeId && routeId !== 'new' ? Number(routeId) : 0;
  const isEdit = editId > 0;
  const basePath = usePortalBasePath();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { create, update, submitForApproval } = useCandidateMutations();
  const existingQuery = useCandidate(editId);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftCandidateId, setDraftCandidateId] = useState<number | null>(
    isEdit ? editId : null,
  );
  const [initialFormValues, setInitialFormValues] = useState<
    Partial<CandidateWizardFormValues> | undefined
  >();
  const draftCandidateIdRef = useRef<number | null>(isEdit ? editId : null);
  const resumeUploadedViaExtractRef = useRef(false);

  useEffect(() => {
    if (!isEdit || !existingQuery.data) return;
    setDraftId(existingQuery.data.id);
    setInitialFormValues(mapCandidateDtoToWizardForm(existingQuery.data));
  }, [isEdit, existingQuery.data]);

  const headerLeading = useMemo(
    () => (
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to={isEdit ? `${basePath}/candidates/${editId}` : `${basePath}/candidates`}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {isEdit ? 'Edit Candidate' : 'Add Candidate'}
        </h1>
      </div>
    ),
    [basePath, editId, isEdit],
  );
  useDashboardHeaderLeading(headerLeading);

  function setDraftId(id: number | null) {
    draftCandidateIdRef.current = id;
    setDraftCandidateId(id);
  }

  async function persistCandidate(
    values: CandidateWizardValues,
    uploads: CandidateWizardUploads,
    options: { submit: boolean; silent?: boolean },
  ): Promise<boolean> {
    setSubmitError(null);
    try {
      const body = mapWizardToApiCreateBody(values);
      if (options.submit) {
        body.profileStatus = 'PROFILE_DRAFT';
        if (!body.availabilityStatus) {
          body.availabilityStatus = values.availabilityStatus ?? 'IMMEDIATE';
        }
      }
      const existingDraftId = draftCandidateIdRef.current;
      const saved = existingDraftId
        ? await update.mutateAsync({ id: existingDraftId, body })
        : await create.mutateAsync(body);

      setDraftId(saved.id);

      const uploadJobs: Promise<unknown>[] = [];
      if (uploads.profileImage) {
        uploadJobs.push(uploadCandidateFile(saved.id, 'profile-image', uploads.profileImage));
      }
      if (uploads.resume && !resumeUploadedViaExtractRef.current) {
        uploadJobs.push(uploadCandidateFile(saved.id, 'resume', uploads.resume));
      }
      if (uploads.introVideo) {
        uploadJobs.push(uploadCandidateFile(saved.id, 'intro-video', uploads.introVideo));
      }
      if (uploadJobs.length > 0) {
        await Promise.all(uploadJobs);
      }

      if (options.submit) {
        await submitForApproval.mutateAsync(saved.id);
        setSubmittedId(saved.id);
        show('Candidate submitted for approval');
        setTimeout(() => navigate(`${basePath}/candidates/${saved.id}`), 1200);
        return true;
      }

      if (!options.silent) {
        show(existingDraftId || isEdit ? 'Candidate updated' : 'Draft saved');
      }
      return true;
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        options.submit ? 'Failed to submit candidate' : 'Failed to save candidate',
      );
      setSubmitError(errorMessage);
      showError(errorMessage);
      return false;
    }
  }

  if (isEdit && existingQuery.isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading candidate…</div>
    );
  }

  if (isEdit && (existingQuery.isError || !existingQuery.data)) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to={`${basePath}/candidates`} className="mt-4 inline-flex text-sm text-brand">
          Back to candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-hidden bg-background">
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

      {message ? (
        <div
          className={`mx-5 mt-3 shrink-0 rounded-lg border px-4 py-2.5 text-sm sm:mx-6 ${
            variant === 'error'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
          {message}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col px-5 py-3 sm:px-6 sm:py-4">
        {submittedId !== null ? (
          <Card className="mx-auto w-full max-w-2xl self-center">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-emerald-600">Submitted for approval</p>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting to candidate profile…</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-5">
              <CandidateWizard
                key={isEdit ? `edit-${editId}-${initialFormValues ? 'ready' : 'loading'}` : 'new'}
                entryMethod="manual"
                initialTab="basic"
                initialFormValues={initialFormValues}
                draftCandidateId={draftCandidateId}
                onDraftCandidateId={(id) => {
                  resumeUploadedViaExtractRef.current = true;
                  setDraftId(id);
                }}
                onSaveDraft={(values, uploads, options) =>
                  persistCandidate(values, uploads, {
                    submit: false,
                    silent: options?.silent,
                  })
                }
                onSubmitForApproval={(values, uploads) =>
                  void persistCandidate(values, uploads, { submit: true })
                }
                onCancel={() =>
                  navigate(
                    isEdit
                      ? `${basePath}/candidates/${editId}`
                      : `${basePath}/candidates`,
                  )
                }
                onToast={show}
                submitError={submitError}
                isSavingDraft={create.isPending || update.isPending}
                isSubmitting={
                  create.isPending || update.isPending || submitForApproval.isPending
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
