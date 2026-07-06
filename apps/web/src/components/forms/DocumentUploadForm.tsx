import { Button, FileUpload } from '@bestal/ui';
import { useState } from 'react';
import type { DocumentUploadFormValues } from '../../lib/entity-field-metadata';

type DocumentUploadFormProps = {
  accept?: string;
  kind: DocumentUploadFormValues['kind'];
  onSubmit: (values: DocumentUploadFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
  showActions?: boolean;
  label?: string;
};

export function DocumentUploadForm({
  accept = '.pdf,.doc,.docx',
  kind,
  onSubmit,
  onCancel,
  submitLabel = 'Upload',
  formId = 'document-upload-form',
  showActions = true,
  label = 'Select file',
}: DocumentUploadFormProps) {
  const [fileName, setFileName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName) return;
    onSubmit({ fileName, kind });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <FileUpload
        label={label}
        accept={accept}
        onFileSelect={(file) => setFileName(file.name)}
      />
      {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}

      {showActions && (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!fileName}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
