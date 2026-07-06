import { useState } from 'react';
import { EvaluationManagementView } from '../../components/evaluations/EvaluationManagementView';
import { EvaluationPipelineView } from '../../components/evaluations/EvaluationPipelineView';
import { cn } from '@bestal/shared-utils';

type EvaluationsPageProps = {
  candidateBasePath?: '/admin/candidates' | '/recruiter/candidates';
  title?: string;
  description?: string;
};

export function EvaluationsPage({
  candidateBasePath = '/recruiter/candidates',
  title = 'Evaluation Management',
  description = 'Review scores, recordings, and hiring recommendations for your candidates',
}: EvaluationsPageProps) {
  const [tab, setTab] = useState<'pipeline' | 'table'>('pipeline');

  return (
    <div>
      <div className="border-b border-border bg-background px-6 pt-4">
        <div className="flex gap-1">
          {(
            [
              { id: 'pipeline' as const, label: 'Pipeline' },
              { id: 'table' as const, label: 'All evaluations' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
                tab === id
                  ? 'border border-b-0 border-border bg-muted/30 text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pipeline' ? (
        <EvaluationPipelineView candidateBasePath={candidateBasePath} />
      ) : (
        <EvaluationManagementView title={title} description={description} candidateBasePath={candidateBasePath} />
      )}
    </div>
  );
}
