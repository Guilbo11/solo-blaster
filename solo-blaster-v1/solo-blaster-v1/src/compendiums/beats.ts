export interface Beat {
  id: string;
  name: string;
  cost?: string;
  effect: string;
  notes?: string;
}

export const BEATS: Beat[] = [
  {
    id: 'sample-beat',
    name: 'Sample Beat (Replace with full Solo Blaster PDF beats)',
    cost: '—',
    effect: 'No mechanical effect (placeholder).',
    notes: 'Paste full beats from your Solo Blaster PDF into this compendium.',
  },
];
