import type { Campaign } from '../app/types';

// Canon adjacency list (kept as-written in the Portal Discovery beat).
export const CANON_PORTAL_WORLDS = [
  'Null',
  'Vastiche',
  'Thennis Spar',
  'The Golden Jungle',
  'Operaeblum',
  'Prismatia',
  'Desnine',
  'The Waking Pits',
  'Popularia',
  'Quahalia',
  'Empyrean',
  'Calorium',
] as const;

const ADJ: Record<string, string[]> = {
  'Null': ['Vastiche', 'Thennis Spar', 'The Golden Jungle'],
  'Vastiche': ['Operaeblum', 'Prismatia', 'Thennis Spar', 'The Golden Jungle'],
  'Thennis Spar': ['Null', 'Prismatia', 'Vastiche', 'The Golden Jungle', 'Desnine', 'The Waking Pits'],
  'The Golden Jungle': ['Null', 'Thennis Spar', 'Desnine'],
  'Operaeblum': ['Calorium', 'Empyrean', 'Prismatia', 'Vastiche'],
  'Prismatia': ['Vastiche', 'Operaeblum', 'Thennis Spar', 'The Waking Pits', 'Popularia', 'Empyrean'],
  'Desnine': ['The Golden Jungle', 'Thennis Spar', 'The Waking Pits', 'Quahalia'],
  'The Waking Pits': ['Popularia', 'Prismatia', 'Desnine', 'Quahalia', 'Thennis Spar'],
  'Popularia': ['Empyrean', 'Prismatia', 'The Waking Pits'],
  'Quahalia': ['The Waking Pits', 'Desnine'],
  'Empyrean': ['Calorium', 'Operaeblum', 'Prismatia', 'Popularia'],
  'Calorium': ['Empyrean', 'Operaeblum'],
};

export function getAllWorldNames(campaign: Campaign): string[] {
  const customWorlds = Array.isArray(campaign.worlds) ? campaign.worlds : [];
  const all = [...CANON_PORTAL_WORLDS, ...customWorlds.map((w) => w.name)];
  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}

export function areAdjacent(campaign: Campaign, a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return false;
  const canonA = ADJ[a] ?? [];
  const canonB = ADJ[b] ?? [];
  if (canonA.includes(b) || canonB.includes(a)) return true;

  // Custom worlds: adjacency is manual (treat as undirected)
  const customWorlds = Array.isArray(campaign.worlds) ? campaign.worlds : [];
  const customAdj = new Map<string, Set<string>>();
  for (const w of customWorlds) {
    const set = new Set<string>(Array.isArray(w.adjacencies) ? w.adjacencies : []);
    customAdj.set(w.name, set);
  }
  const ca = customAdj.get(a);
  const cb = customAdj.get(b);
  if (ca?.has(b) || cb?.has(a)) return true;
  return false;
}

export function adjacentTo(campaign: Campaign, worldA: string): string[] {
  const all = getAllWorldNames(campaign);
  return all.filter((w) => areAdjacent(campaign, worldA, w));
}
