import { CANON_WORLDS } from '../compendiums/worlds';

export type TableDie = 'd6' | 'd66' | 'random';

export type TableEntry = {
  /** For d6: "1".."6". For d66: "11".."66" */
  key: string;
  text: string;
};

export type RollTableDef = {
  id: string;
  name: string;
  die: TableDie;
  entries: TableEntry[];
};

export const TABLES: RollTableDef[] = [
  {
    id: 'soloProblems',
    name: 'Solo Problems (2d6)',
    die: 'd66',
    entries: [
      { key: '11', text: "You’re suddenly put in a desperate and difficult position." },
      { key: '12', text: 'An escape route is cut off or becomes much more dangerous.' },
      { key: '13', text: 'A new threat appears or situation gets much worse.' },
      { key: '14', text: 'You’re separated from someone or something you care about.' },
      { key: '15', text: 'Someone is in immediate danger and needs help right now.' },
      { key: '16', text: 'A terrible deadline or timer is suddenly revealed.' },
      { key: '21', text: 'A key tool or resource is lost, broken, or out of reach.' },
      { key: '22', text: "Someone’s trust is betrayed, or they turn on you." },
      { key: '23', text: 'A difficult choice arises between two bad outcomes.' },
      { key: '24', text: 'An authority figure shows up and complicates everything.' },
      { key: '25', text: 'The environment becomes actively hostile or unstable.' },
      { key: '26', text: 'You realize you were being watched or followed.' },
      { key: '31', text: 'A friend or ally makes a mistake that creates new trouble.' },
      { key: '32', text: 'Your plan is exposed, countered, or anticipated.' },
      { key: '33', text: 'Something valuable is at risk of being destroyed.' },
      { key: '34', text: 'A rival appears and makes a move against you.' },
      { key: '35', text: 'A key truth is revealed that changes what you thought.' },
      { key: '36', text: 'You’re forced to act before you’re ready.' },
      { key: '41', text: 'A monster shows up or becomes a factor.' },
      { key: '42', text: 'A portal or thin-zone behaves unpredictably.' },
      { key: '43', text: 'You’re put on the spot in front of an audience.' },
      { key: '44', text: 'You lose track of time, direction, or your bearings.' },
      { key: '45', text: 'Something you need is guarded, locked, or heavily protected.' },
      { key: '46', text: 'A deal is offered with a hidden cost.' },
      { key: '51', text: 'A sudden setback costs you progress or makes things harder.' },
      { key: '52', text: 'Your gear starts acting up, glitching, or failing.' },
      { key: '53', text: 'A crowd, faction, or authority gets involved unexpectedly.' },
      { key: '54', text: 'You’re cornered with no obvious way out.' },
      { key: '55', text: 'Your body or mind is pushed past its limits.' },
      { key: '56', text: 'You face an impossible task unless you take a big risk.' },
      { key: '61', text: 'Everything spirals. Add a danger track or escalate an existing one.' },
      { key: '62', text: 'You’re forced into a confrontation you can’t avoid.' },
      { key: '63', text: 'A major sacrifice is required to keep going.' },
      { key: '64', text: 'Someone you care about suffers consequences for your actions.' },
      { key: '65', text: 'You are utterly outmatched—escape is the only viable option.' },
      { key: '66', text: 'Disaster strikes early—trigger a Disaster Roll or equivalent fallout.' },
    ],
  },
  {
    id: 'explorationProblems',
    name: 'Exploration Problems (d6)',
    die: 'd6',
    entries: [
      { key: '1', text: "This is going to take longer than you thought." },
      { key: '2', text: 'This place is more dangerous than you expected.' },
      { key: '3', text: 'This place is more confusing than you expected.' },
      { key: '4', text: 'You get slammed by something in the environment.' },
      { key: '5', text: 'A monster shows up and attacks you. Uh oh.' },
      { key: '6', text: "Someone is here, and they might not like you." },
    ],
  },
  {
    id: 'infiltrationProblems',
    name: 'Infiltration Problems (d6)',
    die: 'd6',
    entries: [
      { key: '1', text: "You didn’t know about an extra layer of security." },
      { key: '2', text: 'Someone or something is watching.' },
      { key: '3', text: 'A security system or watcher is about to detect you.' },
      { key: '4', text: 'A security system detects you. Time to go loud or go now.' },
      { key: '5', text: 'A guard or monster shows up.' },
      { key: '6', text: 'You take a slam as you avoid detection.' },
    ],
  },
  {
    id: 'chaseProblems',
    name: 'Chase Problems (d6)',
    die: 'd6',
    entries: [
      { key: '1', text: 'Something unexpected blocks your path.' },
      { key: '2', text: 'You take a slam in the chaos.' },
      { key: '3', text: 'Your opponent gains ground.' },
      { key: '4', text: 'A dangerous obstacle appears.' },
      { key: '5', text: 'An authority shows up.' },
      { key: '6', text: 'A monster gets involved.' },
    ],
  },
  {
    id: 'fightProblems',
    name: 'Fight Problems (d6)',
    die: 'd6',
    entries: [
      { key: '1', text: "Didn’t even flinch! The monster is tougher than expected." },
      { key: '2', text: 'Oh come on! The situation escalates—more foes, a clock, or worse threat.' },
      { key: '3', text: 'Hope you have a backup plan! You lose an advantage or the terrain shifts.' },
      { key: '4', text: 'On second thought… it transforms or reveals something worse. Better run!' },
      { key: '5', text: 'You get slammed! (Slimed, jacked up, etc.)' },
      { key: '6', text: 'Area effect! An attack slams everyone here.' },
    ],
  },
  {
    id: 'socialProblems',
    name: 'Social Situation Problems (d6)',
    die: 'd6',
    entries: [
      { key: '1', text: 'Things get awkward, cold, tense, or hostile.' },
      { key: '2', text: 'You need to explain/prove yourself or do a favour first.' },
      { key: '3', text: "Things aren’t what you thought. You’re being set up, recognized, etc." },
      { key: '4', text: "Time is running out. You’re losing their interest, interruption nears, etc." },
      { key: '5', text: 'You take a slam (stressed, flustered, embarrassed, etc.).' },
      { key: '6', text: 'You are interrupted by something bad (monster, Rescue, unraveling, etc.).' },
    ],
  },
  {
    id: 'worldLandscape',
    name: 'World: Landscape (d6, then 1-3 vs 4-6)',
    die: 'd6',
    entries: [
      { key: '1', text: '1-3: Grasslands · 4-6: Forest' },
      { key: '2', text: '1-3: Jungle · 4-6: Tundra' },
      { key: '3', text: '1-3: Mountain · 4-6: Desert' },
      { key: '4', text: '1-3: Badlands · 4-6: Swamp' },
      { key: '5', text: '1-3: Aquatic · 4-6: Space' },
      { key: '6', text: '1-3: Urban · 4-6: Combine two' },
    ],
  },
  {
    id: 'worldRuins',
    name: 'World: Ruins (2d6)',
    die: 'd66',
    entries: [
      { key: '11', text: 'Airport' },
      { key: '12', text: 'Amusement park' },
      { key: '13', text: 'Battleship' },
      { key: '14', text: 'Casino' },
      { key: '15', text: 'Construction' },
      { key: '16', text: 'Craters' },
      { key: '21', text: 'Cruise liner' },
      { key: '22', text: 'Department store' },
      { key: '23', text: 'Greenhouses' },
      { key: '24', text: 'Hospital' },
      { key: '25', text: 'Hotel' },
      { key: '26', text: 'Huge statues' },
      { key: '31', text: 'Landfill' },
      { key: '32', text: 'Marina' },
      { key: '33', text: 'Military vehicles' },
      { key: '34', text: 'Movie studio' },
      { key: '35', text: 'Multiplex' },
      { key: '36', text: 'Museum' },
      { key: '41', text: 'Parade floats' },
      { key: '42', text: 'Pizza arcade' },
      { key: '43', text: 'Playground' },
      { key: '44', text: 'Powerplant' },
      { key: '45', text: 'Prison' },
      { key: '46', text: 'Rail yard' },
      { key: '51', text: 'Receiver dishes' },
      { key: '52', text: 'Reservoir' },
      { key: '53', text: 'School' },
      { key: '54', text: 'Shipping yard' },
      { key: '55', text: 'Skyscrapers' },
      { key: '56', text: 'Solar farm' },
      { key: '61', text: 'Spacecraft' },
      { key: '62', text: 'Stadium' },
      { key: '63', text: 'Suburb' },
      { key: '64', text: 'Subway system' },
      { key: '65', text: 'Warehouse' },
      { key: '66', text: 'Zoo' },
    ],
  },
  {
    id: 'worldTwist',
    name: 'World: Twist (2d6)',
    die: 'd66',
    entries: [
      { key: '11', text: 'The air here is toxic / hallucinogenic / caffeinated.' },
      { key: '12', text: 'The terrain is constantly moving.' },
      { key: '13', text: "Everything is on fire. It doesn’t burn, just looks rad." },
      { key: '14', text: 'An active battlefield, apocalypse, or celebration.' },
      { key: '15', text: "You can’t be hurt here." },
      { key: '16', text: 'Gravity is weaker.' },
      { key: '21', text: 'Gravity pulls from different points.' },
      { key: '22', text: 'Your tech struggles, lags, routinely dies.' },
      { key: '23', text: 'Your tech gains power at a dangerous rate.' },
      { key: '24', text: 'Every smell reminds you of a specific moment.' },
      { key: '25', text: "You’re like ghosts haunting this place." },
      { key: '26', text: 'An enthusiastic audience you can hear but not see.' },
      { key: '31', text: 'Something draws you to the centre.' },
      { key: '32', text: 'As you move further in, things lose detail.' },
      { key: '33', text: 'Structured like a ring, sphere, ribbon, box, etc.' },
      { key: '34', text: 'Exists on or inside a colossal being.' },
      { key: '35', text: 'Exists inside a snow globe, terrarium, or diorama.' },
      { key: '36', text: "A familiar bedroom, but you’re an inch tall." },
      { key: '41', text: 'Universe is 2D, like a sidescroller.' },
      { key: '42', text: "Like your world, but if you’d made different choices." },
      { key: '43', text: 'Like your world, but in the past.' },
      { key: '44', text: 'Like your world, but in the future.' },
      { key: '45', text: 'Time moves slowly/backwards, but not for you.' },
      { key: '46', text: 'A day here is a minute at home.' },
      { key: '51', text: 'Time can be controlled through intense willpower.' },
      { key: '52', text: 'Time loop!' },
      { key: '53', text: 'Dreamworld logic.' },
      { key: '54', text: 'All your thoughts happen out loud.' },
      { key: '55', text: 'Terrain reflects your mood.' },
      { key: '56', text: 'Formed from the contents of your phones/pockets.' },
      { key: '61', text: 'Formed from your collective id.' },
      { key: '62', text: 'This is the inner landscape of someone you know.' },
      { key: '63', text: 'This is all a simulation. (What’s new, amiright?)' },
      { key: '64', text: 'What constitutes a swear varies moment to moment.' },
      { key: '65', text: 'Single episode genre-swap.' },
      { key: '66', text: "You’re in a musical and only one of you knows this isn’t normal." },
    ],
  },
  {
    id: 'slogans',
    name: 'Slogans (d66)',
    die: 'd66',
    entries: [
      { key: '11', text: 'Albert Einstein with his tongue out doing the hang loose sign' },
      { key: '12', text: '“Skate and/or Die” w/ an image of a dead cartoon cat in a box' },
      { key: '13', text: '“Bohrder” w/ a picture of Niels Bohr on a hoverboard' },
      { key: '14', text: '“Slugblasting is Not a Crime”' },
      { key: '15', text: '“Crush the Waveform”' },
      { key: '16', text: '“Dream On” w/ map of Quahalia that displays the viewer’s last dream or nightmare' },
      { key: '21', text: '“Focus” w/ a picture of a broken hoverboard' },
      { key: '22', text: '“Tough to Peel” w/ the image of a navel orange' },
      { key: '23', text: '“Just Violating Physics Byeeeee”' },
      { key: '24', text: 'Allie Gater doing a kickflip in a wedding dress' },
      { key: '25', text: '“Own the Zone”' },
      { key: '26', text: '“ALT” w/ image of a holographic face that changes slightly each time it’s viewed' },
      { key: '31', text: '“McTriple” in reference to the high-difficulty portal-zones called triples among slugblasters' },
      { key: '32', text: '“Maxed Out” w/ a portrait of Max Planck firing lightning bolts from his mouth' },
      { key: '33', text: '“Not From Around Here”' },
      { key: '34', text: '“Lawbreaker” w/ image of Newton getting a hoverboard broken over his head' },
      { key: '35', text: '“Popularia or Bust”' },
      { key: '36', text: 'A caffeinated scratch and sniff PANIC Energy® drink can. The flavour rotates daily.' },
      { key: '41', text: 'Cya Bear, lovable hoverboarding kawaii icon' },
      { key: '42', text: 'A Miper® sticker defaced with sharpie' },
      { key: '43', text: '“Don’t Even Think About It” over an infinity symbol' },
      { key: '44', text: '“Troubled Youth”' },
      { key: '45', text: '“No Points for Style”' },
      { key: '46', text: "A pinup whose face shifts to look just like the mom of whoever views it" },
      { key: '51', text: "A pinup of Lazy Bunny’s mascot Wift Wabbit wearing a gold chain" },
      { key: '52', text: 'Stephen Hawking wearing shades giving the middle finger' },
      { key: '53', text: '“Keep Slugblasting Weird”' },
      { key: '54', text: '“BRANE-IAC” w/ a portrait of Edward Witten' },
      { key: '55', text: '“Secret Scooter Kid”' },
      { key: '56', text: '“Always Streaming” with a number that reflects current viewership of whatever account you link' },
      { key: '61', text: 'A salt shaker, traditionally considered to be good luck in slugblaster culture' },
      { key: '62', text: 'Two tattooed fists with enough knuckles to spell out the entire Woolner Unraveller Theorem' },
      { key: '63', text: '“Real Spacetime Has Curves”' },
      { key: '64', text: '“Coexist” w/ a picture of multiple slightly different versions of the same person' },
      { key: '65', text: '“Board to Death”' },
      { key: '66', text: '“Light Eater” w/ image of a salad (the sticker’s glittery surface works as a solar panel to slowly charge whatever it’s applied to)' },
    ],
  },
];

// --- World-specific dynamic oracle tables (Problems + Checkpoints) ---
// These appear in the Roll a Table dropdown as:
//  - "Null potential problems"
//  - "Null Checkpoints"
// etc.
// They use `die: 'random'` to support variable list lengths.
const WORLD_TABLES: RollTableDef[] = CANON_WORLDS.flatMap((w) => {
  const problems: RollTableDef = {
    id: `world_${w.id}_problems`,
    name: `${w.id} potential problems`,
    die: 'random',
    entries: w.problems.map((text, i) => ({ key: String(i + 1), text })),
  };
  const checkpoints: RollTableDef = {
    id: `world_${w.id}_checkpoints`,
    name: `${w.id} Checkpoints`,
    die: 'random',
    entries: w.checkpoints.map((text, i) => ({ key: String(i + 1), text })),
  };
  return [problems, checkpoints];
});

// Append to exported TABLES list (keeps existing IDs stable).
TABLES.push(...WORLD_TABLES);

function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function d66(): string {
  const a = d6();
  const b = d6();
  return `${a}${b}`;
}

export function rollTable(tableId: string): { key: string; value: string } | null {
  const t = TABLES.find((x) => x.id === tableId);
  if (!t) return null;

  // Random tables have variable lengths (e.g., World problems/checkpoints).
  if (t.die === 'random') {
    const any = t.entries[Math.floor(Math.random() * t.entries.length)];
    return any ? { key: any.key, value: any.text } : null;
  }

  const key = t.die === 'd6' ? String(d6()) : d66();
  const entry = t.entries.find((e) => e.key === key);
  if (!entry) {
    // Fallback: if a table definition is incomplete, pick a random entry.
    const any = t.entries[Math.floor(Math.random() * t.entries.length)];
    return any ? { key: any.key, value: any.text } : null;
  }
  return { key: entry.key, value: entry.text };
}
