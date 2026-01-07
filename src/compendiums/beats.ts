export type BeatCurrency = 'style' | 'trouble';

export interface BeatCost {
  currency: BeatCurrency;
  amount: number;
}

export interface BeatEffect {
  /** Delta applied to resources (clamped elsewhere as needed). */
  style?: number;
  trouble?: number;
  doom?: number;
  legacy?: number;

  /** Prompts */
  addDoomName?: boolean;
  addLegacyName?: boolean;

  /** Beats with custom UI flows */
  special?: 'in-the-lab' | 'portal-discovery' | 'opportunity' | 'challenge';

  /** Trait gain (player chooses a new trait). */
  gainTrait?: {
    count: number;
    /** If true, allow selecting from *all* playbook traits (not just Loner). */
    allowAllPlaybooks?: boolean;
  };
}

export interface Beat {
  id: string;
  name: string;
  section:
    | 'Trait Beats'
    | 'Crew Beats'
    | 'Loner Arc'
    | 'Family Arc'
    | 'Angst Arc'
    | 'Other Beats';
  cost: BeatCost;
  effectText: string;
  effects?: BeatEffect;
}

// Data source: Solo Blaster PDF (Section 5: Downtime / Beats). Parsed into structured fields.
export const BEATS: Beat[] = [
  // Trait Beats
  {
    id: 'trait-origin-story',
    name: 'Origin Story',
    section: 'Trait Beats',
    cost: { currency: 'style', amount: 3 },
    effectText: 'A flashback that shows a defining moment from your past. +1 trait.',
    effects: { gainTrait: { count: 1 } },
  },
  {
    id: 'trait-sharpened',
    name: 'Sharpened',
    section: 'Trait Beats',
    cost: { currency: 'style', amount: 4 },
    effectText: 'A teammate inspires you or shows you something about yourself. +1 trait. (This beat: trait can be from ANY playbook.)',
    effects: { gainTrait: { count: 1, allowAllPlaybooks: true } },
  },

  // Crew Beats
  {
    id: 'crew-opportunity',
    name: 'Opportunity',
    section: 'Crew Beats',
    cost: { currency: 'style', amount: 2 },
    effectText: 'Something great happens to the crew. Roll an opportunity.',
    effects: { special: 'opportunity' },
  },
  {
    id: 'crew-challenge',
    name: 'Challenge',
    section: 'Crew Beats',
    cost: { currency: 'trouble', amount: 5 },
    effectText: 'Something not-so-great happens to the crew. Roll a challenge.',
    effects: { special: 'challenge' },
  },
  {
    id: 'crew-fight',
    name: 'Fight',
    section: 'Crew Beats',
    cost: { currency: 'trouble', amount: 5 },
    effectText: 'An argument, betrayal, or broken bond. +1 fracture.',
  },
  {
    id: 'crew-make-up',
    name: 'Make Up',
    section: 'Crew Beats',
    cost: { currency: 'style', amount: 5 },
    effectText: 'An apology, kind gesture, or regrown bond. −1 fracture.',
  },

  // Loner Arc
  {
    id: 'loner-alone',
    name: 'Alone',
    section: 'Loner Arc',
    cost: { currency: 'trouble', amount: 2 },
    effectText: '+1 doom, +1 slam.',
    effects: { doom: +1, addDoomName: true },
  },
  {
    id: 'loner-make-a-connection',
    name: 'Make a Connection',
    section: 'Loner Arc',
    cost: { currency: 'style', amount: 2 },
    effectText: '+1 legacy, +1 trait.',
    effects: { legacy: +1, addLegacyName: true, gainTrait: { count: 1 } },
  },
  {
    id: 'loner-the-break',
    name: 'The Break',
    section: 'Loner Arc',
    cost: { currency: 'trouble', amount: 4 },
    effectText: '+1 slam, +1 doom, and flag “-1d6 next solo bite roll”.',
    effects: { doom: +1, addDoomName: true },
  },
  {
    id: 'loner-reunion',
    name: 'Reunion',
    section: 'Loner Arc',
    cost: { currency: 'style', amount: 4 },
    effectText: '-2 doom, +1 legacy, +1 trait.',
    effects: { doom: -2, legacy: +1, addLegacyName: true, gainTrait: { count: 1 } },
  },

  // Family Arc
  {
    id: 'family-trouble-at-home',
    name: 'Trouble at Home',
    section: 'Family Arc',
    cost: { currency: 'trouble', amount: 2 },
    effectText: '+1 slam.',
  },
  {
    id: 'family-final-warning',
    name: 'Final Warning',
    section: 'Family Arc',
    cost: { currency: 'trouble', amount: 3 },
    effectText: '+1 doom.',
    effects: { doom: +1, addDoomName: true },
  },
  {
    id: 'family-last-straw',
    name: 'Last Straw',
    section: 'Family Arc',
    cost: { currency: 'trouble', amount: 4 },
    effectText: '+1 slam, +1 doom.',
    effects: { doom: +1, addDoomName: true },
  },
  {
    id: 'family-redemption',
    name: 'Redemption',
    section: 'Family Arc',
    cost: { currency: 'style', amount: 4 },
    effectText: '-2 doom, +1 legacy.',
    effects: { doom: -2, legacy: +1, addLegacyName: true },
  },

  // Angst Arc
  {
    id: 'angst-angst',
    name: 'Angst',
    section: 'Angst Arc',
    cost: { currency: 'trouble', amount: 2 },
    effectText: '+1 slam.',
  },
  {
    id: 'angst-struggling',
    name: 'Struggling',
    section: 'Angst Arc',
    cost: { currency: 'trouble', amount: 3 },
    effectText: '+1 doom.',
    effects: { doom: +1, addDoomName: true },
  },
  {
    id: 'angst-darkness',
    name: 'Darkness',
    section: 'Angst Arc',
    cost: { currency: 'trouble', amount: 4 },
    effectText: '+1 fracture.',
  },
  {
    id: 'angst-catharsis',
    name: 'Catharsis',
    section: 'Angst Arc',
    cost: { currency: 'style', amount: 4 },
    effectText: '-1 doom, -1 fracture, +1 legacy or trait.',
    effects: { doom: -1 },
  },

  // Other Beats
  {
    id: 'other-being-good',
    name: 'Being Good',
    section: 'Other Beats',
    cost: { currency: 'style', amount: 1 },
    effectText: 'Chores, homework, etc. Clear 2 trouble.',
    effects: { trouble: -2 },
  },
  {
    id: 'other-you-earned-it',
    name: 'You Earned It',
    section: 'Other Beats',
    cost: { currency: 'style', amount: 5 },
    effectText: '+1 legacy.',
    effects: { legacy: +1, addLegacyName: true },
  },
  {
    id: 'other-take-an-l',
    name: 'Take an L',
    section: 'Other Beats',
    cost: { currency: 'trouble', amount: 5 },
    effectText: '+1 doom.',
    effects: { doom: +1, addDoomName: true },
  },
  {
    id: 'other-in-the-lab',
    name: 'In the Lab',
    section: 'Other Beats',
    cost: { currency: 'style', amount: 1 },
    effectText: 'Tinkering, designing, crafting, shopping, etc. Install/uninstall mods, exchange components, or roll to gain components.',
    effects: { special: 'in-the-lab' },
  },
  {
    id: 'other-portal-discovery',
    name: 'Portal Discovery',
    section: 'Other Beats',
    cost: { currency: 'style', amount: 2 },
    effectText: 'Pick bordering worlds (A and B) and roll to learn what kind of portal-zone you discover.',
    effects: { special: 'portal-discovery' },
  },
];
