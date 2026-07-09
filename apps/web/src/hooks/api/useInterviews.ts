import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, type InterviewDto, type InterviewListItem } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useInterviewsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.interviews.list(params),
    queryFn: () => interviewsApi.list(params),
  });
}

export function useInterviewMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.interviews.all });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => interviewsApi.create(body),
      onSuccess: invalidate,
    }),
    confirm: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        interviewsApi.confirm(id, body),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: ({ id, cancelReason }: { id: number; cancelReason?: string }) =>
        interviewsApi.cancel(id, cancelReason),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        interviewsApi.update(id, body),
      onSuccess: invalidate,
    }),
  };
}

export function toInterviewCard(item: InterviewListItem | InterviewDto) {
  return {
    id: item.id,
    candidateId: item.candidateId,
    candidateName: item.candidateName,
    clientId: item.clientId,
    clientName: item.clientName,
    type: item.type,
    status: item.status,
    scheduledAt: item.scheduledAt,
    durationMinutes: item.durationMinutes ?? 60,
    interviewer:
      'assignedToName' in item && item.assignedToName
        ? item.assignedToName
        : 'requestedByName' in item
          ? item.requestedByName
          : 'Pending assignment',
    meetingUrl: 'meetingLink' in item ? item.meetingLink : null,
    notes: 'notes' in item ? (item.notes ?? '') : '',
  };
}
