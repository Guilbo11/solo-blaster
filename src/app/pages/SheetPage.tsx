import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';

export default function SheetPage() {
  const campaign = useActiveCampaign();
  const navigate = useNavigate();
  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;
  if (!campaign.character.created) return <Navigate to="/character" replace />;

  const campaignId = campaign.id;
  const isLocked = campaign.locked;

  function updateChar(key: 'name' | 'pronouns' | 'look', value: string) {
    campaignActions.updateCampaign(campaignId, (c) => ({
      ...c,
      updatedAt: Date.now(),
      character: { ...c.character, [key]: value },
    }));
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderRow">
          <div>

        <h1>Sheet</h1>
            <p className="muted">Loner mode. No crew. No fractures.</p>
          </div>
          <button className="btnSecondary" onClick={() => navigate('/character')}>Edit Character</button>
        </div>
      </header>

      <section className="card">
        <h2>Identity</h2>
        <div className="row">
          <input
            className="input"
            value={campaign.character.name}
            onChange={(e) => updateChar('name', e.target.value)}
            placeholder="Name"
            disabled={isLocked}
          />
        </div>
        <div className="row">
          <input
            className="input"
            value={campaign.character.pronouns}
            onChange={(e) => updateChar('pronouns', e.target.value)}
            placeholder="Pronouns"
            disabled={isLocked}
          />
        </div>
        <div className="row">
          <input
            className="input"
            value={campaign.character.look}
            onChange={(e) => updateChar('look', e.target.value)}
            placeholder="Look"
            disabled={isLocked}
          />
        </div>
      </section>

      <section className="card">
        <h2>Quick Notes</h2>
        <textarea className="textarea" placeholder="Use the Journal in Tools/Tools tab (V1)" disabled />
        <p className="muted small">V1 focuses on run flow, tracks, downtime and compendium reference.</p>
      </section>

      <section className="card">
        <h2>Status</h2>
        <p className="muted small">Campaign: {isLocked ? 'Locked (Epilogue started)' : 'Active'}</p>
        <p className="muted small">Run: {campaign.run.isActive ? 'Active' : 'Not active'} · Disaster rolled this run: {campaign.run.disasterRolled ? 'Yes' : 'No'}</p>
      </section>
    </div>
  );
}
