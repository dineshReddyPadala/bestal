import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { PostJobModal } from './PostJobModal';

type PostJobContextValue = {
  openPostJobModal: () => void;
  closePostJobModal: () => void;
};

const PostJobContext = createContext<PostJobContextValue | null>(null);

export function PostJobProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPostJobModal = useCallback(() => setOpen(true), []);
  const closePostJobModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openPostJobModal, closePostJobModal }),
    [openPostJobModal, closePostJobModal],
  );

  return (
    <PostJobContext.Provider value={value}>
      {children}
      <PostJobModal open={open} onClose={closePostJobModal} />
    </PostJobContext.Provider>
  );
}

export function usePostJobModal(): PostJobContextValue {
  const ctx = useContext(PostJobContext);
  if (!ctx) {
    throw new Error('usePostJobModal must be used within PostJobProvider');
  }
  return ctx;
}

/** Opens the Post a Job modal when used inside MarketingShell; no-op otherwise. */
export function useOptionalPostJobModal(): PostJobContextValue | null {
  return useContext(PostJobContext);
}
