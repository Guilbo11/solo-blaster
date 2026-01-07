import { uuid } from '../utils/uuid';

export const WORLD_COLOURS: Array<{ d6: number; col12: string; col34: string; col56: string }> = [
  { d6: 1, col12: 'red', col34: 'orange', col56: 'teal' },
  { d6: 2, col12: 'yellow', col34: 'green', col56: 'magenta' },
  { d6: 3, col12: 'blue', col34: 'purple', col56: 'lime' },
  { d6: 4, col12: 'pink', col34: 'lilac', col56: 'peach' },
  { d6: 5, col12: 'black', col34: 'white', col56: 'grey' },
  { d6: 6, col12: 'brown', col34: 'clear', col56: 'wtf?' },
];

export const WORLD_LANDSCAPE: Array<{ d6: number; band13: string; band46: string }> = [
  { d6: 1, band13: 'grasslands', band46: 'forest' },
  { d6: 2, band13: 'jungle', band46: 'tundra' },
  { d6: 3, band13: 'mountain', band46: 'desert' },
  { d6: 4, band13: 'badlands', band46: 'swamp' },
  { d6: 5, band13: 'aquatic', band46: 'space' },
  { d6: 6, band13: 'urban', band46: 'combine two' },
];

// Make a World (Other Worlds) — d66 tables.
// Source: Slugblaster 1.31, “Other Worlds: Make a World”.
export const WORLD_RUINS: Record<string, string> = {
  '11': 'airport',
  '12': 'amusement park',
  '13': 'battleship',
  '14': 'casino',
  '15': 'construction',
  '16': 'craters',
  '21': 'cruise liner',
  '22': 'department store',
  '23': 'greenhouses',
  '24': 'hospital',
  '25': 'hotel',
  '26': 'huge statues',
  '31': 'landfill',
  '32': 'marina',
  '33': 'military vehicles',
  '34': 'movie studio',
  '35': 'multiplex',
  '36': 'museum',
  '41': 'parade floats',
  '42': 'pizza arcade',
  '43': 'playground',
  '44': 'powerplant',
  '45': 'prison',
  '46': 'rail yard',
  '51': 'receiver dishes',
  '52': 'reservoir',
  '53': 'school',
  '54': 'shipping yard',
  '55': 'skyscrapers',
  '56': 'solar farm',
  '61': 'spacecraft',
  '62': 'stadium',
  '63': 'suburb',
  '64': 'subway system',
  '65': 'warehouse',
  '66': 'zoo',
};

export const WORLD_TWIST: Record<string, string> = {
  '11': 'The air here is toxic/hallucinogenic/caffeinated.',
  '12': 'The terrain is constantly moving.',
  '13': 'Everything is on fire. It doesn’t burn, just looks rad.',
  '14': 'An active battlefield, apocalypse, or celebration.',
  '15': 'You can’t be hurt here.',
  '16': 'Gravity is weaker.',
  '21': 'Gravity pulls from different points.',
  '22': 'Your tech struggles, lags, routinely dies.',
  '23': 'Your tech gains power at a dangerous rate.',
  '24': 'Every smell reminds you of a specific moment.',
  '25': 'You’re like ghosts haunting this place.',
  '26': 'An enthusiastic audience you can hear but not see.',
  '31': 'Something draws you to the centre.',
  '32': 'As you move further in, things lose detail.',
  '33': 'Structured like a ring, sphere, ribbon, box, etc.',
  '34': 'Exists on or inside a colossal being.',
  '35': 'Exists inside a snow globe, terrarium, or diorama.',
  '36': 'A familiar bedroom, but you’re an inch tall.',
  '41': 'Universe is 2D, like a sidescroller.',
  '42': 'Like your world, but if you’d made different choices.',
  '43': 'Like your world, but in the past.',
  '44': 'Like your world, but in the future.',
  '45': 'Time moves slowly/backwards, but not for you.',
  '46': 'A day here is a minute at home.',
  '51': 'Time can be controlled through intense willpower.',
  '52': 'Time loop!',
  '53': 'Dreamworld logic.',
  '54': 'All your thoughts happen out loud.',
  '55': 'Terrain reflects your mood.',
  '56': 'Formed from the contents of your phones/pockets.',
  '61': 'Formed from your collective id.',
  '62': 'This is the inner landscape of someone you know.',
  '63': 'This is all a simulation. (What’s new, amiright?)',
  '64': 'What constitutes a swear varies moment to moment.',
  '65': 'Single episode genre-swap.',
  '66': 'You’re in a musical and only one of you knows this isn’t normal.',
};

function d6() {
  return Math.floor(Math.random() * 6) + 1;
}

function d66() {
  const a = d6();
  const b = d6();
  return `${a}${b}`;
}

export function rollWorldColours(): string[] {
  // Roll twice on the COLOURS table.
  const pick = () => {
    const r = d6();
    const row = WORLD_COLOURS.find((x) => x.d6 === r)!;
    const band = d6();
    if (band <= 2) return row.col12;
    if (band <= 4) return row.col34;
    return row.col56;
  };
  return [pick(), pick()];
}

export function rollWorldLandscape(): string {
  const row = WORLD_LANDSCAPE.find((x) => x.d6 === d6())!;
  return d6() <= 3 ? row.band13 : row.band46;
}

export function rollWorldRuins(): { roll: string; value: string } {
  const roll = d66();
  return { roll, value: WORLD_RUINS[roll] || 'ruins' };
}

export function rollWorldTwist(): { roll: string; value: string } {
  const roll = d66();
  return { roll, value: WORLD_TWIST[roll] || 'something strange is going on' };
}

export function makeWorldFromRolls(args: {
  name: string;
  colours: string[];
  landscape: string;
  ruins: string;
  twist: string;
  adjacencies: string[];
}) {
  const now = Date.now();
  return {
    id: uuid(),
    name: args.name.trim() || 'Unnamed World',
    kind: 'custom' as const,
    colours: args.colours,
    landscape: args.landscape,
    ruins: args.ruins,
    twist: args.twist,
    adjacencies: args.adjacencies,
    createdAt: now,
  };
}
