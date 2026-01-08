import { FACTIONS } from '../compendiums/factions';

// Note: the book has 200 terrestrial + 200 extraterrestrial names.
// To keep the repo light, we generate deterministic pools.

function buildNames(syllablesA: string[], syllablesB: string[], syllablesC: string[], count: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (out.length < count) {
    const a = syllablesA[i % syllablesA.length];
    const b = syllablesB[Math.floor(i / syllablesA.length) % syllablesB.length];
    const c = syllablesC[Math.floor(i / (syllablesA.length * syllablesB.length)) % syllablesC.length];
    const name = `${cap(a)}${b}${c}`.replaceAll("''", "'");
    out.push(name);
    i++;
  }
  return out;
}

function buildFullNames(first: string[], last: string[], count: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (out.length < count) {
    const f = first[i % first.length];
    const l = last[Math.floor(i / first.length) % last.length];
    const name = `${f} ${l}`;
    if (!out.includes(name)) out.push(name);
    i++;
  }
  return out;
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Terrestrial: real-world-style full names (avoid samey suffixes like "-son").
export const NAMES_TERRESTRIAL: string[] = buildFullNames(
  [
    'Alex', 'Sam', 'Jordan', 'Taylor', 'Jamie', 'Casey', 'Morgan', 'Riley', 'Avery', 'Cameron',
    'Dylan', 'Elliot', 'Noah', 'Maya', 'Lea', 'Zoé', 'Chloé', 'Emma', 'Lucas', 'Leo',
    'Mila', 'Nina', 'Sofia', 'Mia', 'Owen', 'Ethan', 'Liam', 'Aria', 'Jules', 'Theo',
    'Nora', 'Iris', 'Mason', 'Logan', 'Harper', 'Quinn', 'Parker', 'Rowan', 'Sasha', 'Robin',
  ],
  [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
    'Anderson', 'Thomas', 'Moore', 'Martin', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King',
    'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts',
    'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy',
  ],
  200
);

// Extraterrestrial: pronounceable-ish alien names (vary endings; not all "-th").
export const NAMES_EXTRATERRESTRIAL: string[] = buildNames(
  ['x', 'z', 'q', 'k', 'v', 't', 'r', 'n', 'm', 'l', 's', 'h', 'j', "y'", 'gh', 'kr', 'zx', 'qu', 'va', 'nu'],
  ['a', 'e', 'i', 'o', 'u', 'aa', 'ii', 'oo', 'uu', 'ae'],
  ['x', 'k', 'q', 'n', 'm', 'r', 'z', "'l", "-9", 'th', 's', 'v'],
  200
);

const factionNames = FACTIONS.map((f) => f.name).filter(Boolean);

// 36 entries each (d66-ish in the book; Solo Blaster uses any random).
export const WANTS: string[] = (
  [
    'A clean escape route',
    'To pay off a debt',
    'To impress their crew',
    'A ride out of town',
    'A rare component',
    'A portal map fragment',
    'To sabotage a rival',
    'To clear their name',
    'To sell a hot item',
    'To prove a theory',
    'To find a missing friend',
    'To secure a safehouse',
    'To recruit you',
    'To warn you about a threat',
    'To trade information',
    'To keep a secret buried',
    'To get revenge',
    'To win a contest',
    'To stop a disaster',
    'To cause a disaster (for profit)',
    'To steal a prototype',
    'To recover lost footage',
    'To expose corruption',
    'To get licensed access',
    'To get a favour called in',
    'To replace a broken Mod',
    'To get a sponsorship deal',
    'To secure medical help',
    'To protect someone important',
    'To break into a facility',
    'To erase a trail',
    'To make an example of someone',
    'To buy time',
    'To get you off their back',
    'To start a new hustle',
    'To keep the peace (their way)',
  ] as string[]
).map((s, i) => (i < 36 ? s : s))
  .slice(0, 36)
  .concat([])
  .slice(0, 36)
  .map((s, i) => (i === 0 && factionNames[0] ? `${s} (tied to ${factionNames[0]})` : s));

export const LIKES: string[] = (
  [
    'Fast talk and bold plans',
    'Careful prep and checklists',
    'High-risk stunts',
    'Quiet competence',
    'Gossip and rumours',
    'Portal lore',
    'Old tech',
    'New tech',
    'Aesthetic gear',
    'Honest deals',
    'One last chance',
    'Clean lines and symmetry',
    'Weird snacks',
    'Local music',
    'Exploring ruins',
    'Collecting souvenirs',
    'Making friends with strangers',
    'Winning arguments',
    'Overhearing secrets',
    'Being underestimated',
    'Helping kids',
    'Helping animals',
    'A good hustle',
    'A good story',
    'Being owed favours',
    'Watching the skies',
    'Testing boundaries',
    'Big public gestures',
    'Small private gestures',
    'Rules that make sense',
    'Breaking rules that don’t',
    'A clean getaway',
    'A clean conscience',
    'A clean record',
    'A clean outfit',
    'A clean win',
  ] as string[]
).slice(0, 36);

export const DISLIKES: string[] = (
  [
    'Being lied to',
    'Being interrupted',
    'Being ignored',
    'Being followed',
    'Being recorded',
    'Corporate suits',
    'Portal tourists',
    'Careless crews',
    'Overconfident amateurs',
    'Unnecessary violence',
    'Necessary violence',
    'Crowds',
    'Silence',
    'Bright lights',
    'Deep shadows',
    'Wet places',
    'Dry places',
    'Anything "cursed"',
    'Anything "official"',
    'Anyone asking questions',
    'People who won’t commit',
    'People who commit too hard',
    'Bad odds',
    'Good odds (too easy)',
    'Messy plans',
    'Messy friends',
    'Messy morals',
    'Long waits',
    'Short deadlines',
    'Being in debt',
    'Being in charge',
    'Being powerless',
    'Being famous',
    'Being forgotten',
    'Being second best',
    'Being predictable',
  ] as string[]
).slice(0, 36);

export function rollFrom<T>(arr: T[]): T {
  if (!arr.length) throw new Error('Cannot roll from empty array');
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollNpcName(kind: 'terrestrial' | 'extraterrestrial'): string {
  return rollFrom(kind === 'extraterrestrial' ? NAMES_EXTRATERRESTRIAL : NAMES_TERRESTRIAL);
}

export function rollNpcTrait(kind: 'wants' | 'likes' | 'dislikes'): string {
  if (kind === 'wants') return rollFrom(WANTS);
  if (kind === 'likes') return rollFrom(LIKES);
  return rollFrom(DISLIKES);
}
