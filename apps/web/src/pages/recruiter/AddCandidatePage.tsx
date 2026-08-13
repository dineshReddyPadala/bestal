import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, useDashboardHeaderLeading } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CandidateWizard,
  type CandidateWizardMode,
} from '../../components/forms/CandidateWizard';
import type {
  CandidateWizardFormValues,
  CandidateWizardUploads,
  CandidateWizardValues,
} from '../../components/forms/candidate-wizard-schema';
import {
  mapCandidateDtoToWizardForm,
  mapWizardToApiCreateBody,
  mapWizardToBgvUpdateBody,
  mapWizardToEvaluationUpdateBody,
} from '../../components/forms/candidate-wizard-schema';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useCandidate, useCandidateMutations } from '../../hooks/api/useCandidates';
import { getApiErrorMessage } from '../../lib/api/errors';
import { uploadCandidateFile } from '../../lib/api/candidates';
import { backgroundChecksApi, evaluationsApi } from '../../lib/api';
import { ToastHost } from '../../components/ui/ToastHost';

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/super-admin')) return '/super-admin';
  if (pathname.startsWith('/admin')) return '/admin';
  return '/recruiter';
}

function resolveWizardMode(
  basePath: string,
  isEdit: boolean,
  role: string | undefined,
  sourceCandidateId: string | null | undefined,
): CandidateWizardMode {
  if (basePath === '/super-admin') {
    return 'superAdminCreate';
  }
  if (isEdit && (role === 'ADMIN' || role === 'RECRUITER') && sourceCandidateId?.trim()) {
    return 'importedEdit';
  }
  return 'superAdminCreate';
}

export function AddCandidatePage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const editId = routeId && routeId !== 'new' ? Number(routeId) : 0;
  const isEdit = editId > 0;
  const basePath = usePortalBasePath();
  const { user } = useAuth();
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
  const [formRevision, setFormRevision] = useState(0);
  const draftCandidateIdRef = useRef<number | null>(isEdit ? editId : null);
  const resumeUploadedViaExtractRef = useRef(false);

  const isImportOnlyRole = user?.role === 'ADMIN' || user?.role === 'RECRUITER';
  const importPath = `${basePath}/candidates/import`;

  const wizardMode = useMemo(
    () =>
      resolveWizardMode(
        basePath,
        isEdit,
        user?.role,
        existingQuery.data?.sourceCandidateId,
      ),
    [basePath, isEdit, user?.role, existingQuery.data?.sourceCandidateId],
  );

  useEffect(() => {
    if (!isEdit && isImportOnlyRole) {
      navigate(importPath, { replace: true });
    }
  }, [isEdit, isImportOnlyRole, importPath, navigate]);

  useEffect(() => {
    if (!isEdit || !existingQuery.data) return;

    setDraftId(existingQuery.data.id);

    if (wizardMode !== 'importedEdit') {
      setInitialFormValues(mapCandidateDtoToWizardForm(existingQuery.data));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const candidateId = existingQuery.data!.id;
        const [evalRes, bgvRes] = await Promise.all([
          evaluationsApi.list({ candidateId, limit: 1, sort: '-createdAt' }),
          backgroundChecksApi.list({ candidateId, limit: 1, sort: '-createdAt' }),
        ]);
        const bgvListItem = bgvRes.data[0];
        const bgvDetail =
          bgvListItem != null ? await backgroundChecksApi.get(bgvListItem.id) : null;
        if (cancelled) return;
        setInitialFormValues(
          mapCandidateDtoToWizardForm(existingQuery.data!, {
            evaluation: evalRes.data[0] ?? null,
            bgv: bgvDetail,
          }),
        );
      } catch {
        if (!cancelled) {
          setInitialFormValues(mapCandidateDtoToWizardForm(existingQuery.data!));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, existingQuery.data, wizardMode]);

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
          {isEdit
            ? wizardMode === 'importedEdit'
              ? 'Edit Imported Candidate'
              : 'Edit Candidate'
            : 'Add Candidate'}
        </h1>
      </div>
    ),
    [basePath, editId, isEdit, wizardMode],
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
        uploads.profileImage = undefined;
        uploads.resume = undefined;
        uploads.introVideo = undefined;
      }

      if (wizardMode === 'importedEdit') {
        const linkedUpdates: Promise<unknown>[] = [];
        if (values.evaluationId) {
          linkedUpdates.push(
            evaluationsApi.update(
              values.evaluationId,
              mapWizardToEvaluationUpdateBody(values),
            ),
          );
        }
        if (values.bgvBackgroundCheckId) {
          linkedUpdates.push(
            backgroundChecksApi.update(
              values.bgvBackgroundCheckId,
              mapWizardToBgvUpdateBody(values),
            ),
          );
        }
        if (linkedUpdates.length > 0) {
          await Promise.all(linkedUpdates);
        }

        if (values.bgvBackgroundCheckId) {
          const bgvUploads: Promise<unknown>[] = [];
          if (uploads.bgvConsentFile) {
            bgvUploads.push(
              backgroundChecksApi.uploadDocument(
                values.bgvBackgroundCheckId,
                'CONSENT',
                uploads.bgvConsentFile,
              ),
            );
          }
          if (uploads.bgvSupportingFile) {
            bgvUploads.push(
              backgroundChecksApi.uploadDocument(
                values.bgvBackgroundCheckId,
                'SUPPORTING',
                uploads.bgvSupportingFile,
              ),
            );
          }
          if (uploads.bgvFile) {
            bgvUploads.push(
              backgroundChecksApi.uploadDocument(
                values.bgvBackgroundCheckId,
                'REPORT',
                uploads.bgvFile,
              ),
            );
          }
          if (bgvUploads.length > 0) {
            await Promise.all(bgvUploads);
            uploads.bgvConsentFile = undefined;
            uploads.bgvSupportingFile = undefined;
            uploads.bgvFile = undefined;
          }
        }

        if (values.evaluationId && uploads.evaluationFile) {
          await evaluationsApi.uploadDocument(values.evaluationId, uploads.evaluationFile);
          uploads.evaluationFile = undefined;
        }
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

      if (isEdit) {
        const refreshed = await existingQuery.refetch();
        if (refreshed.data) {
          if (wizardMode === 'importedEdit') {
            const [evalRes, bgvRes] = await Promise.all([
              evaluationsApi.list({ candidateId: refreshed.data.id, limit: 1, sort: '-createdAt' }),
              backgroundChecksApi.list({ candidateId: refreshed.data.id, limit: 1, sort: '-createdAt' }),
            ]);
            const bgvListItem = bgvRes.data[0];
            const bgvDetail =
              bgvListItem != null ? await backgroundChecksApi.get(bgvListItem.id) : null;
            setInitialFormValues(
              mapCandidateDtoToWizardForm(refreshed.data, {
                evaluation: evalRes.data[0] ?? null,
                bgv: bgvDetail,
              }),
            );
          } else {
            setInitialFormValues(mapCandidateDtoToWizardForm(refreshed.data));
          }
          setFormRevision((v) => v + 1);
        }
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

  if (!isEdit && isImportOnlyRole) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Redirecting to import…</div>
    );
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

  if (
    isEdit &&
    isImportOnlyRole &&
    !existingQuery.data?.sourceCandidateId?.trim()
  ) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Only imported candidates can be edited here. Use Import Candidates to add new profiles.
        </p>
        <Link to={importPath} className="mt-4 mr-4 inline-flex text-sm text-brand">
          Import candidates
        </Link>
        <Link to={`${basePath}/candidates/${editId}`} className="mt-4 inline-flex text-sm text-brand">
          View candidate
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-var(--shell-header-h))] min-h-0 flex-col overflow-hidden bg-background">
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

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
                key={isEdit ? `edit-${editId}-${formRevision}` : 'new'}
                entryMethod="manual"
                initialTab="basic"
                freshStart={!isEdit}
                wizardMode={wizardMode}
                initialFormValues={initialFormValues}
                draftCandidateId={draftCandidateId}
                onDraftCandidateId={(id) => {
                  resumeUploadedViaExtractRef.current = true;
                  setDraftId(id);
                }}
                isEditMode={isEdit}
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
