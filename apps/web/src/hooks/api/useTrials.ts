import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trialsApi, type TrialDto, type TrialListItem } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useTrialsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.trials.list(params),
    queryFn: () => trialsApi.list(params),
  });
}

export function useTrial(id: number) {
  return useQuery({
    queryKey: queryKeys.trials.detail(id),
    queryFn: () => trialsApi.get(id),
    enabled: id > 0,
  });
}

export function useTrialMutations() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.trials.all });

  const approve = useMutation({
    mutationFn: (id: number) => trialsApi.approve(id),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      trialsApi.reject(id, reason),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      trialsApi.update(id, body),
    onSuccess: invalidate,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => trialsApi.create(body),
    onSuccess: invalidate,
  });

  return { approve, reject, update, create };
}

/** Map API trial list + detail fields to management view row shape */
export function toTrialRow(item: TrialListItem, detail?: TrialDto) {
  const start = item.startDate;
  const end = item.endDate;
  let durationDays: number | null = detail?.durationDays ?? null;
  if (durationDays == null && start && end) {
    const s = new Date(start);
    const e = new Date(end);
    if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e >= s) {
      durationDays = Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1;
    }
  }

  return {
    id: item.id,
    clientId: item.clientId,
    clientName: item.clientName,
    candidateId: item.candidateId,
    candidateName: item.candidateName,
    roleTitle: item.roleTitle ?? '',
    durationDays,
    startDate: item.startDate,
    endDate: item.endDate,
    status: item.status,
    outcome: detail?.outcome ?? null,
    feedback: detail?.feedback ?? null,
    rejectReason: detail?.rejectReason ?? null,
    converted: Boolean(detail?.deploymentId),
    requestedAt: item.createdAt,
  };
}

export type TrialManagementRow = ReturnType<typeof toTrialRow>;
