import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  careerOpeningsApi,
  type CareerOpeningPayload,
} from '../../lib/api/career-openings';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function usePublicCareerOpenings() {
  return useQuery({
    queryKey: queryKeys.careerOpenings.public,
    queryFn: () => careerOpeningsApi.listPublic(),
    staleTime: 60_000,
  });
}

export function useCareerOpenings(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.careerOpenings.list(params),
    queryFn: () => careerOpeningsApi.list(params),
  });
}

export function useCareerOpening(id: number) {
  return useQuery({
    queryKey: queryKeys.careerOpenings.detail(id),
    queryFn: () => careerOpeningsApi.get(id),
    enabled: id > 0,
  });
}

export function useCareerOpeningMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.careerOpenings.all });
    void qc.invalidateQueries({ queryKey: queryKeys.careerOpenings.public });
  };

  return {
    create: useMutation({
      mutationFn: (body: CareerOpeningPayload) => careerOpeningsApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Partial<CareerOpeningPayload> }) =>
        careerOpeningsApi.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => careerOpeningsApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}
