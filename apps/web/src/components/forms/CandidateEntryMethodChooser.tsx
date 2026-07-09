import { cn } from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { FileSpreadsheet, FileUp, PenLine, Workflow } from 'lucide-react';
import type { CandidateEntryMethod } from './candidate-wizard-schema';

type EntryOption = {
  id: CandidateEntryMethod;
  title: string;
  description: string;
  icon: typeof FileUp;
};

const ENTRY_OPTIONS: EntryOption[] = [
  {
    id: 'resume',
    title: 'Upload Resume',
    description: 'Upload a PDF or Word resume. AI extracts profile fields you can review and edit.',
    icon: FileUp,
  },
  {
    id: 'oorwin',
    title: 'Import from Oorwin',
    description: 'Link an existing Oorwin candidate by ID and complete the profile in BesTal.',
    icon: Workflow,
  },
  {
    id: 'manual',
    title: 'Manual Entry',
    description: 'Enter candidate details step by step without a resume or external import.',
    icon: PenLine,
  },
  {
    id: 'csv',
    title: 'Import CSV',
    description: 'Bulk import multiple candidates from a spreadsheet using the BesTal template.',
    icon: FileSpreadsheet,
  },
];

type CandidateEntryMethodChooserProps = {
  onSelect: (method: CandidateEntryMethod) => void;
  onCancel: () => void;
};

export function CandidateEntryMethodChooser({
  onSelect,
  onCancel,
}: CandidateEntryMethodChooserProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Choose how to add this candidate</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an entry method. You can review and edit all details before submitting.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ENTRY_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                'group flex h-full flex-col rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/10 p-5 text-left shadow-sm transition-all',
                'hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-colors group-hover:bg-brand/15">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{option.title}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
