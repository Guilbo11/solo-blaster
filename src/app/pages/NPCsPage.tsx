import React, { useMemo, useState } from 'react';
import { useCampaignStore, campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import { MONSTERS } from '../../compendiums/monsters';

export default function NPCsPage() {
  const { campaigns, activeCampaignId } = useCampaignStore();
  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.id === activeCampaignId) ?? null,
    [campaigns, activeCampaignId]
  );
  const [q, setQ] = useState('');
  const [newName, setNewName] = useState('');

  const npcs = activeCampaign?.npcs ?? [];

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

  const addNpc = () => {
    const name = newName.trim();
    if (!name) return;
    const now = Date.now();
    campaignActions.updateCampaign(activeCampaign.id, (c) => ({
      ...c,
      updatedAt: now,
      npcs: [{ id: uuid(), name, notes: '', createdAt: now }, ...(c.npcs ?? [])],
    }));
    setNewName('');
  };

  const updateNpc = (id: string, patch: Partial<{ name: string; notes: string }>) => {
    const now = Date.now();
    campaignActions.updateCampaign(activeCampaign.id, (c) => ({
      ...c,
      updatedAt: now,
      npcs: (c.npcs ?? []).map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  };

  const removeNpc = (id: string) => {
    const now = Date.now();
    campaignActions.updateCampaign(activeCampaign.id, (c) => ({
      ...c,
      updatedAt: now,
      npcs: (c.npcs ?? []).filter((n) => n.id !== id),
    }));
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <h1>NPCs</h1>
        <p className="muted">Campaign NPC list + a quick monster reference.</p>
      </div>

      <section className="card">
        <h2>Campaign NPCs</h2>

        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            placeholder="Add an NPC name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn" onClick={addNpc} disabled={!newName.trim()}>
            Add
          </button>
        </div>

        {npcs.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>
            No NPCs yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            {npcs.map((n) => (
              <div key={n.id} className="subcard">
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <input
                    className="input"
                    value={n.name}
                    onChange={(e) => updateNpc(n.id, { name: e.target.value })}
                  />
                  <button className="btn btnGhost" onClick={() => removeNpc(n.id)}>
                    Remove
                  </button>
                </div>
                <textarea
                  className="textarea"
                  placeholder="Notes"
                  value={n.notes}
                  onChange={(e) => updateNpc(n.id, { notes: e.target.value })}
                  style={{ marginTop: 8 }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

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
