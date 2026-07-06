import { EVALUATION_WORKFLOW_STEP_DEFS, getEvaluationPipeline } from '@bestal/mock-data';
import { cn } from '@bestal/shared-utils';
import { Badge, PageHeader } from '@bestal/ui';
import { Link } from 'react-router-dom';

type EvaluationPipelineViewProps = {
  candidateBasePath: '/admin/candidates' | '/recruiter/candidates';
  title?: string;
  description?: string;
};

export function EvaluationPipelineView({
  candidateBasePath,
  title = 'Evaluation Pipeline',
  description = 'Candidates at each stage of the evaluation workflow',
}: EvaluationPipelineViewProps) {
  const pipeline = getEvaluationPipeline();

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader title={title} description={description} />

      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max gap-3">
            {EVALUATION_WORKFLOW_STEP_DEFS.map((def, idx) => {
              const bucket = pipeline.find((b) => b.stepId === def.id);
              const count = bucket?.candidates.length ?? 0;
              return (
                <div key={def.id} className="flex items-stretch gap-3">
                  <div
                    className={cn(
                      'flex w-52 flex-col rounded-xl border bg-background p-4 shadow-sm',
                      count > 0 ? 'border-brand/40' : 'border-border/80',
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Step {idx + 1}</span>
                      <Badge variant={count > 0 ? 'default' : 'secondary'}>{count}</Badge>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{def.label}</p>
                    <p className="mt-1 flex-1 text-xs text-muted-foreground line-clamp-2">
                      {def.description}
                    </p>
                    <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                      {bucket?.candidates.length ? (
                        bucket.candidates.map((c) => (
                          <li key={c.id}>
                            <Link
                              to={`${candidateBasePath}/${c.id}/workflow`}
                              className="block truncate text-xs font-medium text-brand hover:underline"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-muted-foreground">No candidates</li>
                      )}
                    </ul>
                  </div>
                  {idx < EVALUATION_WORKFLOW_STEP_DEFS.length - 1 && (
                    <div className="flex items-center text-muted-foreground/30">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
