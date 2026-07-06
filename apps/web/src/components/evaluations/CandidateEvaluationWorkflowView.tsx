import {
  EVALUATION_WORKFLOW_STEP_DEFS,
  getCandidateDetailProfile,
  getEvaluationWorkflowForCandidate,
  getSchemaCandidate,
  getSchemaDocumentsForCandidate,
  getScreeningForCandidate,
  getWorkflowProgressPercent,
  type EvaluationWorkflowStep,
  type EvaluationWorkflowStepId,
} from '@bestal/mock-data';
import { cn, formatDate } from '@bestal/shared-utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FileUpload,
  Input,
  Select,
  StatusBadge,
} from '@bestal/ui';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Globe,
  Loader2,
  Play,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EvaluationForm } from '../forms/EvaluationForm';
import { buildEvaluationPayload } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

type CandidateEvaluationWorkflowViewProps = {
  candidateId: number;
  basePath: '/admin/candidates' | '/recruiter/candidates';
  compact?: boolean;
};

const textareaClass =
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function StepIcon({ status }: { status: EvaluationWorkflowStep['status'] }) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (status === 'in_progress') return <Loader2 className="h-5 w-5 animate-spin text-brand" />;
  return <Circle className="h-5 w-5 text-muted-foreground/40" />;
}

function WorkflowStepper({
  steps,
  activeStep,
  onSelect,
}: {
  steps: EvaluationWorkflowStep[];
  activeStep: EvaluationWorkflowStepId;
  onSelect: (id: EvaluationWorkflowStepId) => void;
}) {
  return (
    <nav aria-label="Evaluation workflow" className="space-y-1">
      {steps.map((step, idx) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onSelect(step.id)}
          className={cn(
            'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
            activeStep === step.id
              ? 'border-brand bg-brand/5'
              : 'border-transparent hover:border-border hover:bg-muted/40',
          )}
        >
          <div className="mt-0.5 shrink-0">
            <StepIcon status={step.status} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {step.completedAt && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {step.actor} · {formatDate(step.completedAt)}
              </p>
            )}
          </div>
        </button>
      ))}
    </nav>
  );
}

export function CandidateEvaluationWorkflowView({
  candidateId,
  basePath,
  compact = false,
}: CandidateEvaluationWorkflowViewProps) {
  const { message, show } = useDemoToast();
  const record = getSchemaCandidate(candidateId);
  const profile = getCandidateDetailProfile(candidateId);
  const screening = getScreeningForCandidate(candidateId);
  const docs = useMemo(() => getSchemaDocumentsForCandidate(candidateId), [candidateId]);

  const initialSteps = useMemo(() => getEvaluationWorkflowForCandidate(candidateId), [candidateId]);
  const [steps, setSteps] = useState(initialSteps);
  const [activeStep, setActiveStep] = useState<EvaluationWorkflowStepId>(
    () => initialSteps.find((s) => s.status === 'in_progress')?.id ?? 'candidate_added',
  );
  const [screeningRunning, setScreeningRunning] = useState(false);
  const [aiSummary, setAiSummary] = useState(profile?.evaluationDetail.aiEvaluationSummary ?? '');
  const [conductScores, setConductScores] = useState({
    technical: 0,
    communication: 0,
    architecture: 0,
    problemSolving: 0,
  });

  const progress = getWorkflowProgressPercent(candidateId);
  const fullName = record ? `${record.firstName} ${record.lastName}` : 'Candidate';

  const advanceStep = useCallback(
    (stepId: EvaluationWorkflowStepId, actor = 'You') => {
      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.id === stepId);
        if (idx < 0) return prev;
        const now = new Date().toISOString();
        const next = prev.map((s, i) => {
          if (i <= idx) {
            return {
              ...s,
              status: 'completed' as const,
              completedAt: s.completedAt ?? now,
              actor: s.actor ?? actor,
            };
          }
          if (i === idx + 1) return { ...s, status: 'in_progress' as const };
          return s;
        });
        const nextActive = EVALUATION_WORKFLOW_STEP_DEFS[idx + 1]?.id;
        if (nextActive) setActiveStep(nextActive);
        return next;
      });
    },
    [],
  );

  if (!record || !profile) {
    return <p className="text-sm text-muted-foreground">Candidate not found.</p>;
  }

  const candidate = record;
  const candidateProfile = profile;
  const resumeDoc = docs.find((d) => d.kind === 'RESUME');

  function renderStepPanel(stepId: EvaluationWorkflowStepId) {
    switch (stepId) {
      case 'candidate_added':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {fullName} was added to the talent pool. Profile is in draft until the evaluation
              workflow completes.
            </p>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{candidate.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Source</dt>
                <dd><StatusBadge status={candidate.source} /></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={candidate.status} /></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Visibility</dt>
                <dd><StatusBadge status={candidate.visibility} /></dd>
              </div>
            </dl>
            <Button size="sm" onClick={() => { advanceStep('candidate_added'); show('Step confirmed (demo)'); }}>
              Confirm & continue
            </Button>
          </div>
        );

      case 'resume_uploaded':
        return (
          <div className="space-y-4">
            <FileUpload
              label="Upload resume"
              accept=".pdf,.doc,.docx"
              hint="PDF or Word — no URL needed"
              onFileSelect={() => {
                advanceStep('resume_uploaded');
                show('Resume uploaded (demo)');
              }}
            />
            {resumeDoc && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                On file: {resumeDoc.fileName} · uploaded {formatDate(resumeDoc.createdAt)}
              </div>
            )}
          </div>
        );

      case 'ai_screening':
        return (
          <div className="space-y-4">
            {!screening && !screeningRunning && (
              <>
                <p className="text-sm text-muted-foreground">
                  Run AI screening to analyze skills match, experience, and communication signals
                  from the resume.
                </p>
                <Button onClick={() => {
                  setScreeningRunning(true);
                  setTimeout(() => {
                    setScreeningRunning(false);
                    advanceStep('ai_screening', 'BesTal AI');
                    show('AI screening complete (demo)');
                  }, 2000);
                }}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run AI screening
                </Button>
              </>
            )}
            {screeningRunning && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing resume…
              </p>
            )}
            {screening && (
              <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{screening.overallScore}</p>
                    <p className="text-xs text-muted-foreground">Overall score</p>
                  </div>
                  <StatusBadge status={screening.recommendation} />
                </div>
                <dl className="grid gap-3 sm:grid-cols-3 text-sm">
                  <div><dt className="text-muted-foreground">Skills</dt><dd className="font-semibold">{screening.skillsMatch}%</dd></div>
                  <div><dt className="text-muted-foreground">Experience</dt><dd className="font-semibold">{screening.experienceMatch}%</dd></div>
                  <div><dt className="text-muted-foreground">Communication</dt><dd className="font-semibold">{screening.communicationScore}%</dd></div>
                </dl>
                <p className="text-sm">{screening.summary}</p>
                {screening.flags.length > 0 && (
                  <ul className="space-y-1 text-sm text-amber-700">
                    {screening.flags.map((f) => <li key={f}>⚠ {f}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        );

      case 'recruiter_review':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review AI screening results and decide whether to proceed to technical evaluation.
            </p>
            <textarea rows={3} className={textareaClass} placeholder="Recruiter notes (optional)" />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { advanceStep('recruiter_review'); show('Approved for evaluation (demo)'); }}>
                <UserCheck className="mr-2 h-4 w-4" />
                Approve for evaluation
              </Button>
              <Button variant="outline" onClick={() => show('Candidate held for review (demo)')}>
                Request more info
              </Button>
              <Button variant="outline" className="text-destructive" onClick={() => show('Candidate rejected (demo)')}>
                Reject
              </Button>
            </div>
          </div>
        );

      case 'schedule_evaluation':
        return (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              advanceStep('schedule_evaluation');
              show('Technical evaluation scheduled (demo)');
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Evaluator</label>
                <Select defaultValue="David Chen">
                  <option>David Chen</option>
                  <option>Sarah Mitchell</option>
                  <option>Dr. Alan Wright</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Evaluation type</label>
                <Select defaultValue="TECHNICAL">
                  <option value="TECHNICAL">Technical</option>
                  <option value="FULL_STACK">Full Stack</option>
                  <option value="ARCHITECTURE">Architecture</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input type="time" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Meeting link</label>
                <Input placeholder="https://meet.google.com/..." />
              </div>
            </div>
            <Button type="submit">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule evaluation
            </Button>
          </form>
        );

      case 'conduct_evaluation':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Score the candidate during the live technical session. Scores save when you complete
              the session.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(['technical', 'communication', 'architecture', 'problemSolving'] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={conductScores[key] || ''}
                    onChange={(e) =>
                      setConductScores((s) => ({ ...s, [key]: Number(e.target.value) }))
                    }
                  />
                </div>
              ))}
            </div>
            <textarea rows={3} className={textareaClass} placeholder="Session notes…" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => show('Session paused (demo)')}>
                <Clock className="mr-2 h-4 w-4" />
                Save draft
              </Button>
              <Button onClick={() => { advanceStep('conduct_evaluation'); show('Evaluation session completed (demo)'); }}>
                <Play className="mr-2 h-4 w-4" />
                Complete session
              </Button>
            </div>
          </div>
        );

      case 'upload_results':
        return (
          <EvaluationForm
            uploadOnly
            submitLabel="Upload results"
            defaultValues={{ candidateName: fullName }}
            onSubmit={(values) => {
              buildEvaluationPayload(values);
              advanceStep('upload_results');
              show('Evaluation results uploaded (demo)');
            }}
            onCancel={() => show('Upload cancelled')}
          />
        );

      case 'ai_summary':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate an AI summary from evaluation scores and session notes for admin review.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setAiSummary(
                  `${fullName} demonstrated strong technical depth with clear communication. Recommended for client shortlists in ${candidateProfile.overview.community} roles.`,
                );
                show('AI summary generated (demo)');
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI summary
            </Button>
            <textarea
              rows={5}
              className={textareaClass}
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              placeholder="AI summary will appear here…"
            />
            <Button
              disabled={!aiSummary}
              onClick={() => { advanceStep('ai_summary', 'BesTal AI'); show('AI summary approved (demo)'); }}
            >
              Approve summary
            </Button>
          </div>
        );

      case 'admin_approval':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={candidate.approvalStatus} />
              <StatusBadge status={candidate.visibility} />
            </div>
            <p className="text-sm text-muted-foreground">
              Admin reviews the full evaluation package before the candidate becomes visible to
              clients.
            </p>
            <textarea rows={2} className={textareaClass} placeholder="Approval notes (optional)" />
            <div className="flex gap-2">
              <Button onClick={() => { advanceStep('admin_approval', 'Admin'); show('Candidate approved (demo)'); }}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="outline" className="text-destructive" onClick={() => show('Candidate rejected (demo)')}>
                Reject
              </Button>
            </div>
          </div>
        );

      case 'bestal_score':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              BesTal score is recalculated from screening, evaluation scores, and reliability
              signals.
            </p>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
              </div>
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">BesTal Score</p>
                <p className="text-2xl font-bold text-brand">{candidateProfile.overview.bestalScore}</p>
              </div>
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">Technical</p>
                <p className="text-2xl font-bold">{candidateProfile.overview.technicalScore}</p>
              </div>
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">Communication</p>
                <p className="text-2xl font-bold">{candidateProfile.overview.communicationScore}</p>
              </div>
            </div>
            <Button onClick={() => { advanceStep('bestal_score', 'System'); show('BesTal score updated (demo)'); }}>
              Recalculate score
            </Button>
          </div>
        );

      case 'client_visible':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Publish the candidate to the client portal. Only approved candidates with a BesTal
              score appear in search results.
            </p>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-brand" />
                <div>
                  <p className="font-medium">{fullName}</p>
                  <p className="text-sm text-muted-foreground">{candidateProfile.overview.role}</p>
                </div>
                <Badge className="ml-auto">Score {candidateProfile.overview.bestalScore}</Badge>
              </div>
            </div>
            <Button
              onClick={() => { advanceStep('client_visible'); show('Candidate published to clients (demo)'); }}
            >
              <Globe className="mr-2 h-4 w-4" />
              Publish to client portal
            </Button>
          </div>
        );

      default:
        return null;
    }
  }

  const activeMeta = steps.find((s) => s.id === activeStep);

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Evaluation workflow · {progress}% complete</p>
          <Link
            to={`${basePath}/${candidateId}/workflow`}
            className="text-sm text-brand hover:underline"
          >
            Open full workflow
          </Link>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
        {renderStepPanel(activeStep)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Evaluation Workflow</h2>
          <p className="text-sm text-muted-foreground">{fullName} · {progress}% complete</p>
        </div>
        <Link to={`${basePath}/${candidateId}`} className="text-sm text-brand hover:underline">
          View candidate profile
        </Link>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline steps</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <WorkflowStepper steps={steps} activeStep={activeStep} onSelect={setActiveStep} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <StepIcon status={activeMeta?.status ?? 'pending'} />
              <div>
                <CardTitle className="text-base">{activeMeta?.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{activeMeta?.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderStepPanel(activeStep)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
