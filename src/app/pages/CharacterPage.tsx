import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import { d6 } from '../../utils/dice';

import {
  LOOK_WORDS,
  FAMILY_TABLE,
  LONER_VIBES,
  LONER_TRAITS,
  GRIP_COLOUR_TABLE,
  GRIP_CUT_TABLE,
  DECK_GRAPHIC_TABLE,
  BOARD_TYPE_ROWS,
  HANGOUT_TABLE,
  RAYGUN_TYPES,
  HOOK_PROMPTS,
} from '../../tables/characterTables';

import { FACTIONS } from '../../compendiums/factions';
import { OTHER_GEAR } from '../../compendiums/otherGear';
import type { Campaign, Character, PortalLink } from '../types';

function now() {
  return Date.now();
}

function pickLR(table: Array<{ left: string; right: string }>): string {
  const row = table[d6() - 1];
  const left = d6() <= 3;
  return left ? row.left : row.right;
}

function pickUnique(pool: string[], n: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const v = pool[Math.floor(Math.random() * pool.length)];
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function pickDistinctFactions(names: string[], n: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < n && guard++ < 400) {
    const v = names[Math.floor(Math.random() * names.length)];
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export default function CharacterPage() {
  const nav = useNavigate();
  const campaign = useActiveCampaign();

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [family1, setFamily1] = useState('');
  const [family2, setFamily2] = useState('');
  const [look1, setLook1] = useState('');
  const [look2, setLook2] = useState('');
  const [look3, setLook3] = useState('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [autodidact1, setAutodidact1] = useState('');
  const [autodidact2, setAutodidact2] = useState('');

  const [portalFrom, setPortalFrom] = useState('');
  const [portalTo, setPortalTo] = useState('');

  const factions = useMemo(() => FACTIONS, []);
  const otherGear = useMemo(() => OTHER_GEAR, []);

  const familyOptions = useMemo(() => {
    const vals = FAMILY_TABLE.flatMap((r) => [r.left, r.right]).filter(Boolean);
    return Array.from(new Set(vals)).sort();
  }, []);

  const openCreator = () => {
    // hydrate modal local state from stored strings
    const parts = (campaign?.character.family ?? '').split('/').map((s) => s.trim()).filter(Boolean);
    setFamily1(parts[0] ?? '');
    setFamily2(parts[1] ?? '');

    const looks = (campaign?.character.look ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    setLook1(looks[0] ?? '');
    setLook2(looks[1] ?? '');
    setLook3(looks[2] ?? '');

    const vb = (campaign?.character.vibes ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    setVibes(vb.length ? vb : ['', ''].filter(Boolean));

    if ((campaign?.character.trait ?? '').startsWith('Autodidact:')) {
      const rest = (campaign?.character.trait ?? '').replace('Autodidact:', '').trim();
      const segs = rest.split(',').map((s) => s.trim());
      setAutodidact1(segs[0] ?? '');
      setAutodidact2(segs[1] ?? '');
    } else {
      setAutodidact1('');
      setAutodidact2('');
    }
    setIsCreatorOpen(true);
  };

  if (!campaign) {
    return (
      <div className="page">
        <header className="pageHeader">
          <h1>Character</h1>
          <p className="muted">No active campaign.</p>
        </header>
      </div>
    );
  }

  const campaignId = campaign.id;
  const locked = campaign.locked;
  const ch = campaign.character;

  const lookOptions = useMemo(() => [...LOOK_WORDS].sort(), []);

  function patch(patcher: (c: Campaign) => Campaign) {
    campaignActions.updateCampaign(campaignId, (prev) => {
      if (prev.locked) return prev;
      const next = patcher(prev);
      return { ...next, updatedAt: now() };
    });
  }

  function setChar<T extends keyof Character>(key: T, value: Character[T]) {
    patch((prev) => ({ ...prev, character: { ...prev.character, [key]: value } }));
  }

  function log(title: string, body?: string) {
    patch((prev) => ({
      ...prev,
      journal: [{ id: uuid(), ts: now(), type: 'note', title, body }, ...prev.journal],
    }));
  }

  function randomAll() {
    // Respect: don't overwrite name/pronouns if already filled.
    const nextName = ch.name.trim() ? ch.name : '';
    const nextPronouns = ch.pronouns.trim() ? ch.pronouns : '';

    const look = pickUnique(LOOK_WORDS, 3).join(', ');
    // Two family choices (stored as a single string for v1 compatibility)
    const fam2 = pickUnique(familyOptions, 2);
    const family = `${fam2[0] ?? ''} / ${fam2[1] ?? ''}`.trim();

    const gripColor = pickLR(GRIP_COLOUR_TABLE);
    const gripCut = pickLR(GRIP_CUT_TABLE);
    const deckGraphic = pickLR(DECK_GRAPHIC_TABLE);

    const rowBucket = d6() <= 2 ? 0 : d6() <= 4 ? 1 : 2;
    const col = d6() - 1;
    const boardType = BOARD_TYPE_ROWS[rowBucket][col];

    const [hang1, hang2] = pickDistinctFactions(
      HANGOUT_TABLE.flatMap((r) => [r.left, r.right]),
      2
    );

    const raygunA = RAYGUN_TYPES[Math.floor(Math.random() * RAYGUN_TYPES.length)];
    const raygunB = RAYGUN_TYPES[Math.floor(Math.random() * RAYGUN_TYPES.length)];

    const hook = HOOK_PROMPTS[Math.floor(Math.random() * HOOK_PROMPTS.length)];

    const gearPicks = pickDistinctFactions(otherGear.map((g) => g.name), 2);

    const factionPicks = pickDistinctFactions(factions.map((f) => f.name), 3);

    patch((prev) => ({
      ...prev,
      character: {
        ...prev.character,
        name: nextName,
        pronouns: nextPronouns,
        look,
        family,
        vibes: prev.character.vibes || (LONER_VIBES[d6() - 1] ?? ''),
        trait: prev.character.trait || '',
        raygun: { ...prev.character.raygun, a: raygunA, b: raygunB },
        hoverboard: { gripColor, gripCut, deckGraphic, boardType },
        otherGear: gearPicks,
        hangouts: [hang1, hang2],
        factions: { fan: factionPicks[0] ?? '', annoyed: factionPicks[1] ?? '', family: factionPicks[2] ?? '' },
        hook,
      },
    }));

    log('Random all', 'Generated a full character draft.');
  }

  function addPortal() {
    const from = portalFrom.trim();
    const to = portalTo.trim();
    if (!from || !to) return;
    const link: PortalLink = { id: uuid(), from, to };
    setChar('portals', [link, ...ch.portals]);
    setPortalFrom('');
    setPortalTo('');
  }

  function removePortal(id: string) {
    setChar('portals', ch.portals.filter((p) => p.id !== id));
  }

  function finalize() {
    const missing: string[] = [];
    if (!ch.name.trim()) missing.push('Name');
    // Pronouns optional in this app variant.
    if (!ch.look.trim()) missing.push('Look');
    // Family is stored as "A / B"; require two picks.
    if (!ch.family.includes('/') || ch.family.split('/').map((s) => s.trim()).filter(Boolean).length < 2) missing.push('Family (2 picks)');
    if (ch.otherGear.length !== 2) missing.push('Pick 2 Other Gear');
    if (ch.hangouts.length !== 2) missing.push('Pick 2 Hangouts');
    if (!ch.factions.fan || !ch.factions.annoyed || !ch.factions.family) missing.push('Factions (Fan/Annoyed/Family)');

    if (missing.length) {
      alert('Missing: ' + missing.join(', '));
      return;
    }

    patch((prev) => ({ ...prev, character: { ...prev.character, created: true } }));
    log('Character finalized', `Name: ${ch.name}`);
    nav('/sheet');
  }

  const factionByName = useMemo(() => {
    const map = new Map<string, (typeof factions)[number]>();
    for (const f of factions) map.set(f.name, f);
    return map;
  }, [factions]);

  return (
    <div className="page">
      <header className="pageHeader stickerHeader">
        <div className="pageHeaderRow">
          <div>
            <h1>Character</h1>
            <p className="muted">Your Loner character. Edit via the popup creator.</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btnSecondary" onClick={randomAll} disabled={locked}>🎲 Random all</button>
            <button className="btn" onClick={openCreator} disabled={locked}>
              {ch.created ? 'Edit' : 'Create'}
            </button>
          </div>
        </div>
      </header>

      <section className="card cardLoud">
        <h2>Name</h2>
        <div className="muted">{ch.name || '—'}</div>
      </section>

      <section className="card cardLoud">
        <h2>Playbook</h2>
        <div className="pillRow">
          <span className="pill pillAccent">Loner</span>
        </div>
      </section>

      <section className="card">
        <h2>Basics</h2>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="pill">Look: {ch.look || '—'}</div>
          <div className="pill">Family: {ch.family || '—'}</div>
          <div className="pill">Vibes: {ch.vibes || '—'}</div>
          <div className="pill">Traits: {ch.trait || '—'}</div>
        </div>
      </section>

      <section className="card">
        <h2>Gear</h2>
        <div className="muted">Raygun: {ch.raygun?.a || '—'}</div>
        <div className="muted" style={{ marginTop: 6 }}>Other Gear: {ch.otherGear?.length ? ch.otherGear.join(', ') : '—'}</div>
      </section>

      <section className="card">
        <h2>Finalize</h2>
        <p className="muted small">Marks the character as created and returns to Sheet.</p>
        <button className="btn" onClick={finalize} disabled={locked}>Confirm Character</button>
      </section>

      {isCreatorOpen && (
        <div className="modalBackdrop">
          <div className="modal modalTall" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Create Character</h2>
              <button className="btn" onClick={() => setIsCreatorOpen(false)}>Close</button>
            </div>

            <div className="muted small" style={{ marginTop: 4 }}>Form is scrollable. Close only via the Close button.</div>

            {/* Name */}
            <div style={{ marginTop: 14 }}>
              <div className="fieldLabel">Name</div>
              <input className="input" value={ch.name} onChange={(e) => setChar('name', e.target.value)} disabled={locked} />
            </div>

            {/* Look */}
            <div style={{ marginTop: 14 }}>
              <div className="fieldLabel">Look (pick 3)</div>
              {(() => {
                const parts = ch.look.split(',').map((s) => s.trim()).filter(Boolean);
                const p1 = parts[0] ?? '';
                const p2 = parts[1] ?? '';
                const p3 = parts[2] ?? '';
                const setPart = (idx: number, val: string) => {
                  const next = [p1, p2, p3];
                  next[idx] = val;
                  setChar('look', next.filter(Boolean).join(', '));
                };
                return (
                  <>
                    <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                      <select className="select" value={p1} onChange={(e) => setPart(0, e.target.value)} disabled={locked}>
                        <option value="">Select…</option>
                        {lookOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                      </select>
                      <button className="btnSecondary" onClick={() => setPart(0, lookOptions[Math.floor(Math.random() * lookOptions.length)])} disabled={locked}>🎲</button>
                    </div>
                    <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                      <select className="select" value={p2} onChange={(e) => setPart(1, e.target.value)} disabled={locked}>
                        <option value="">Select…</option>
                        {lookOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                      </select>
                      <button className="btnSecondary" onClick={() => setPart(1, lookOptions[Math.floor(Math.random() * lookOptions.length)])} disabled={locked}>🎲</button>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <select className="select" value={p3} onChange={(e) => setPart(2, e.target.value)} disabled={locked}>
                        <option value="">Select…</option>
                        {lookOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                      </select>
                      <button className="btnSecondary" onClick={() => setPart(2, lookOptions[Math.floor(Math.random() * lookOptions.length)])} disabled={locked}>🎲</button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Family (2) */}
            <div style={{ marginTop: 14 }}>
              <div className="fieldLabel">Family (2 picks)</div>
              {(() => {
                const parts = ch.family.split('/').map((s) => s.trim());
                const f1 = parts[0] ?? '';
                const f2 = parts[1] ?? '';
                const setFam = (a: string, b: string) => setChar('family', `${a} / ${b}`.trim());
                return (
                  <div className="row" style={{ gap: 8 }}>
                    <select className="select" value={f1} onChange={(e) => setFam(e.target.value, f2)} disabled={locked}>
                      <option value="">Select…</option>
                      {familyOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                    <select className="select" value={f2} onChange={(e) => setFam(f1, e.target.value)} disabled={locked}>
                      <option value="">Select…</option>
                      {familyOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                );
              })()}
            </div>

            {/* Vibes */}
            <div style={{ marginTop: 14 }}>
              <div className="fieldLabel">Vibes</div>
              <div className="row" style={{ gap: 8 }}>
                <select className="select" value={ch.vibes} onChange={(e) => setChar('vibes', e.target.value)} disabled={locked}>
                  <option value="">Select…</option>
                  {LONER_VIBES.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
                <button className="btnSecondary" onClick={() => setChar('vibes', LONER_VIBES[d6() - 1] ?? '')} disabled={locked}>🎲</button>
              </div>
            </div>

            {/* Traits */}
            <div style={{ marginTop: 14 }}>
              <div className="fieldLabel">Traits (Loner)</div>
              <div className="muted small" style={{ marginBottom: 8 }}>Pick one. Autodidact requires two custom fields.</div>
              {LONER_TRAITS.map((t) => (
                <div key={t.name} className="card" style={{ marginBottom: 10 }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{t.name}</strong>
                    <button
                      className="btnSecondary"
                      onClick={() => {
                        if (t.name === 'Autodidact') {
                          const label = `Autodidact: ${autodidact1 || '______'} and ${autodidact2 || '______'}`;
                          setChar('trait', label);
                        } else {
                          setChar('trait', t.name);
                        }
                      }}
                      disabled={locked}
                    >
                      Select
                    </button>
                  </div>
                  <div className="muted small" style={{ marginTop: 6 }}>{t.description}</div>
                  {t.name === 'Autodidact' ? (
                    <div style={{ marginTop: 10 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <input className="input" placeholder="Field 1" value={autodidact1} onChange={(e) => setAutodidact1(e.target.value)} disabled={locked} />
                        <input className="input" placeholder="Field 2" value={autodidact2} onChange={(e) => setAutodidact2(e.target.value)} disabled={locked} />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Raygun */}
            <div style={{ marginTop: 14 }}>
              <div className="fieldLabel">Raygun</div>
              <select className="select" value={ch.raygun?.a ?? ''} onChange={(e) => setChar('raygun', { a: e.target.value, b: '' })} disabled={locked}>
                <option value="">Select…</option>
                {RAYGUN_TYPES.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn" onClick={() => setIsCreatorOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <section className="card cardLoud">
        <h2>Hangouts (pick 2)</h2>
        <div className="row">
          <input className="input" placeholder="Hangout #1" value={ch.hangouts[0] ?? ''} onChange={(e) => setChar('hangouts', [e.target.value, ch.hangouts[1] ?? ''])} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('hangouts', [pickLR(HANGOUT_TABLE), ch.hangouts[1] ?? ''])} disabled={locked}>🎲</button>
        </div>
        <div className="row">
          <input className="input" placeholder="Hangout #2" value={ch.hangouts[1] ?? ''} onChange={(e) => setChar('hangouts', [ch.hangouts[0] ?? '', e.target.value])} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('hangouts', [ch.hangouts[0] ?? '', pickLR(HANGOUT_TABLE)])} disabled={locked}>🎲</button>
        </div>
        <p className="muted small">Hangouts are the places you keep ending up. Pick two.</p>
      </section>

      <section className="card">
        <h2>Factions</h2>
        <p className="muted">Choose one each: Fan / Annoyed / Family.</p>

        <div className="row">
          <select className="input" value={ch.factions.fan} onChange={(e) => setChar('factions', { ...ch.factions, fan: e.target.value })} disabled={locked}>
            <option value="">(Fan)</option>
            {factions.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        {ch.factions.fan && (
          <div className="stickerNote">
            <strong>{ch.factions.fan}</strong>
            <div className="muted small">{factionByName.get(ch.factions.fan)?.description ?? ''}</div>
          </div>
        )}

        <div className="row">
          <select className="input" value={ch.factions.annoyed} onChange={(e) => setChar('factions', { ...ch.factions, annoyed: e.target.value })} disabled={locked}>
            <option value="">(Annoyed)</option>
            {factions.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        {ch.factions.annoyed && (
          <div className="stickerNote stickerDanger">
            <strong>{ch.factions.annoyed}</strong>
            <div className="muted small">{factionByName.get(ch.factions.annoyed)?.description ?? ''}</div>
          </div>
        )}

        <div className="row">
          <select className="input" value={ch.factions.family} onChange={(e) => setChar('factions', { ...ch.factions, family: e.target.value })} disabled={locked}>
            <option value="">(Family)</option>
            {factions.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        {ch.factions.family && (
          <div className="stickerNote stickerCyan">
            <strong>{ch.factions.family}</strong>
            <div className="muted small">{factionByName.get(ch.factions.family)?.description ?? ''}</div>
          </div>
        )}
      </section>

      <section className="card cardLoud">
        <h2>Map (one-way portals)</h2>
        <div className="row">
          <input className="input" placeholder="From world" value={portalFrom} onChange={(e) => setPortalFrom(e.target.value)} disabled={locked} />
          <input className="input" placeholder="To world" value={portalTo} onChange={(e) => setPortalTo(e.target.value)} disabled={locked} />
          <button className="btn" onClick={addPortal} disabled={locked}>Add</button>
        </div>

        {ch.portals.length === 0 ? (
          <p className="muted">No portals yet.</p>
        ) : (
          <div className="list">
            {ch.portals.map((p) => (
              <div key={p.id} className="listItem">
                <div className="listItemMain">
                  <div className="listItemTitle">{p.from} → {p.to}</div>
                </div>
                <div className="listItemActions">
                  <button className="btnSecondary" onClick={() => removePortal(p.id)} disabled={locked}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card cardLoud">
        <h2>Hook</h2>
        <div className="row">
          <input className="input" placeholder="Hook" value={ch.hook} onChange={(e) => setChar('hook', e.target.value)} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('hook', HOOK_PROMPTS[Math.floor(Math.random() * HOOK_PROMPTS.length)])} disabled={locked}>🎲</button>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="btnSecondary" onClick={() => nav('/sheet')}>Back</button>
          <button className="btn" onClick={finalize} disabled={locked}>Finalize Character</button>
        </div>

        {!ch.created ? (
          <p className="muted small">
            Finalize marks the character as created. You can still edit later unless you lock the campaign.
          </p>
        ) : (
          <p className="muted small">This character is already finalized.</p>
        )}
      </section>
    </div>
  );
}