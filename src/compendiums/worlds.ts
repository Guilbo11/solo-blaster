export type CanonWorldId =
  | 'Null (Hillview)'
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

export interface CanonWorld {
  id: CanonWorldId;
  name: string;
  /** Raw reference text extracted from the book, shown in Oracles + Worlds tab. */
  body: string;
}

// NOTE: These blurbs are intentionally stored as raw text blocks (not fully parsed)
// so the UI can show the content in a simple, collapsible details view.
// Source: Slugblaster 1.31 (Worlds + Other Worlds sections).
export const CANON_WORLDS: CanonWorld[] = [
  {
    id: 'Null (Hillview)' as const,
    name: 'Null (Hillview)',
    body: `y our
Null
The Universe of Null is fantastically
boring—a desaturated, bland world of
wo
r tax returns and life insurance, vanilla ice
ld cream and talk radio.
A world of beige lawns, brownish snow
and a dozen shades of taupe plastic
siding. A world of two-hour Sunday after-
noon drives to your great aunt’s house,
with
 a faded brown-velour car interior and a
few weeks’ worth of stale mints out
of a garage-sale candy dish.
This is where you live.

your World
Hillview
THE REAL HILLVIEW
Hillview was never really home to me. I
grew up in the city, and got moved there
after my parents’ divorce. I always felt
like an outsider. I’d play pretend on my
own, or hang out with a few other kids
who didn’t fit in. We’d explore the woods
and abandoned buildings around town
and dream about running away.
I guess I did run away, in the end.

1. Grain Elevators. Towering wooden relics, where 11. Burger Man. Hard ice cream, mushroom burgers, a
wheat was siloed then loaded into train cars table of retirees reading Coffee News Bulletin.
through long, tempting chutes.
12. The Video Hut. This cultural hub rents movies,
2. Gravel Yard. Large sloping heaps of aggregate, game consoles, and well-used slugblasting gear.
well-secured by a broken chainlink fence. Have it back by 5 pm the next day, and don’t forget
to rewind the amp-coils!

3. Hillview Aquatic Centre. This indoor pool is the
epicentre of Hillview’s nightlife. Family swim ends 13. The Food Cellar. This local grocery monopoly
at 7 pm. Closed semi-annually to be drained and employs most of Hillview’s teenage workforce,
cleaned. who spend eternal 4-hour shifts stocking shelves,

4. Overpass. A huge gash in the landscape where a
new highway cuts across town. Some nights you can 14. Vargtronix. This garage-built drone shop used
hear semi-trucks racing through at 3 am. to be a computer repair store. Amateur engine-tinkerers
now buy, fix, and race drones here.

5. Hillview High. Every kid goes here. The library and
the auditorium are the oldest parts of the building. 15. The Hill. This long, treed slope down to the river
has some of the best skate spots in town.

6. The Dive. A concrete underpass over the river,
with a steep, narrow, graffiti covered path down to 16. The New Subdivision. Overpriced copy-paste
it. Nothing soothes the soul like chucking rocks into houses on the south edge of town. First time home
the river from a great height. buyers, with more money than sense.

7. Wendy’s. This restaurant was built around an old
trainstation that stopped being used decades ago. 17. The Coffee Garden. Sleepy café in a ramshackle
spot at the end of the stripmall. When it’s warm out,

8. Hillview Manor. An abandoned, crumbling mansion
overlooking the river. It looks (and probably is) cursed. 18. The Strip. A stretch of franchise shops and fast
food joints on the edge of town.
`,
  },
  {
    id: 'Vastiche' as const,
    name: 'Vastiche',
    body: `Pronounced
Vastiche “Vas-TEESH.”
FEATURED LOCATIONS
● The Overpass. A river of abandoned cars rust
bumper to bumper on a mile of elevated freeway.
The windshields, on-ramps, and medians are fun
to skate and underneath you’ll find shade, graffiti,
empty cans, and hundreds of thrumming egg sacs.
Chemical war badlands. Crumbling parkades, faded
billboards, and an abandoned megamall almost entire-
ly covered over with dunes of pink sand.

● Rainbow Tank. Between the bombed-out remains
of two big-box stores is a pockmarked graveyard
of military vehicles, including a large battle tank
covered in years of spraypaint and railwax.

Greenish clouds smear Vastiche’s pale yellow sky. The
landscape is dry and jagged, the air smells like chlo-
rine and tastes like artificial sweetener—a byproduct of
some sort of chemical weapon used during whatever
global conflict turned this once-placid suburb into a
desolate shadow of itself.

● The Ruined Megamall. What used to be a sprawling
temple to consumerism is now a series of half-
buried caverns. Crumbling concrete, broken escalators,
and tons of graffiti. Good stuff can still be found
in the backrooms, if you can handle the bugs.

● Neon Dune. A neon pink sand dune rising above
the ruins, used as a launchpad by slugblasters.
It’s rad as hell, but watch for unstable sand.
`,
  },
  {
    id: 'Thennis Spar' as const,
    name: 'Thennis Spar',
    body: `otHEr WorldS
thennis Spar
FEATURED LOCATIONS
● Arborist Temple. Like everything in Thennis Spar,
this sacred site is both impossibly ancient and un-
believably futuristic. Word is that the Arborists are
hoarding some serious tech in their inner sanctum
(not to mention all the secrets of the multiverse).

A bustling, exotic utopian city. Locals trade olives and
spices in the forum, discuss the multiverse in ancient
temples, and try to ignore all the ghosts.

● The Forum. You can find just about anything here if
you know where to look, including strange delica-
cies, impossible wonders, and all the components
and gear a crew could ask for. The question is:
what do you have to trade?

Visiting Thennis Spar for the first time feels like travel-
ing to the ancient past and the distant future all at the
same time. In the crowded marketplace, you’re as likely
to find a cart full of fresh produce as you are a cache
of advanced, otherworldly technology.
`,
  },
  {
    id: 'Desnine' as const,
    name: 'Desnine',
    body: `Pronounced “DEZ-neen,”
from a Thennis Spartian word
desnine meaning “Swim Forever.”
FEATURED LOCATIONS
● Observation Centre. Miles of pristine glass corri-
dors that twist in every direction. Flickering emer-
gency lights illuminate steep drops, tight corners,
and occasional full loops. A great place to score
primo footage or find abandoned gear, but watch
for cracked glass and flooded chambers.

An infinite ocean, with water where outer space should
be. The serpentine glass corridors of an abandoned
observation centre twist around a small coral moon.

● Ethan’s Reef. A coral moon home to hundreds of
metaterrestrial species and some very mysterious
alien wreckage. Named after that kid who went
missing here years ago.
`,
  },
  {
    id: 'The Golden Jungle' as const,
    name: 'The Golden Jungle',
    body: `otHEr WorldS
the golden
FEATURED LOCATIONS
● The Praetorians. No one knows how many of these Jungle
Beasts there are, but you always see their golden eyes
peering from the shadows.

The ruins of an advanced civilization, grown over by
golden jungle vines and impossibly huge flora.

● The Ruined City. Massive stone structures and
collapsed towers draped in vines. There are
still glittering devices embedded in the walls.
`,
  },
  {
    id: 'Prismatia' as const,
    name: 'Prismatia',
    body: `Pronounced
“priz-MAT-ee-ah.”
Prismatia
FEATURED LOCATIONS
● Hardecker Mining Facility. Hardecker has been
mining kramshon and farming polystellar energy
here for years—junking up the place with chutes,
struts, conveyors, and an entire workforce of dis-
gruntled, virus-riddled mining bots.

The plane of light. No sky, no ground, no up, no down.
Pink clouds and giant crystal asteroids refract rays
from a pantheon of distant psionic stars.

● The Miper Train. Miper believes their trillion dollar
multiversal train network will bring the multiverse
together. Right now it’s mostly a sleek ribbon of
impossible light cutting through the void.
`,
  },
  {
    id: 'Operaeblum' as const,
    name: 'Operaeblum',
    body: `otHEr WorldS
Pronounced
“op-er-AY-blum.”
operaeblum
FEATURED LOCATIONS
● Matte Static. The hottest club in the multiverse.
Models push illegal flavours of PANIC Energy®,
sponsor reps cut deals in the VIP, pros skate the
portal-connected halfpipe, and every time the beat
drops the dance floor is blasted with a flurry of
caffeinated party snow. Must be legal drinking age.

Three warring corporate megatowers, connected with
twisting pedways and skytrains. Raves, androids, mir-
ror shades. You get it.

● The Drop Line. This famous skate route starts at
one tower’s upper skybridge and plummets through
the city’s infrastructure like a glittering artery.
`,
  },
  {
    id: 'Calorium' as const,
    name: 'Calorium',
    body: `calorium
FEATURED LOCATIONS
Pronounced
● The Gliders. Dozens of glimmering foil air vessels
“cah-LOR-ee-um.”
coast between floating basalt islands. Some are
traders. Some are pirates. Some are both.

Lava seas and floating basalt islands, with a red-orange
sky and heat that can melt gear and egos alike.

● The Soda Lakes. Pools of boiling, carbonated liquid
that fizz and pop like a nightmare party.
`,
  },
  {
    id: 'The Waking Pits' as const,
    name: 'The Waking Pits',
    body: `otHEr WorldS
the waking
FEATURED LOCATIONS
● The Doom Slalom. Starts on the hilltop ruins of a pits
castle and drops down into the frozen dark. Fast.

Hardmode. Cold, dark Hell. A frozen landscape of crumbling cas-
tles and deep crevasses.

● The Choir. Strange voices echo through the ice.
If you follow them, you might find something
beautiful. Or hungry.
`,
  },
  {
    id: 'Popularia' as const,
    name: 'Popularia',
    body: `Pronounced
“pop-you-LAIR-ee-ah.”
PoPulArIA
FEATURED LOCATIONS
● The Beach. Swim, surf, and party among the hot-
test people in the multiverse. Or get judged.

A sunlit resort world and multiversal party capital.

● Slugblaster Academy. The competitive training ground
where slugblasting was born. this hopping beachside campus.
`,
  },
  {
    id: 'Empyrean' as const,
    name: 'Empyrean',
    body: `otHEr WorldS
Pronounced
“em-PEER-ee-en.”
EMPyrEAn
FEATURED LOCATIONS
● The Meadow. Bushes hang with a dozen variet-
ies of berries. Bees and birds and strange little
spirits drift through the grass.

A surreal pastoral world, impossibly vivid and alive.

● The Edge. Waterfalls spill off the world’s rim into
the void. You can hear distant music in the mist.
`,
  },
  {
    id: 'Quahalia' as const,
    name: 'Quahalia',
    body: `Pronounced
“Qua-HAY-lee-ah.”
QuAHAlIA
FEATURED LOCATIONS
● The Orthoplex. Impossible shapes overlap, reflect, and
refract. You can lose your sense of self just looking.

A world of shifting geometry and metaphysical weirdness.

● The Palaces. Bright, faceted structures floating in
the impossible distance. Hold onto your atoms.
`,
  },
];

export const CANON_WORLD_NAMES: string[] = CANON_WORLDS.map((w) => w.name);
