import { Upload } from 'lucide-react';
import { useEffect, useMemo } from 'react';

type IconUploadFieldProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  currentPreviewUrl?: string | null;
  label?: string;
  required?: boolean;
};

export function IconUploadField({
  file,
  onChange,
  currentPreviewUrl,
  label = 'Icon image',
  required = false,
}: IconUploadFieldProps) {
  const objectPreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);
    };
  }, [objectPreviewUrl]);

  const previewUrl = objectPreviewUrl ?? currentPreviewUrl;

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {required ? ' *' : ''}
      </span>
      {previewUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={previewUrl}
            alt=""
            className="h-12 w-12 rounded-md object-cover ring-1 ring-border/60"
          />
          <span className="text-sm text-muted-foreground">
            {file ? file.name : 'Current icon'}
          </span>
        </div>
      ) : null}
      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-3 py-3 text-sm hover:bg-muted/30">
        <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span>{file ? file.name : 'Upload icon image (PNG, JPG, WebP)'}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
