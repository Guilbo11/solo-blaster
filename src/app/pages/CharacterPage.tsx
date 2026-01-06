import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import { d6 } from '../../utils/dice';

import {
  LOOK_WORDS,
  FAMILY_TABLE,
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
import type { PortalLink } from '../types';

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

  const [portalFrom, setPortalFrom] = useState('');
  const [portalTo, setPortalTo] = useState('');

  const factions = useMemo(() => FACTIONS, []);
  const otherGear = useMemo(() => OTHER_GEAR, []);

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

  function patch(patcher: (c: typeof campaign) => typeof campaign) {
    campaignActions.updateCampaign(campaignId, (prev) => {
      if (prev.locked) return prev;
      const next = patcher(prev);
      return { ...next, updatedAt: now() };
    });
  }

  function setChar<T extends keyof typeof ch>(key: T, value: (typeof ch)[T]) {
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
    const family = pickLR(FAMILY_TABLE);

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
        vibes: prev.character.vibes || '',
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
    if (!ch.pronouns.trim()) missing.push('Pronouns');
    if (!ch.look.trim()) missing.push('Look');
    if (!ch.family.trim()) missing.push('Family');
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
            <h1>Character Creation</h1>
            <p className="muted">One scroll page. Loud choices. Clear UI.</p>
          </div>
          <button className="btn" onClick={randomAll} disabled={locked}>
            🎲 Random all
          </button>
        </div>
      </header>

      <section className="card cardLoud">
        <h2>Playbook</h2>
        <div className="pillRow">
          <span className="pill pillAccent">Loner</span>
          <span className="muted small">Solo mode. No crew management. No fractures.</span>
        </div>
      </section>

      <section className="card cardLoud">
        <h2>Identity</h2>
        <div className="row">
          <input className="input" placeholder="Name" value={ch.name} onChange={(e) => setChar('name', e.target.value)} disabled={locked} />
          <input className="input" placeholder="Pronouns" value={ch.pronouns} onChange={(e) => setChar('pronouns', e.target.value)} disabled={locked} />
        </div>

        <div className="row">
          <input className="input" placeholder="Look" value={ch.look} onChange={(e) => setChar('look', e.target.value)} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('look', pickUnique(LOOK_WORDS, 3).join(', '))} disabled={locked}>
            🎲
          </button>
        </div>

        <div className="row">
          <input className="input" placeholder="Family" value={ch.family} onChange={(e) => setChar('family', e.target.value)} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('family', pickLR(FAMILY_TABLE))} disabled={locked}>
            🎲
          </button>
        </div>

        <div className="row">
          <input className="input" placeholder="Vibes" value={ch.vibes} onChange={(e) => setChar('vibes', e.target.value)} disabled={locked} />
        </div>

        <div className="row">
          <input className="input" placeholder="Trait" value={ch.trait} onChange={(e) => setChar('trait', e.target.value)} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('trait', 'One Step Ahead')} disabled={locked}>One Step Ahead</button>
          <button className="btnSecondary" onClick={() => setChar('trait', 'Main Character Energy')} disabled={locked}>Main Character Energy</button>
          <button className="btnSecondary" onClick={() => setChar('trait', 'Called Shot')} disabled={locked}>Called Shot</button>
        </div>
      </section>

      <section className="card">
        <h2>Starter Kit</h2>

        <div className="row">
          <input className="input" placeholder="Raygun (A)" value={ch.raygun.a} onChange={(e) => setChar('raygun', { ...ch.raygun, a: e.target.value })} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('raygun', { ...ch.raygun, a: RAYGUN_TYPES[Math.floor(Math.random() * RAYGUN_TYPES.length)] })} disabled={locked}>
            🎲
          </button>
        </div>

        <div className="row">
          <input className="input" placeholder="Raygun (B)" value={ch.raygun.b} onChange={(e) => setChar('raygun', { ...ch.raygun, b: e.target.value })} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('raygun', { ...ch.raygun, b: RAYGUN_TYPES[Math.floor(Math.random() * RAYGUN_TYPES.length)] })} disabled={locked}>
            🎲
          </button>
        </div>

        <div className="divider" />

        <h3>Hoverboard</h3>
        <div className="row">
          <input className="input" placeholder="Grip colour" value={ch.hoverboard.gripColor} onChange={(e) => setChar('hoverboard', { ...ch.hoverboard, gripColor: e.target.value })} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('hoverboard', { ...ch.hoverboard, gripColor: pickLR(GRIP_COLOUR_TABLE) })} disabled={locked}>🎲</button>
        </div>
        <div className="row">
          <input className="input" placeholder="Grip cut" value={ch.hoverboard.gripCut} onChange={(e) => setChar('hoverboard', { ...ch.hoverboard, gripCut: e.target.value })} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('hoverboard', { ...ch.hoverboard, gripCut: pickLR(GRIP_CUT_TABLE) })} disabled={locked}>🎲</button>
        </div>
        <div className="row">
          <input className="input" placeholder="Deck graphic" value={ch.hoverboard.deckGraphic} onChange={(e) => setChar('hoverboard', { ...ch.hoverboard, deckGraphic: e.target.value })} disabled={locked} />
          <button className="btnSecondary" onClick={() => setChar('hoverboard', { ...ch.hoverboard, deckGraphic: pickLR(DECK_GRAPHIC_TABLE) })} disabled={locked}>🎲</button>
        </div>
        <div className="row">
          <input className="input" placeholder="Board type" value={ch.hoverboard.boardType} onChange={(e) => setChar('hoverboard', { ...ch.hoverboard, boardType: e.target.value })} disabled={locked} />
          <button className="btnSecondary" onClick={() => {
            const rowBucket = d6() <= 2 ? 0 : d6() <= 4 ? 1 : 2;
            const col = d6() - 1;
            setChar('hoverboard', { ...ch.hoverboard, boardType: BOARD_TYPE_ROWS[rowBucket][col] });
          }} disabled={locked}>🎲</button>
        </div>

        <div className="divider" />

        <h3>Other Gear (pick 2)</h3>
        <div className="pillRow">
          {ch.otherGear.map((g) => (
            <span key={g} className="pill">
              {g}
              <button className="pillX" onClick={() => setChar('otherGear', ch.otherGear.filter((x) => x !== g))} disabled={locked}>×</button>
            </span>
          ))}
        </div>

        <div className="list">
          {otherGear.map((g) => {
            const picked = ch.otherGear.includes(g.name);
            const disabled = locked || (!picked && ch.otherGear.length >= 2);
            return (
              <div key={g.id} className="listItem">
                <div className="listItemMain">
                  <div className="listItemTitle">{g.name}</div>
                  <div className="muted small">{g.description}</div>
                </div>
                <div className="listItemActions">
                  <button
                    className={picked ? 'btnSecondary' : 'btn'}
                    disabled={disabled}
                    onClick={() => {
                      if (picked) setChar('otherGear', ch.otherGear.filter((x) => x !== g.name));
                      else setChar('otherGear', [...ch.otherGear, g.name]);
                    }}
                  >
                    {picked ? 'Remove' : 'Pick'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
