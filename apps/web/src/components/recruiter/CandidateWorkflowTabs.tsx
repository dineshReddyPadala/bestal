import {
  getAvailabilityForCandidate,
  getDocumentsForCandidate,
  getPricingForCandidate,
  getScreeningForCandidate,
  type MockCandidate,
} from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DocumentList,
  FileUpload,
  FormField,
  Input,
  PricingEditor,
  Select,
  StatusBadge,
} from '@bestal/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

type CandidateWorkflowTabsProps = {
  candidate: MockCandidate;
};

export function CandidateWorkflowTabs({ candidate }: CandidateWorkflowTabsProps) {
  const docs = getDocumentsForCandidate(candidate.id);
  const screening = getScreeningForCandidate(candidate.id);
  const pricing = getPricingForCandidate(candidate.id);
  const availability = getAvailabilityForCandidate(candidate.id);

  const resumeDocs = docs.filter((d) => d.kind === 'RESUME');
  const evalDocs = docs.filter((d) => d.kind === 'EVALUATION_FORM');
  const bgvDocs = docs.filter((d) => d.kind === 'BGV_FORM');

  const [screeningRunning, setScreeningRunning] = useState(false);
  const [screeningDone, setScreeningDone] = useState(!!screening);
  const [approvalStatus, setApprovalStatus] = useState(candidate.approvalStatus);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  function mockUpload(label: string) {
    setUploadMsg(`${label} uploaded successfully (demo)`);
    setTimeout(() => setUploadMsg(null), 2500);
  }

  function runScreening() {
    setScreeningRunning(true);
    setTimeout(() => {
      setScreeningRunning(false);
      setScreeningDone(true);
    }, 2000);
  }

  return (
    <div className="space-y-4">
      {uploadMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {uploadMsg}
        </div>
      )}

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            label="Drop resume here or click to browse"
            hint="PDF or Word · max 10 MB"
            onFileSelect={() => mockUpload('Resume')}
          />
          <DocumentList documents={resumeDocs} emptyMessage="No resume on file." />
        </CardContent>
      </Card>

      {/* AI Screening */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            AI Screening
          </CardTitle>
          {!screeningDone && (
            <Button size="sm" onClick={runScreening} disabled={screeningRunning}>
              <Play className="mr-2 h-4 w-4" />
              {screeningRunning ? 'Running…' : 'Run screening'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {screeningRunning ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Analyzing resume, skills, and experience…
            </p>
          ) : screeningDone && screening ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{screening.overallScore}</p>
                  <p className="text-sm text-muted-foreground">Overall score</p>
                </div>
                <StatusBadge status={screening.recommendation} />
              </div>
              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">Skills match</dt>
                  <dd className="text-lg font-semibold">{screening.skillsMatch}%</dd>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">Experience</dt>
                  <dd className="text-lg font-semibold">{screening.experienceMatch}%</dd>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">Communication</dt>
                  <dd className="text-lg font-semibold">{screening.communicationScore}%</dd>
                </div>
              </dl>
              <p className="text-sm text-muted-foreground">{screening.summary}</p>
              {screening.flags.length > 0 && (
                <ul className="space-y-1">
                  {screening.flags.map((flag) => (
                    <li key={flag} className="flex items-center gap-2 text-sm text-amber-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                Model {screening.modelVersion} · {formatDate(screening.runAt)}
              </p>
            </div>
          ) : screeningDone ? (
            <div className="py-6 text-center">
              <p className="text-lg font-semibold text-emerald-600">Screening complete</p>
              <p className="mt-1 text-sm text-muted-foreground">Score: 85 · Recommendation: PASS</p>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Upload a resume first, then run AI screening to evaluate this candidate.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          {pricing ? (
            <>
              <PricingEditor payRate={pricing.payRate} billRate={pricing.billRate} currency={pricing.currency} />
              <p className="mt-4 text-xs text-muted-foreground">{pricing.notes}</p>
              <Button className="mt-4" size="sm" onClick={() => mockUpload('Pricing')}>
                Save pricing
              </Button>
            </>
          ) : (
            <PricingEditor payRate={100} billRate={140} onChange={() => {}} />
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Available from" htmlFor="avail-from">
              <Input
                id="avail-from"
                type="date"
                defaultValue={availability?.availableFrom ?? candidate.availableFrom}
              />
            </FormField>
            <FormField label="Hours per week" htmlFor="hours-week">
              <Select id="hours-week" defaultValue={String(availability?.hoursPerWeek ?? 40)}>
                <option value="20">20 hours</option>
                <option value="32">32 hours</option>
                <option value="40">40 hours</option>
              </Select>
            </FormField>
            <FormField label="Timezone" htmlFor="timezone">
              <Input id="timezone" defaultValue={availability?.timezone ?? 'America/New_York'} />
            </FormField>
            <FormField label="Notice period (days)" htmlFor="notice">
              <Input
                id="notice"
                type="number"
                defaultValue={availability?.noticePeriodDays ?? 14}
              />
            </FormField>
            <FormField label="Preferred engagement" htmlFor="engagement" className="sm:col-span-2">
              <Select id="engagement" defaultValue={availability?.preferredEngagement ?? 'CONTRACT'}>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="FREELANCE">Freelance</option>
              </Select>
            </FormField>
          </div>
          {availability?.notes && (
            <p className="mt-4 text-xs text-muted-foreground">{availability.notes}</p>
          )}
          <Button className="mt-4" size="sm" onClick={() => mockUpload('Availability')}>
            Save availability
          </Button>
        </CardContent>
      </Card>

      {/* Evaluation forms */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Evaluation Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            label="Upload evaluation form"
            accept=".pdf"
            onFileSelect={() => mockUpload('Evaluation form')}
          />
          <DocumentList documents={evalDocs} emptyMessage="No evaluation forms uploaded." />
        </CardContent>
      </Card>

      {/* Background check forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Upload Background Check Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            label="Upload BGV consent form"
            accept=".pdf"
            onFileSelect={() => mockUpload('Background check form')}
          />
          <DocumentList documents={bgvDocs} emptyMessage="No background check forms uploaded." />
        </CardContent>
      </Card>

      {/* Client visibility approval */}
      <Card>
        <CardHeader>
          <CardTitle>Approve for Client Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={approvalStatus} />
            <Badge variant="outline">Visibility: {candidate.visibility}</Badge>
            {candidate.visibility === 'DRAFT' && (
              <Badge variant="outline">Not visible to clients</Badge>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Approving makes this candidate searchable in the client portal. Reject to keep internal only.
          </p>
          {approvalStatus === 'PENDING' && (
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => setApprovalStatus('APPROVED')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="outline" onClick={() => setApprovalStatus('REJECTED')}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
          {approvalStatus === 'APPROVED' && (
            <p className="mt-4 text-sm font-medium text-emerald-600">
              Candidate approved — visible to clients in search results.
            </p>
          )}
          {approvalStatus === 'REJECTED' && (
            <p className="mt-4 text-sm font-medium text-red-600">
              Candidate rejected — hidden from client portal.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
