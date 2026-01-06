import React, { useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import type { EpilogueItem } from '../types';

export default function EpiloguePage() {
  const campaign = useActiveCampaign();
  const [confirming, setConfirming] = useState(false);

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  const campaignId = campaign.id;

  const ep = campaign.epilogue ?? { legacies: [], dooms: [] };

  function updateEpilogue(patcher: (ep: { legacies: EpilogueItem[]; dooms: EpilogueItem[] }) => { legacies: EpilogueItem[]; dooms: EpilogueItem[] }) {
    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      const current = c.epilogue ?? { legacies: [], dooms: [] };
      const next = patcher(current);
      return {
        ...c,
        updatedAt: Date.now(),
        epilogue: next,
        resources: { ...c.resources, legacy: next.legacies.length, doom: next.dooms.length },
      };
    });
  }

  function log(title: string, body?: string) {
    campaignActions.updateCampaign(campaignId, (c) => ({
      ...c,
      updatedAt: Date.now(),
      journal: [{ id: uuid(), ts: Date.now(), type: 'note', title, body }, ...c.journal],
    }));
  }

  function startEpilogue() {
    campaignActions.updateCampaign(campaignId, (c) => ({ ...c, updatedAt: Date.now(), locked: true }));
    log('Epilogue started', 'Campaign locked. No further runs or downtime can be performed.');
    setConfirming(false);
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Epilogue</h1>
        <p className="muted">Epilogue rolls are based on total Legacy and Doom.</p>
      </header>

      <section className="card">
        <h2>Status</h2>
        <p className="muted small">Legacy: {campaign.resources.legacy} · Doom: {campaign.resources.doom}</p>
        <p className="muted small">Campaign: {campaign.locked ? 'Locked' : 'Active'}</p>
      </section>

      <section className="card">
        <h2>Legacy & Doom</h2>
        <p className="muted small">Give each Legacy and Doom a name. You can edit them later.</p>

        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Legacies</h3>
          <button
            className="btnSecondary"
            disabled={campaign.locked}
            onClick={() => {
              const name = (prompt('Legacy name (required)') || '').trim();
              if (!name) return;
              updateEpilogue((e) => ({ ...e, legacies: [...e.legacies, { id: uuid(), name }] }));
            }}
          >
            + Legacy
          </button>
        </div>
        {ep.legacies.length === 0 ? (
          <p className="muted">No legacies yet.</p>
        ) : (
          <div className="list">
            {ep.legacies.map((l) => (
              <div key={l.id} className="listItem">
                <div className="listItemMain">
                  <input
                    className="input"
                    value={l.name}
                    onChange={(ev) => {
                      const v = ev.target.value;
                      updateEpilogue((e) => ({ ...e, legacies: e.legacies.map((x) => (x.id === l.id ? { ...x, name: v } : x)) }));
                    }}
                    disabled={campaign.locked}
                  />
                </div>
                <div className="listItemActions">
                  <button
                    className="btnDanger"
                    disabled={campaign.locked}
                    onClick={() => {
                      if (!confirm('Delete this Legacy?')) return;
                      updateEpilogue((e) => ({ ...e, legacies: e.legacies.filter((x) => x.id !== l.id) }));
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 14 }}>
          <h3 style={{ margin: 0 }}>Dooms</h3>
          <button
            className="btnSecondary"
            disabled={campaign.locked}
            onClick={() => {
              const name = (prompt('Doom name (required)') || '').trim();
              if (!name) return;
              updateEpilogue((e) => ({ ...e, dooms: [...e.dooms, { id: uuid(), name }] }));
            }}
          >
            + Doom
          </button>
        </div>
        {ep.dooms.length === 0 ? (
          <p className="muted">No dooms yet.</p>
        ) : (
          <div className="list">
            {ep.dooms.map((d) => (
              <div key={d.id} className="listItem">
                <div className="listItemMain">
                  <input
                    className="input"
                    value={d.name}
                    onChange={(ev) => {
                      const v = ev.target.value;
                      updateEpilogue((e) => ({ ...e, dooms: e.dooms.map((x) => (x.id === d.id ? { ...x, name: v } : x)) }));
                    }}
                    disabled={campaign.locked}
                  />
                </div>
                <div className="listItemActions">
                  <button
                    className="btnDanger"
                    disabled={campaign.locked}
                    onClick={() => {
                      if (!confirm('Delete this Doom?')) return;
                      updateEpilogue((e) => ({ ...e, dooms: e.dooms.filter((x) => x.id !== d.id) }));
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Start Epilogue</h2>
        <p className="muted">Starting your epilogue will lock this campaign. Are you sure?</p>

        {!campaign.locked ? (
          <button className="btnDanger" onClick={() => setConfirming(true)}>
            Start Epilogue
          </button>
        ) : (
          <p className="muted">This campaign is locked.</p>
        )}
      </section>

      {confirming && (
        <div className="modalBackdrop" onClick={() => setConfirming(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Lock campaign?</h3>
            <p className="muted">Starting your epilogue will lock this campaign. You won’t be able to do runs or downtime afterwards.</p>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="btnSecondary" onClick={() => setConfirming(false)}>Not yet</button>
              <button className="btnDanger" onClick={startEpilogue}>Let’s do this</button>
            </div>
          </div>
        </div>
      )}

      <section className="card">
        <h2>Epilogue Rolls</h2>
        <p className="muted small">
          V1 provides the locking flow and journaling. Add the specific epilogue roll tables from your rulebook into Tables/Tools.
        </p>
      </section>
    </div>
  );
}
