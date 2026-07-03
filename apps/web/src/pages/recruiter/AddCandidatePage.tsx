import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, PageHeader } from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CandidateWizard } from '../../components/forms/CandidateWizard';
import type { CandidateWizardValues } from '../../components/forms/candidate-wizard-schema';
import { useDemoToast } from '../../lib/use-demo-toast';

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return '/admin';
  return '/recruiter';
}

export function AddCandidatePage() {
  const navigate = useNavigate();
  const basePath = usePortalBasePath();
  const { message, show } = useDemoToast();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(_values: CandidateWizardValues) {
    setSubmitted(true);
    show('Candidate created successfully (demo)');
    setTimeout(() => navigate(`${basePath}/candidates/6`), 1200);
  }

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title="Add Candidate"
        description="7-step wizard — every candidate schema field"
        breadcrumbs={
          <Link to={`${basePath}/candidates`} className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to candidates
          </Link>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {submitted ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-emerald-600">Candidate created successfully</p>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting to candidate profile…</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto max-w-4xl">
            <CardContent className="p-6">
              <CandidateWizard
                onSubmit={handleSubmit}
                onCancel={() => navigate(`${basePath}/candidates`)}
                onToast={show}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
