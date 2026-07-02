import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  PageHeader,
  Select,
} from '@bestal/ui';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return '/admin';
  return '/recruiter';
}

export function AddCandidatePage() {
  const navigate = useNavigate();
  const basePath = usePortalBasePath();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate(`${basePath}/candidates/6`), 1200);
  }

  return (
    <div>
      <PageHeader
        title="Add Candidate"
        description="Create a new candidate profile in your pipeline"
        breadcrumbs={
          <Link to={`${basePath}/candidates`} className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to candidates
          </Link>
        }
      />

      <div className="p-6">
        {submitted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-emerald-600">Candidate created successfully</p>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting to candidate profile…</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField label="First name" htmlFor="first-name" required>
                  <Input id="first-name" placeholder="Alexandra" required />
                </FormField>
                <FormField label="Last name" htmlFor="last-name" required>
                  <Input id="last-name" placeholder="Petrov" required />
                </FormField>
                <FormField label="Email" htmlFor="email" required className="sm:col-span-2">
                  <Input id="email" type="email" placeholder="alexandra@example.com" required />
                </FormField>
                <FormField label="Headline" htmlFor="headline" required className="sm:col-span-2">
                  <Input id="headline" placeholder="Staff Full-Stack Engineer" required />
                </FormField>
                <FormField label="Location" htmlFor="location" required>
                  <Input id="location" placeholder="New York, NY" required />
                </FormField>
                <FormField label="Years of experience" htmlFor="experience" required>
                  <Input id="experience" type="number" min={0} placeholder="8" required />
                </FormField>
                <FormField label="Source" htmlFor="source" required>
                  <Select id="source" defaultValue="LINKEDIN" required>
                    <option value="DIRECT">Direct</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="JOB_BOARD">Job Board</option>
                    <option value="AGENCY">Agency</option>
                  </Select>
                </FormField>
                <FormField label="LinkedIn URL" htmlFor="linkedin">
                  <Input id="linkedin" placeholder="https://linkedin.com/in/..." />
                </FormField>
                <FormField label="Summary" htmlFor="summary" className="sm:col-span-2">
                  <textarea
                    id="summary"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Brief professional summary…"
                  />
                </FormField>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => navigate(`${basePath}/candidates`)}>
                Cancel
              </Button>
              <Button type="submit">Create candidate</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
