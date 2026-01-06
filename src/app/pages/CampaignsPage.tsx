import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignActions, useCampaignStore } from '../../storage/useCampaignStore';

export default function CampaignsPage() {
  const { campaigns } = useCampaignStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Solo Blaster</h1>
        <p className="muted">Solo campaign manager for Slugblaster (Loner mode).</p>
      </header>

      <section className="card">
        <h2>New Campaign</h2>
        <p className="muted">All tables are available by default for new campaigns.</p>
        <div className="row">
          <input
            className="input"
            placeholder="Campaign name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="btn"
            onClick={() => {
              campaignActions.createCampaign(name);
              setName('');
            }}
          >
            Create
          </button>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Campaigns</h2>
          <button className="btnSecondary" onClick={() => setImporting((v) => !v)}>
            {importing ? 'Cancel Import' : 'Import'}
          </button>
        </div>

        {importing && (
          <div style={{ marginTop: 12 }}>
            <textarea
              className="textarea"
              placeholder="Paste campaign JSON here"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button
                className="btnSecondary"
                onClick={() => {
                  setImportText('');
                  setError(null);
                }}
              >
                Clear
              </button>
              <button
                className="btn"
                onClick={() => {
                  const err = campaignActions.importCampaign(importText);
                  setError(err);
                  if (!err) {
                    setImporting(false);
                    setImportText('');
                  }
                }}
              >
                Import
              </button>
            </div>
            {error && <p className="error">{error}</p>}
          </div>
        )}

        {campaigns.length === 0 ? (
          <p className="muted">No campaigns yet.</p>
        ) : (
          <div className="list">
            {campaigns.map((c) => (
              <div key={c.id} className="listItem">
                <div className="listItemMain">
                  <div className="listItemTitle">
                    {c.name} {c.locked ? <span className="badge">Locked</span> : null}
                  </div>
                  <div className="muted small">
                    Legacy {c.resources.legacy} · Doom {c.resources.doom} · Last played{' '}
                    {new Date(c.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="listItemActions">
                  <button
                    className="btn"
                    onClick={() => {
                      campaignActions.setActiveCampaign(c.id);
                      // After selecting a campaign, jump into the shell.
                      navigate(c.character?.created ? '/sheet' : '/character');
                    }}
                  >
                    Open
                  </button>
                  <button
                    className="btnSecondary"
                    onClick={() => {
                      const json = campaignActions.exportCampaign(c.id);
                      if (!json) return;
                      navigator.clipboard.writeText(json).catch(() => {});
                      alert('Campaign JSON copied to clipboard.');
                    }}
                  >
                    Export
                  </button>
                  <button
                    className="btnDanger"
                    onClick={() => {
                      if (confirm('Delete this campaign?')) campaignActions.deleteCampaign(c.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Danger Zone</h2>
        <button
          className="btnDanger"
          onClick={() => {
            if (confirm('Reset ALL campaigns? This cannot be undone.')) campaignActions.resetAll();
          }}
        >
          Reset All
        </button>
      </section>
    </div>
  );
}
