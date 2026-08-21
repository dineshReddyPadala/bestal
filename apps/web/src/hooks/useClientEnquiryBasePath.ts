import { useLocation } from 'react-router-dom';

export function useClientEnquiryBasePath(): string {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin/client-enquiries')) return '/admin/client-enquiries';
  if (pathname.startsWith('/sales/client-enquiries')) return '/sales/client-enquiries';
  return '/super-admin/client-enquiries';
}
