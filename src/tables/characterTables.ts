// Tables used by the one-page Character Creation Wizard.
// These are meant to be sourced from the Solo Blaster PDF / core rulebook tables.
// v1: A compact set that matches the app flow; expand by pasting full tables later.

export const LOOK_WORDS = [
  'minimal', 'technical', 'oversized', 'fitted', 'all black', 'pastel',
  'neon', 'muted', 'vintage', 'flashy', 'polished', 'provocative',
  'relaxed', 'cutesy', 'trashy', 'chic', 'androgynous', 'brand-new',
  'classic', 'sporty', 'piercings', 'chains', 'second-hand', 'handmade',
  'ballcap', 'braces', 'nail polish', 'jewelry', 'shoelace belt', 'light makeup',
  'full beat', 'glasses', 'bandanna', 'dyed hair', 'lots of hair', 'shaved head',
];

// FAMILY table: d6 for row, then 1–3 vs 4–6
export const FAMILY_TABLE: Array<{ left: string; right: string }> = [
  { left: 'rich', right: 'boring' },
  { left: 'poor', right: 'religious' },
  { left: 'supportive', right: 'big' },
  { left: 'unstable', right: 'small' },
  { left: 'strict', right: 'sheltered' },
  { left: 'relaxed', right: 'ultraterrestrial' },
];

// Loner-specific vibes (Solo Blaster appendix).
export const LONER_VIBES = [
  'already has a smoking habit',
  'brooding',
  'odd one out in every crowd',
  'monosyllabic',
  'fixated on odd hobbies',
  'not from around here',
];

export type LonerTraitDef = { name: string; description: string };

// Loner traits (Solo Blaster appendix). Descriptions kept short for UI readability.
export const LONER_TRAITS: LonerTraitDef[] = [
  {
    name: 'One Step Ahead',
    description:
      'Twice per run, flash back to how you prepared for this moment. Take +1d6 or +1 Kick to that action.',
  },
  {
    name: 'Main Character Energy',
    description: 'You get +1d6 to Disaster rolls and an additional Slam box.',
  },
  {
    name: 'Called Shot',
    description:
      'You get +1d6 on solo Bite rolls. Also, when you roll on problem tables you can mark 1 Trouble to reroll and use either result.',
  },
  {
    name: 'Pathfinder',
    description: 'You roll +1d6 for In The Lab and Portal Discovery beats.',
  },
  {
    name: 'Autodidact',
    description:
      'You taught yourself all about ______ and ______. If either would help with an action, you can mark 1 Trouble to upgrade a 1–3 to a 4–5.',
  },
];

// Hoverboard tables: d6 for row, then 1–3 vs 4–6
export const GRIP_COLOUR_TABLE: Array<{ left: string; right: string }> = [
  { left: 'classic black', right: 'classic black' },
  { left: 'red', right: 'yellow' },
  { left: 'blue', right: 'orange' },
  { left: 'purple', right: 'green' },
  { left: 'pink', right: 'white' },
  { left: 'clear', right: 'hologram' },
];

export const GRIP_CUT_TABLE: Array<{ left: string; right: string }> = [
  { left: 'solid', right: 'solid' },
  { left: 'stripe', right: 'band' },
  { left: 'word pattern', right: 'pattern' },
  { left: 'logo', right: 'messy' },
  { left: 'mosaic', right: 'design' },
  { left: 'painted', right: 'torn' },
];

export const DECK_GRAPHIC_TABLE: Array<{ left: string; right: string }> = [
  { left: 'unpainted', right: 'solid colour' },
  { left: 'rad design', right: 'name of a sponsor' },
  { left: 'cool image', right: 'dope pattern' },
  { left: 'custom paint job', right: 'sticker collage' },
  { left: 'signed by someone', right: 'programmable display' },
  { left: 'hilarious slogan', right: 'hilarious slogan' },
];

// Board type: a 2d6-style matrix. Row bucket is 1–2 / 3–4 / 5–6; col is 1–6.
export const BOARD_TYPE_ROWS: Array<string[]> = [
  ['street', 'mcfly', 'manta', 'bigfoot', 'oldschool', 'slush'],
  ['penny', 'nickel', 'gert', 'bomb', 'drift', 'wave'],
  ['bmx', 'bmx', 'laserblades', 'laserblades', 'freerunners', 'freerunners'],
];

// Hangouts: d6 for row, then 1–3 vs 4–6
export const HANGOUT_TABLE: Array<{ left: string; right: string }> = [
  { left: 'the gas station', right: 'The Video Hut' },
  { left: 'Burger Man', right: 'the hoverboard park' },
  { left: 'a classroom', right: 'the school cafeteria' },
  { left: 'Make-Out Park', right: 'an abandoned building' },
  { left: 'a friend’s basement', right: 'your hideout' },
  { left: 'the mall', right: 'the woods' },
];

// Raygun tables (Raygun section):
// Step A and Step B are separate d6 tables with a 1–3 / 4–6 split.
export const RAYGUN_STEP_A_TABLE: Array<{ left: string; right: string }> = [
  { left: 'particle', right: 'maser' },
  { left: 'proton', right: 'neutron' },
  { left: 'laser', right: 'reality' },
  { left: 'mass', right: 'feedback' },
  { left: 'photon', right: 'danger' },
  { left: 'gravity', right: 'zero' },
];

export const RAYGUN_STEP_B_TABLE: Array<{ left: string; right: string }> = [
  { left: 'ray', right: 'bow' },
  { left: 'beam', right: 'wave' },
  { left: 'blaster', right: 'pistol' },
  { left: 'visor', right: 'projector' },
  { left: 'arc', right: 'cannon' },
  { left: 'wand', right: 'glove' },
];

// v1 Hooks: prompts; replace with full hook table from the PDF if desired.
export const HOOK_PROMPTS = [
  'A rival wants what you found.',
  'An authority is watching you.',
  'A faction offers a deal with strings attached.',
  'A portal is behaving wrong.',
  'Someone you care about is at risk.',
  'A monster has taken interest in you.',
];
