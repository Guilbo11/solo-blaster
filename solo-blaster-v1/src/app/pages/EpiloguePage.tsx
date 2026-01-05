import React, { useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';

export default function EpiloguePage() {
  const campaign = useActiveCampaign();
  const [confirming, setConfirming] = useState(false);

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  function log(title: string, body?: string) {
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      journal: [{ id: uuid(), ts: Date.now(), type: 'note', title, body }, ...c.journal],
    }));
  }

  function startEpilogue() {
    campaignActions.updateCampaign(campaign.id, (c) => ({ ...c, updatedAt: Date.now(), locked: true }));
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
