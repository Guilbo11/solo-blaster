import { useSyncExternalStore } from 'react';
import { Campaign, Resources } from '../app/types';
import { uuid } from '../utils/uuid';

const STORAGE_KEY = 'solo-blaster:v1';

interface State {
  campaigns: Campaign[];
  activeCampaignId: string | null;
}

type Listener = () => void;

function defaultResources(): Resources {
  return {
    attitude: 0,
    turbo: 0,
    bite: 0,
    trouble: 0,
    style: 0,
    doom: 0,
    legacy: 0,
  };
}

function makeCampaign(name: string): Campaign {
  const now = Date.now();
  return {
    id: uuid(),
    name,
    createdAt: now,
    updatedAt: now,
    locked: false,
    character: {
    created: false,
    playbook: 'Loner',
    name: 'Unnamed Loner',
    pronouns: '',
    look: '',
    family: '',
    vibes: '',
    trait: '',
    raygun: { a: '', b: '' },
    hoverboard: { gripColor: '', gripCut: '', deckGraphic: '', boardType: '' },
    personalGear: '',
    otherGear: [],
    signatureDevice: '',
    signatureLooks: '',
    startingMod: '',
    hangouts: [],
    factions: { fan: '', annoyed: '', family: '' },
    portals: [],
    hook: '',
  },
    resources: defaultResources(),
    run: { isActive: false, disasterRolled: false, tracks: [] },
    journal: [],
  };
}


function defaultCharacter() {
  return {
    created: false,
    playbook: 'Loner' as const,
    name: 'Unnamed Loner',
    pronouns: '',
    look: '',
    family: '',
    vibes: '',
    trait: '',
    raygun: { a: '', b: '' },
    hoverboard: { gripColor: '', gripCut: '', deckGraphic: '', boardType: '' },
    personalGear: '',
    otherGear: [] as string[],
    signatureDevice: '',
    signatureLooks: '',
    startingMod: '',
    hangouts: [] as string[],
    factions: { fan: '', annoyed: '', family: '' },
    portals: [] as { id: string; from: string; to: string }[],
    hook: '',
  };
}

function normalizeCampaign(c: any): Campaign {
  const now = Date.now();
  const resources = { ...defaultResources(), ...(c?.resources ?? {}) };

  const baseChar = defaultCharacter();
  const rawChar = c?.character ?? {};
  const character = {
    ...baseChar,
    ...rawChar,
    // normalize nested
    raygun: { ...baseChar.raygun, ...(rawChar.raygun ?? {}) },
    hoverboard: { ...baseChar.hoverboard, ...(rawChar.hoverboard ?? {}) },
    factions: { ...baseChar.factions, ...(rawChar.factions ?? {}) },
    portals: Array.isArray(rawChar.portals) ? rawChar.portals : baseChar.portals,
    hangouts: Array.isArray(rawChar.hangouts) ? rawChar.hangouts : baseChar.hangouts,
    otherGear: Array.isArray(rawChar.otherGear) ? rawChar.otherGear : baseChar.otherGear,
  };

  const run = {
    isActive: false,
    disasterRolled: false,
    // tracks normalized below
    ...(c?.run ?? {}),
    tracks: Array.isArray(c?.run?.tracks) ? c.run.tracks : [],
  };

  return {
    id: c?.id ?? uuid(),
    name: c?.name ?? 'Campaign',
    createdAt: typeof c?.createdAt === 'number' ? c.createdAt : now,
    updatedAt: typeof c?.updatedAt === 'number' ? c.updatedAt : now,
    locked: Boolean(c?.locked),
    character,
    resources,
    run,
    journal: Array.isArray(c?.journal) ? c.journal : [],
  };
}
function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { campaigns: [], activeCampaignId: null };
    const parsed = JSON.parse(raw) as State;
    // light validation
    if (!Array.isArray(parsed.campaigns)) return { campaigns: [], activeCampaignId: null };
    parsed.campaigns = parsed.campaigns.map(normalizeCampaign) as any;
    // ensure activeCampaignId still exists
    if (parsed.activeCampaignId && !parsed.campaigns.find((c:any)=>c.id===parsed.activeCampaignId)) {
      parsed.activeCampaignId = parsed.campaigns[0]?.id ?? null;
    }
    return parsed;
  } catch {
    return { campaigns: [], activeCampaignId: null };
  }
}

let state: State = typeof window === 'undefined' ? { campaigns: [], activeCampaignId: null } : loadState();
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function setState(updater: (prev: State) => State) {
  state = updater(state);
  persist();
  emit();
}

export const campaignActions = {
  createCampaign(name: string) {
    const c = makeCampaign(name.trim() || 'New Campaign');
    setState((prev) => ({
      ...prev,
      campaigns: [c, ...prev.campaigns],
      activeCampaignId: c.id,
    }));
  },

  deleteCampaign(id: string) {
    setState((prev) => {
      const campaigns = prev.campaigns.filter((c) => c.id !== id);
      const activeCampaignId = prev.activeCampaignId === id ? (campaigns[0]?.id ?? null) : prev.activeCampaignId;
      return { ...prev, campaigns, activeCampaignId };
    });
  },

  setActiveCampaign(id: string) {
    setState((prev) => ({ ...prev, activeCampaignId: id }));
  },

  updateCampaign(id: string, patcher: (c: Campaign) => Campaign) {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => (c.id === id ? patcher(c) : c)),
    }));
  },

  exportCampaign(id: string): string | null {
    const c = state.campaigns.find((x) => x.id === id);
    if (!c) return null;
    return JSON.stringify(c, null, 2);
  },

  importCampaign(jsonText: string): string | null {
    try {
      const c = JSON.parse(jsonText) as Campaign;
      if (!c?.id || !c?.name) return 'Invalid campaign JSON.';
      // Ensure unique id
      const newId = uuid();
      const now = Date.now();
      const imported: Campaign = { ...c, id: newId, createdAt: c.createdAt ?? now, updatedAt: now };
      setState((prev) => ({
        ...prev,
        campaigns: [imported, ...prev.campaigns],
        activeCampaignId: imported.id,
      }));
      return null;
    } catch (e) {
      return 'Invalid JSON.';
    }
  },

  resetAll() {
    setState(() => ({ campaigns: [], activeCampaignId: null }));
  },
};

export function getActiveCampaign(): Campaign | null {
  if (!state.activeCampaignId) return null;
  return state.campaigns.find((c) => c.id === state.activeCampaignId) ?? null;
}

export function useCampaignStore() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state
  );

  return snapshot;
}