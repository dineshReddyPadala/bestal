import { useCallback, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error';

const TOAST_DURATION_MS = 6000;

export function useDemoToast() {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback(
    (text: string, variant: ToastVariant = 'success') => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      setToast({ message: text, variant });
      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [],
  );

  const showError = useCallback(
    (text: string) => {
      show(text, 'error');
    },
    [show],
  );

  return {
    toast,
    message: toast?.message ?? null,
    variant: toast?.variant ?? 'success',
    show,
    showError,
    dismiss,
  };
}
