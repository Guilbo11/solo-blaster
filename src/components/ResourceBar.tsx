import React, { useState } from 'react';
import { campaignActions, getActiveCampaign } from '../storage/useCampaignStore';

const order: { key: string; label: string }[] = [
  { key: 'attitude', label: 'Attitude' },
  { key: 'turbo', label: 'Turbo' },
  { key: 'bite', label: 'Bite' },
  { key: 'trouble', label: 'Trouble' },
  { key: 'style', label: 'Style' },
  { key: 'doom', label: 'Doom' },
  { key: 'legacy', label: 'Legacy' },
];

export default function ResourceBar() {
  const [editing, setEditing] = useState<{ key: string; value: number } | null>(null);

  const campaign = getActiveCampaign();
  if (!campaign) return null;
  if (!campaign) return null;

  // ✅ Capture stable values so TypeScript is happy inside handlers
  const campaignId = campaign.id;
  const isLocked = campaign.locked;

  function adjust(key: string, delta: number) {
    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      const current = (c.resources as any)[key] ?? 0;
      const next = { ...c.resources, [key]: current + delta };
      return { ...c, resources: next, updatedAt: Date.now() };
    });
  }

  function setValue(key: string, value: number) {
    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      const next = { ...c.resources, [key]: value };
      return { ...c, resources: next, updatedAt: Date.now() };
    });
  }

  return (
    <div className="resourceBar">
      <div className="resourceBarLeft">
        <button className="linkBtn" onClick={() => campaignActions.setActiveCampaign(campaignId)}>
          {campaign.name}
        </button>
        {isLocked ? <span className="muted small" style={{ marginLeft: 8 }}>(Locked)</span> : null}
      </div>

      <div className="resourceBarItems">
        {order.map(({ key, label }) => (
          <button
            key={key}
            className="chip"
            onClick={() => setEditing({ key, value: (campaign.resources as any)[key] ?? 0 })}
            title={isLocked ? 'Campaign is locked' : 'Click to edit'}
            disabled={isLocked}
          >
            <span className="chipLabel">{label}</span>
            <span className="chipValue">{(campaign.resources as any)[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {editing && (
        <div className="modalBackdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit {order.find((o) => o.key === editing.key)?.label ?? editing.key}</h3>
            <div className="row">
              <button className="btn" onClick={() => adjust(editing.key, -1)} disabled={isLocked}>-1</button>
              <input
                className="input"
                type="number"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                disabled={isLocked}
              />
              <button className="btn" onClick={() => adjust(editing.key, 1)} disabled={isLocked}>+1</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="btnSecondary" onClick={() => setEditing(null)}>Cancel</button>
              <button
                className="btn"
                onClick={() => {
                  setValue(editing.key, editing.value);
                  setEditing(null);
                }}
                disabled={isLocked}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
