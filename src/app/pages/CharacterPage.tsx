import React, { useMemo, useState } from 'react';
import { campaignActions, useCampaignStore } from '../../storage/useCampaignStore';
import {
  BOARD_TYPE_ROWS,
  DECK_GRAPHIC_TABLE,
  FAMILY_TABLE,
  GRIP_COLOUR_TABLE,
  GRIP_CUT_TABLE,
  HANGOUT_TABLE,
  LONER_TRAITS,
  LOOK_WORDS,
  HOOK_PROMPTS,
  RAYGUN_STEP_A_TABLE,
  RAYGUN_STEP_B_TABLE,
} from '../../tables/characterTables';
import { OTHER_GEAR } from '../../compendiums/otherGear';
import {
  SIGNATURE_GEAR,
  SIGNATURE_LOOKS,
  canAfford,
  totalComponents,
} from '../../compendiums/signatureGear';
import { d6, rollRange } from '../../utils/dice';
import { uuid } from '../../utils/uuid';
import { FACTIONS } from '../../compendiums/factions';
import type { Campaign, Character } from '../types';
import { adjacentTo, areAdjacent, getAllWorldNames } from '../../utils/worldAdjacency';

type ComponentKey = 'coil' | 'disc' | 'lens' | 'gem';

function rollD6Split<T extends { left: string; right: string }>(table: T[]): string {
  const row = table[d6() - 1];
  const col = d6();
  return col <= 3 ? row.left : row.right;
}

function rollBoardType(): string {
  const rowRoll = d6();
  const rowIdx = rowRoll <= 2 ? 0 : rowRoll <= 4 ? 1 : 2;
  const col = d6();
  return BOARD_TYPE_ROWS[rowIdx][col - 1];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function costLabel(cost: Record<string, number>) {
  const parts: string[] = [];
  const map: Array<[ComponentKey, string]> = [
    ['coil', 'Coil'],
    ['disc', 'Disc'],
    ['lens', 'Lens'],
    ['gem', 'Gem'],
  ];
  for (const [k, label] of map) {
    const n = (cost as any)[k] ?? 0;
    if (n > 0) parts.push(`${n} ${label}${n > 1 ? 's' : ''}`);
  }
  return parts.join(', ') || '—';
}

export default function CharacterPage() {
  const { campaigns, activeCampaignId } = useCampaignStore();
  const campaign = useMemo(
    () => campaigns.find((c) => c.id === activeCampaignId) ?? null,
    [campaigns, activeCampaignId]
  );
  const [showCreate, setShowCreate] = useState(false);
  const [showAddGear, setShowAddGear] = useState(false);
  const [showAddMod, setShowAddMod] = useState(false);
  const [pendingDisaster, setPendingDisaster] = useState(false);

  if (!campaign) {
    return (
      <div className="page">
        <h1>Character</h1>
        <p className="muted">Select a campaign first.</p>
      </div>
    );
  }

  const ch = campaign.character;
  const resources = campaign.resources;

  const updateCharacter = (patcher: (prev: Character) => Character) => {
    const now = Date.now();
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now,
      character: patcher(c.character),
    }));
  };

  const updateResources = (patcher: (prev: typeof resources) => typeof resources) => {
    const now = Date.now();
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now,
      resources: patcher(c.resources),
    }));
  };

  const toggleTrouble = (next: number) => {
    if (next === 8 && resources.trouble < 8 && !pendingDisaster) {
      setPendingDisaster(true);
      return;
    }
    updateResources((r) => ({ ...r, trouble: clamp(next, 0, 8) }));
    setPendingDisaster(false);
  };

  const confirmDisaster = (yes: boolean) => {
    if (!yes) {
      setPendingDisaster(false);
      return;
    }
    updateResources((r) => ({ ...r, trouble: 8 }));
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      run: { ...c.run, disasterRolled: false },
    }));
    setPendingDisaster(false);
  };

  const eligibleMods = useMemo(() => {
    if (!ch.signatureGear?.gearId) return [];
    const gear = SIGNATURE_GEAR.find((g) => g.id === ch.signatureGear!.gearId);
    if (!gear) return [];
    return gear.mods;
  }, [ch.signatureGear?.gearId]);

  return (
    <div className="page">
      <div className="pageHeader">
        <h1>Character</h1>
        {!ch.created ? (
          <button className="btn" onClick={() => setShowCreate(true)}>
            Create character
          </button>
        ) : null}
      </div>

      {!ch.created ? (
        <div className="card">
          <p className="muted">
            Your campaign doesn’t have a created character yet. Use “Create character” to build your Loner.
          </p>
        </div>
      ) : (
        <>
          <section className="card">
            <h2>{ch.name || 'Unnamed Loner'}</h2>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="pill">Playbook: Loner</span>
              <span className="pill">Attitude: {resources.attitudeBoost} Boost / {resources.attitudeKick} Kick</span>
              <span className="pill">Turbo: {resources.turboBoost} Boost / {resources.turboKick} Kick</span>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              Refill: when you rest between runs, set Attitude & Turbo to their max (Boost and Kick are separate tracks).
            </p>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Signature gear</h2>
            {ch.signatureGear ? (
              <div className="subcard">
                <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{ch.signatureGear.gearName}</div>
                    <div className="muted">Type: {ch.signatureGear.type}</div>
                    <div className="muted">Looks: {ch.signatureGear.looks.join(', ') || '—'}</div>
                    <div className="muted">Installed mods: {ch.signatureGear.installedMods.join(', ') || '—'}</div>
                  </div>
                  <button className="btn" onClick={() => setShowAddMod(true)}>
                    Buy a new Mod
                  </button>
                </div>
              </div>
            ) : (
              <p className="muted">No signature gear selected yet.</p>
            )}
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Traits</h2>
            {ch.traits.length === 0 ? (
              <p className="muted">No traits selected.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {ch.traits.map((t) => {
                  const def = LONER_TRAITS.find((x) => x.name === t);
                  return (
                    <details key={t} className="details">
                      <summary>
                        <span style={{ fontWeight: 800 }}>{t}</span>
                      </summary>
                      <div className="detailsBody">
                        <p>{def?.description ?? ''}</p>
                        {t === 'Autodidact' ? (
                          <p className="muted">
                            Autodidact: {ch.autodidact?.[0] || '____'} and {ch.autodidact?.[1] || '____'}
                          </p>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Raygun</h2>
            <div className="subcard">
              <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                <div className="pill">A: {ch.raygun.a || '—'}</div>
                <div className="pill">B: {ch.raygun.b || '—'}</div>
              </div>
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Hoverboard</h2>
            <div className="subcard">
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="pill">Grip colour: {ch.hoverboard.gripColor || '—'}</span>
                <span className="pill">Grip cut: {ch.hoverboard.gripCut || '—'}</span>
                <span className="pill">Deck graphic: {ch.hoverboard.deckGraphic || '—'}</span>
                <span className="pill">Board type: {ch.hoverboard.boardType || '—'}</span>
              </div>
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Gear</h2>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div className="muted">Other gear: {ch.otherGear.length ? ch.otherGear.join(', ') : '—'}</div>
              <button className="btn" onClick={() => setShowAddGear(true)}>
                Add other gear
              </button>
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Components</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {(['coil', 'disc', 'lens', 'gem'] as ComponentKey[]).map((k) => (
                <div key={k} className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{k}s</div>
                  <div className="row" style={{ gap: 8 }}>
                    <button
                      className="btn btnGhost"
                      onClick={() =>
                        updateCharacter((prev) => ({
                          ...prev,
                          components: { ...prev.components, [k]: Math.max(0, (prev.components as any)[k] - 1) },
                        }))
                      }
                      disabled={(ch.components as any)[k] <= 0}
                    >
                      −
                    </button>
                    <div className="pill" style={{ minWidth: 44, textAlign: 'center' }}>
                      {(ch.components as any)[k]}
                    </div>
                    <button
                      className="btn btnGhost"
                      onClick={() =>
                        updateCharacter((prev) => ({
                          ...prev,
                          components: { ...prev.components, [k]: (prev.components as any)[k] + 1 },
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Notes</h2>
            <textarea
              className="textarea"
              value={ch.notes}
              onChange={(e) => updateCharacter((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes…"
              style={{ minHeight: 140 }}
            />
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Trouble & Style</h2>
            <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Trouble (max 8)</div>
                <div className="track">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const n = i + 1;
                    const checked = resources.trouble >= n;
                    return (
                      <label key={n} className="trackBox">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTrouble(checked ? n - 1 : n)}
                        />
                        <span />
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Style (max 10)</div>
                <div className="track">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const n = i + 1;
                    const checked = resources.style >= n;
                    return (
                      <label key={n} className="trackBox">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => updateResources((r) => ({ ...r, style: checked ? n - 1 : n }))}
                        />
                        <span />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {showCreate ? (
        <CreateCharacterModal
          campaign={campaign}
          initial={ch}
          onClose={() => setShowCreate(false)}
          onConfirm={(nextChar, nextResources) => {
            const now = Date.now();
            campaignActions.updateCampaign(campaign.id, (c) => ({
              ...c,
              updatedAt: now,
              character: nextChar,
              resources: nextResources,
            }));
            setShowCreate(false);
          }}
        />
      ) : null}

      {showAddGear ? (
        <AddOtherGearModal
          owned={ch.otherGear}
          onClose={() => setShowAddGear(false)}
          onAdd={(item) => {
            updateCharacter((prev) => ({ ...prev, otherGear: [...prev.otherGear, item] }));
            setShowAddGear(false);
          }}
        />
      ) : null}

      {showAddMod && ch.signatureGear ? (
        <BuyModModal
          gearId={ch.signatureGear.gearId}
          installed={ch.signatureGear.installedMods}
          inv={ch.components}
          onClose={() => setShowAddMod(false)}
          onBuy={(modName, cost) => {
            updateCharacter((prev) => {
              const inv = prev.components;
              const nextInv = {
                coil: inv.coil - (cost.coil || 0),
                disc: inv.disc - (cost.disc || 0),
                lens: inv.lens - (cost.lens || 0),
                gem: inv.gem - (cost.gem || 0),
              };
              return {
                ...prev,
                components: nextInv,
                ownedMods: Array.from(new Set([...(prev.ownedMods || []), modName])),
                signatureGear: prev.signatureGear
                  ? {
                      ...prev.signatureGear,
                      installedMods: Array.from(new Set([...(prev.signatureGear.installedMods || []), modName])),
                    }
                  : prev.signatureGear,
              };
            });
            setShowAddMod(false);
          }}
        />
      ) : null}

      {pendingDisaster ? (
        <div className="modalBackdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Trigger Disaster Roll?</h2>
            <p className="muted">Trouble is about to hit 8. If you confirm, a Disaster Roll should be triggered.</p>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn btnGhost" onClick={() => confirmDisaster(false)}>
                Cancel
              </button>
              <button className="btn" onClick={() => confirmDisaster(true)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreateCharacterModal({
  campaign,
  initial,
  onClose,
  onConfirm,
}: {
  campaign: Campaign;
  initial: Character;
  onClose: () => void;
  onConfirm: (c: Character, resources: any) => void;
}) {
  const starterOtherGear = useMemo(() => OTHER_GEAR.filter((g) => g.starting), []);

  const raygunAOptions = useMemo(() => {
    const out = new Set<string>();
    for (const r of RAYGUN_STEP_A_TABLE) {
      out.add(r.left);
      out.add(r.right);
    }
    return Array.from(out);
  }, []);

  const raygunBOptions = useMemo(() => {
    const out = new Set<string>();
    for (const r of RAYGUN_STEP_B_TABLE) {
      out.add(r.left);
      out.add(r.right);
    }
    return Array.from(out);
  }, []);

  const [name, setName] = useState(initial.name || 'Unnamed Loner');
  const familyOptions = useMemo(() => {
    const out = new Set<string>();
    for (const r of FAMILY_TABLE) {
      out.add(r.left);
      out.add(r.right);
    }
    return Array.from(out);
  }, []);
  const [family1, setFamily1] = useState(initial.family?.[0] ?? '');
  const [family2, setFamily2] = useState(initial.family?.[1] ?? '');

  const [look1, setLook1] = useState('');
  const [look2, setLook2] = useState('');
  const [look3, setLook3] = useState('');

  // Solo Blaster: choose only ONE starting trait.
  const [trait, setTrait] = useState<string>(initial.traits?.[0] ?? '');
  const [autod1, setAutod1] = useState(initial.autodidact?.[0] ?? '');
  const [autod2, setAutod2] = useState(initial.autodidact?.[1] ?? '');

  const [rayA, setRayA] = useState(initial.raygun?.a ?? '');
  const [rayB, setRayB] = useState(initial.raygun?.b ?? '');

  const [gripColor, setGripColor] = useState(initial.hoverboard?.gripColor ?? '');
  const [gripCut, setGripCut] = useState(initial.hoverboard?.gripCut ?? '');
  const [deckGraphic, setDeckGraphic] = useState(initial.hoverboard?.deckGraphic ?? '');
  const [boardType, setBoardType] = useState(initial.hoverboard?.boardType ?? '');

  // Solo Blaster: choose only TWO starting other gear items.
  const [otherGear, setOtherGear] = useState<string[]>(initial.otherGear ?? []);
  const [showSig, setShowSig] = useState(false);
  const [signatureGear, setSignatureGear] = useState<Character['signatureGear']>(initial.signatureGear);

  const toggleTrait = (t: string) => {
    setTrait((prev) => (prev === t ? '' : t));
  };

  const toggleOtherGear = (itemName: string) => {
    setOtherGear((prev) => {
      if (prev.includes(itemName)) return prev.filter((x) => x !== itemName);
      if (prev.length >= 2) return prev; // max 2 at start
      return [...prev, itemName];
    });
  };

  // Hangouts (pick/roll) x2
  const hangoutOptions = useMemo(() => {
    const out = new Set<string>();
    for (const r of HANGOUT_TABLE) {
      out.add(r.left);
      out.add(r.right);
    }
    return Array.from(out);
  }, []);
  const [hangout1, setHangout1] = useState(initial.hangouts?.[0] ?? '');
  const [hangout2, setHangout2] = useState(initial.hangouts?.[1] ?? '');
  const rollHangout = () => {
    const v = rollD6Split(HANGOUT_TABLE);
    if (!hangout1) setHangout1(v);
    else if (!hangout2) setHangout2(v);
    else setHangout1(v);
  };

  // Factions
  const factionNames = useMemo(
    () => Array.from(new Set(FACTIONS.map((f) => f.name))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const [fanFaction, setFanFaction] = useState(initial.factions?.fan ?? '');
  const [annoyedFaction, setAnnoyedFaction] = useState(initial.factions?.annoyed ?? '');
  const [familyFaction, setFamilyFaction] = useState(initial.factions?.family?.name ?? '');
  const [familyRelation, setFamilyRelation] = useState<1 | -1>(initial.factions?.family?.relation ?? 1);

  // Hook (free text or roll)
  const [hook, setHook] = useState(initial.hook ?? '');
  const rollHook = () => setHook(HOOK_PROMPTS[rollRange(0, HOOK_PROMPTS.length - 1)]);

  // Map: choose 3 one-way portals between adjacent worlds (no rolls).
  const allWorldNames = useMemo(() => getAllWorldNames(campaign), [campaign.worlds]);
  const [startPortals, setStartPortals] = useState<Array<{ from: string; to: string }>>(() => {
    const existing = Array.isArray(initial.portals) ? initial.portals : [];
    const seeded = existing
      .filter((p) => !p.twoWay)
      .slice(0, 3)
      .map((p) => ({ from: p.from, to: p.to }));
    while (seeded.length < 3) seeded.push({ from: 'Null', to: '' });
    return seeded;
  });

  const rollFamily = () => {
    const row = FAMILY_TABLE[d6() - 1];
    const col = d6();
    const v = col <= 3 ? row.left : row.right;
    // fill the first empty slot, otherwise overwrite the first
    if (!family1) setFamily1(v);
    else if (!family2) setFamily2(v);
    else setFamily1(v);
  };

  const rollLook = (slot: 1 | 2 | 3) => {
    const v = LOOK_WORDS[rollRange(0, LOOK_WORDS.length - 1)];
    if (slot === 1) setLook1(v);
    if (slot === 2) setLook2(v);
    if (slot === 3) setLook3(v);
  };

  const canConfirm = useMemo(() => {
    if (!name.trim()) return false;
    if (!family1.trim() || !family2.trim()) return false;
    if (!trait.trim()) return false;
    if (!rayA.trim() || !rayB.trim()) return false;
    if (otherGear.length !== 2) return false;
    if (!hangout1.trim() || !hangout2.trim()) return false;
    if (hangout1.trim() === hangout2.trim()) return false;
    if (!fanFaction.trim() || !annoyedFaction.trim() || !familyFaction.trim()) return false;
    if (!hook.trim()) return false;
    if (startPortals.some((p) => !p.from.trim() || !p.to.trim() || !areAdjacent(campaign, p.from, p.to))) return false;
    if (!signatureGear) return false;
    return true;
  }, [name, family1, family2, trait, rayA, rayB, otherGear.length, hangout1, hangout2, fanFaction, annoyedFaction, familyFaction, hook, startPortals, signatureGear, campaign]);

  const confirm = () => {
    const looks = [look1, look2, look3].filter(Boolean).slice(0, 3);
    const nextPortals = startPortals.map((p) => ({ id: uuid(), from: p.from, to: p.to, twoWay: false }));
    const next: Character = {
      ...initial,
      created: true,
      playbook: 'Loner',
      name: name.trim(),
      family: [family1.trim(), family2.trim()],
      look: looks.join(', '),
      traits: trait.trim() ? [trait.trim()] : [],
      autodidact: trait.trim() === 'Autodidact' ? [autod1.trim(), autod2.trim()] : ['', ''],
      raygun: { a: rayA, b: rayB },
      hoverboard: { gripColor, gripCut, deckGraphic, boardType },
      otherGear,
      signatureGear,
      hangouts: [hangout1.trim(), hangout2.trim()],
      factions: {
        fan: fanFaction.trim(),
        annoyed: annoyedFaction.trim(),
        family: { name: familyFaction.trim(), relation: familyRelation },
      },
      portals: nextPortals,
      hook: hook.trim(),
    };

    const nextResources = {
      attitudeBoost: 2,
      attitudeKick: 2,
      turboBoost: 2,
      turboKick: 2,
      bite: 0,
      trouble: 0,
      style: 0,
      doom: 0,
      legacy: 0,
    };

    onConfirm(next, nextResources);
  };

  return (
    <div className="modalBackdrop modalBackdropTop">
      <div className="modal modalTall" role="dialog" aria-modal="true">
        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <h2>Create character</h2>
          <button className="btn btnGhost" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ display: 'grid', gap: 14, marginTop: 10 }}>
          <div>
            <div className="fieldLabel">Character name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <div className="fieldLabel">Family (choose two)</div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <select className="select" value={family1} onChange={(e) => setFamily1(e.target.value)}>
                <option value="">—</option>
                {familyOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select className="select" value={family2} onChange={(e) => setFamily2(e.target.value)}>
                <option value="">—</option>
                {familyOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <button className="btn btnGhost" onClick={rollFamily}>
                Random
              </button>
            </div>
          </div>

          <div>
            <div className="fieldLabel">Look (pick up to 3)</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="row" style={{ gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <select
                    className="select"
                    value={slot === 1 ? look1 : slot === 2 ? look2 : look3}
                    onChange={(e) => {
                      if (slot === 1) setLook1(e.target.value);
                      if (slot === 2) setLook2(e.target.value);
                      if (slot === 3) setLook3(e.target.value);
                    }}
                  >
                    <option value="">—</option>
                    {LOOK_WORDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  <button className="btn btnGhost" onClick={() => rollLook(slot as any)}>
                    Random
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="fieldLabel">Traits</div>
            <div className="muted small" style={{ marginBottom: 6 }}>Pick exactly one starting Trait.</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {LONER_TRAITS.map((t) => {
                const selected = trait === t.name;
                return (
                  <div key={t.name} className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                    <button
                      className={selected ? 'btn btnSelected' : 'btn btnGhost'}
                      onClick={() => toggleTrait(t.name)}
                      type="button"
                    >
                      {t.name}
                    </button>
                    <span className="muted" style={{ flex: 1 }}>
                      {t.description}
                    </span>
                  </div>
                );
              })}
            </div>
            {trait === 'Autodidact' ? (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <div className="fieldLabel">Autodidact fill-ins</div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <input className="input" placeholder="Subject 1" value={autod1} onChange={(e) => setAutod1(e.target.value)} />
                  <input className="input" placeholder="Subject 2" value={autod2} onChange={(e) => setAutod2(e.target.value)} />
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div className="fieldLabel">Raygun (A + B)</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <select className="select" value={rayA} onChange={(e) => setRayA(e.target.value)}>
                <option value="">A —</option>
                {raygunAOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button className="btn btnGhost" onClick={() => setRayA(rollD6Split(RAYGUN_STEP_A_TABLE))}>
                Random A
              </button>
              <select className="select" value={rayB} onChange={(e) => setRayB(e.target.value)}>
                <option value="">B —</option>
                {raygunBOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button className="btn btnGhost" onClick={() => setRayB(rollD6Split(RAYGUN_STEP_B_TABLE))}>
                Random B
              </button>
            </div>
          </div>

          <div>
            <div className="fieldLabel">Hoverboard</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <select className="select" value={gripColor} onChange={(e) => setGripColor(e.target.value)}>
                  <option value="">Grip colour —</option>
                  {Array.from(new Set(GRIP_COLOUR_TABLE.flatMap((r) => [r.left, r.right]))).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <button className="btn btnGhost" onClick={() => setGripColor(rollD6Split(GRIP_COLOUR_TABLE))}>
                  Random
                </button>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <select className="select" value={gripCut} onChange={(e) => setGripCut(e.target.value)}>
                  <option value="">Grip cut —</option>
                  {Array.from(new Set(GRIP_CUT_TABLE.flatMap((r) => [r.left, r.right]))).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <button className="btn btnGhost" onClick={() => setGripCut(rollD6Split(GRIP_CUT_TABLE))}>
                  Random
                </button>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <select className="select" value={deckGraphic} onChange={(e) => setDeckGraphic(e.target.value)}>
                  <option value="">Deck graphic —</option>
                  {Array.from(new Set(DECK_GRAPHIC_TABLE.flatMap((r) => [r.left, r.right]))).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <button className="btn btnGhost" onClick={() => setDeckGraphic(rollD6Split(DECK_GRAPHIC_TABLE))}>
                  Random
                </button>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <input className="input" value={boardType} onChange={(e) => setBoardType(e.target.value)} placeholder="Board type" />
                <button className="btn btnGhost" onClick={() => setBoardType(rollBoardType())}>
                  Random
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="fieldLabel">Other gear (starting options)</div>
            <div className="muted small" style={{ marginBottom: 6 }}>Pick exactly two.</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {starterOtherGear.map((g) => (
                <label key={g.id} className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={otherGear.includes(g.name)}
                    disabled={!otherGear.includes(g.name) && otherGear.length >= 2}
                    onChange={() => toggleOtherGear(g.name)}
                  />
                  <span style={{ fontWeight: 700 }}>{g.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="fieldLabel">Signature gear</div>
            {signatureGear ? (
              <div className="subcard">
                <div style={{ fontWeight: 800 }}>{signatureGear.gearName}</div>
                <div className="muted">Type: {signatureGear.type}</div>
                <div className="muted">Free mod: {signatureGear.freeModName}</div>
                <div className="muted">Looks: {signatureGear.looks.join(', ')}</div>
              </div>
            ) : (
              <p className="muted">None selected yet.</p>
            )}
            <button className="btn" style={{ marginTop: 8 }} onClick={() => setShowSig(true)} type="button">
              Add Signature Gear
            </button>
          </div>

          <div>
            <div className="fieldLabel">Hangout (pick/roll) x2</div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <select className="select" value={hangout1} onChange={(e) => setHangout1(e.target.value)}>
                <option value="">—</option>
                {hangoutOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <select className="select" value={hangout2} onChange={(e) => setHangout2(e.target.value)}>
                <option value="">—</option>
                {hangoutOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <button className="btn btnGhost" type="button" onClick={rollHangout}>Random</button>
            </div>
            {hangout1 && hangout2 && hangout1 === hangout2 ? (
              <div className="muted small" style={{ marginTop: 6 }}>Pick two different hangouts.</div>
            ) : null}
          </div>

          <div>
            <div className="fieldLabel">Factions</div>
            <div className="muted small">Fan (+1), Annoyed (-1), Your Family is part of (+1 or -1)</div>
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              <div>
                <div className="fieldLabel">Fan (+1)</div>
                <select className="select" value={fanFaction} onChange={(e) => setFanFaction(e.target.value)}>
                  <option value="">—</option>
                  {factionNames.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="fieldLabel">Annoyed (-1)</div>
                <select className="select" value={annoyedFaction} onChange={(e) => setAnnoyedFaction(e.target.value)}>
                  <option value="">—</option>
                  {factionNames.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="fieldLabel">Your Family is part of</div>
                <div className="row" style={{ gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <select className="select" value={familyFaction} onChange={(e) => setFamilyFaction(e.target.value)}>
                    <option value="">—</option>
                    {factionNames.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <select
                    className="select"
                    value={String(familyRelation)}
                    onChange={(e) => setFamilyRelation((e.target.value === '-1' ? -1 : 1) as 1 | -1)}
                  >
                    <option value="1">+1</option>
                    <option value="-1">-1</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="fieldLabel">Map</div>
            <div className="muted small" style={{ marginBottom: 6 }}>
              Draw 3 one-way portals between adjacent worlds (no roll).
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {startPortals.map((p, idx) => {
                const toOpts = p.from ? adjacentTo(campaign, p.from) : [];
                const ok = p.from && p.to && areAdjacent(campaign, p.from, p.to);
                return (
                  <div key={idx} className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <div className="fieldLabel">From</div>
                      <select
                        className="select"
                        value={p.from}
                        onChange={(e) => {
                          const from = e.target.value;
                          setStartPortals((prev) => {
                            const next = [...prev];
                            next[idx] = { from, to: '' };
                            return next;
                          });
                        }}
                      >
                        <option value="">—</option>
                        {allWorldNames.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <div className="fieldLabel">To (adjacent)</div>
                      <select
                        className="select"
                        value={p.to}
                        onChange={(e) => {
                          const to = e.target.value;
                          setStartPortals((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], to };
                            return next;
                          });
                        }}
                      >
                        <option value="">—</option>
                        {toOpts.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    {!ok ? <span className="muted small">Adjacency required</span> : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="fieldLabel">Hook</div>
            <div className="muted small">Pick freely or roll.</div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 8 }}>
              <textarea className="textarea" value={hook} onChange={(e) => setHook(e.target.value)} />
              <button className="btn btnGhost" type="button" onClick={rollHook}>Random</button>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn btnGhost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={confirm} disabled={!canConfirm}>
            Confirm
          </button>
        </div>
      </div>

      {showSig ? (
        <SignatureGearWizard
          onClose={() => setShowSig(false)}
          onConfirm={(sel) => {
            setSignatureGear(sel);
            setShowSig(false);
          }}
        />
      ) : null}
    </div>
  );
}

function SignatureGearWizard({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (sel: Character['signatureGear']) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [gearId, setGearId] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [mod, setMod] = useState<string>('');
  const [look1, setLook1] = useState<string>('');
  const [look2, setLook2] = useState<string>('');
  const [look3, setLook3] = useState<string>('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const gear = useMemo(() => SIGNATURE_GEAR.find((g) => g.id === gearId) ?? null, [gearId]);
  const eligibleFreeMods = useMemo(() => {
    if (!gear) return [];
    return gear.mods.filter((m) => totalComponents(m.costParsed) === 2);
  }, [gear]);

  const next = () => setStep((s) => (s === 4 ? 4 : ((s + 1) as any)));
  const prev = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as any)));

  const confirm = () => {
    if (!gear) return;
    const looks = [look1, look2, look3].filter(Boolean).slice(0, 3);
    onConfirm({
      gearId: gear.id,
      gearName: gear.name,
      type,
      freeModName: mod,
      looks,
      installedMods: [mod].filter(Boolean),
    });
  };

  return (
    <div className="modalBackdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <h2>Add Signature Gear</h2>
          <button className="btn btnGhost" onClick={onClose}>
            Close
          </button>
        </div>

        {step === 1 ? (
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {SIGNATURE_GEAR.map((g) => (
              <div key={g.id} className="subcard">
                <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                  <button
                    className={gearId === g.id ? 'btn btnSelected' : 'btn btnGhost'}
                    onClick={() => setGearId(g.id)}
                    type="button"
                  >
                    {g.name}
                  </button>
                  <button className="btn btnGhost" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                    i
                  </button>
                </div>
                {expanded === g.id ? <p className="muted" style={{ marginTop: 8 }}>{g.function}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {step === 2 && gear ? (
          <div style={{ marginTop: 10 }}>
            <div className="fieldLabel">Choose a type</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {gear.types.map((t) => (
                <button
                  key={t}
                  className={type === t ? 'btn btnSelected' : 'btn btnGhost'}
                  onClick={() => setType(t)}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 && gear ? (
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            <div className="fieldLabel">Choose a free Mod (must cost exactly 2 components)</div>
            {eligibleFreeMods.map((m) => (
              <div key={m.name} className="subcard">
                <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                  <button
                    className={mod === m.name ? 'btn btnSelected' : 'btn btnGhost'}
                    onClick={() => setMod(m.name)}
                    type="button"
                  >
                    {m.name}
                  </button>
                  <button className="btn btnGhost" onClick={() => setExpanded(expanded === m.name ? null : m.name)}>
                    i
                  </button>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>Cost: {m.cost}</div>
                {expanded === m.name ? <p className="muted" style={{ marginTop: 8 }}>{m.description}</p> : null}
              </div>
            ))}
            {eligibleFreeMods.length === 0 ? (
              <p className="muted">No eligible free mods found for this gear.</p>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            <div className="fieldLabel">Looks (pick 1–3)</div>
            {[1, 2, 3].map((slot) => (
              <div key={slot} className="row" style={{ gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <select
                  className="select"
                  value={slot === 1 ? look1 : slot === 2 ? look2 : look3}
                  onChange={(e) => {
                    if (slot === 1) setLook1(e.target.value);
                    if (slot === 2) setLook2(e.target.value);
                    if (slot === 3) setLook3(e.target.value);
                  }}
                >
                  <option value="">—</option>
                  {SIGNATURE_LOOKS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btnGhost"
                  onClick={() => {
                    const v = SIGNATURE_LOOKS[d6() - 1];
                    if (slot === 1) setLook1(v);
                    if (slot === 2) setLook2(v);
                    if (slot === 3) setLook3(v);
                  }}
                >
                  Random
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="row" style={{ justifyContent: 'space-between', gap: 8, marginTop: 16 }}>
          <button className="btn btnGhost" onClick={prev} disabled={step === 1}>
            Back
          </button>
          <div className="row" style={{ gap: 8 }}>
            {step < 4 ? (
              <button
                className="btn"
                onClick={next}
                disabled={
                  (step === 1 && !gearId) ||
                  (step === 2 && (!gearId || !type)) ||
                  (step === 3 && (!gearId || !type || !mod))
                }
              >
                Next
              </button>
            ) : (
              <button className="btn" onClick={confirm} disabled={!gearId || !type || !mod || !look1}>
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddOtherGearModal({
  owned,
  onClose,
  onAdd,
}: {
  owned: string[];
  onClose: () => void;
  onAdd: (itemName: string) => void;
}) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = OTHER_GEAR.filter((g) => !owned.includes(g.name));
    if (!s) return base;
    return base.filter((g) => (g.name + ' ' + g.description).toLowerCase().includes(s));
  }, [q, owned]);

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="modalBackdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <h2>Add other gear</h2>
          <button className="btn btnGhost" onClick={onClose}>
            Close
          </button>
        </div>

        <input
          className="input"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginTop: 10 }}
        />

        <div style={{ display: 'grid', gap: 10, marginTop: 12, maxHeight: '55vh', overflow: 'auto' }}>
          {list.map((g) => (
            <div key={g.id} className="subcard">
              <div className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btnGhost" onClick={() => onAdd(g.name)}>
                  Add: {g.name}
                </button>
                <button className="btn btnGhost" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                  i
                </button>
              </div>
              <div className="muted" style={{ marginTop: 6 }}>Cost: {g.costs || '—'}</div>
              {expanded === g.id ? <p className="muted" style={{ marginTop: 8 }}>{g.description}</p> : null}
            </div>
          ))}
          {list.length === 0 ? <p className="muted">No items.</p> : null}
        </div>
      </div>
    </div>
  );
}

function BuyModModal({
  gearId,
  installed,
  inv,
  onClose,
  onBuy,
}: {
  gearId: string;
  installed: string[];
  inv: { coil: number; disc: number; lens: number; gem: number };
  onClose: () => void;
  onBuy: (modName: string, cost: any) => void;
}) {
  const gear = useMemo(() => SIGNATURE_GEAR.find((g) => g.id === gearId) ?? null, [gearId]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const mods = useMemo(() => {
    if (!gear) return [];
    return gear.mods.filter((m) => !installed.includes(m.name));
  }, [gear, installed]);

  return (
    <div className="modalBackdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
          <h2>Buy a new Mod</h2>
          <button className="btn btnGhost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="muted" style={{ marginTop: 8 }}>
          Inventory: {inv.coil} Coils, {inv.disc} Discs, {inv.lens} Lenses, {inv.gem} Gems
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 12, maxHeight: '60vh', overflow: 'auto' }}>
          {mods.map((m) => {
            const affordable = canAfford(m.costParsed, inv);
            return (
              <div key={m.name} className="subcard">
                <div className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn" onClick={() => onBuy(m.name, m.costParsed)} disabled={!affordable}>
                    Buy: {m.name}
                  </button>
                  <button className="btn btnGhost" onClick={() => setExpanded(expanded === m.name ? null : m.name)}>
                    i
                  </button>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>Cost: {m.cost} ({costLabel(m.costParsed as any)})</div>
                {!affordable ? <div className="muted" style={{ marginTop: 6 }}>Not enough components.</div> : null}
                {expanded === m.name ? <p className="muted" style={{ marginTop: 8 }}>{m.description}</p> : null}
              </div>
            );
          })}
          {mods.length === 0 ? <p className="muted">No mods available.</p> : null}
        </div>
      </div>
    </div>
  );
}
