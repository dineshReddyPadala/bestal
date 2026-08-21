import { createContext, useContext } from 'react';

export const DashboardShellContext = createContext(false);

export function useDashboardShell(): boolean {
  return useContext(DashboardShellContext);
}
