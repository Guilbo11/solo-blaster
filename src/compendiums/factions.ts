export interface FactionEntry {
  id: string;
  name: string;
  description: string;
  vibe: string;
  likes: string[];
  dislikes: string[];
  whatTheyWant: string[];
  howTheyApplyPressure: string[];
}

export const FACTIONS: FactionEntry[] = [
  {
    id: 'miper',
    name: 'MIPER',
    description:
      'A multiversal mega-corporation obsessed with control, logistics, and branding. MIPER sees the multiverse as a supply chain waiting to be optimized, owned, and monetized.',
    vibe: 'Corporate, invasive, relentlessly polished',
    likes: ['Order and predictability', 'Exclusive contracts and proprietary tech', 'Clear chains of command'],
    dislikes: ['Unlicensed portal use', 'Independent crews', 'Public embarrassment or brand damage'],
    whatTheyWant: ['Total control over portal infrastructure', 'To turn chaos into a managed product', 'To eliminate unsanctioned competition'],
    howTheyApplyPressure: ['Legal threats and cease-and-desist notices', 'Corporate security interventions', 'Subtle blacklisting and resource denial'],
  },
];
