import React, { useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import { TABLES, rollTable } from '../../tables/soloTables';
import { OTHER_GEAR } from '../../compendiums/otherGear';
import { MONSTERS } from '../../compendiums/monsters';
import { FACTIONS } from '../../compendiums/factions';

export default function ToolsPage() {
  const campaign = useActiveCampaign();
  const [selectedTable, setSelectedTable] = useState(TABLES[0]?.id ?? 'slogans');

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  function log(title: string, body?: string, type: 'note' | 'roll' = 'roll') {
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      journal: [{ id: uuid(), ts: Date.now(), type, title, body }, ...c.journal],
    }));
  }

  function doRoll() {
    const r = rollTable(selectedTable);
    if (!r) return;
    const t = TABLES.find((x) => x.id === selectedTable);
    log(`Rolled: ${t?.name ?? selectedTable}`, r.value);
    alert(r.value);
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Tables & Tools</h1>
        <p className="muted">Roll tables, reference compendiums, and journal.</p>
      </header>

      <section className="card">
        <h2>Roll a Table</h2>
        <div className="row">
          <select className="input" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
            {TABLES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button className="btn" onClick={doRoll}>Roll</button>
        </div>
        <p className="muted small">Tables are pulled from the Solo Blaster PDF + rulebook and logged to your journal when rolled.</p>
      </section>

      <section className="card">
        <h2>Other Gear (Reference)</h2>
        <p className="muted small">“Other gear” and “Extra gear” are the same list.</p>
        {OTHER_GEAR.map((g) => (
          <details key={g.id} className="details">
            <summary><strong>{g.name}</strong></summary>
            <p className="muted">{g.description}</p>
            {(g.costs || g.requires) && (
              <p className="muted small">
                {g.costs ? <><strong>Costs:</strong> {g.costs}</> : null}
                {g.costs && g.requires ? ' · ' : null}
                {g.requires ? <><strong>Requires:</strong> {g.requires}</> : null}
              </p>
            )}
          </details>
        ))}
      </section>

      <section className="card">
        <h2>Monsters (Reference)</h2>
        <p className="muted small">Canon-only (no extrapolation). Currently includes Mathpanthers.</p>
        {MONSTERS.map((m) => (
          <details key={m.id} className="details">
            <summary><strong>{m.name}</strong></summary>
            <p className="muted">{m.description}</p>
            <ul>
              {m.potentialProblems.map((p, idx) => <li key={idx}>{p}</li>)}
            </ul>
          </details>
        ))}
      </section>

      <section className="card">
        <h2>Factions (Draft)</h2>
        <p className="muted small">Draft enrichment (we’ll do an official pass later).</p>
        {FACTIONS.map((f) => (
          <details key={f.id} className="details">
            <summary><strong>{f.name}</strong> <span className="muted small">({f.vibe})</span></summary>
            <p className="muted">{f.description}</p>
            <div className="grid2">
              <div>
                <h4>Likes</h4>
                <ul>{f.likes.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
              <div>
                <h4>Dislikes</h4>
                <ul>{f.dislikes.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            </div>
            <h4>What they want</h4>
            <ul>{f.whatTheyWant.map((x, i) => <li key={i}>{x}</li>)}</ul>
            <h4>How they apply pressure</h4>
            <ul>{f.howTheyApplyPressure.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </details>
        ))}
      </section>

      <section className="card">
        <h2>Journal</h2>
        {campaign.journal.length === 0 ? (
          <p className="muted">No journal entries yet.</p>
        ) : (
          <div className="list">
            {campaign.journal.slice(0, 50).map((j) => (
              <div key={j.id} className="listItem">
                <div className="listItemMain">
                  <div className="listItemTitle">{j.title}</div>
                  <div className="muted small">{new Date(j.ts).toLocaleString()} · {j.type}</div>
                  {j.body ? <div className="small" style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{j.body}</div> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
