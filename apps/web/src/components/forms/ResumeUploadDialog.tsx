import { cn } from '@bestal/shared-utils';
import { Button, Dialog, FileUpload } from '@bestal/ui';
import { AlertCircle, FileText, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useSkillCommunitiesList } from '../../hooks/api/useSkillCommunities';
import { applyResumeExtractionToWizardForm } from '../../lib/api/ai/resume-extraction.mapper';
import { extractResumeFromFile } from '../../lib/api/ai/resume-extraction.stub';
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
  ) => void;
};

export function ResumeUploadDialog({ open, onClose, onSuccess }: ResumeUploadDialogProps) {
  const { data: skillCommunities = [], isLoading: communitiesLoading } = useSkillCommunitiesList();
  const [fileName, setFileName] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (extracting) return;
    setFileName(null);
    setError(null);
    onClose();
  }

  async function handleFileSelect(file: File) {
    if (!isAcceptedResume(file)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }
    if (skillCommunities.length === 0) {
      setError('Skill communities are not available. Run database seed before importing resumes.');
      return;
    }

    setFileName(file.name);
    setError(null);
    setExtracting(true);

    try {
      const extraction = await extractResumeFromFile(file);
      const formValues = applyResumeExtractionToWizardForm(
        extraction,
        skillCommunities,
        file.name,
      );

      if (!formValues.firstName?.trim() || !formValues.lastName?.trim()) {
        throw new Error('Could not extract candidate name from this resume.');
      }
      if (!formValues.email?.trim()) {
        throw new Error('Could not extract an email address. Try another file or use Manual Entry.');
      }

      const confidence = Math.round(extraction.confidence * 100);
      const warningNote =
        extraction.warnings.length > 0 ? ` ${extraction.warnings[0]}` : '';

      onSuccess(
        file,
        formValues,
        { resume: file },
        `Resume extracted (${confidence}% confidence). Review all sections before submitting.${warningNote}`,
      );

      setFileName(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume extraction failed');
    } finally {
      setExtracting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Upload resume"
      description="Upload a PDF or Word resume. BesTal will extract profile details and pre-fill the candidate form."
      className="max-w-lg"
      footer={
        <Button type="button" variant="outline" onClick={handleClose} disabled={extracting}>
          Cancel
        </Button>
      }
    >
      <div className="space-y-4">
        <div
          className={cn(
            'rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-muted-foreground',
            extracting && 'opacity-80',
          )}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p>
              {import.meta.env.VITE_AI_EXTRACTION_URL
                ? 'Connected to the AI resume extraction service. Fields will be filled automatically after upload.'
                : 'AI extraction URL is not configured — demo data will be used to pre-fill the form.'}
            </p>
          </div>
        </div>

        {communitiesLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading skill communities…
          </div>
        ) : (
          <FileUpload
            label="Resume file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hint={extracting ? 'Extracting…' : 'PDF or Word · max 10 MB'}
            onFileSelect={(file) => {
              if (!extracting) void handleFileSelect(file);
            }}
          />
        )}

        {extracting && (
          <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Extracting resume with AI…
          </div>
        )}

        {fileName && !extracting && !error && (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <FileText className="h-4 w-4" />
            Selected: {fileName}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Dialog>
  );
}
