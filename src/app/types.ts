export type UUID = string;

export type TrackType = 'progress' | 'danger';

export interface Track {
  id: UUID;
  type: TrackType;
  name: string;
  length: number;
  ticks: number;
}

export type JournalEntryType = 'note' | 'roll' | 'disaster' | 'track' | 'state';

export interface JournalEntry {
  id: UUID;
  ts: number;
  type: JournalEntryType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface PortalLink {
  id: UUID;
  from: string;
  to: string;
}

export interface World {
  id: UUID;
  name: string;
  kind: 'canon' | 'custom';
  /** Optional flavor fields (from Make a World tool). */
  colours?: string[];
  landscape?: string;
  ruins?: string;
  twist?: string;
  /** Manual adjacency list (user-defined for custom worlds). */
  adjacencies: string[];
  createdAt: number;
}

export interface Character {
  created: boolean;
  playbook: 'Loner';

  name: string;
  pronouns: string;

  look: string;
  /** Solo Blaster: pick two families. */
  family: [string, string];
  vibes: string;
  /** One or more traits (beats can add more later). */
  traits: string[];

  /** Loner trait: Autodidact fill-ins (two free-text subjects). */
  autodidact?: [string, string];

  // Starter kit
  raygun: { a: string; b: string };
  hoverboard: { gripColor: string; gripCut: string; deckGraphic: string; boardType: string };
  personalGear: string;
  otherGear: string[];

  // Signature Gear (Solo Blaster)
  signatureGear?: {
    gearId: string;
    gearName: string;
    type: string;
    freeModName: string;
    looks: string[];
    installedMods: string[];
  };

  // Components inventory
  components: { coil: number; disc: number; lens: number; gem: number };

  // Purchased/known mods (for manual buying + beats)
  ownedMods: string[];

  // Notes
  notes: string;

  /** Legacy fields kept for backwards compatibility (older saves). */
  signatureDevice?: string;
  signatureLooks?: string;
  startingMod?: string;
  trait?: string;

  // Connections & map
  hangouts: string[]; // should be 2
  factions: { fan: string; annoyed: string; family: string };
  portals: PortalLink[];

  // Hook
  hook: string;
}

export interface Resources {
  // Attitude is a kit with two separate resources.
  attitudeBoost: number;
  attitudeKick: number;

  // Turbo is also two separate resources. Boost affects dice pools.
  // Turbo can be increased later via mods.
  turboBoost: number;
  turboKick: number;

  bite: number;
  trouble: number;
  style: number;
  // Counts (named items are stored in epilogue below)
  doom: number;
  legacy: number;
}

export interface EpilogueItem {
  id: UUID;
  name: string;
}

export interface EpilogueState {
  legacies: EpilogueItem[];
  dooms: EpilogueItem[];
}

export interface RunState {
  isActive: boolean;
  goal?: string;
  prize?: string;
  biteStart?: number;
  disasterRolled: boolean;
  tracks: Track[];
}

export interface Campaign {
  id: UUID;
  name: string;
  createdAt: number;
  updatedAt: number;
  locked: boolean;

  character: Character;
  resources: Resources;
  run: RunState;
  // Rich journal HTML (TOR-style) + legacy list kept for backwards compat.
  journalHtml?: string;
  journal: JournalEntry[];
  epilogue?: EpilogueState;

  /** Simple NPC list for the campaign (Solo Blaster: section 6 Tables/Tools). */
  npcs?: { id: UUID; name: string; notes: string; createdAt: number }[];

  /** Worlds compendium for the campaign: canon worlds are implicit; custom worlds live here. */
  worlds?: World[];
}
