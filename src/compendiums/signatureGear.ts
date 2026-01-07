export type ComponentKind = 'coil' | 'disc' | 'lens' | 'gem';

export type ComponentCost = Partial<Record<ComponentKind, number>>;

export type SignatureMod = {
  name: string;
  /** Raw cost string from the Solo Blaster PDF (ex: "1 Coil, 1 Gem") */
  cost: string;
  /** Parsed component cost. Only covers Coils/Discs/Lens/Gems. */
  costParsed: ComponentCost;
  description: string;
};

export type SignatureGearDef = {
  id: string;
  name: string;
  function: string;
  types: string[];
  mods: SignatureMod[];
};

export type SignatureGearSelection = {
  gearId: string;
  gearName: string;
  type: string;
  /** Free mod chosen at creation time (must cost exactly 2 components). */
  freeModName: string;
  looks: string[];
  /** Mods currently installed on this signature gear (includes the free one by default). */
  installedMods: string[];
};

export function parseComponentCost(raw: string): ComponentCost {
  const out: ComponentCost = {};
  const s = String(raw || '').toLowerCase();
  const add = (k: ComponentKind, n: number) => {
    out[k] = (out[k] || 0) + n;
  };

  // Matches "2 Coils" / "1 Gem" / "1 Lens" / "1 Disc"
  const re = /(\d+)\s*(coil|coils|disc|discs|lens|lenses|gem|gems)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = Number(m[1]) || 0;
    const kindRaw = m[2];
    const kind: ComponentKind =
      kindRaw.startsWith('coil')
        ? 'coil'
        : kindRaw.startsWith('disc')
          ? 'disc'
          : kindRaw.startsWith('lens')
            ? 'lens'
            : 'gem';
    add(kind, n);
  }
  return out;
}

export function totalComponents(cost: ComponentCost): number {
  return (cost.coil || 0) + (cost.disc || 0) + (cost.lens || 0) + (cost.gem || 0);
}

export function canAfford(cost: ComponentCost, inv: ComponentCost): boolean {
  return (
    (inv.coil || 0) >= (cost.coil || 0) &&
    (inv.disc || 0) >= (cost.disc || 0) &&
    (inv.lens || 0) >= (cost.lens || 0) &&
    (inv.gem || 0) >= (cost.gem || 0)
  );
}

export const SIGNATURE_LOOKS: string[] = [
  'Ancient',
  'Industrial',
  'Boutique',
  'Chunky',
  'Minimal',
  'Hardlight',
  'Worn',
  'Polished',
  'Smoky',
  'Glossy',
  'Bright',
  'Goth',
  'Stickered',
  'Cute',
  'Spiky',
  'Soft',
  'Chrome',
  'Organic',
  'Overdesigned',
  'Custom-painted',
  'Glitched',
  'Translucent',
  'Matte',
  'Neon',
];

// NOTE: Canon-only: pulled from the Solo Blaster PDF.
export const SIGNATURE_GEAR: SignatureGearDef[] = [
  {
    id: 'gravityblaster',
    name: 'Gravity blaster',
    function: 'Roll to damage things at a distance with a blast of crushing force (or pummel stuff with non-lethal grav torrents).',
    types: ['gauntlet', 'glove', 'carbine', 'pistol', 'cannon', 'visor powerpack', 'orb', 'wand'],
    mods: [
      { name: 'Endurance Engine', cost: '1 Coil, 1 Gem', costParsed: parseComponentCost('1 Coil, 1 Gem'), description: 'Roll to coarsely lift, push, and pull things at a distance, with the accuracy and power of a tractor.' },
      { name: 'Agility Pin', cost: '1 Lens, 1 Disc', costParsed: parseComponentCost('1 Lens, 1 Disc'), description: 'Roll to manipulate things at a distance with the accuracy and power of two human hands.' },
      { name: 'Impulse Rig', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'Roll to launch yourself high in the air, use your gravity beam like a grappling hook, or give yourself a burst of speed.' },
      { name: 'Gravity Spasm', cost: '1 Lens, 1 Gem', costParsed: parseComponentCost('1 Lens, 1 Gem'), description: 'Mark 1 turbo to avoid a physical slam by creating a brief, invisible force field.' },
      { name: 'Field Inverter', cost: '2 Coils, 1 Lens, 1 Gem', costParsed: parseComponentCost('2 Coils, 1 Lens, 1 Gem'), description: 'Roll to temporarily modify the gravity of a room-sized area, like making it lighter, heavier, reversed, pointing sideways, etc. Roll each time you want to change it.' },
    ],
  },
  {
    id: 'realitycannon',
    name: 'Reality Cannon',
    function: 'Roll to scramble things with a powerful reality beam (either destructive and permanent, or unpleasant and temporary).',
    types: ['gauntlet', 'glove', 'carbine', 'pistol', 'cannon', 'visor', 'powerpack', 'orb', 'wand'],
    mods: [
      { name: 'Parameter Dial', cost: '2 Discs', costParsed: parseComponentCost('2 Discs'), description: 'Roll to temporarily shift or calibrate minor features of a target, like colour, texture, volume, odor, temperature, etc.' },
      { name: 'Exponent Coil', cost: '1 Coil, 1 Gem', costParsed: parseComponentCost('1 Coil, 1 Gem'), description: 'Roll to temporarily create 2d6 alternate versions of a target, each with one changed detail.' },
      { name: 'Runic Printer', cost: '1 Lens, 1 Disc', costParsed: parseComponentCost('1 Lens, 1 Disc'), description: 'Roll to create a temporary glyph on a surface that changes the physical rules in a small area (like reduced gravity, frictionless floor, etc.).' },
      { name: 'Coherence Spray', cost: '1 Coil, 1 Lens', costParsed: parseComponentCost('1 Coil, 1 Lens'), description: 'Mark 1 turbo to stop a peelback or reality glitch from getting worse, stabilizing yourself or a nearby target.' },
      { name: 'Catastrophe Lens', cost: '2 Gems, 1 Lens, 1 Disc', costParsed: parseComponentCost('2 Gems, 1 Lens, 1 Disc'), description: 'Roll to permanently rewrite a major feature of a target (dangerous, loud, and likely to cause fallout).' },
    ],
  },
  {
    id: 'roboticcompanion',
    name: 'Robotic companion',
    function: 'As smart and loyal as a dog. Can follow closely, lift and carry things you could, communicate vaguely, and you can roll to have it do simple tasks, like fetch.',
    types: ['android', 'mech', 'drone', 'quadruped', 'biped', 'rolling', 'hovering', 'metal', 'plastic'],
    mods: [
      { name: 'Weapons', cost: '1 Lens, 1 Gem', costParsed: parseComponentCost('1 Lens, 1 Gem'), description: 'Roll to have your robot attack, at a distance or in melee, lethally or nonlethally, with weapons you’ve designed. What are they?' },
      { name: 'Mobility Boosters', cost: '1 Coil, 1 Disc', costParsed: parseComponentCost('1 Coil, 1 Disc'), description: 'Roll to have your robot move fast, jump far, climb, or keep up with you in a chase.' },
      { name: 'Tool Kit', cost: '2 Coils', costParsed: parseComponentCost('2 Coils'), description: 'Roll to have your robot perform repairs, salvage, or modifications in the field.' },
      { name: 'Personality Module', cost: '1 Disc, 1 Gem', costParsed: parseComponentCost('1 Disc, 1 Gem'), description: 'Your robot becomes more expressive and can communicate more clearly. Roll to have it charm or distract people/creatures.' },
      { name: 'Autonomy Upgrade', cost: '2 Gems, 1 Disc', costParsed: parseComponentCost('2 Gems, 1 Disc'), description: 'Your robot can operate independently for longer and handle more complex tasks, even out of sight.' },
    ],
  },
  {
    id: 'poweredarmour',
    name: 'Powered armour',
    function: 'Nope slams from falls, crushing, hits, and other kinetic damage for only 1 trouble. Don and doff fast via an automated process.',
    types: ['flashy', 'utilitarian', 'mining exo', 'combat jacket', 'skinsuit', 'hardsuit', 'post-motocross'],
    mods: [
      { name: 'Heavy-Duty Servos', cost: '1 Coil, 1 Gem', costParsed: parseComponentCost('1 Coil, 1 Gem'), description: 'Roll to lift or carry very heavy things, slowly crush things in your hands, or jump great distances.' },
      { name: 'Weapons System', cost: '1 Lens, 1 Gem', costParsed: parseComponentCost('1 Lens, 1 Gem'), description: 'Roll to attack, at a distance or in melee, lethally or nonlethally, with weapons you’ve designed. What are they?' },
      { name: 'Haz Protocols', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'Roll to survive hostile environments (vacuum, toxic air, radiation, pressure) for longer without taking slams.' },
      { name: 'Stabilizer Frame', cost: '1 Disc, 1 Coil', costParsed: parseComponentCost('1 Disc, 1 Coil'), description: 'Mark 1 turbo to stay on your feet or keep control when you’d otherwise be slammed or knocked back.' },
      { name: 'Nth-Grade Reactor', cost: '2 Coils, 1 Gem, 1 Lens', costParsed: parseComponentCost('2 Coils, 1 Gem, 1 Lens'), description: 'Roll to temporarily overclock the suit for extreme feats (fast, strong, loud), with serious consequences if you push it.' },
    ],
  },
  {
    id: 'photonicjacket',
    name: 'Photonic jacket',
    function: 'Display colours, patterns, and images on the fabric’s surface. Also, nope slams from lasers and other electromagnetic energy for only 1 trouble.',
    types: ['blazer', 'bomber', 'denim', 'leather', 'hoodie', 'trench', 'coveralls', 'raincoat windbreaker'],
    mods: [
      { name: 'Flash Patterns', cost: '1 Lens, 1 Disc', costParsed: parseComponentCost('1 Lens, 1 Disc'), description: 'Roll to blind, daze, confuse, entrance, or cause seizures in targets that can see your jacket.' },
      { name: 'Ambiance Panel', cost: '1 Gem, 1 Coil', costParsed: parseComponentCost('1 Gem, 1 Coil'), description: 'Freely program non-realistic or animated patterns that can be seen from far away.' },
      { name: 'Holographic Fringe', cost: '2 Lenses', costParsed: parseComponentCost('2 Lenses'), description: 'Roll to create convincing holograms, doubles, or visual cover in a small area.' },
      { name: 'EM Jammer', cost: '1 Disc, 1 Coil', costParsed: parseComponentCost('1 Disc, 1 Coil'), description: 'Mark 1 turbo to scramble nearby sensors, cameras, or drones for a brief moment.' },
      { name: 'Spectrum Reactor', cost: '2 Gems, 1 Lens, 1 Disc', costParsed: parseComponentCost('2 Gems, 1 Lens, 1 Disc'), description: 'Roll to unleash a powerful electromagnetic burst (dangerous to tech, bright, loud, and likely to escalate the situation).' },
    ],
  },
  {
    id: 'negafictionsword',
    name: 'Negafriction Sword',
    function: 'Roll to slice, dice, chop, and stab things (or non-lethally smack them with the kineticallycharged sheath).',
    types: ['ancient', 'futuristic', 'modern', 'hardlight', 'katana', 'scimitar', 'longsword', 'carbon fibre'],
    mods: [
      { name: 'Slip Rattle', cost: '1 Coil, 1 Disc', costParsed: parseComponentCost('1 Coil, 1 Disc'), description: 'Roll to teleport in-universe by slicing spacetime. If you can’t see your destination, potential problems are worse.' },
      { name: 'Field Projector', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'Roll to temporarily remove the surface friction of a target, making it slippery or frictionless.' },
      { name: 'Guard Halo', cost: '2 Discs', costParsed: parseComponentCost('2 Discs'), description: 'Mark 1 turbo to automatically parry/deflect a physical slam or attack that would hit you.' },
      { name: 'Phase Edge', cost: '1 Lens, 1 Gem', costParsed: parseComponentCost('1 Lens, 1 Gem'), description: 'Roll to cut through materials that should be impossible to cut, ignoring standard resistance.' },
      { name: 'Redshift Blade', cost: '2 Gems, 1 Lens, 1 Coil', costParsed: parseComponentCost('2 Gems, 1 Lens, 1 Coil'), description: 'Roll to slice an entire structure or area in a catastrophic way. Extremely loud. Extremely dangerous.' },
    ],
  },
  {
    id: 'hyperopticvisor',
    name: 'Hyperoptic visor',
    function: 'Use an advanced HUD to access information, capture picture and video, send texts, play Ruby Rush, and do everything else you could with a phone.',
    types: ['goggles', 'visor', 'shades', 'glasses', 'eyepiece', 'mask', 'helmet', 'contact lenses'],
    mods: [
      { name: 'Realmware Lens', cost: '1 Lens, 1 Disc', costParsed: parseComponentCost('1 Lens, 1 Disc'), description: 'Roll to see energy fields, invisible entities, and in-depth biometrics. Also acts as a spacetime ampimeter.' },
      { name: 'Omniscience Aperture', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'You can see farther and with more detail than should be possible, including through some obstructions.' },
      { name: 'Reticle Overlay', cost: '2 Discs', costParsed: parseComponentCost('2 Discs'), description: 'Roll to precisely aim a shot, track a target, or find a weak point.' },
      { name: 'Countermeasure Scan', cost: '1 Disc, 1 Gem', costParsed: parseComponentCost('1 Disc, 1 Gem'), description: 'Mark 1 turbo to get immediate warning of an incoming hazard, ambush, or sudden environmental shift.' },
      { name: 'Panoptic Sync', cost: '2 Lenses, 1 Disc, 1 Gem', costParsed: parseComponentCost('2 Lenses, 1 Disc, 1 Gem'), description: 'Roll to network multiple views/sensors and achieve near-total awareness over a large area (until something breaks the setup).' },
    ],
  },
  {
    id: 'kineticdeck',
    name: 'Kinetic deck',
    function: 'Go fast over solid terrain. Make your board super heavy at will, either as an effective attack or to protect it from theft.',
    types: ['Use “Board” tables'],
    mods: [
      { name: 'Proximity Lock', cost: '2 Discs', costParsed: parseComponentCost('2 Discs'), description: 'Your deck returns to you, if possible. May require a roll if the path isn’t clear or it faces resistance.' },
      { name: 'Stasis Anchor', cost: '1 Coil, 1 Gem', costParsed: parseComponentCost('1 Coil, 1 Gem'), description: 'Make your deck completely immovable, floating frozen in space, until you deactivate it.' },
      { name: 'Density Peg', cost: '1 Coil, 1 Disc', costParsed: parseComponentCost('1 Coil, 1 Disc'), description: 'Roll to slam an obstacle by suddenly increasing your board’s mass at the right moment.' },
      { name: 'Terrain Spike', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'Roll to stick to walls, ceilings, or weird surfaces for a short time while moving fast.' },
      { name: 'Momentum Reactor', cost: '2 Coils, 1 Gem, 1 Disc', costParsed: parseComponentCost('2 Coils, 1 Gem, 1 Disc'), description: 'Roll to achieve impossible speed/force for a brief window, leaving obvious fallout and potential slams.' },
    ],
  },
  {
    id: 'voidwearbackpack',
    name: 'Voidwear backpack',
    function: 'Store any amount of objects smaller than a person in your bag’s pocket dimension. Roll to see if you happen to have a specific everyday item in there.',
    types: ['nylon', 'canvas', 'denim', 'leather', 'plastic', 'hardlight', 'mirage-weave', 'satchel'],
    mods: [
      { name: 'Astral Intake', cost: '1 Coil, 1 Disc', costParsed: parseComponentCost('1 Coil, 1 Disc'), description: 'Mark 1 turbo and roll to pull a unique, specialized, or implausible item from the multiverse, like antitoxin, an alien lifeform, or almost the exact keycard you need.' },
      { name: 'Null Pocket', cost: '2 Discs', costParsed: parseComponentCost('2 Discs'), description: 'Roll to stash something in a pocket dimension that’s harder to detect or access without you.' },
      { name: 'Safety Liner', cost: '1 Coil, 1 Gem', costParsed: parseComponentCost('1 Coil, 1 Gem'), description: 'Nope one slam from impact, crushing, or falls for only 1 trouble, as long as you can throw yourself into the bag at the last moment.' },
      { name: 'Retrieval Tether', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'Roll to pull an item from the bag instantly or from far away, even in the middle of chaos.' },
      { name: 'Vault Heart', cost: '2 Gems, 1 Disc, 1 Coil', costParsed: parseComponentCost('2 Gems, 1 Disc, 1 Coil'), description: 'Roll to store or protect something that should be impossible to store safely (dangerous, loud, and likely to get attention).' },
    ],
  },
  {
    id: 'hardlightboard',
    name: 'Hardlight Board',
    function: 'Go fast over solid terrain on a hoverboard made from crystallized light. Make your board non-exist and re-exist at will.',
    types: ['purple city', 'blue sunset', 'loud stars', 'white heat', 'pink ice', 'teal god', 'neon black'],
    mods: [
      { name: 'Photon Vent', cost: '1 Coil, 1 Gem', costParsed: parseComponentCost('1 Coil, 1 Gem'), description: 'Roll to create trails of semi-permanent, slightly brittle hardlight behind you, which float in space until they fade.' },
      { name: 'Energy Lattice', cost: '1 Lens, 1 Coil', costParsed: parseComponentCost('1 Lens, 1 Coil'), description: 'Roll to reform your board into temporary shapes (ramps, rails, shields), then revert.' },
      { name: 'Mirror Splinter', cost: '2 Lenses', costParsed: parseComponentCost('2 Lenses'), description: 'Roll to refract or redirect beams and bright anomalies using hardlight facets.' },
      { name: 'Phase Skip', cost: '1 Disc, 1 Gem', costParsed: parseComponentCost('1 Disc, 1 Gem'), description: 'Mark 1 turbo to briefly blink your board out of existence to avoid a slam, obstacle, or collision.' },
      { name: 'Prismatic Engine', cost: '2 Gems, 1 Lens, 1 Coil', costParsed: parseComponentCost('2 Gems, 1 Lens, 1 Coil'), description: 'Roll to unleash a massive hardlight construct or burst (extremely visible, extremely disruptive, likely to cause fallout).' },
    ],
  },
];
