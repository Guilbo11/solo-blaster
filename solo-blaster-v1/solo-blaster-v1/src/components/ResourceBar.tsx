import React, { useMemo, useState } from 'react';
import { campaignActions, getActiveCampaign } from '../storage/useCampaignStore';

type ResKey = keyof ReturnType<typeof getActiveResources>;

function getActiveResources() {
  return getActiveCampaign()?.resources ?? null;
}

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

  const resources = useMemo(() => getActiveResources(), []);
  // NOTE: this component is simple; pages trigger rerenders via store usage anyway.

  const campaign = getActiveCampaign();
  if (!campaign) return null;

  function adjust(key: string, delta: number) {
    campaignActions.updateCampaign(campaign.id, (c) => {
      if (c.locked) return c;
      const next = { ...c.resources, [key]: (c.resources as any)[key] + delta };
      return { ...c, resources: next, updatedAt: Date.now() };
    });
  }

  function setValue(key: string, value: number) {
    campaignActions.updateCampaign(campaign.id, (c) => {
      if (c.locked) return c;
      const next = { ...c.resources, [key]: value };
      return { ...c, resources: next, updatedAt: Date.now() };
    });
  }

  return (
    <div className="resourceBar">
      <div className="resourceBarLeft">
        <button className="linkBtn" onClick={() => campaignActions.setActiveCampaign(campaign.id)}>
          {campaign.name}
        </button>
      </div>

      <div className="resourceBarItems">
        {order.map(({ key, label }) => (
          <button
            key={key}
            className="chip"
            onClick={() => setEditing({ key, value: (campaign.resources as any)[key] ?? 0 })}
            title="Click to edit"
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
              <button className="btn" onClick={() => adjust(editing.key, -1)}>-1</button>
              <input
                className="input"
                type="number"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
              />
              <button className="btn" onClick={() => adjust(editing.key, 1)}>+1</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="btnSecondary" onClick={() => setEditing(null)}>Close</button>
              <button className="btn" onClick={() => { setValue(editing.key, editing.value); setEditing(null); }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
