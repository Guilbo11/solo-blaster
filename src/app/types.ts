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

export interface Character {
  created: boolean;
  playbook: 'Loner';

  name: string;
  pronouns: string;

  look: string;
  family: string;
  vibes: string;
  trait: string;

  // Starter kit
  raygun: { a: string; b: string };
  hoverboard: { gripColor: string; gripCut: string; deckGraphic: string; boardType: string };
  personalGear: string;
  otherGear: string[];

  // Signature (kept for later expansion)
  signatureDevice: string;
  signatureLooks: string;
  startingMod: string;

  // Connections & map
  hangouts: string[]; // should be 2
  factions: { fan: string; annoyed: string; family: string };
  portals: PortalLink[];

  // Hook
  hook: string;
}

export interface Resources {
  attitude: number;
  turbo: number;
  bite: number;
  trouble: number;
  style: number;
  doom: number;
  legacy: number;
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
  journal: JournalEntry[];
}
