import { useCallback, useState } from 'react';

export function useDemoToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  }, []);

  return { message, show };
}
