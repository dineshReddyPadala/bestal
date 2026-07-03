import { Button, FileUpload } from '@bestal/ui';
import { useState } from 'react';
import type { DocumentUploadFormValues } from '../../lib/entity-field-metadata';
import { FormSystemNote } from './FormSystemNote';

type DocumentUploadFormProps = {
  accept?: string;
  hint?: string;
  kind: DocumentUploadFormValues['kind'];
  onSubmit: (values: DocumentUploadFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  formId?: string;
};

export function DocumentUploadForm({
  accept = '.pdf,.doc,.docx',
  hint = 'Upload a file — no URL needed',
  kind,
  onSubmit,
  onCancel,
  submitLabel = 'Upload',
  formId = 'document-upload-form',
}: DocumentUploadFormProps) {
  const [fileName, setFileName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName) return;
    onSubmit({ fileName, kind });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <FormSystemNote />

      <FileUpload
        label="Select file"
        accept={accept}
        hint={hint}
        onFileSelect={(file) => setFileName(file.name)}
      />
      {fileName && <p className="text-sm text-emerald-700">Selected: {fileName}</p>}

      <p className="text-xs text-muted-foreground">
        Upload metadata, verification status, and audit fields are set by the system.
      </p>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!fileName}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
