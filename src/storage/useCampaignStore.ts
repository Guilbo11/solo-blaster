import { useSyncExternalStore } from 'react';
import { Campaign, JournalChapter, Resources } from '../app/types';
import { uuid } from '../utils/uuid';

const STORAGE_KEY = 'solo-blaster:v1';

interface State {
  campaigns: Campaign[];
  activeCampaignId: string | null;
}

type Listener = () => void;

function defaultResources(): Resources {
  return {
    attitudeBoost: 2,
    attitudeKick: 2,
    turboBoost: 2,
    turboKick: 2,
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
    character: defaultCharacter(),
    resources: defaultResources(),
    run: { isActive: false, disasterRolled: false, tracks: [] },
    journalHtml: '',
    journalChapters: [
      { id: uuid(), title: 'Journal', html: '', createdAt: now, updatedAt: now } satisfies JournalChapter,
    ],
    journal: [],
    epilogue: { legacies: [], dooms: [] },
    npcs: [],
    worlds: [],
  };
}


function defaultCharacter() {
  return {
    created: false,
    playbook: 'Loner' as const,
    name: 'Unnamed Loner',
    pronouns: '',
    look: '',
    family: ['', ''] as [string, string],
    vibes: '',
    traits: [] as string[],
    autodidact: ['', ''] as [string, string],
    raygun: { a: '', b: '' },
    hoverboard: { gripColor: '', gripCut: '', deckGraphic: '', boardType: '' },
    personalGear: '',
    otherGear: [] as string[],
    signatureGear: undefined as any,
    components: { coil: 0, disc: 0, lens: 0, gem: 0 },
    ownedMods: [] as string[],
    notes: '',
    // legacy
    signatureDevice: '',
    signatureLooks: '',
    startingMod: '',
    trait: '',
    hangouts: [] as string[],
    factions: { fan: '', annoyed: '', family: '' },
    portals: [] as { id: string; from: string; to: string }[],
    hook: '',
  };
}

function normalizeCampaign(c: any): Campaign {
  const now = Date.now();
  // Backwards compat: older builds stored attitude/turbo as a single number.
  const rawResources = { ...(c?.resources ?? {}) };
  const resources = { ...defaultResources(), ...rawResources };
  // If legacy "attitude" exists, map it to boost (keep kick default).
  if (typeof rawResources.attitude === 'number') {
    resources.attitudeBoost = rawResources.attitude;
  }
  // If legacy "turbo" exists, map it to boost (keep kick default).
  if (typeof rawResources.turbo === 'number') {
    resources.turboBoost = rawResources.turbo;
  }

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
    components: { ...baseChar.components, ...(rawChar.components ?? {}) },
    ownedMods: Array.isArray(rawChar.ownedMods) ? rawChar.ownedMods : baseChar.ownedMods,
    notes: typeof rawChar.notes === 'string' ? rawChar.notes : baseChar.notes,
    traits: Array.isArray(rawChar.traits) ? rawChar.traits : baseChar.traits,
    autodidact:
      Array.isArray(rawChar.autodidact) && rawChar.autodidact.length === 2
        ? (rawChar.autodidact as [string, string])
        : baseChar.autodidact,
    family: (Array.isArray(rawChar.family) && rawChar.family.length === 2 ? rawChar.family : (typeof rawChar.family === 'string' ? [rawChar.family, ''] : baseChar.family)) as [string, string],
  };

  // Migrations / back-compat:
  if (!character.traits.length && typeof (rawChar?.trait) === 'string' && rawChar.trait.trim()) {
    character.traits = [rawChar.trait.trim()];
  }

  const run = {
    isActive: false,
    disasterRolled: false,
    // tracks normalized below
    ...(c?.run ?? {}),
    tracks: Array.isArray(c?.run?.tracks) ? c.run.tracks : [],
  };

  const epilogue = {
    legacies: Array.isArray(c?.epilogue?.legacies) ? c.epilogue.legacies : [],
    dooms: Array.isArray(c?.epilogue?.dooms) ? c.epilogue.dooms : [],
  };

  // Keep counts in sync with named lists if present.
  resources.doom = epilogue.dooms.length || resources.doom || 0;
  resources.legacy = epilogue.legacies.length || resources.legacy || 0;

  const legacyHtml = typeof c?.journalHtml === 'string' ? c.journalHtml : '';
  const rawChapters = Array.isArray(c?.journalChapters) ? c.journalChapters : null;
  let journalChapters: JournalChapter[];
  if (rawChapters && rawChapters.length) {
    journalChapters = rawChapters
      .filter(Boolean)
      .map((ch: any) => {
        const createdAt = typeof ch?.createdAt === 'number' ? ch.createdAt : now;
        const updatedAt = typeof ch?.updatedAt === 'number' ? ch.updatedAt : createdAt;
        return {
          id: ch?.id ?? uuid(),
          title: typeof ch?.title === 'string' && ch.title.trim() ? ch.title : 'Chapter',
          html: typeof ch?.html === 'string' ? ch.html : '',
          createdAt,
          updatedAt,
        } satisfies JournalChapter;
      });
  } else {
    // Migrate from legacy journalHtml.
    journalChapters = [
      { id: uuid(), title: 'Journal', html: legacyHtml, createdAt: now, updatedAt: now } satisfies JournalChapter,
    ];
  }

  const rawNpcs = Array.isArray(c?.npcs) ? c.npcs : [];
  const npcs = rawNpcs
    .filter(Boolean)
    .map((n: any) => {
      // Back-compat: older NPCs only had name/notes.
      const createdAt = typeof n?.createdAt === 'number' ? n.createdAt : now;
      const updatedAt = typeof n?.updatedAt === 'number' ? n.updatedAt : createdAt;
      return {
        id: n?.id ?? uuid(),
        kind: n?.kind === 'extraterrestrial' ? 'extraterrestrial' : 'terrestrial',
        name: typeof n?.name === 'string' ? n.name : 'NPC',
        location: typeof n?.location === 'string' ? n.location : '',
        wants: typeof n?.wants === 'string' ? n.wants : '',
        likes: typeof n?.likes === 'string' ? n.likes : '',
        dislikes: typeof n?.dislikes === 'string' ? n.dislikes : '',
        notes: typeof n?.notes === 'string' ? n.notes : '',
        createdAt,
        updatedAt,
      };
    });

  return {
    id: c?.id ?? uuid(),
    name: c?.name ?? 'Campaign',
    createdAt: typeof c?.createdAt === 'number' ? c.createdAt : now,
    updatedAt: typeof c?.updatedAt === 'number' ? c.updatedAt : now,
    locked: Boolean(c?.locked),
    character,
    resources,
    run,
    journalHtml: legacyHtml,
    journalChapters,
    journal: Array.isArray(c?.journal) ? c.journal : [],
    epilogue,
    npcs,
    worlds: Array.isArray(c?.worlds) ? c.worlds : [],
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