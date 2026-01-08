export type Hazard =
  | { kind: 'CIV' }
  | { kind: 'Haz'; level: 0 | 1 | 2 | 3 };

export type FeaturedLocation = {
  name: string;
  description: string;
};

export type WorldOracleId =
  | 'Null'
  | 'Vastiche'
  | 'Thennis Spar'
  | 'Desnine'
  | 'The Golden Jungle'
  | 'Prismatia'
  | 'Operaeblum'
  | 'Calorium'
  | 'The Waking Pits'
  | 'Popularia'
  | 'Empyrean'
  | 'Quahalia';

export type WorldOracle = {
  /** Short name used for Portal Discovery adjacency + Roll a Table naming. */
  id: WorldOracleId;
  /** Display name used in UI. */
  displayName: string;
  hazard: Hazard;
  problems: string[];
  checkpoints: string[];
  featuredLocations: FeaturedLocation[];
};

export function hazardLabel(h: Hazard): string {
  return h.kind === 'CIV' ? 'CIV' : `Haz ${h.level}`;
}

// Source: Solo Blaster (Slugblaster 1.31) — Compendiums & Tables → Worlds.
// These lists are kept as direct bullet lists for easy use in Oracles and Roll a Table.
export const CANON_WORLDS: WorldOracle[] = [
  {
    id: 'Null',
    displayName: 'Null (Hillview)',
    hazard: { kind: 'CIV' },
    problems: [
      'multiple neighbours offer you a ride',
      'Doorways protest',
      'one of your parents shows up or calls you',
      "someone from your mom’s book club",
      'your narc little brother',
      'off-duty teacher',
      'on-duty RCMP officer',
      "another crew visits and it’s so humiliating",
      'your crush is here',
      'unannounced DARA Rescue division training exercise',
      'invasive species from another world',
    ],
    checkpoints: [
      'chainlink fence',
      'a soccer field during practice',
      'a sofa being loaded into a moving truck',
      'packed playground',
      'the trailer park, an old trampoline',
      'two freaks smoking in Make-Out Park',
      'drainage ditch',
      'your dad leaving his job at the gravel yard',
      'school bus full of wide-eyed normies',
      "Cst. Plett’s patrol car",
    ],
    featuredLocations: [],
  },
  {
    id: 'Vastiche',
    displayName: 'Vastiche',
    hazard: { kind: 'Haz', level: 1 },
    problems: [
      'a rival crew shows up with the same idea',
      'a category 5 caustic storm brewing in the distance',
      'a squadron of wellarmed salvage crabs',
      'a dreadfly',
      'Rescue does a routine mop up',
      'the mall is already swarming with other slugblasters',
      'your way home is obscured by shifting dunes',
    ],
    checkpoints: [
      'maze of hoodoos',
      'collapsing billboards',
      'active minefield',
      'ragged canyon',
      'piece of old on-ramp',
      'huge cement pipe',
      'craters and gravel',
      'waves of sandy dunes',
      'crumbling parkades',
      'broken, crisscrossing escalators',
      'waterfall of pink sand coming down through a broken skylight',
      'food court labyrinth',
      'second level collapsing onto first',
      'mini-golf course',
    ],
    featuredLocations: [
      {
        name: 'The Overpass',
        description:
          'A river of abandoned cars rust bumper to bumper on a mile of elevated freeway. The windshields, on-ramps, and medians are fun to skate and underneath you’ll find shade, graffiti, empty cans, and hundreds of thrumming egg sacs.',
      },
      {
        name: 'Rainbow Tank',
        description:
          'Between the bombed-out remains of two big-box stores is a pockmarked graveyard of military vehicles, including a large battle tank covered in years of spraypaint and railwax.',
      },
      {
        name: 'The Secret Megamall',
        description:
          "The dunes occasionally drift enough to expose an entrance to this legendary spot. There’s a food court, a mini-golf course, extravagant water features hiding entire ecosystems under a layer of thick chemical algae, and even some alternate-reality stores and snack machines that haven’t been picked over yet.",
      },
    ],
  },
  {
    id: 'Thennis Spar',
    displayName: 'Thennis Spar',
    hazard: { kind: 'CIV' },
    problems: [
      'stern Arborist guards',
      'ghost attention',
      'huge negawraith',
      'briefly crossing into a conjoined negaverse',
      'scheming rival crew',
      'too many people are watching you',
      'Shimmer mercs',
      'a city-wide ceremony starts, with intricate customs you’re expected to know',
      'you accidentally break or defile something',
      'a summoned soliton',
      'the way out is slowly sealing off',
    ],
    checkpoints: [
      'a grove of olives',
      'a balcony overlooking the bustling market',
      'a cart of colourful powders in your path',
      'a narrow alley',
      'a labyrinth of apartments and insulae',
      'a vine-covered wall',
      'an ampitheatre',
      'a wedding at an expensive villa',
      "a back way into the Arborists’ gardens",
      'the serene waters of the public baths',
      'a risky jump to the aqueduct',
    ],
    featuredLocations: [
      {
        name: 'Arborist Temple',
        description:
          'Like everything in Thennis Spar, this sacred site is both impossibly ancient and unbelievably futuristic. Word is that the Arborists are hoarding some serious tech in their inner sanctum (not to mention all the secrets of the multiverse).',
      },
      {
        name: 'The Forum',
        description:
          'You can find just about anything here if you know where to look, including strange delicacies, impossible wonders, and all the components and gear a crew could ask for. The question is: what do you have to trade?',
      },
      {
        name: 'The Catacombs',
        description:
          'In a city full of ancient architecture, the catacombs pre-date almost everything else by centuries. Secrets hide inside these winding tunnels, but who knows what else is waiting for you in the darkness. Finding your way in is difficult, finding your way out is even worse.',
      },
    ],
  },
  {
    id: 'Desnine',
    displayName: 'Desnine',
    hazard: { kind: 'Haz', level: 1 },
    problems: [
      'flooding hallways',
      'giant psionic squid',
      'mask failure',
      'a freaking megalodon',
      "your stream is weirdly hemorrhaging viewers",
      'the water is changing temperature/viscosity',
      'some kids are trapped inside an air pocket',
      'shady experiments',
      'so many crabs',
      'reality-bent whirlpool sucking you into, like, Quahalia?',
    ],
    checkpoints: [
      'coral archways',
      'a smack of jellyfish',
      'a powerful gyre',
      'a gauntlet of giant, predatory anemones',
      'the carcass of a large animal covered in scavengers',
      'unlocked hatch',
      'tight corner, full loop',
      'a jumble of computer stuff blocking the hall',
      'cracked glass',
      'segment where the artificial gravity has gone out',
      'tunnel heads into the darkness of the coral',
    ],
    featuredLocations: [
      {
        name: 'Observation Centre',
        description:
          'Miles of pristine glass corridors that twist in every direction. Flickering emergency lights illuminate steep drops, tight corners, and occasional full loops. A great place to score primo footage or find abandoned gear, but watch for cracked glass and flooded chambers.',
      },
      {
        name: "Ethan’s Reef",
        description:
          'A coral moon home to hundreds of metaterrestrial species and some very mysterious alien wreckage. Named after that kid who went missing here. What was he looking for anyway?',
      },
      {
        name: 'The Bub',
        description:
          'This huge air pocket collects interesting flotsam from surrounding waters—things washed off sluggers and things from leagues away. Plus a few years ago a crew of shredders hauled a janky old grav unit in here that can be set to make the inside surface fully skateable.',
      },
    ],
  },
  {
    id: 'The Golden Jungle',
    displayName: 'The Golden Jungle',
    hazard: { kind: 'Haz', level: 0 },
    problems: [
      'you portal in over some crocodile water',
      'you draw the attention of mathpanthers',
      'giant slugs',
      'oh no quicksand',
      'ancient, mossy robots',
      'giant robot hand gets activated',
      'you’re being watched',
      'accidental fire',
      'two authorities having a secret meeting',
      'these are not vines',
      'rival crew followed you here',
      'your way out is in metasaur territory',
    ],
    checkpoints: [
      'rotting rope bridge',
      'giant robotic head sticking out of the ground',
      'deep, muddy river',
      'huge tree, huge roots',
      'mag-train hanging from tangled vines',
      'rusted silo on its side',
      'mating ground for many exotic birds',
      'a very dark canopy',
      'large termite mounds',
      'temple ruins',
      'wide chasm',
      'mecha skeletons covered in webs and black foliage',
    ],
    featuredLocations: [
      {
        name: 'The Praetorians',
        description:
          'No one knows how many of these huge bipedal battlecraft hide beneath the foliage, rusting away, just like no one knows who built them or why. The one thing that’s certain is they’re full of valuable components, if only you could get inside.',
      },
      {
        name: 'The Clearing',
        description:
          'This large break in the canopy is littered with highly-skateable and lichen-crusted wreckage—tempting, taunting, and utterly exposed to the watchful gaze of flying predators.',
      },
      {
        name: 'The Chasm',
        description:
          'An enormous scar across the landscape. Nothing grows along the scorched, crumbling cliffsides, and few know what’s at the bottom other than a thick layer of ominous fog. Some say it holds the answer to what happened here. Everyone says it’s way too wide to jump across on a hoverboard, but you can’t help but wonder…',
      },
    ],
  },
  {
    id: 'Prismatia',
    displayName: 'Prismatia',
    hazard: { kind: 'Haz', level: 0 },
    problems: [
      'portaling right into a hazardous field of mining debris',
      'stomach churning planetesimal hopscotch',
      'pteranodons',
      'giant glasshoppers with laser eyes',
      'a psionic storm crashing into the thoughtscape',
      'an exit in constant motion',
      'an exit deep inside the tangled framework of a half-built shipping station',
    ],
    checkpoints: [
      'two crystal asteroids colliding',
      'a length of discarded Miper trainway',
      'Hardecker mining drones calving an opalescent mountain',
      'an oscillating orb of sparkling fluid',
      'a drifting chunk from a wayward alien idol',
      'one and a half floors of a ruined skycastle',
      'a giant rotating disc with a small hole in the centre',
      'a migrating flock of metaterrestrial birds',
    ],
    featuredLocations: [
      {
        name: 'Hardecker Mining Facility',
        description:
          'Hardecker has been mining kramshon and farming polystellar energy here for years—junking up the place with chutes, struts, conveyors, and an entire workforce of disgruntled, virus-riddled mining bots.',
      },
      {
        name: 'The Miper Train',
        description:
          'Miper believes their trillion dollar multiversal train network will bring the multiverse closer together and usher in a new era of peace and (for them) prosperity. Right now it’s just a tantalizing, half-finished network of hardlight tubes.',
      },
      {
        name: 'The Wanda Curve',
        description:
          'An ancient, large-diameter ring of solid glass, thrumming with odd wavelengths of energy. Scientists and historians speculate on its origin and purpose, but most slugblasters just want to know if they can skate all the way around the inner edge first try.',
      },
    ],
  },
  {
    id: 'Operaeblum',
    displayName: 'Operaeblum',
    hazard: { kind: 'CIV' },
    problems: [
      'portaling into the middle of a gang war',
      'android bouncers',
      'pickpockets snatch something and take off running',
      'homicidal funbots break out from the candy lab',
      'caught in proxy war',
      'crucial infrastructure begins to break apart',
      'something bad falls from a thousand floors above',
      'mysterious hacker calls you with dangerous directions',
    ],
    checkpoints: [
      'dance floor of a club filled with freaks',
      'maze of dark hallways',
      'passing skytrain',
      'kids playing ball hockey in empty pedways',
      'crowded skybridge',
      'paramilitary blockade',
      'flickering hardlight crosswalk',
      'illegal street race on vertical roadways',
      'very narrow beams',
      'tangle of personal transport tubes',
      'departing party tram packed with sloppy conscripts',
    ],
    featuredLocations: [
      {
        name: 'Matte Static',
        description:
          "The hottest club in the multiverse. Models push illegal flavours of PANIC Energy®, sponsor reps cut deals in the VIP, pros skate the portal-connected halfpipe, and every time the beat drops the dance floor is blasted with a flurry of caffeinated party snow. Must be legal drinking age.",
      },
      {
        name: 'The Drop Line',
        description:
          'This famous skate route starts off the M-train platform, snakes across a tangle of skyways, past the giant party windows of Matte Static, and ends with a faith-testing air drop into a supposed portal near the Hardecker mining floors.',
      },
      {
        name: "Wilkie’s Candy Lab®",
        description:
          'A grueling funzone, where indentured employees must eat only candy, shoot each other with foam darts, and party joylessly in 16-hour shifts as they roll out the newest in toys, games, candy, and slugblaster tech.',
      },
    ],
  },
  {
    id: 'Calorium',
    displayName: 'Calorium',
    hazard: { kind: 'Haz', level: 2 },
    problems: [
      'hazwear failure',
      'portal rupture',
      'a planar volcano venting pure molten mathematics from a subdimensional mantle',
      'jet black metasaurs',
      'the phase dragon flies in eldritch patterns',
      'soliton of pure fire',
      'aggressive thermofarm defence bots',
      'centipede with a reflective carapace moving like mercury',
      'android ravagers made of hot chrome',
      'your way out heats to volatile levels',
    ],
    checkpoints: [
      'a ramp of cooling rock',
      'a surprising series of cliché geysers',
      'drifts of hot salt',
      'small islands across the soda lake',
      'a parade of flamingos',
      'the bleached ruins of cinderblock structures',
      'half-open hatch to a burned-out bunker',
      'a slope of black glass',
      'a twisting lava tube',
      'onyx slabs jutting from the ground',
      'dragging chains of low-flying gliders',
      'sagging metal girders placed across rivers of lava',
    ],
    featuredLocations: [
      {
        name: 'The Gliders',
        description:
          'Dozens of glimmering foil air vessels circle lazily with no visible purpose or pilots, stuck in a powerful thermal column. Winged creatures roost, silhouetted against the oppressive white sky.',
      },
      {
        name: 'Soda Lake',
        description:
          'A natural skatepark of partially cooled lava formations forms the shoreline of these scalding alkaline waters. An audience of metaterrestrial flamingos watches closely. The deep part of the lake hides strange ruins beneath its roiling surface.',
      },
      {
        name: 'The Ziggurat',
        description:
          'This black zirconium structure shimmers in the heat, its origin unclear, its contents a mystery, and its architecture a dope array of skateable ledges, hubbas, and banks. Cursed markings herald the coming Omni-Sorcerer.',
      },
    ],
  },
  {
    id: 'The Waking Pits',
    displayName: 'The Waking Pits',
    hazard: { kind: 'Haz', level: 2 },
    problems: [
      'swarm of starving phosphorescent bugs',
      'lightning blizzard',
      'wraiths',
      'bad cell reception',
      'something hidden in the moathouse',
      'vicious scavengers',
      'you find some other kids but something seems...off',
      'you break through the ice into a tomb/nest',
      'bone-white spiders',
      'chaotic evil soliton formed from black ice and castle pieces',
      'your way out requires a freefall into The Trench',
    ],
    checkpoints: [
      'a falling tower',
      'drifts of hard dry snow',
      'series of powerful lightning strikes',
      'frosted castle ruins',
      'a healthy patch of tubular plant-animals feeding off a vent',
      'a giant white crab walking over you',
      'a frozen orchard',
      'porcelain dolls falling from the sky like rain',
      'a rotting barn filled with cracked mirrors',
      'crumbling ramparts',
      'treacherous field of crooked tombstones',
      'a half-lowered drawbridge',
    ],
    featuredLocations: [
      {
        name: 'The Doom Slalom',
        description:
          'Starts on the hilltop ruins of a flickering castle, winds its way through the breeding grounds and hunting territories of multiple predatory ecologies, ends in a flagstone megaramp over The Trench. Welcome to Hardmode.',
      },
      {
        name: 'The Trench',
        description:
          'The abyss of this abyssal plane. A deeper descent into alien madness—where logic unravels and nightmares wake and slabs of rotting masonry from collapsing bridges hang suspended in the tattered spacetime.',
      },
      {
        name: 'The Steeple',
        description:
          'A massive cathedral surrounded by acres of cemetery. Eerie frequencies thrum from within. A power source? Sub-woofers? The warped anti-hymns of a hive of metaterrestrial vampires?',
      },
    ],
  },
  {
    id: 'Popularia',
    displayName: 'Popularia',
    hazard: { kind: 'CIV' },
    problems: [
      'no one else is dressed like you here',
      'you can hear a party but can’t find it',
      'a rival spreading lies',
      'peelback countdown',
      'it came from the sea',
      'Miper security drones',
      'Old Guard is watching you, evaluating',
      'people smirking and you don’t know why',
      'someone hands you the mic',
      'maniacal soliton crystallizes at a concert',
      'trouble at the foam party',
      'packed crowd won’t let you through',
    ],
    checkpoints: [
      'snaking boardwalk',
      'hotties by a pool',
      'skaters seshing the famous 12-stair hubba',
      'lit beachside rap show',
      'active movie shoot',
      'the buzzing line outside a sneaker store',
      'philosophy students tripping balls',
      'someone amazingly extra taking their metasaur for a walk',
      "Wilkie’s promo taping with another crew and a bunch of models",
      'the legendary banks down to the beach',
      'perfect reef break coming in',
    ],
    featuredLocations: [
      {
        name: 'The Beach',
        description:
          "Swim, surf, and party among the hottest people in the multiverse, or skate the famous boardwalk. Sure, there’s a Miper® store there now, but also FUST, Infinite Pizza, and Scram Cat’s first mythic storefront, where slugblasting was born.",
      },
      {
        name: 'Popularia U',
        description:
          'Sure, you probably didn’t travel across 3–6 hostile planes of reality to slip into a class on Quantum Scattering Theory or Relative Multiversal Ethics, but the campus’s skate spots, lab tech, and elite dorm parties may interest you.',
      },
      {
        name: 'Downtown',
        description:
          "Go shopping, skate the M-train station, sneak into Miper’s corporate hq, or search for the elusive loft offices of Slugblaster Magazine.",
      },
    ],
  },
  {
    id: 'Empyrean',
    displayName: 'Empyrean',
    hazard: { kind: 'Haz', level: 3 },
    problems: [
      'horse wants to race',
      'poachers',
      'Calorium flooding in through frayed portal',
      'lost track of time',
      'failing logic binders',
      'v. happy, v. sleepy',
      'rare time inversion',
      'stampede of large, non-violent creatures',
      'animal adopts you',
      'mischievous critter steals something vital',
      'curfew approaching',
      "why aren’t your phones working?",
      'you’ve been duped',
      'your way out requires you to leave and you don’t wanna',
    ],
    checkpoints: [
      'a series of large hills',
      'a stream of cool water',
      'a stampede of horses',
      'migrating bison',
      'waterfall',
      'tall, numbing grass',
      'a tangled thicket',
      'beautiful, tranquilizing field of flowers',
      'potential shortcut',
      'bees',
      'an adorable animal the size of a house blocking your path',
      'cute animals sleeping on large, pretty rocks',
      'missing ribbon slice creates a huge gap',
      'a deep coulee',
      'a dense stand of pine',
    ],
    featuredLocations: [
      {
        name: 'The Meadow',
        description:
          'Bushes hang with a dozen varieties of berry and meadow seals sleep among the wildflowers in adorable fuzzy piles. Odd ampimeter readings birth speculation of secret portal-zones, arcane forces, and higher-dimensional beings.',
      },
      {
        name: 'Eternal Pastures',
        description:
          'Soft, grassy hills home to herds of giant bison and teams of playful mustangs. A rainbow of new colours arcs across an open sky scattered with dancing flocks of winged deer.',
      },
      {
        name: "Allie’s TurboSplash Waterpark™",
        description:
          'An abandoned Wilkie’s project, now sunbleached and overgrown with prairie grass. Empty pools, weird exhibits, and a half-finished network of colourful waterslides await hoverboarders lucky enough to be here.',
      },
    ],
  },
  {
    id: 'Quahalia',
    displayName: 'Quahalia',
    hazard: { kind: 'Haz', level: 3 },
    problems: [
      'swarm of omnimouths',
      'you are all one being, thoughts colliding, each controlling a different limb',
      'construct of darkening numbers',
      'meta-structural failure',
      'carnivorous terrain',
      'part of who you are takes off running',
      'foes made from your internal contradictions',
      'red-hot logic binders',
      "you think you’re back home but you’re not",
      'the way out is deeper into The Noise',
    ],
    checkpoints: [
      'stairs to nowhere',
      'a garden of forking paths',
      'a turnstile of deep questions',
      'a corridor you create with thought',
      'a one-inch hole you can fit through',
      'your bedroom door',
      'take a moment to fall forever',
      'the skatepark of your own body',
      'a halfpipe, a 3/2 pipe',
      'the terrain of dreams',
      'a room from your nightmares',
    ],
    featuredLocations: [
      {
        name: 'The Orthoplex',
        description:
          'Impossible shapes overlap, reflect, and reform in this kaleidoscopic 5D playground. Strange control panels on hard-to-reach platforms can tweak mathematical parameters, unfurl new spacial dimensions, and create new worlds.',
      },
      {
        name: 'The Archives',
        description:
          'The flooding halls of an infinite library, where time flows strangely—slowing and reversing, swirling forever in whirlpools, stagnating in hidden alcoves, and escaping down seductive side passages into alternate timelines.',
      },
      {
        name: 'The Neb',
        description:
          'Memories, secrets, dreams, and fears tumble in this psychic nebula like traincars in a tornado. A shuffling obstacle course made from movie sets from your life, asteroid-sized personal possessions, dioramas of thought, and garish floats from the parade of you.',
      },
    ],
  },
];

export const CANON_WORLD_NAMES: string[] = CANON_WORLDS.map((w) => w.id);
export const CANON_WORLD_DISPLAY_NAMES: string[] = CANON_WORLDS.map((w) => w.displayName);
