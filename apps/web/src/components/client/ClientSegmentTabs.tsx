import { cn } from '@bestal/shared-utils';

export type ClientSegmentTab = {
  id: string;
  label: string;
};

type ClientSegmentTabsProps = {
  tabs: ClientSegmentTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function ClientSegmentTabs({
  tabs,
  activeId,
  onChange,
  className,
}: ClientSegmentTabsProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border/80 bg-muted/30 p-0.5', className)}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
