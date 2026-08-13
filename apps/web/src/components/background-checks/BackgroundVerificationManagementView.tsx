import { cn, formatBgvCheckStatusesSummary, formatBgvStatusLabel, formatDate, BGV_PER_CHECK_STATUS_OPTIONS } from '@bestal/shared-utils';
import { Button, Dialog, FileUpload, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Check, Loader2, Plus, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import {
  useBackgroundCheckMutations,
  useBackgroundChecksList,
} from '../../hooks/api/useEvaluations';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useBgvAiJob } from '../../hooks/useBgvAiJob';
import { usePermissions } from '../../hooks/usePermissions';
import { queryKeys } from '../../hooks/api/query-keys';
import { AiScreeningStatusBanner } from '../candidates/AiScreeningStatusBanner';
import { mapBgvExtractionToForm } from '../../lib/api/ai/bgv-extraction.mapper';
import { getApiErrorMessage } from '../../lib/api/errors';
import { backgroundChecksApi } from '../../lib/api/evaluations';
import type { BackgroundCheckDto, BackgroundCheckListItem } from '../../lib/api/types';
import {
  BGV_WIZARD_STATUS_OPTIONS,
  mapWizardBgvStatusFromApi,
  mapWizardBgvStatusToApi,
} from '../forms/candidate-wizard-schema';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';
import {
  bgvStepIndex,
  getBgvStepsForDetail,
  getBgvWorkflowStep,
  isBgvWorkflowStepComplete,
  isImportedBgv,
  resolveBgvResultSummaryForDisplay,
  type BgvWorkflowStepId,
} from './bgv-workflow-steps';
import { ActionMenu } from '../ui/ActionMenu';

const BGV_TYPES = [
  'CRIMINAL',
  'EMPLOYMENT',
  'EDUCATION',
  'REFERENCE',
  'IDENTITY',
  'CREDIT',
  'COMPREHENSIVE',
] as const;

const BGV_EDIT_STATUS_OPTIONS = [
  ...BGV_WIZARD_STATUS_OPTIONS.filter((status) => status !== 'COMPLETED_CLEAR'),
  'CONSIDER',
  'CANCELLED',
] as const;

const BGV_CHECK_STATUS_OPTIONS = ['', ...BGV_PER_CHECK_STATUS_OPTIONS] as const;

type EditCheckField =
  | 'editIdCheckStatus'
  | 'editAddressCheckStatus'
  | 'editEmploymentCheckStatus'
  | 'editEducationCheckStatus'
  | 'editCriminalCheckStatus'
  | 'editReferenceCheckStatus';

const EDIT_CHECK_FIELDS: Array<{ key: EditCheckField; label: string }> = [
  { key: 'editIdCheckStatus', label: 'Identity' },
  { key: 'editAddressCheckStatus', label: 'Address' },
  { key: 'editEmploymentCheckStatus', label: 'Employment' },
  { key: 'editEducationCheckStatus', label: 'Education' },
  { key: 'editCriminalCheckStatus', label: 'Criminal' },
  { key: 'editReferenceCheckStatus', label: 'Reference' },
];

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso?.trim()) return '';
  return iso.slice(0, 10);
}

function dateInputToIso(date: string): string | null {
  const trimmed = date.trim();
  if (!trimmed) return null;
  return `${trimmed}T00:00:00.000Z`;
}

type BackgroundVerificationManagementViewProps = {
  title?: string;
  description?: string;
};

const defaultFilters = {
  status: 'all',
  type: 'all',
};

function StepRail({
  detail,
  currentStep,
}: {
  detail: BackgroundCheckDto;
  currentStep: BgvWorkflowStepId;
}) {
  const steps = getBgvStepsForDetail(detail);
  const currentIdx = bgvStepIndex(currentStep, detail);
  return (
    <ol className="flex flex-wrap gap-1.5">
      {steps.map((step, idx) => {
        const done = isBgvWorkflowStepComplete(detail, step.id);
        const active = step.id === currentStep;
        return (
          <li
            key={step.id}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              done && !active && 'border-emerald-200 bg-emerald-50 text-emerald-800',
              active && 'border-brand/40 bg-brand/10 text-foreground',
              !done && !active && 'border-border bg-muted/40 text-muted-foreground',
              idx > currentIdx && !done && 'opacity-70',
            )}
          >
            {done && !active ? <Check className="h-3 w-3" /> : <span>{idx + 1}.</span>}
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

export function BackgroundVerificationManagementView({
  title = 'Background Verification Management',
}: BackgroundVerificationManagementViewProps) {
  const { message, show, showError } = useDemoToast();
  const queryClient = useQueryClient();
  const { canUploadBgv } = usePermissions();
  const { searchInput, setSearchInput, search } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useBackgroundChecksList({
    limit: 100,
    sort: '-createdAt',
  });
  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const mutations = useBackgroundCheckMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [requestOpen, setRequestOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBgvId, setEditingBgvId] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editType, setEditType] = useState<string>('COMPREHENSIVE');
  const [editStatus, setEditStatus] = useState('');
  const [editVendorName, setEditVendorName] = useState('');
  const [editAiBgvSummary, setEditAiBgvSummary] = useState('');
  const [editConcernNotes, setEditConcernNotes] = useState('');
  const [editResultSummary, setEditResultSummary] = useState('');
  const [editIdCheckStatus, setEditIdCheckStatus] = useState('');
  const [editAddressCheckStatus, setEditAddressCheckStatus] = useState('');
  const [editEmploymentCheckStatus, setEditEmploymentCheckStatus] = useState('');
  const [editEducationCheckStatus, setEditEducationCheckStatus] = useState('');
  const [editCriminalCheckStatus, setEditCriminalCheckStatus] = useState('');
  const [editReferenceCheckStatus, setEditReferenceCheckStatus] = useState('');
  const [editInitiatedDate, setEditInitiatedDate] = useState('');
  const [editCompletedDate, setEditCompletedDate] = useState('');
  const [editExternalReferenceId, setEditExternalReferenceId] = useState('');
  const [editIsImported, setEditIsImported] = useState(false);
  const [editCandidateName, setEditCandidateName] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedType, setSelectedType] = useState<string>('COMPREHENSIVE');
  const [requestVendorName, setRequestVendorName] = useState('');
  const [aiBgvSummary, setAiBgvSummary] = useState('');
  const [concernNotes, setConcernNotes] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const {
    status: bgvAiStatus,
    errorMessage: bgvAiError,
    isRunning: extractingPdf,
    backgroundCheckId: draftBackgroundCheckId,
    runAnalysis: runBgvAnalysis,
    waitForReportAnalysis,
    runExtractAiForCheck,
    reset: resetBgvAi,
  } = useBgvAiJob();
  const [extractHint, setExtractHint] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pendingReportFile, setPendingReportFile] = useState<File | null>(null);
  const [pendingDetailReportFile, setPendingDetailReportFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<BackgroundCheckDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [busy, setBusy] = useState(false);

  const records = useMemo(() => data?.data ?? [], [data]);

  const candidateOptions = useMemo(
    () =>
      (candidatesData?.data ?? [])
        .filter((c) =>
          ['EVALUATION_COMPLETE', 'BGV_PENDING', 'BGV_COMPLETE', 'PROFILE_DRAFT'].includes(
            c.profileStatus ?? '',
          ),
        )
        .map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
        })),
    [candidatesData],
  );

  const statusOptions = useMemo(
    () => [...new Set(records.map((r) => r.status))].sort(),
    [records],
  );

  const typeOptions = useMemo(
    () => [...new Set(records.map((r) => r.type).filter(Boolean) as string[])].sort(),
    [records],
  );

  const filteredData = useMemo(() => {
    let rows = [...records];
    if (filters.status !== 'all') rows = rows.filter((r) => r.status === filters.status);
    if (filters.type !== 'all') rows = rows.filter((r) => r.type === filters.type);

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        [r.candidateName, r.provider, r.vendor].some((field) =>
          String(field ?? '').toLowerCase().includes(q),
        ),
      );
    }

    rows.sort((a, b) => {
      const aTime = new Date(a.initiatedAt ?? a.requestedAt ?? a.createdAt).getTime() || 0;
      const bTime = new Date(b.initiatedAt ?? b.requestedAt ?? b.createdAt).getTime() || 0;
      return bTime - aTime;
    });
    return rows;
  }, [records, filters, search]);

  const currentStep = detail ? getBgvWorkflowStep(detail) : 'consent';
  const detailIsImported = detail ? isImportedBgv(detail) : false;
  const awaitingAdmin = Boolean(
    detail &&
      (detail.status === 'CONSIDER' || detail.status === 'CLEAR' || detail.status === 'FAILED'),
  );
  const applyDetail = useCallback(
    (next: BackgroundCheckDto, options?: { resetLocalFields?: boolean }) => {
      setDetail(next);
      if (options?.resetLocalFields) {
        setVendorName(next.provider ?? '');
      } else if (next.provider) {
        setVendorName((current) => current.trim() || next.provider || '');
      }
    },
    [],
  );

  const openDetail = useCallback(
    async (id: number) => {
      setDetailLoading(true);
      try {
        const next = await backgroundChecksApi.get(id);
        applyDetail(next, { resetLocalFields: true });
      } catch (err) {
        showError(getApiErrorMessage(err, 'Failed to load verification'));
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [applyDetail, showError],
  );

  const run = useCallback(
    async (action: () => Promise<BackgroundCheckDto | unknown>, success: string) => {
      setBusy(true);
      try {
        const result = await action();
        show(success);
        if (result && typeof result === 'object' && 'id' in result && 'status' in result) {
          applyDetail(result as BackgroundCheckDto);
        } else if (detail) {
          applyDetail(await backgroundChecksApi.get(detail.id));
        }
      } catch (err) {
        showError(getApiErrorMessage(err, 'Action failed'));
      } finally {
        setBusy(false);
      }
    },
    [applyDetail, detail, show, showError],
  );

  const resetRequestForm = useCallback(() => {
    setSelectedCandidateId('');
    setSelectedType('COMPREHENSIVE');
    setRequestVendorName('');
    setAiBgvSummary('');
    setConcernNotes('');
    setResultSummary('');
    setExtractHint(null);
    setExtractError(null);
    setPendingReportFile(null);
    resetBgvAi();
  }, [resetBgvAi]);

  const resetEditForm = useCallback(() => {
    setEditingBgvId(null);
    setEditType('COMPREHENSIVE');
    setEditStatus('');
    setEditVendorName('');
    setEditAiBgvSummary('');
    setEditConcernNotes('');
    setEditResultSummary('');
    setEditIdCheckStatus('');
    setEditAddressCheckStatus('');
    setEditEmploymentCheckStatus('');
    setEditEducationCheckStatus('');
    setEditCriminalCheckStatus('');
    setEditReferenceCheckStatus('');
    setEditInitiatedDate('');
    setEditCompletedDate('');
    setEditExternalReferenceId('');
    setEditIsImported(false);
    setEditCandidateName('');
  }, []);

  const syncEditResultSummary = useCallback(
    (fields: {
      idCheckStatus: string;
      addressCheckStatus: string;
      employmentCheckStatus: string;
      educationCheckStatus: string;
      criminalCheckStatus: string;
      referenceCheckStatus: string;
    }) => {
      setEditResultSummary(
        formatBgvCheckStatusesSummary({
          idCheckStatus: fields.idCheckStatus || null,
          addressCheckStatus: fields.addressCheckStatus || null,
          employmentCheckStatus: fields.employmentCheckStatus || null,
          educationCheckStatus: fields.educationCheckStatus || null,
          criminalCheckStatus: fields.criminalCheckStatus || null,
          referenceCheckStatus: fields.referenceCheckStatus || null,
        }),
      );
    },
    [],
  );

  const updateEditCheckStatus = useCallback(
    (field: EditCheckField, value: string) => {
      const next = {
        editIdCheckStatus,
        editAddressCheckStatus,
        editEmploymentCheckStatus,
        editEducationCheckStatus,
        editCriminalCheckStatus,
        editReferenceCheckStatus,
        [field]: value,
      };
      switch (field) {
        case 'editIdCheckStatus':
          setEditIdCheckStatus(value);
          break;
        case 'editAddressCheckStatus':
          setEditAddressCheckStatus(value);
          break;
        case 'editEmploymentCheckStatus':
          setEditEmploymentCheckStatus(value);
          break;
        case 'editEducationCheckStatus':
          setEditEducationCheckStatus(value);
          break;
        case 'editCriminalCheckStatus':
          setEditCriminalCheckStatus(value);
          break;
        case 'editReferenceCheckStatus':
          setEditReferenceCheckStatus(value);
          break;
        default:
          break;
      }
      syncEditResultSummary({
        idCheckStatus: next.editIdCheckStatus,
        addressCheckStatus: next.editAddressCheckStatus,
        employmentCheckStatus: next.editEmploymentCheckStatus,
        educationCheckStatus: next.editEducationCheckStatus,
        criminalCheckStatus: next.editCriminalCheckStatus,
        referenceCheckStatus: next.editReferenceCheckStatus,
      });
    },
    [
      editAddressCheckStatus,
      editCriminalCheckStatus,
      editEducationCheckStatus,
      editEmploymentCheckStatus,
      editIdCheckStatus,
      editReferenceCheckStatus,
      syncEditResultSummary,
    ],
  );

  const openEditBgv = useCallback(
    async (record: BackgroundCheckListItem) => {
      setEditLoading(true);
      setEditOpen(true);
      try {
        const full = await backgroundChecksApi.get(record.id);
        setEditingBgvId(full.id);
        setEditCandidateName(full.candidateName);
        setEditIsImported(isImportedBgv(full));
        setEditType(full.type ?? 'COMPREHENSIVE');
        setEditStatus(mapWizardBgvStatusFromApi(full.status));
        setEditVendorName(full.provider ?? '');
        setEditAiBgvSummary(full.aiSummary ?? '');
        setEditConcernNotes(full.reviewNotes ?? '');
        setEditIdCheckStatus(full.idCheckStatus ?? '');
        setEditAddressCheckStatus(full.addressCheckStatus ?? '');
        setEditEmploymentCheckStatus(full.employmentCheckStatus ?? '');
        setEditEducationCheckStatus(full.educationCheckStatus ?? '');
        setEditCriminalCheckStatus(full.criminalCheckStatus ?? '');
        setEditReferenceCheckStatus(full.referenceCheckStatus ?? '');
        setEditInitiatedDate(toDateInputValue(full.initiatedAt));
        setEditCompletedDate(toDateInputValue(full.completedAt));
        setEditExternalReferenceId(full.externalReferenceId ?? '');
        setEditResultSummary(resolveBgvResultSummaryForDisplay(full));
      } catch (err) {
        showError(getApiErrorMessage(err, 'Failed to load background check'));
        setEditOpen(false);
        resetEditForm();
      } finally {
        setEditLoading(false);
      }
    },
    [resetEditForm, showError],
  );

  const handleEditSave = useCallback(async () => {
    if (editingBgvId == null) return;
    const checkFields = {
      idCheckStatus: editIdCheckStatus.trim() || null,
      addressCheckStatus: editAddressCheckStatus.trim() || null,
      employmentCheckStatus: editEmploymentCheckStatus.trim() || null,
      educationCheckStatus: editEducationCheckStatus.trim() || null,
      criminalCheckStatus: editCriminalCheckStatus.trim() || null,
      referenceCheckStatus: editReferenceCheckStatus.trim() || null,
    };
    const computedSummary = formatBgvCheckStatusesSummary(checkFields);
    try {
      await mutations.update.mutateAsync({
        id: editingBgvId,
        body: {
          type: editType,
          status: mapWizardBgvStatusToApi(editStatus) || undefined,
          provider: editVendorName.trim() || undefined,
          aiSummary: editAiBgvSummary.trim() || null,
          reviewNotes: editConcernNotes.trim() || null,
          resultSummary: computedSummary || editResultSummary.trim() || null,
          idCheckStatus: checkFields.idCheckStatus,
          addressCheckStatus: checkFields.addressCheckStatus,
          employmentCheckStatus: checkFields.employmentCheckStatus,
          educationCheckStatus: checkFields.educationCheckStatus,
          criminalCheckStatus: checkFields.criminalCheckStatus,
          referenceCheckStatus: checkFields.referenceCheckStatus,
          initiatedAt: dateInputToIso(editInitiatedDate),
          completedAt: dateInputToIso(editCompletedDate),
          externalReferenceId: editExternalReferenceId.trim() || null,
        },
      });
      show(`BGV updated — ${editCandidateName || 'candidate'}`);
      setEditOpen(false);
      resetEditForm();
      if (detail?.id === editingBgvId) {
        applyDetail(await backgroundChecksApi.get(editingBgvId), { resetLocalFields: true });
      }
    } catch (err) {
      showError(getApiErrorMessage(err, 'Save failed'));
    }
  }, [
    applyDetail,
    detail?.id,
    editAiBgvSummary,
    editCandidateName,
    editConcernNotes,
    editCriminalCheckStatus,
    editEducationCheckStatus,
    editEmploymentCheckStatus,
    editAddressCheckStatus,
    editIdCheckStatus,
    editReferenceCheckStatus,
    editInitiatedDate,
    editCompletedDate,
    editExternalReferenceId,
    editResultSummary,
    editStatus,
    editType,
    editVendorName,
    editingBgvId,
    mutations.update,
    resetEditForm,
    show,
    showError,
  ]);

  const handleBgvPdfUpload = useCallback(
    async (file: File) => {
      const candidateId = Number(selectedCandidateId);
      if (!candidateId) {
        setExtractError('Select a candidate before uploading the BGV report.');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
        setExtractError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
        return;
      }

      setExtractError(null);
      setExtractHint(null);
      setPendingReportFile(file);
      resetBgvAi();

      try {
        const result = await runBgvAnalysis(file, candidateId);
        if (!result) return;

        const patch = mapBgvExtractionToForm(result.extraction);
        if (!patch.aiBgvSummary) {
          throw new Error('AI did not return a background verification summary.');
        }

        if (patch.vendorName) setRequestVendorName(patch.vendorName);
        if (patch.checkType) setSelectedType(patch.checkType);
        if (patch.aiBgvSummary) setAiBgvSummary(patch.aiBgvSummary);
        if (patch.concernNotes) setConcernNotes(patch.concernNotes);
        if (patch.resultSummary) setResultSummary(patch.resultSummary);

        const confidence = Math.round(result.extraction.confidence * 100);
        const warningNote =
          result.extraction.warnings.length > 0 ? ` ${result.extraction.warnings[0]}` : '';
        const modeNote = result.liveAi
          ? ''
          : ' (demo/static AI — set AI_BGV_URL or n8n on the API)';

        setExtractHint(
          result.backgroundCheckId != null
            ? `BGV analyzed (${confidence}% confidence)${modeNote}. Review fields, then save to update the draft verification.${warningNote}`
            : `BGV extracted (${confidence}% confidence)${modeNote}. Review fields, then Request BGV.${warningNote}`,
        );
      } catch (err) {
        setExtractError(
          bgvAiError || getApiErrorMessage(err, 'BGV extraction failed'),
        );
        setPendingReportFile(null);
      }
    },
    [bgvAiError, resetBgvAi, runBgvAnalysis, selectedCandidateId],
  );

  const handleDetailReportUpload = useCallback(
    async (file: File) => {
      if (!detail) return;

      setPendingDetailReportFile(file);
      resetBgvAi();
      setBusy(true);

      try {
        const uploaded = await mutations.uploadDocument.mutateAsync({
          id: detail.id,
          kind: 'REPORT',
          file,
        });
        applyDetail(uploaded);

        const analyzed = await waitForReportAnalysis(detail.id, detail.candidateId);
        if (analyzed) {
          applyDetail(analyzed, { resetLocalFields: true });
          await queryClient.invalidateQueries({ queryKey: queryKeys.backgroundChecks.all });
          await queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
          show(
            'Report uploaded and analyzed — candidate BGV badge updated; admins notified. Review and submit for approval.',
          );
        }
      } catch (err) {
        showError(getApiErrorMessage(err, 'Report upload or AI analysis failed'));
      } finally {
        setBusy(false);
      }
    },
    [
      applyDetail,
      detail,
      mutations.uploadDocument,
      resetBgvAi,
      show,
      showError,
      queryClient,
      waitForReportAnalysis,
    ],
  );

  const handleRefreshAiSummary = useCallback(async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const refreshed = await runExtractAiForCheck(detail.id);
      if (refreshed) {
        applyDetail(refreshed, { resetLocalFields: true });
        await queryClient.invalidateQueries({ queryKey: queryKeys.backgroundChecks.all });
        await queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
        show('AI summary refreshed');
      }
    } catch (err) {
      showError(getApiErrorMessage(err, 'AI extraction failed'));
    } finally {
      setBusy(false);
    }
  }, [applyDetail, detail, queryClient, runExtractAiForCheck, show, showError]);

  const handleRequest = useCallback(async () => {
    const candidateId = Number(selectedCandidateId);
    if (!candidateId) {
      show('Select a candidate');
      return;
    }
    try {
      const payload = {
        candidateId,
        type: selectedType,
        ...(requestVendorName.trim() ? { provider: requestVendorName.trim() } : {}),
        ...(resultSummary.trim() ? { resultSummary: resultSummary.trim() } : {}),
        ...(aiBgvSummary.trim() ? { aiSummary: aiBgvSummary.trim() } : {}),
        ...(concernNotes.trim() ? { reviewNotes: concernNotes.trim() } : {}),
      };

      if (draftBackgroundCheckId != null && draftBackgroundCheckId > 0) {
        const { candidateId: _candidateId, type: _type, ...updateBody } = payload;
        await mutations.update.mutateAsync({
          id: draftBackgroundCheckId,
          body: updateBody,
        });
        show(`BGV updated — draft verification ${draftBackgroundCheckId}`);
        applyDetail(await backgroundChecksApi.get(draftBackgroundCheckId), {
          resetLocalFields: true,
        });
      } else {
        const created = await mutations.create.mutateAsync(payload);

        if (pendingReportFile) {
          try {
            await backgroundChecksApi.uploadDocument(created.id, 'REPORT', pendingReportFile);
          } catch {
            // Report upload is optional after create; workflow can upload later.
          }
        }

        show(`BGV requested — ${created.candidateName}`);
        applyDetail(await backgroundChecksApi.get(created.id), { resetLocalFields: true });
      }

      setRequestOpen(false);
      resetRequestForm();
    } catch (err) {
      showError(getApiErrorMessage(err, 'Request failed'));
    }
  }, [
    aiBgvSummary,
    applyDetail,
    concernNotes,
    draftBackgroundCheckId,
    mutations.create,
    mutations.update,
    pendingReportFile,
    requestVendorName,
    resetRequestForm,
    resultSummary,
    selectedCandidateId,
    selectedType,
    show,
    showError,
  ]);

  const columns = useMemo<ColumnDef<BackgroundCheckListItem>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'provider',
        header: 'Provider',
        cell: ({ row }) => <span>{row.original.provider ?? row.original.vendor ?? '—'}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const val = getValue() as string | undefined;
          return val ? <StatusBadge status={val} /> : <span className="text-muted-foreground">—</span>;
        },
      },
      {
        id: 'initiated',
        header: 'Initiated',
        cell: ({ row }) => {
          const val = row.original.initiatedAt ?? row.original.requestedAt;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'completedAt',
        header: 'Completed',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ActionMenu
            label="BGV actions"
            items={[
              {
                id: 'open',
                label: 'Open workflow',
                onSelect: () => void openDetail(row.original.id),
              },
              {
                id: 'edit',
                label: 'Edit',
                hidden: !canUploadBgv,
                separatorBefore: true,
                onSelect: () => void openEditBgv(row.original),
              },
              {
                id: 'download',
                label: 'Download report',
                hidden: !row.original.documentId,
                separatorBefore: true,
                onSelect: () =>
                  void backgroundChecksApi
                    .downloadReport(row.original.id)
                    .catch((err) => showError(getApiErrorMessage(err, 'Download failed'))),
              },
            ]}
          />
        ),
      },
    ],
    [canUploadBgv, openDetail, openEditBgv, showError],
  );

  const listError = isError
    ? error instanceof Error
      ? error.message
      : 'Failed to load background checks'
    : null;

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        error={listError}
        loading={isLoading}
        loadingLabel="Loading background checks…"
      >
        <TanStackDataTable
          key={search}
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate or provider…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          toolbar={
            canUploadBgv ? (
              <Button size="sm" onClick={() => setRequestOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Request BGV
              </Button>
            ) : undefined
          }
          filters={
            <ListingFiltersRow>
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                options={[
                  { value: 'all', label: 'All statuses' },
                  ...statusOptions.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
                ]}
              />
              <ListingFilterSelect
                label="TYPE"
                value={filters.type}
                onChange={(v) => setFilters((prev) => ({ ...prev, type: v }))}
                options={[
                  { value: 'all', label: 'All types' },
                  ...typeOptions.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
                ]}
              />
            </ListingFiltersRow>
          }
        />
      </ListingPageShell>

      <Dialog
        open={requestOpen}
        onClose={() => {
          if (extractingPdf) return;
          setRequestOpen(false);
        }}
        title="Request background verification"
        description="Upload a BGV report to auto-fill fields via AI, or enter details manually."
        scrollable
        className="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestOpen(false)}
              disabled={extractingPdf}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleRequest()} disabled={extractingPdf}>
              Request BGV
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div className="space-y-2">
                <p>
                  Upload a PDF/Word BGV report. When n8n is configured, BesTal triggers{' '}
                  <code className="rounded bg-white/80 px-1">BESTAL_BGV_AI_ANALYSIS</code> to extract
                  check statuses and summary. Otherwise the API uses the legacy Python extractor or
                  demo stub.
                </p>
                <p className="text-xs">
                  Flow: report uploaded → n8n extracts text → AI check statuses → BGV record updated →
                  candidate badge synced → admin notified.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Candidate & document</h3>
            <div className="space-y-2">
              <label htmlFor="bgv-candidate" className="text-sm font-medium">
                Candidate *
              </label>
              <Select
                id="bgv-candidate"
                className="h-10"
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
              >
                <option value="">— Select —</option>
                {candidateOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <FileUpload
              label="Upload BGV report PDF"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint={
                extractingPdf
                  ? 'Extracting BGV fields via AI…'
                  : 'PDF or Word · select candidate first'
              }
              onFileSelect={(file) => {
                if (!extractingPdf) void handleBgvPdfUpload(file);
              }}
            />
            {extractingPdf && (
              <div className="space-y-2">
                <AiScreeningStatusBanner
                  context="bgv"
                  status={bgvAiStatus}
                  errorMessage={bgvAiError}
                  onRetry={
                    bgvAiStatus === 'FAILED' && pendingReportFile
                      ? () => void handleBgvPdfUpload(pendingReportFile)
                      : undefined
                  }
                />
              </div>
            )}
            {extractError && bgvAiStatus !== 'FAILED' ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {extractError}
              </div>
            ) : null}
            {extractHint ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {extractHint}
              </div>
            ) : null}
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground">BGV details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="bgv-type" className="text-sm font-medium">
                  Check type *
                </label>
                <Select
                  id="bgv-type"
                  className="h-10"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {BGV_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="bgv-vendor" className="text-sm font-medium">
                  Vendor name
                </label>
                <Input
                  id="bgv-vendor"
                  value={requestVendorName}
                  onChange={(e) => setRequestVendorName(e.target.value)}
                  placeholder="e.g. VerifyCorp Screening"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-result-summary" className="text-sm font-medium">
                Check statuses summary
              </label>
              <textarea
                id="bgv-result-summary"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                placeholder="Per-check statuses from AI extraction"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-ai-summary" className="text-sm font-medium">
                AI BGV summary
              </label>
              <textarea
                id="bgv-ai-summary"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={aiBgvSummary}
                onChange={(e) => setAiBgvSummary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-concerns" className="text-sm font-medium">
                Concern notes
              </label>
              <textarea
                id="bgv-concerns"
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={concernNotes}
                onChange={(e) => setConcernNotes(e.target.value)}
              />
            </div>
          </section>
        </div>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          resetEditForm();
        }}
        title={editCandidateName ? `Edit BGV — ${editCandidateName}` : 'Edit background verification'}
        description="Update verification metadata, status, and summaries."
        scrollable
        className="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                resetEditForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleEditSave()}
              disabled={editLoading || editingBgvId == null}
            >
              Save changes
            </Button>
          </>
        }
      >
        {editLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="bgv-edit-type" className="text-sm font-medium">
                  Check type
                </label>
                <Select
                  id="bgv-edit-type"
                  className="h-10"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  {BGV_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="bgv-edit-status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  id="bgv-edit-status"
                  className="h-10"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {BGV_EDIT_STATUS_OPTIONS.includes(
                    editStatus as (typeof BGV_EDIT_STATUS_OPTIONS)[number],
                  ) ? null : (
                    <option value={editStatus}>{formatBgvStatusLabel(editStatus)}</option>
                  )}
                  {BGV_EDIT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatBgvStatusLabel(status)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="bgv-edit-vendor" className="text-sm font-medium">
                  Vendor / provider
                </label>
                <Input
                  id="bgv-edit-vendor"
                  value={editVendorName}
                  onChange={(e) => setEditVendorName(e.target.value)}
                  placeholder="e.g. Checkr, Sterling"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bgv-edit-initiated" className="text-sm font-medium">
                  Initiated date
                </label>
                <Input
                  id="bgv-edit-initiated"
                  type="date"
                  value={editInitiatedDate}
                  onChange={(e) => setEditInitiatedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bgv-edit-completed" className="text-sm font-medium">
                  Completed date
                </label>
                <Input
                  id="bgv-edit-completed"
                  type="date"
                  value={editCompletedDate}
                  onChange={(e) => setEditCompletedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="bgv-edit-external-ref" className="text-sm font-medium">
                  External reference ID
                </label>
                <Input
                  id="bgv-edit-external-ref"
                  value={editExternalReferenceId}
                  onChange={(e) => setEditExternalReferenceId(e.target.value)}
                  placeholder="Vendor case / reference number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Per-check statuses</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {EDIT_CHECK_FIELDS.map(({ key, label }) => {
                  const value =
                    key === 'editIdCheckStatus'
                      ? editIdCheckStatus
                      : key === 'editAddressCheckStatus'
                        ? editAddressCheckStatus
                        : key === 'editEmploymentCheckStatus'
                          ? editEmploymentCheckStatus
                          : key === 'editEducationCheckStatus'
                            ? editEducationCheckStatus
                            : key === 'editCriminalCheckStatus'
                              ? editCriminalCheckStatus
                              : editReferenceCheckStatus;
                  return (
                    <div key={key} className="space-y-2">
                      <label htmlFor={`bgv-edit-${key}`} className="text-sm font-medium">
                        {label}
                      </label>
                      <Select
                        id={`bgv-edit-${key}`}
                        className="h-10"
                        value={value}
                        onChange={(e) => updateEditCheckStatus(key, e.target.value)}
                      >
                        {!BGV_CHECK_STATUS_OPTIONS.includes(
                          value as (typeof BGV_CHECK_STATUS_OPTIONS)[number],
                        ) && value ? (
                          <option value={value}>{formatBgvStatusLabel(value)}</option>
                        ) : null}
                        {BGV_CHECK_STATUS_OPTIONS.map((status) => (
                          <option key={status || 'empty'} value={status}>
                            {status ? formatBgvStatusLabel(status) : '—'}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-edit-result-summary" className="text-sm font-medium">
                Check statuses summary
              </label>
              <textarea
                id="bgv-edit-result-summary"
                rows={4}
                readOnly
                className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm"
                value={editResultSummary}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from per-check statuses when you save.
              </p>
            </div>
            {!editIsImported ? (
              <div className="space-y-2">
                <label htmlFor="bgv-edit-ai-summary" className="text-sm font-medium">
                  AI BGV summary
                </label>
                <textarea
                  id="bgv-edit-ai-summary"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editAiBgvSummary}
                  onChange={(e) => setEditAiBgvSummary(e.target.value)}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <label htmlFor="bgv-edit-concerns" className="text-sm font-medium">
                Concern notes
              </label>
              <textarea
                id="bgv-edit-concerns"
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editConcernNotes}
                onChange={(e) => setEditConcernNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={Boolean(detail) || detailLoading}
        onClose={() => {
          if (busy || extractingPdf) return;
          setDetail(null);
          setPendingDetailReportFile(null);
          resetBgvAi();
        }}
        title={detail ? `BGV — ${detail.candidateName}` : 'Background verification'}
        className="max-w-2xl"
      >
        {detailLoading || !detail ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              {detail.type ? <StatusBadge status={detail.type} /> : null}
            </div>

            {canUploadBgv && (
              <StepRail detail={detail} currentStep={currentStep} />
            )}

            {canUploadBgv && !awaitingAdmin ? (
              <section className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
                {detailIsImported && currentStep === 'review' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">Review imported BGV</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Imported BGV — update fields manually via Edit BGV. Candidate approval
                        happens in the Approvals queue.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Vendor:</span>{' '}
                        {detail.provider || '—'}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Status:</span>{' '}
                        <StatusBadge status={detail.status} />
                      </p>
                    </div>
                    {resolveBgvResultSummaryForDisplay(detail) ? (
                      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Check statuses
                        </p>
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-foreground">
                          {resolveBgvResultSummaryForDisplay(detail)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No check statuses yet. Open Edit BGV to add per-check results.
                      </p>
                    )}
                    {detail.reviewNotes?.trim() ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                          Concern notes
                        </p>
                        <p className="mt-1 text-sm text-amber-900">{detail.reviewNotes}</p>
                      </div>
                    ) : null}

                    <div className="space-y-3 border-t border-border/60 pt-4">
                      <h4 className="text-sm font-semibold">Documents</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload consent, supporting documents, or the final BGV report. Files are
                        stored without AI analysis for imported candidates.
                      </p>
                      {(detail.documents?.length ?? 0) > 0 ? (
                        <ul className="space-y-1 rounded-lg border border-border/70 bg-background p-3 text-sm">
                          {detail.documents?.map((doc) => (
                            <li key={doc.id} className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{doc.description ?? 'Document'}:</span>
                              {doc.url ? (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-brand hover:underline"
                                >
                                  {doc.originalName}
                                </a>
                              ) : (
                                <span>{doc.originalName}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                      )}
                      <div className="grid gap-4 lg:grid-cols-3">
                        <FileUpload
                          key="imported-consent-upload"
                          label="Consent form"
                          accept=".pdf,.doc,.docx"
                          hint="PDF or Word"
                          onFileSelect={(file) =>
                            void run(
                              () =>
                                mutations.uploadDocument.mutateAsync({
                                  id: detail.id,
                                  kind: 'CONSENT',
                                  file,
                                }),
                              'Consent document uploaded',
                            )
                          }
                        />
                        <FileUpload
                          key="imported-supporting-upload"
                          label="Supporting document"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          hint="PDF, Word, or image"
                          onFileSelect={(file) =>
                            void run(
                              () =>
                                mutations.uploadDocument.mutateAsync({
                                  id: detail.id,
                                  kind: 'SUPPORTING',
                                  file,
                                }),
                              'Supporting document uploaded',
                            )
                          }
                        />
                        <FileUpload
                          key="imported-report-upload"
                          label="BGV report"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          hint="PDF or Word"
                          onFileSelect={(file) =>
                            void run(
                              () =>
                                mutations.uploadDocument.mutateAsync({
                                  id: detail.id,
                                  kind: 'REPORT',
                                  file,
                                }),
                              'BGV report uploaded',
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          Consent: {detail.hasConsentDocument ? 'On file' : 'Not uploaded'}
                        </span>
                        <span>
                          Supporting: {detail.supportingDocumentCount ?? 0} document
                          {(detail.supportingDocumentCount ?? 0) === 1 ? '' : 's'}
                        </span>
                        <span>Report: {detail.hasReportDocument ? 'On file' : 'Not uploaded'}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const row = records.find((r) => r.id === detail.id);
                        if (row) void openEditBgv(row);
                      }}
                    >
                      Edit BGV
                    </Button>
                  </>
                )}

                {!detailIsImported && currentStep === 'consent' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">1. Confirm candidate consent</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Confirm consent first. Optionally upload a signed consent form.
                      </p>
                    </div>
                    <FileUpload
                      key="consent-upload"
                      label="Consent form (optional)"
                      accept=".pdf,.doc,.docx"
                      hint="PDF or Word"
                      onFileSelect={(file) =>
                        void run(
                          () =>
                            mutations.uploadDocument.mutateAsync({
                              id: detail.id,
                              kind: 'CONSENT',
                              file,
                            }),
                          'Consent document uploaded',
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => mutations.confirmConsent.mutateAsync(detail.id),
                          'Consent confirmed — continue to Docs',
                        )
                      }
                    >
                      {busy ? 'Working…' : 'Confirm consent'}
                    </Button>
                  </>
                )}

                {!detailIsImported && currentStep === 'docs' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">2. Upload supporting documents</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload at least one supporting document to unlock Vendor.
                        {' '}Currently: {detail.supportingDocumentCount ?? 0}
                      </p>
                    </div>
                    <FileUpload
                      key="supporting-upload"
                      label="Supporting document"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      hint="PDF, Word, or image"
                      onFileSelect={(file) =>
                        void run(
                          () =>
                            mutations.uploadDocument.mutateAsync({
                              id: detail.id,
                              kind: 'SUPPORTING',
                              file,
                            }),
                          'Supporting document uploaded',
                        )
                      }
                    />
                  </>
                )}

                {!detailIsImported && currentStep === 'vendor' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">3. Assign verification vendor</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose the vendor that will run the background check.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="bgv-vendor">
                        Vendor name *
                      </label>
                      <Input
                        id="bgv-vendor"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="e.g. Checkr, Sterling"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy || !vendorName.trim()}
                      onClick={() =>
                        void run(
                          () =>
                            mutations.assignVendor.mutateAsync({
                              id: detail.id,
                              provider: vendorName.trim(),
                            }),
                          'Vendor assigned — continue to Start',
                        )
                      }
                    >
                      {busy ? 'Working…' : 'Assign vendor'}
                    </Button>
                  </>
                )}

                {!detailIsImported && currentStep === 'start' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">4. Start verification</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Vendor <strong>{detail.provider}</strong> is assigned. Mark verification in
                        progress.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => mutations.startVerification.mutateAsync(detail.id),
                          'Verification started — upload the final report next',
                        )
                      }
                    >
                      {busy ? 'Working…' : 'Start verification'}
                    </Button>
                  </>
                )}

                {!detailIsImported && currentStep === 'report' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">5. Upload final BGV report</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload the vendor&apos;s final report. AI analysis starts automatically and
                        updates the candidate BGV badge when complete.
                      </p>
                    </div>
                    <FileUpload
                      key="report-upload"
                      label="Final BGV report"
                      accept=".pdf,.doc,.docx"
                      hint={
                        extractingPdf || busy
                          ? 'Uploading and analyzing report…'
                          : 'PDF or Word — triggers n8n AI when configured'
                      }
                      onFileSelect={(file) => {
                        if (!extractingPdf && !busy) void handleDetailReportUpload(file);
                      }}
                    />
                    {(extractingPdf || busy) && (
                      <AiScreeningStatusBanner
                        context="bgv"
                        status={bgvAiStatus ?? (busy ? 'PROCESSING' : null)}
                        errorMessage={bgvAiError}
                        onRetry={
                          bgvAiStatus === 'FAILED' && pendingDetailReportFile
                            ? () => void handleDetailReportUpload(pendingDetailReportFile)
                            : undefined
                        }
                        retrying={busy}
                      />
                    )}
                  </>
                )}

                {!detailIsImported && currentStep === 'ai' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">6. Review AI extraction</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Check statuses were extracted from the report. Review the summary and update
                        fields as needed — candidate approval happens in the Approvals queue.
                      </p>
                    </div>
                    {extractingPdf && (
                      <AiScreeningStatusBanner
                        context="bgv"
                        status={bgvAiStatus}
                        errorMessage={bgvAiError}
                      />
                    )}
                    {detail.resultSummary?.trim() ? (
                      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Check statuses
                        </p>
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-foreground">
                          {detail.resultSummary}
                        </pre>
                      </div>
                    ) : null}
                    <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-background p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                      {detail.aiSummary?.trim() ||
                        'No AI summary yet. Upload a report or click Refresh AI summary.'}
                    </pre>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy || extractingPdf || !detail.hasReportDocument}
                        onClick={() => void handleRefreshAiSummary()}
                      >
                        Refresh AI summary
                      </Button>
                    </div>
                  </>
                )}
              </section>
            ) : null}

            {detail.reviewNotes ? (
              <section className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <h3 className="text-sm font-semibold text-amber-900">Notes</h3>
                <p className="text-sm text-amber-900">{detail.reviewNotes}</p>
              </section>
            ) : null}

            {!canUploadBgv ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Status: <StatusBadge status={detail.status} />
                </p>
                <p>Vendor: {detail.provider || '—'}</p>
                <p>Completed: {detail.completedAt ? formatDate(detail.completedAt) : '—'}</p>
                {detail.aiSummary ? <p>AI summary: {detail.aiSummary}</p> : null}
              </div>
            ) : null}
          </div>
        )}
      </Dialog>
    </>
  );
}
