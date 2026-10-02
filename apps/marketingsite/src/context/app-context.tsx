/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { INITIAL_PODS, INITIAL_PROJECTS, INITIAL_REQUESTS, INITIAL_WORKFORCE } from '@/constants/workspace-data';
import type {
  ConsultingRequest,
  DeliveryPod,
  DiscoverFilters,
  ParsedNeed,
  ProjectOpportunity,
  RequestKind,
  TeamDraftMember,
  WorkforceMember,
  WorkspaceMode,
  WorkspaceTab,
} from '@/types';

export type DrawerKind =
  | { type: 'profile'; index: number }
  | { type: 'pod'; index: number }
  | { type: 'request-detail'; index: number }
  | { type: 'shortlist' };

export type ModalKind =
  | { type: 'compare' }
  | { type: 'trial'; index: number }
  | { type: 'post-project' }
  | { type: 'enquiry'; kind: RequestKind };

interface ToastItem {
  id: number;
  message: string;
}

interface AppState {
  mode: WorkspaceMode;
  tab: WorkspaceTab;
  zone: string;
  model: string;
  match: ParsedNeed | null;
  needText: string;
  shortlist: number[];
  compare: number[];
  draftTeam: TeamDraftMember[];
  teamZone: string;
  teamWeeks: number;
  filters: DiscoverFilters;
  pods: DeliveryPod[];
  requests: ConsultingRequest[];
  projects: ProjectOpportunity[];
  workforce: WorkforceMember[];
  drawer: DrawerKind | null;
  modal: ModalKind | null;
  toasts: ToastItem[];
  unlockOpen: boolean;
}

interface AppContextValue extends AppState {
  toast: (message: string) => void;
  closeOverlays: () => void;
  requestUnlock: () => void;
  closeUnlock: () => void;
  openDrawer: (drawer: DrawerKind) => void;
  openModal: (modal: ModalKind) => void;
  setMode: (mode: WorkspaceMode) => void;
  setTab: (tab: WorkspaceTab) => void;
  setZone: (zone: string) => void;
  setModel: (model: string) => void;
  setMatch: (match: ParsedNeed | null) => void;
  setNeedText: (text: string) => void;
  setFilters: (filters: DiscoverFilters | ((prev: DiscoverFilters) => DiscoverFilters)) => void;
  clearFilters: () => void;
  toggleShortlist: (index: number) => void;
  toggleCompare: (index: number) => void;
  addToTeam: (index: number) => void;
  addRole: (role: string) => void;
  updateDraftAlloc: (index: number, allocation: number) => void;
  removeDraft: (index: number) => void;
  clearDraft: () => void;
  setTeamZone: (zone: string) => void;
  setTeamWeeks: (weeks: number) => void;
  requestTeam: () => void;
  approveTimesheet: (index: number) => void;
  continueTrial: (index: number) => void;
  moveRequest: (index: number) => void;
  addRequest: (request: ConsultingRequest) => void;
  addProject: (project: ProjectOpportunity) => void;
  startTrial: (index: number) => void;
}

const EMPTY_FILTERS: DiscoverFilters = {
  query: '',
  community: '',
  availability: '',
  rate: '',
  sort: 'match',
};

const AppContext = createContext<AppContextValue | null>(null);

let toastId = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>('buyer');
  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [zone, setZone] = useState('');
  const [model, setModel] = useState('');
  const [match, setMatch] = useState<ParsedNeed | null>(null);
  const [needText, setNeedText] = useState(
    'We need to migrate our legacy warehouse to Databricks in the next two quarters and want a team that owns it.',
  );
  const [shortlist] = useState<number[]>([]);
  const [compare] = useState<number[]>([]);
  const [draftTeam, setDraftTeam] = useState<TeamDraftMember[]>([]);
  const [teamZone, setTeamZone] = useState('US Central');
  const [teamWeeks, setTeamWeeks] = useState(12);
  const [filters, setFilters] = useState<DiscoverFilters>(EMPTY_FILTERS);
  const [pods] = useState<DeliveryPod[]>(INITIAL_PODS);
  const [requests, setRequests] = useState<ConsultingRequest[]>(INITIAL_REQUESTS);
  const [projects, setProjects] = useState<ProjectOpportunity[]>(INITIAL_PROJECTS);
  const [workforce] = useState<WorkforceMember[]>(INITIAL_WORKFORCE);
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const toast = useCallback((message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2600);
  }, []);

  const closeOverlays = useCallback(() => {
    setDrawer(null);
    setModal(null);
  }, []);

  const requestUnlock = useCallback(() => {
    setDrawer(null);
    setModal(null);
    setUnlockOpen(true);
  }, []);

  const closeUnlock = useCallback(() => {
    setUnlockOpen(false);
  }, []);

  const openDrawer = useCallback(
    (_next: DrawerKind) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const openModal = useCallback(
    (next: ModalKind) => {
      if (next.type === 'enquiry') {
        setDrawer(null);
        setModal(next);
        return;
      }
      requestUnlock();
    },
    [requestUnlock],
  );

  const setMode = useCallback((next: WorkspaceMode) => {
    setModeState(next);
    setTab(next === 'buyer' ? 'overview' : 'passport');
  }, []);

  const clearFilters = useCallback(() => {
    setZone('');
    setMatch(null);
    setModel('');
    setFilters(EMPTY_FILTERS);
  }, []);

  const toggleShortlist = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const toggleCompare = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const addToTeam = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const addRole = useCallback(
    (_role: string) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const updateDraftAlloc = useCallback((index: number, allocation: number) => {
    setDraftTeam((prev) => prev.map((member, i) => (i === index ? { ...member, allocation } : member)));
  }, []);

  const removeDraft = useCallback((index: number) => {
    setDraftTeam((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearDraft = useCallback(() => setDraftTeam([]), []);

  const requestTeam = useCallback(() => {
    requestUnlock();
  }, [requestUnlock]);

  const approveTimesheet = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const continueTrial = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const moveRequest = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const addRequest = useCallback((request: ConsultingRequest) => {
    setRequests((prev) => [request, ...prev]);
  }, []);

  const addProject = useCallback((project: ProjectOpportunity) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const startTrial = useCallback(
    (_index: number) => {
      requestUnlock();
    },
    [requestUnlock],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      mode,
      tab,
      zone,
      model,
      match,
      needText,
      shortlist,
      compare,
      draftTeam,
      teamZone,
      teamWeeks,
      filters,
      pods,
      requests,
      projects,
      workforce,
      drawer,
      modal,
      toasts,
      unlockOpen,
      toast,
      closeOverlays,
      requestUnlock,
      closeUnlock,
      openDrawer,
      openModal,
      setMode,
      setTab,
      setZone,
      setModel,
      setMatch,
      setNeedText,
      setFilters,
      clearFilters,
      toggleShortlist,
      toggleCompare,
      addToTeam,
      addRole,
      updateDraftAlloc,
      removeDraft,
      clearDraft,
      setTeamZone,
      setTeamWeeks,
      requestTeam,
      approveTimesheet,
      continueTrial,
      moveRequest,
      addRequest,
      addProject,
      startTrial,
    }),
    [
      mode,
      tab,
      zone,
      model,
      match,
      needText,
      shortlist,
      compare,
      draftTeam,
      teamZone,
      teamWeeks,
      filters,
      pods,
      requests,
      projects,
      workforce,
      drawer,
      modal,
      toasts,
      unlockOpen,
      toast,
      closeOverlays,
      requestUnlock,
      closeUnlock,
      openDrawer,
      openModal,
      setMode,
      clearFilters,
      toggleShortlist,
      toggleCompare,
      addToTeam,
      addRole,
      updateDraftAlloc,
      removeDraft,
      clearDraft,
      requestTeam,
      approveTimesheet,
      continueTrial,
      moveRequest,
      addRequest,
      addProject,
      startTrial,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
