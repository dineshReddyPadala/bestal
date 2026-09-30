import { useEffect } from 'react';

type ExternalRedirectProps = {
  href: string;
};

export function ExternalRedirect({ href }: ExternalRedirectProps) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return null;
}
