export interface FactionEntry {
  id: string;
  name: string;
  /** Crew | Authority | Sponsor */
  category: 'Crew' | 'Authority' | 'Sponsor';
  // Optional enrichment fields (used by ToolsPage; can be expanded later).
  description: string;
  vibe: string;
  likes: string[];
  dislikes: string[];
  whatTheyWant: string[];
  howTheyApplyPressure: string[];
}

// Source: Factions quick list (provided PDF).
// These are names-only for now (safe, faithful). Enrichment can be added later.
export const FACTIONS: FactionEntry[] = [
  // Crews
  { id: 'brb', name: 'BRB', category: 'Crew', description: '', vibe: 'Crew', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'jet_collective', name: 'Jet Collective', category: 'Crew', description: '', vibe: 'Crew', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'null_range', name: 'Null Range', category: 'Crew', description: '', vibe: 'Crew', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'lazy_bunny', name: 'Lazy Bunny', category: 'Crew', description: '', vibe: 'Crew', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'the_wicks', name: 'The Wicks', category: 'Crew', description: '', vibe: 'Crew', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },

  // Authorities
  { id: 'dara', name: 'DARA', category: 'Authority', description: '', vibe: 'Authority', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'the_arborists', name: 'The Arborists', category: 'Authority', description: '', vibe: 'Authority', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'shimmer', name: 'Shimmer', category: 'Authority', description: '', vibe: 'Authority', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'doorways', name: 'Doorways', category: 'Authority', description: '', vibe: 'Authority', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'the_old_guard', name: 'The Old Guard', category: 'Authority', description: '', vibe: 'Authority', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },

  // Sponsors
  { id: 'miper', name: 'MIPER', category: 'Sponsor', description: '', vibe: 'Sponsor', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'hardecker', name: 'Hardecker', category: 'Sponsor', description: '', vibe: 'Sponsor', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'wilkies', name: "Wilkie’s", category: 'Sponsor', description: '', vibe: 'Sponsor', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'scram_cat', name: 'Scram Cat', category: 'Sponsor', description: '', vibe: 'Sponsor', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
  { id: 'fust', name: 'FUST', category: 'Sponsor', description: '', vibe: 'Sponsor', likes: [], dislikes: [], whatTheyWant: [], howTheyApplyPressure: [] },
];
