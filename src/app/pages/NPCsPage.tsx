import React, { useMemo, useState } from 'react';
import { useCampaignStore, campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import { MONSTERS } from '../../compendiums/monsters';
import { CANON_WORLDS } from '../../compendiums/worlds';
import { rollNpcName, rollNpcTrait } from '../../tables/npcTables';

type NpcKind = 'terrestrial' | 'extraterrestrial';
type Npc = {
  id: string;
  kind: NpcKind;
  name: string;
  location: string;
  wants: string;
  likes: string;
  dislikes: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

export default function NPCsPage() {
  const { campaigns, activeCampaignId } = useCampaignStore();
  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.id === activeCampaignId) ?? null,
    [campaigns, activeCampaignId]
  );
  const [q, setQ] = useState('');
  const [draftKind, setDraftKind] = useState<NpcKind>('terrestrial');
  const [draftName, setDraftName] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftWants, setDraftWants] = useState('');
  const [draftLikes, setDraftLikes] = useState('');
  const [draftDislikes, setDraftDislikes] = useState('');
  const [draftNotes, setDraftNotes] = useState('');

  const [showGenerator, setShowGenerator] = useState(false);

  const [editing, setEditing] = useState<Npc | null>(null);

  const npcs = (activeCampaign?.npcs ?? []) as any as Npc[];

  const worldOptions = useMemo(() => {
    const custom = Array.isArray(activeCampaign?.worlds) ? activeCampaign!.worlds! : [];
    // Canon worlds use displayName (WorldOracle has no `name` field).
    const all = [...CANON_WORLDS.map((w) => w.displayName), ...custom.map((w) => w.name)];
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  }, [activeCampaign?.worlds]);

  const filteredMonsters = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MONSTERS;
    return MONSTERS.filter((m) =>
      [m.name, m.description, ...(m.tags ?? [])].some((x) => String(x).toLowerCase().includes(s))
    );
  }, [q]);

  if (!activeCampaign) {
    return (
      <div className="page">
        <h1>NPCs</h1>
        <p className="muted">Select a campaign first.</p>
      </div>
    );
  }

  const resetDraft = () => {
    setDraftName('');
    setDraftLocation('');
    setDraftWants('');
    setDraftLikes('');
    setDraftDislikes('');
    setDraftNotes('');
  };

  const addNpc = () => {
    const name = draftName.trim();
    if (!name) return;
    const now = Date.now();
    const npc: Npc = {
      id: uuid(),
      kind: draftKind,
      name,
      location: draftLocation.trim(),
      wants: draftWants.trim(),
      likes: draftLikes.trim(),
      dislikes: draftDislikes.trim(),
      notes: draftNotes,
      createdAt: now,
      updatedAt: now,
    };
    campaignActions.updateCampaign(activeCampaign.id, (c) => ({
      ...c,
      updatedAt: now,
      npcs: [npc, ...(c.npcs ?? [])],
    }));
    resetDraft();
    setShowGenerator(false);
  };

  const updateNpc = (id: string, patch: Partial<Npc>) => {
    const now = Date.now();
    campaignActions.updateCampaign(activeCampaign.id, (c) => ({
      ...c,
      updatedAt: now,
      npcs: (c.npcs ?? []).map((n: any) => (n.id === id ? { ...n, ...patch, updatedAt: now } : n)),
    }));
  };

  const removeNpc = (id: string) => {
    if (!confirm('Delete this NPC?')) return;
    const now = Date.now();
    campaignActions.updateCampaign(activeCampaign.id, (c) => ({
      ...c,
      updatedAt: now,
      npcs: (c.npcs ?? []).filter((n: any) => n.id !== id),
    }));
  };

  return (
    <div className="page">
      <div className="pageHeader pageHeaderRow">
        <div>
          <h1>NPCs</h1>
          <p className="muted">Campaign NPC list + a quick monster reference.</p>
        </div>
        <button className="btn" type="button" onClick={() => setShowGenerator(true)}>
          Add NPC
        </button>
      </div>

      {showGenerator ? (
        <div className="modalBackdrop modalBackdropTop">
          <div className="modal modalTall" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
              <h2>NPC Generator</h2>
              <button className="btn btnGhost" type="button" onClick={() => setShowGenerator(false)}>
                Close
              </button>
            </div>

            <div className="subcard" style={{ marginTop: 10 }}>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="input" value={draftKind} onChange={(e) => setDraftKind(e.target.value as NpcKind)} style={{ maxWidth: 220 }}>
              <option value="terrestrial">Terrestrial</option>
              <option value="extraterrestrial">Extraterrestrial</option>
            </select>

            <div className="row" style={{ gap: 8, flex: 1, minWidth: 240 }}>
              <input className="input" placeholder="Name" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              <button
                className="btnSecondary"
                type="button"
                onClick={() => setDraftName(rollNpcName(draftKind))}
              >
                Roll
              </button>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="fieldLabel">Location</div>
            <select className="input" value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)}>
              <option value="">(Select a world)</option>
              {worldOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="row" style={{ gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="fieldLabel">Wants</div>
              <div className="row" style={{ gap: 8 }}>
                <input className="input" value={draftWants} onChange={(e) => setDraftWants(e.target.value)} />
                <button className="btnSecondary" type="button" onClick={() => setDraftWants(rollNpcTrait('wants'))}>Roll</button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="fieldLabel">Likes</div>
              <div className="row" style={{ gap: 8 }}>
                <input className="input" value={draftLikes} onChange={(e) => setDraftLikes(e.target.value)} />
                <button className="btnSecondary" type="button" onClick={() => setDraftLikes(rollNpcTrait('likes'))}>Roll</button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="fieldLabel">Dislikes</div>
              <div className="row" style={{ gap: 8 }}>
                <input className="input" value={draftDislikes} onChange={(e) => setDraftDislikes(e.target.value)} />
                <button className="btnSecondary" type="button" onClick={() => setDraftDislikes(rollNpcTrait('dislikes'))}>Roll</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="fieldLabel">Notes</div>
            <textarea className="textarea" value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} />
          </div>

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <button className="btnSecondary" type="button" onClick={resetDraft}>Reset</button>
            <button className="btn" type="button" onClick={addNpc} disabled={!draftName.trim()}>
              Add NPC
            </button>
          </div>
        </div>
          </div>
        </div>
      ) : null}

      <section className="card">
        <h2>NPCs</h2>
        <p className="muted">Click an NPC to expand details. Use “Add NPC” (top right) to open the generator.</p>
        {npcs.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>
            No NPCs yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {npcs.map((n) => (
              <details key={n.id} className="details">
                <summary className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800 }}>{n.name}</span>
                    <span className="muted small">— {n.location || '(no location)'}</span>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditing(n);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeNpc(n.id);
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </summary>
                <div className="detailsBody">
                  <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <div className="fieldLabel">Wants</div>
                      <div>{n.wants || <span className="muted">—</span>}</div>
                    </div>
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <div className="fieldLabel">Likes</div>
                      <div>{n.likes || <span className="muted">—</span>}</div>
                    </div>
                    <div style={{ minWidth: 220, flex: 1 }}>
                      <div className="fieldLabel">Dislikes</div>
                      <div>{n.dislikes || <span className="muted">—</span>}</div>
                    </div>
                  </div>
                  {n.notes ? (
                    <div style={{ marginTop: 10 }}>
                      <div className="fieldLabel">Notes</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{n.notes}</div>
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      {editing ? (
        <div className="modalBackdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit NPC</h3>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <select
                className="input"
                value={editing.kind}
                onChange={(e) => setEditing({ ...editing, kind: e.target.value as NpcKind })}
                style={{ maxWidth: 220 }}
              >
                <option value="terrestrial">Terrestrial</option>
                <option value="extraterrestrial">Extraterrestrial</option>
              </select>

              <div className="row" style={{ gap: 8, flex: 1, minWidth: 240 }}>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <button className="btnSecondary" type="button" onClick={() => setEditing({ ...editing, name: rollNpcName(editing.kind) })}>
                  Roll
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="fieldLabel">Location</div>
              <select className="input" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })}>
                <option value="">(Select a world)</option>
                {worldOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="row" style={{ gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="fieldLabel">Wants</div>
                <div className="row" style={{ gap: 8 }}>
                  <input className="input" value={editing.wants} onChange={(e) => setEditing({ ...editing, wants: e.target.value })} />
                  <button className="btnSecondary" type="button" onClick={() => setEditing({ ...editing, wants: rollNpcTrait('wants') })}>Roll</button>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="fieldLabel">Likes</div>
                <div className="row" style={{ gap: 8 }}>
                  <input className="input" value={editing.likes} onChange={(e) => setEditing({ ...editing, likes: e.target.value })} />
                  <button className="btnSecondary" type="button" onClick={() => setEditing({ ...editing, likes: rollNpcTrait('likes') })}>Roll</button>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="fieldLabel">Dislikes</div>
                <div className="row" style={{ gap: 8 }}>
                  <input className="input" value={editing.dislikes} onChange={(e) => setEditing({ ...editing, dislikes: e.target.value })} />
                  <button className="btnSecondary" type="button" onClick={() => setEditing({ ...editing, dislikes: rollNpcTrait('dislikes') })}>Roll</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="fieldLabel">Notes</div>
              <textarea className="textarea" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>

            <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
              <button className="btnSecondary" onClick={() => setEditing(null)} type="button">Cancel</button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  updateNpc(editing.id, { ...editing });
                  setEditing(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Monster quick reference</h2>
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            placeholder="Search monsters…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {filteredMonsters.map((m) => (
            <details key={m.id} className="details">
              <summary>
                <span style={{ fontWeight: 700 }}>{m.name}</span>
                {m.tags?.length ? <span className="pill" style={{ marginLeft: 8 }}>{m.tags[0]}</span> : null}
              </summary>
              <div className="detailsBody">
                <p>{m.description}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
