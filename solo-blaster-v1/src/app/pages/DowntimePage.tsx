import React from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { BEATS } from '../../compendiums/beats';
import { uuid } from '../../utils/uuid';

export default function DowntimePage() {
  const campaign = useActiveCampaign();
  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  function log(title: string, body?: string) {
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      journal: [{ id: uuid(), ts: Date.now(), type: 'note', title, body }, ...c.journal],
    }));
  }

  function applyBeat(beatId: string) {
    if (campaign.locked) return;
    const beat = BEATS.find((b) => b.id === beatId);
    if (!beat) return;
    // V1: We journal the beat and let the player adjust resources manually via Resource Bar.
    log(`Beat: ${beat.name}`, `${beat.effect}${beat.cost ? `\nCost: ${beat.cost}` : ''}`);
    alert('Beat applied (logged). Adjust any resources manually using the Resource Bar.');
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Downtime</h1>
        <p className="muted">Beats are logged. Mechanical automation will be expanded as compendiums are filled.</p>
      </header>

      <section className="card">
        <h2>Beats</h2>
        <p className="muted small">V1 includes a placeholder beat entry. Replace BEATS in src/compendiums/beats.ts using your Solo Blaster PDF.</p>

        <div className="list">
          {BEATS.map((b) => (
            <div key={b.id} className="listItem">
              <div className="listItemMain">
                <div className="listItemTitle">{b.name}</div>
                <div className="muted small">{b.effect}</div>
              </div>
              <div className="listItemActions">
                <button className="btn" onClick={() => applyBeat(b.id)} disabled={campaign.locked}>Apply</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
