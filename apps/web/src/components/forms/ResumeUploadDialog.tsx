import { Button, Dialog, FileUpload } from '@bestal/ui';
import { AlertCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { AiScreeningStatusBanner } from '../candidates/AiScreeningStatusBanner';
import { useSkillCommunitiesList } from '../../hooks/api/useSkillCommunities';
import { useAiScreeningJob } from '../../hooks/useAiScreeningJob';
import { getApiErrorMessage } from '../../lib/api/errors';
import { applyResumeExtractionToWizardForm } from '../../lib/api/ai/resume-extraction.mapper';
import type {
  CandidateWizardFormValues,
  CandidateWizardUploads,
} from './candidate-wizard-schema';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function isAcceptedResume(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && ['pdf', 'doc', 'docx'].includes(ext)) return true;
  return ACCEPTED_TYPES.includes(file.type);
}

type ResumeUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (
    file: File,
    formValues: Partial<CandidateWizardFormValues>,
    uploads: CandidateWizardUploads,
    message: string,
    draftCandidateId: number,
  ) => void;
};

export function ResumeUploadDialog({ open, onClose, onSuccess }: ResumeUploadDialogProps) {
  const { data: skillCommunities = [], isLoading: communitiesLoading } = useSkillCommunitiesList();
  const screening = useAiScreeningJob();
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (screening.isRunning) return;
    setFileName(null);
    setPendingFile(null);
    setError(null);
    screening.reset();
    onClose();
  }

  async function runWithFile(file: File) {
    if (!isAcceptedResume(file)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }
    if (skillCommunities.length === 0) {
      setError('Skill communities are not available. Run database seed before importing resumes.');
      return;
    }

    setFileName(file.name);
    setPendingFile(file);
    setError(null);

    try {
      const result = await screening.runScreening(file);
      if (!result) return;

      const formValues = applyResumeExtractionToWizardForm(
        result.extraction,
        skillCommunities,
        file.name,
      );

      if (!formValues.firstName?.trim() || !formValues.lastName?.trim()) {
        throw new Error('Could not extract candidate name from this resume.');
      }
      if (!formValues.email?.trim()) {
        throw new Error('Could not extract an email address. Try another file or use Manual Entry.');
      }

      const confidence = Math.round(result.extraction.confidence * 100);
      const scoreNote =
        result.extraction.bestalScore != null
          ? ` BesTal score ${result.extraction.bestalScore}.`
          : '';
      const warningNote =
        result.extraction.warnings.length > 0 ? ` ${result.extraction.warnings[0]}` : '';

      onSuccess(
        file,
        formValues,
        { resume: file },
        `Resume saved & AI screening complete (${confidence}% confidence). Draft #${result.candidate.id} created.${scoreNote} Review before submitting.${warningNote}`,
        result.candidate.id,
      );

      setFileName(null);
      setPendingFile(null);
      setError(null);
      screening.reset();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Resume extraction failed'));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Upload resume"
      className="max-w-lg"
      footer={
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={screening.isRunning}
        >
          Cancel
        </Button>
      }
    >
      <div className="space-y-4">
        {communitiesLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            Loading skill communities…
          </div>
        ) : (
          <FileUpload
            label="Resume file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hint={
              screening.isRunning
                ? 'Uploading & running AI screening…'
                : 'PDF or Word · max 10 MB'
            }
            onFileSelect={(file) => {
              if (!screening.isRunning) void runWithFile(file);
            }}
          />
        )}

        <AiScreeningStatusBanner
          status={screening.status}
          errorMessage={screening.errorMessage ?? error}
          retrying={screening.isRunning}
          onRetry={
            pendingFile && screening.status === 'FAILED'
              ? () => void runWithFile(pendingFile)
              : undefined
          }
        />

        {fileName && !screening.isRunning && screening.status !== 'FAILED' && !error ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <FileText className="h-4 w-4" />
            Selected: {fileName}
          </div>
        ) : null}

        {error && screening.status !== 'FAILED' ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
