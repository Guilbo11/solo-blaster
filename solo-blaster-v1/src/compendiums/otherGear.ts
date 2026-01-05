export type OtherGearItem = {
  id: string;
  name: string;
  description: string;
  costs?: string;
  requires?: string;
};

// NOTE: “Other gear” and “Extra gear” are treated as the same table/compendium.
export const OTHER_GEAR: OtherGearItem[] = [
  {
    id: 'grapplingHook',
    name: 'Grappling Hook',
    description:
      'A pistol-sized launcher that fires an anti-negafriction dart which sticks firmly to most surfaces until switched off. The dart is attached to a hundred feet of lightweight carbon-fibre cable, which can be retracted via the launcher’s micro-winch.',
    costs: '1 coil',
  },
  {
    id: 'spacetimeAmpimeter',
    name: 'Spacetime Ampimeter',
    description:
      'Allows you to measure spacetime thickness in your vicinity, which can help you find thin-zones and other quantum abnormalities. Available as a standalone device or as a smartphone dongle. Also grants +1d6 to Portal Discovery beats.',
    costs: '1 disc',
  },
  {
    id: 'multiversalMaps',
    name: 'Multiversal Maps',
    description:
      'Local terrain maps for a number of worlds, overlaid and gridded, allowing you to figure out exactly which part of that vampire nest you’re going to portal right into. Available in a bizarrely-folded waterproof hardcopy for the exceptionally paranoid.',
    costs: '1 disc',
  },
  {
    id: 'smallDrone',
    name: 'Small Drone',
    description:
      'Can be controlled manually via a difficult-to-use app, or programmed to fly in predictable patterns or keep a subject in sight. Useful for scouting, filming stunts, carrying less than a kilogram, and running out of power right when it’s 400 feet out over a lake of acid.',
    costs: '1 disc',
  },
  {
    id: 'hackingTools',
    name: 'Hacking Tools',
    description:
      'May include an advanced handset or hacking gauntlet, as well as an arsenal of data spikes, keyloggers, transceivers, rippers, cloners, proxies, packet dumps, brute-force salvos, and old-fashioned lock picks.',
    costs: '1 disc',
  },
  {
    id: 'repairTools',
    name: 'Repair Tools',
    description:
      'May include soldering irons, laser torches, screwdrivers, ratchets, tweezers, skate-tools, multimeters, oscilloscopes, decoiling pliers, astral bolts, duct tape, and various spare parts needed to repair, salvage, or modify tech away from home.',
    costs: '1 coil',
  },
  {
    id: 'proCameraGear',
    name: 'Pro Camera Gear',
    description:
      'Covers a variety of DSLRs, vintage film cameras, chest-mounted action cams, shoulder-mounted 3D video rigs, advanced drone attachments (drone sold separately) and anything else better or different than your phone’s camera.',
    costs: '1 lens',
  },
  {
    id: 'mask',
    name: 'Mask',
    description:
      'You can’t hoverboard if you can’t breathe! A slugblaster’s mask is as unique as their wallet or cellphone case. They can look like bandannas, medical masks, gasmasks, gaiters, hockey masks, Halloween masks, and motocross helmets, all with enough nanofilters, CO₂ scrubbers, and oxygen lattice built in to keep you vaping nature’s own wherever you are.',
    costs: '1 coil, 1 lens',
    requires: 'Masks',
  },
  {
    id: 'advancedPortalTech',
    name: 'Advanced Portal Tech',
    description:
      'Thin-zones without thin enough spacetime are known as “doubles” and “triples,” and using them requires special cutting-edge technologies such as portal drills, slip foam, spacetime unravellers, or fancy Nth gear upgrades. Also grants +1d6 to Portal Discovery beats.',
    costs: '1 gem, 1 coil',
    requires: 'Advanced Portal Tech',
  },
  {
    id: 'hazwear',
    name: 'Hazwear',
    description:
      'The problem with portals is you might not know what’s on the other side. Will there be air? Will it be toxic? Will it be thrumming with radiation or piled on top of you for miles and kilometres creating a dozen atmospheres of organ-stomping pressure? Who knows! That’s the fun of it. And you can enjoy it all with the various skinsuits and motocross-inspired hazwear available for you really serious slugblasters to decorate with cartoon characters and spill iced coffee on.',
    costs: '2 coils',
    requires: 'Hazwear',
  },
  {
    id: 'logicBinder',
    name: 'Logic Binder',
    description:
      'Logic Binders are arcane devices that allow you to exist safely in universes with different physical laws than your own, keeping your reality intact long enough for you to get yourself killed in a more comprehensible way. They can look like a remote control, a piece of odd metallic jewelry, or a glittering cloth patch sewn onto your denim jacket.',
    costs: '1 disc, 1 gem',
    requires: 'Logic Binders',
  },
  {
    id: 'peelbackKit',
    name: 'Peelback Kit',
    description:
      'Peelback accidents are traumatic events, even for the pliable teenage brain, and a peelback kit (usually consisting of a coherence rod, mouthguard, seizure and nausea tablets, stable pattern flashcards, etc.) can make all the difference should a friend be unlucky enough to experience one—and you’re lucky enough to get back to them in time.',
    costs: '1 disc, 1 coil',
  },
  {
    id: 'backupPortalingDevice',
    name: 'Backup Portaling Device',
    description:
      'Bad things can happen to a hoverboard. You could shoot it out near a bottomless pit, focus it in a fit of rage, or lose it to an aggressive Rescue officer. Cautious slugblasters might like to know they have a second way home. Covers compound-energy photospheres, spare Nth gears, splat-hatches, etc.',
    costs: '1 lens',
  },
  {
    id: 'hardeckerSludgeFlares',
    name: 'Hardecker® Sludge Flares',
    description:
      'Over 600 cubic feet and 4.5 eventual tons of patented Solidifying Liquid Ultra-Dense Grappling Expansion packed into an 8-inch, 14-ounce baton, originally designed for various mining applications. Crack the stick, stand back, and watch a shipping container worth of sticky hi-viz foam gush out. Pack of two.',
    costs: '1 coil',
  },
  {
    id: 'maserGrenades',
    name: 'Maser Grenades',
    description:
      'Great for swarms of bloodwhips, better for swarms of popcorn, maser grenades explode into hot fields of microwave radiation that cook anything inside. Pack of two.',
    costs: '1 gem',
  },
  {
    id: 'fustMix',
    name: 'The FUST® Mix',
    description:
      'A quantum compact disc full of songs curated by FUST music snobs. From remixes and covers of familiar hits, to originals that were never released in this dimension, you’ll always have the right song for any occasion.',
    costs: '1 disc',
  },
  {
    id: 'wilkieGravityStickers',
    name: "Wilkie’s Gravity Stickers",
    description:
      'A set of 15-inch circular, transparent sticker pads that can be applied to any surface. When powered on, they project a faint gravity field roughly 2 feet in diameter. The effects can vary based on the mass of the object they’re stuck to, as well as local gravity conditions. Pack of two.',
    costs: '1 disc, 1 gem',
  },
  {
    id: 'fustStasisStickers',
    name: 'FUST® Stasis Stickers',
    description:
      'A set of thick paper stickers. When applied to an object, they cover it in a thin stasis field, freezing its physical state until removed. Pack of six.',
    costs: '1 coil',
  },
  {
    id: 'hardlightMarker',
    name: 'Hardlight Marker',
    description:
      'Like a thick marker, but it produces hardlight rails. Great for making crude staircases, ramps, rail slides, or skateboard parks. However, hardlight can be affected by heavier objects and strong impacts.',
    costs: '1 disc',
  },
  {
    id: 'smartCord',
    name: 'Smart Cord',
    description:
      'Cord that can become rigid, sticky, or elastic based on the user’s intention, allowing for quick bindings, grapples, or improvised climbing aids.',
    costs: '1 coil',
  },
  {
    id: 'beamFilter',
    name: 'Beam Filter',
    description:
      'A lens attachment that can refract, dampen, or distort beams and bright anomalies. Handy for countering laser-like hazards or confusing beam-based sensors.',
    costs: '1 lens',
  },
  {
    id: 'panicEnergyFuelLine',
    name: 'PANIC Energy® Fuel-line',
    description:
      'A canister and tube setup that lets you inject concentrated stimulant fuel directly into devices or (inadvisably) into yourself. You will feel terrible later.',
    costs: '1 disc',
  },
  {
    id: 'augBand',
    name: 'Aug Band',
    description:
      'A wearable band that can boost or tune a single physical response for a short time—like grip, balance, or reaction speed—at the cost of nasty feedback later.',
    costs: '1 lens',
  },
  {
    id: 'particleBondTights',
    name: 'Particle Bond Tights',
    description:
      'A tight underlayer that helps keep your particles together in harsh environments. Makes you harder to rattle, at the cost of feeling weirdly “sticky” and wrong.',
    costs: '1 coil',
  },
  {
    id: 'knockoffScramCatTee',
    name: 'Knock-off Scram Cat Tee',
    description:
      'A bootleg tee that somehow messes with recognition systems, cameras, and even people’s attention just enough to make you a little harder to remember.',
    costs: '1 disc',
  },
  {
    id: 'awfBracelet',
    name: 'AWF Bracelet',
    description:
      'A bracelet that can project a short-lived force field or deflection shimmer. It’s not strong, but it can turn a bad moment into a survivable one.',
    costs: '1 gem',
  },
  {
    id: 'printedAblatine',
    name: '3D-Printed Ablatine',
    description:
      'A block or sheet of ablatine—material designed to absorb and burn away energy. Great for improvised shielding or for soaking up a burst that would otherwise ruin your day.',
    costs: '1 disc, 1 gem',
  },
  {
    id: 'miperEscapeBag',
    name: 'MIPER® Escape Bag',
    description:
      'This single-use emergency device is a big hit with parents. When you would be seriously injured, this backpack instead expands and encloses you in an embarrassingly massive sphere of cushioning material and stable quarks that deposit you back in Null unharmed.',
    costs: '1 coil, 1 disc',
  },
  {
    id: 'duraweaveJacket',
    name: 'Duraweave Jacket',
    description:
      'Your Duraweave jacket has a lifetime warranty for standard wear and tear, but literally nothing you’re doing in it qualifies as standard so don’t get ahead of yourself. Nope bruising, bludgeoning, and crushing for only 1 trouble.',
    costs: '1 disc, 1 coil',
  },
  {
    id: 'linkPatchDuo',
    name: 'Link Patch Duo',
    description:
      'Sew one onto your jacket and give the other to a friend. Arcane energy entangles your quanta, allowing you to swap places within the same universe and communicate telepathically (emoji only). If one of you peels back, the other does too, and removing either patch hurts you both. Set of two.',
    costs: '1 coil, 1 disc, 1 gem',
  },
  {
    id: 'slamPatch',
    name: 'Slam Patch',
    description:
      'This iron-on patch absorbs a set amount of most types of energy, including kinetic energy. Avoid one slam from physical damage for free. Once used, the patch fades to greyscale, functionally inert but now valuable as a form of street cred.',
    costs: '1 lens, 1 disc',
  },
];
