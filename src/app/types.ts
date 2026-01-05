export type UUID = string;

export type TrackType = 'progress' | 'danger';

export interface Track {
  id: UUID;
  type: TrackType;
  name: string;
  length: number;
  ticks: number;
}

export type JournalEntryType =
  | 'note'
  | 'roll'
  | 'disaster'
  | 'track'
  | 'state';

export interface JournalEntry {
  id: UUID;
  ts: number;
  type: JournalEntryType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface Character {
  name: string;
  pronouns?: string;
  look?: string;
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
