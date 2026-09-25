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
import { PROFESSIONALS } from '@/constants/workspace-data';
import { ROLES } from '@/constants/content';
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
}

interface AppContextValue extends AppState {
  toast: (message: string) => void;
  closeOverlays: () => void;
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
  const [shortlist, setShortlist] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);
  const [draftTeam, setDraftTeam] = useState<TeamDraftMember[]>([]);
  const [teamZone, setTeamZone] = useState('US Central');
  const [teamWeeks, setTeamWeeks] = useState(12);
  const [filters, setFilters] = useState<DiscoverFilters>(EMPTY_FILTERS);
  const [pods, setPods] = useState<DeliveryPod[]>(INITIAL_PODS);
  const [requests, setRequests] = useState<ConsultingRequest[]>(INITIAL_REQUESTS);
  const [projects, setProjects] = useState<ProjectOpportunity[]>(INITIAL_PROJECTS);
  const [workforce, setWorkforce] = useState<WorkforceMember[]>(INITIAL_WORKFORCE);
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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

  const openDrawer = useCallback((next: DrawerKind) => {
    setModal(null);
    setDrawer(next);
  }, []);

  const openModal = useCallback((next: ModalKind) => {
    setDrawer(null);
    setModal(next);
  }, []);

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
    (index: number) => {
      setShortlist((prev) => {
        if (prev.includes(index)) {
          toast(`${PROFESSIONALS[index].name} removed`);
          return prev.filter((item) => item !== index);
        }
        toast(`${PROFESSIONALS[index].name} saved`);
        return [...prev, index];
      });
    },
    [toast],
  );

  const toggleCompare = useCallback(
    (index: number) => {
      setCompare((prev) => {
        if (prev.includes(index)) return prev.filter((item) => item !== index);
        if (prev.length >= 3) {
          toast('Compare holds three. Remove one first.');
          return prev;
        }
        const next = [...prev, index];
        if (next.length >= 2) toast(`${next.length} selected - Compare is in the toolbar`);
        return next;
      });
    },
    [toast],
  );

  const addToTeam = useCallback(
    (index: number) => {
      setDraftTeam((prev) => {
        if (prev.some((member) => member.professionalIndex === index)) {
          toast(`${PROFESSIONALS[index].name} is already on the team`);
          return prev;
        }
        toast(`${PROFESSIONALS[index].name} added to the team you're building`);
        return [...prev, { professionalIndex: index, role: PROFESSIONALS[index].role, allocation: 100 }];
      });
    },
    [toast],
  );

  const addRole = useCallback((role: string) => {
    setDraftTeam((prev) => [...prev, { role, allocation: 100 }]);
  }, []);

  const updateDraftAlloc = useCallback((index: number, allocation: number) => {
    setDraftTeam((prev) => prev.map((member, i) => (i === index ? { ...member, allocation } : member)));
  }, []);

  const removeDraft = useCallback((index: number) => {
    setDraftTeam((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearDraft = useCallback(() => setDraftTeam([]), []);

  const requestTeam = useCallback(() => {
    const monthly = draftTeam.reduce((sum, member) => {
      const rate =
        member.professionalIndex !== undefined
          ? PROFESSIONALS[member.professionalIndex].rate
          : ROLES[member.role][0];
      return sum + rate * 40 * (member.allocation / 100) * 4.33;
    }, 0);
    setPods((prev) => [
      ...prev,
      {
        name: `Requested team - ${draftTeam.length} people`,
        team: draftTeam
          .map((member) => member.professionalIndex)
          .filter((index): index is number => index !== undefined),
        lead: draftTeam.find((member) => member.professionalIndex !== undefined)?.professionalIndex ?? 0,
        owner: 'Alex R.',
        status: 'pending',
        sprint: 0,
        velocity: [],
        commit: [],
        start: 'Requested',
        model: 'Managed Delivery Pod',
        fee: Math.round((monthly / 1000) * 10) / 10,
      },
    ]);
    setDraftTeam([]);
    setTab('delivery');
    toast('Team requested - named professionals and a fixed fee within two business days');
  }, [draftTeam, toast]);

  const approveTimesheet = useCallback(
    (index: number) => {
      setWorkforce((prev) => {
        const member = prev[index];
        toast(`${PROFESSIONALS[member.professionalIndex].name}: ${member.hours} hours approved`);
        return prev.map((item, i) => (i === index ? { ...item, pending: false } : item));
      });
    },
    [toast],
  );

  const continueTrial = useCallback(
    (index: number) => {
      setWorkforce((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'live', model: 'Dedicated', since: 'Today' } : item,
        ),
      );
      toast('Engagement started. Rate and hours carried over.');
    },
    [toast],
  );

  const moveRequest = useCallback(
    (index: number) => {
      setRequests((prev) =>
        prev.map((item, i) => {
          if (i !== index || item.stage >= 4) return item;
          toast(`Moved to ${['Submitted', 'Scoping', 'Proposal', 'Active', 'Closed'][item.stage + 1]}`);
          return { ...item, stage: item.stage + 1 };
        }),
      );
    },
    [toast],
  );

  const addRequest = useCallback((request: ConsultingRequest) => {
    setRequests((prev) => [request, ...prev]);
  }, []);

  const addProject = useCallback((project: ProjectOpportunity) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const startTrial = useCallback(
    (index: number) => {
      setWorkforce((prev) => [
        ...prev,
        {
          professionalIndex: index,
          status: 'trial',
          hours: 0,
          pending: false,
          since: 'Today',
          model: 'Flexible',
        },
      ]);
      toast('Trial requested - confirmation typically within 24 hours');
    },
    [toast],
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
      toast,
      closeOverlays,
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
      toast,
      closeOverlays,
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
