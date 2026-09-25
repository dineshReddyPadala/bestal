import type { CommunityApplication } from '@/types';
import { wait } from '@/utils/format';
import type { ServiceResult } from '@/services/contact.service';

/**
 * Isolated community application submission. Replace this mock with a real
 * API call once a backend endpoint is available.
 */
export async function submitCommunityApplication(payload: CommunityApplication): Promise<ServiceResult> {
  void payload;
  await wait(400);
  return { ok: true };
}
