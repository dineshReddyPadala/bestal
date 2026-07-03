import { SYSTEM_FIELDS_NOTE } from '../../lib/entity-field-metadata';

export function FormSystemNote() {
  return (
    <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      {SYSTEM_FIELDS_NOTE}
    </p>
  );
}
