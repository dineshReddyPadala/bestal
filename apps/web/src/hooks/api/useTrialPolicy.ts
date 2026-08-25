import { useQuery } from '@tanstack/react-query';
import { fetchPublicTrialPolicy, fetchTrialPolicy } from '../../lib/api/settings';
import { DEFAULT_FREE_TRIAL_HOURS, type TrialPolicy } from '../../lib/trial-policy';

const trialPolicyQueryKey = ['settings', 'trial-policy'] as const;

export function usePublicTrialPolicy() {
  return useQuery({
    queryKey: [...trialPolicyQueryKey, 'public'],
    queryFn: fetchPublicTrialPolicy,
    staleTime: 5 * 60_000,
  });
}

export function useTrialPolicy(options?: { authenticated?: boolean }) {
  const authenticated = options?.authenticated ?? false;
  return useQuery({
    queryKey: [...trialPolicyQueryKey, authenticated ? 'auth' : 'public'],
    queryFn: authenticated ? fetchTrialPolicy : fetchPublicTrialPolicy,
    staleTime: 5 * 60_000,
  });
}

export function useFreeTrialHours(options?: { authenticated?: boolean }): number {
  const { data } = useTrialPolicy(options);
  return data?.freeTrialHours ?? DEFAULT_FREE_TRIAL_HOURS;
}

export function resolveFreeTrialHours(policy: TrialPolicy | undefined): number {
  return policy?.freeTrialHours ?? DEFAULT_FREE_TRIAL_HOURS;
}
