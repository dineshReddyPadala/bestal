import {
  candidateListingCommunities,
  candidateListingRecords,
  candidateListingSkills,
  candidateListingTimezones,
  type CandidateListRecord,
} from '@bestal/mock-data';
import { Button, PageHeader, Select, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BulkActionBar,
  candidateListingColumns,
} from './CandidateListingTable';
import { useDemoToast } from '../../lib/use-demo-toast';

export type SortPreset =
  | 'newest'
  | 'oldest'
  | 'highest-score'
  | 'lowest-rate'
  | 'experience';

type CandidateListingViewProps = {
  basePath: string;
  addCandidatePath: string;
  title?: string;
  description?: string;
};

const defaultFilters = {
  community: 'all',
  primarySkill: 'all',
  experience: 'all',
  availability: 'all',
  timezone: 'all',
  rate: 'all',
  score: 'all',
  bgv: 'all',
  evaluation: 'all',
  deployment: 'all',
  visibility: 'all',
};

export function CandidateListingView({
  basePath,
  addCandidatePath,
  title = 'Candidates',
  description = 'Primary talent pool — search, filter, bulk manage, and take action on profiles',
}: CandidateListingViewProps) {
  const navigate = useNavigate();
  const { message, show } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const [sortPreset, setSortPreset] = useState<SortPreset>('newest');

  const filteredData = useMemo(() => {
    let rows: CandidateListRecord[] = [...candidateListingRecords];

    if (filters.community !== 'all') {
      rows = rows.filter((r) => r.community === filters.community);
    }
    if (filters.primarySkill !== 'all') {
      rows = rows.filter((r) => r.primarySkill === filters.primarySkill);
    }
    if (filters.experience !== 'all') {
      const [min, max] = filters.experience.split('-').map(Number);
      rows = rows.filter((r) => r.yearsExperience >= min && (max ? r.yearsExperience <= max : true));
    }
    if (filters.availability !== 'all') {
      rows = rows.filter((r) => r.availabilityCategory === filters.availability);
    }
    if (filters.timezone !== 'all') {
      rows = rows.filter((r) => r.timezone === filters.timezone);
    }
    if (filters.rate !== 'all') {
      const [min, max] = filters.rate.split('-').map(Number);
      rows = rows.filter((r) => r.billRate >= min && (max ? r.billRate <= max : true));
    }
    if (filters.score !== 'all') {
      const [min, max] = filters.score.split('-').map(Number);
      rows = rows.filter((r) => r.bestalScore >= min && (max ? r.bestalScore <= max : true));
    }
    if (filters.bgv !== 'all') {
      rows = rows.filter((r) => r.bgvStatus === filters.bgv);
    }
    if (filters.evaluation !== 'all') {
      rows = rows.filter((r) => r.evaluationStatus === filters.evaluation);
    }
    if (filters.deployment !== 'all') {
      rows = rows.filter((r) => r.deploymentStatus === filters.deployment);
    }
    if (filters.visibility !== 'all') {
      rows = rows.filter((r) => r.visibility === filters.visibility);
    }

    switch (sortPreset) {
      case 'newest':
        rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest-score':
        rows.sort((a, b) => b.bestalScore - a.bestalScore);
        break;
      case 'lowest-rate':
        rows.sort((a, b) => a.billRate - b.billRate);
        break;
      case 'experience':
        rows.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
    }

    return rows;
  }, [filters, sortPreset]);

  const columns = useMemo<ColumnDef<CandidateListRecord>[]>(
    () =>
      candidateListingColumns(basePath, (record, action) => {
        if (action === 'View') {
          navigate(`${basePath}/${record.id}`);
          return;
        }
        if (action === 'Edit') {
          navigate(`${basePath}/${record.id}`);
          return;
        }
        show(`${action} — ${record.fullName} (demo)`);
      }),
    [basePath, navigate, show],
  );

  const updateFilter = (key: keyof typeof defaultFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" to={`${basePath}/import`}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button to={addCandidatePath}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by name, email, role, company, or skill…"
          pageSize={10}
          enableRowSelection
          getRowId={(row) => String(row.id)}
          stickyHeader
          onRowClick={(row) => navigate(`${basePath}/${row.id}`)}
          toolbar={
            <Select
              value={sortPreset}
              onChange={(e) => setSortPreset(e.target.value as SortPreset)}
              className="w-44"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest-score">Highest Score</option>
              <option value="lowest-rate">Lowest Rate</option>
              <option value="experience">Experience</option>
            </Select>
          }
          filters={
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                <FilterSelect
                  label="Community"
                  value={filters.community}
                  onChange={(v) => updateFilter('community', v)}
                  options={[
                    { value: 'all', label: 'All communities' },
                    ...candidateListingCommunities.map((c) => ({ value: c, label: c })),
                  ]}
                />
                <FilterSelect
                  label="Primary Skill"
                  value={filters.primarySkill}
                  onChange={(v) => updateFilter('primarySkill', v)}
                  options={[
                    { value: 'all', label: 'All skills' },
                    ...candidateListingSkills.map((s) => ({ value: s, label: s })),
                  ]}
                />
                <FilterSelect
                  label="Experience"
                  value={filters.experience}
                  onChange={(v) => updateFilter('experience', v)}
                  options={[
                    { value: 'all', label: 'Any experience' },
                    { value: '0-5', label: '0–5 years' },
                    { value: '6-10', label: '6–10 years' },
                    { value: '11-99', label: '11+ years' },
                  ]}
                />
                <FilterSelect
                  label="Availability"
                  value={filters.availability}
                  onChange={(v) => updateFilter('availability', v)}
                  options={[
                    { value: 'all', label: 'Any availability' },
                    { value: 'IMMEDIATE', label: 'Immediate' },
                    { value: 'WITHIN_2_WEEKS', label: 'Within 2 weeks' },
                    { value: 'WITHIN_30_DAYS', label: 'Within 30 days' },
                    { value: 'WITHIN_60_DAYS', label: 'Within 60 days' },
                    { value: 'NOT_AVAILABLE', label: 'Not available' },
                  ]}
                />
                <FilterSelect
                  label="Timezone"
                  value={filters.timezone}
                  onChange={(v) => updateFilter('timezone', v)}
                  options={[
                    { value: 'all', label: 'All timezones' },
                    ...candidateListingTimezones.map((tz) => ({
                      value: tz,
                      label: tz.replace(/_/g, ' '),
                    })),
                  ]}
                />
                <FilterSelect
                  label="Rate"
                  value={filters.rate}
                  onChange={(v) => updateFilter('rate', v)}
                  options={[
                    { value: 'all', label: 'Any rate' },
                    { value: '0-120', label: 'Under $120/hr' },
                    { value: '120-150', label: '$120–150/hr' },
                    { value: '150-999', label: '$150+/hr' },
                  ]}
                />
                <FilterSelect
                  label="Score"
                  value={filters.score}
                  onChange={(v) => updateFilter('score', v)}
                  options={[
                    { value: 'all', label: 'Any score' },
                    { value: '90-100', label: '90+' },
                    { value: '80-89', label: '80–89' },
                    { value: '0-79', label: 'Below 80' },
                  ]}
                />
                <FilterSelect
                  label="BGV"
                  value={filters.bgv}
                  onChange={(v) => updateFilter('bgv', v)}
                  options={[
                    { value: 'all', label: 'All BGV' },
                    { value: 'CLEAR', label: 'Clear' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'NOT_STARTED', label: 'Not Started' },
                  ]}
                />
                <FilterSelect
                  label="Evaluation"
                  value={filters.evaluation}
                  onChange={(v) => updateFilter('evaluation', v)}
                  options={[
                    { value: 'all', label: 'All evaluations' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'NOT_STARTED', label: 'Not Started' },
                  ]}
                />
                <FilterSelect
                  label="Deployment"
                  value={filters.deployment}
                  onChange={(v) => updateFilter('deployment', v)}
                  options={[
                    { value: 'all', label: 'All deployments' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'ON_HOLD', label: 'On Hold' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'NOT_DEPLOYED', label: 'Not Deployed' },
                  ]}
                />
                <FilterSelect
                  label="Visibility"
                  value={filters.visibility}
                  onChange={(v) => updateFilter('visibility', v)}
                  options={[
                    { value: 'all', label: 'All visibility' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'HIDDEN', label: 'Hidden' },
                  ]}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [
              r.fullName,
              r.displayName,
              r.email,
              r.role,
              r.currentCompany,
              r.community,
              r.primarySkill,
              r.headline,
              r.location,
            ].some((field) => field.toLowerCase().includes(q));
          }}
          bulkActions={(selected) => (
            <BulkActionBar
              onAction={(action) =>
                show(`${action} applied to ${selected.length} candidate(s) (demo)`)
              }
            />
          )}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
