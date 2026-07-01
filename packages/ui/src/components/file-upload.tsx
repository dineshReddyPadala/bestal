import { cn } from '@bestal/shared-utils';
import { Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

export type FileUploadProps = {
  accept?: string;
  label?: string;
  hint?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
};

export function FileUpload({
  accept = '.pdf,.doc,.docx',
  label = 'Upload file',
  hint = 'PDF or Word documents up to 10 MB',
  onFileSelect,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    onFileSelect?.(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors',
          dragOver
            ? 'border-brand bg-brand/5'
            : 'border-border hover:border-brand/50 hover:bg-muted/30',
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        {fileName && (
          <p className="mt-3 rounded-md bg-muted px-3 py-1 text-xs font-medium">{fileName}</p>
        )}
      </button>
      <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
    </div>
  );
}
