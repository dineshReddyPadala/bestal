import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobRequestsApi, type SubmitJobRequestPayload } from '../../lib/api/job-requests';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useJobRequestsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.jobRequests.list(params),
    queryFn: () => jobRequestsApi.list(params),
  });
}

export function useJobRequest(id: number) {
  return useQuery({
    queryKey: queryKeys.jobRequests.detail(id),
    queryFn: () => jobRequestsApi.get(id),
    enabled: id > 0,
  });
}

export function useJobRequestMutations() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.jobRequests.all });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      jobRequestsApi.update(id, body),
    onSuccess: invalidate,
  });

  const submitPublic = useMutation({
    mutationFn: (body: SubmitJobRequestPayload) => jobRequestsApi.submitPublic(body),
  });

  return { update, submitPublic };
}

export type JobRequestManagementRow = {
  id: number;
  jobTitle: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  experienceRequired: string;
  numberOfResources: string;
  status: string;
  assignedToName: string | null;
  createdAt: string;
};

export function toJobRequestRow(item: import('../../lib/api/types').JobRequestListItem): JobRequestManagementRow {
  return {
    id: item.id,
    jobTitle: item.jobTitle,
    companyName: item.companyName,
    contactName: item.contactName,
    contactEmail: item.contactEmail,
    contactPhone: item.contactPhone,
    experienceRequired: item.experienceRequired,
    numberOfResources: item.numberOfResources,
    status: item.status,
    assignedToName: item.assignedToName,
    createdAt: item.createdAt,
  };
}
