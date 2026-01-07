import React, { useMemo, useState } from 'react';
import { campaignActions, useCampaignStore } from '../storage/useCampaignStore';

type Panel =
  | { kind: 'attitude' }
  | { kind: 'turbo' }
  | { kind: 'bite' }
  | { kind: 'trouble' }
  | { kind: 'style' }
  | { kind: 'doom' }
  | { kind: 'legacy' }
  | { kind: 'menu' };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function CheckboxLine({ total, value, onChange, maxLabel }: { total: number; value: number; onChange: (v: number) => void; maxLabel?: string }) {
  const boxes = Array.from({ length: total }, (_, i) => i);
  return (
    <div>
      <div className="muted small" style={{ marginBottom: 6 }}>
        {value}/{total}
      </div>
      <div className="checkboxRow">
        {boxes.map((i) => {
          const checked = i < value;
          return (
            <button
              key={i}
              type="button"
              className={checked ? 'box checked' : 'box'}
              onClick={() => {
                // Clicking an already checked box reduces to that index.
                const next = checked ? i : i + 1;
                onChange(next);
              }}
            />
          );
        })}
      </div>
      {maxLabel ? <div className="muted small" style={{ marginTop: 6 }}>{maxLabel}</div> : null}
    </div>
  );
}

export default function ResourceBar() {
  const { campaigns, activeCampaignId } = useCampaignStore();
  const campaign = useMemo(
    () => campaigns.find((c) => c.id === activeCampaignId) ?? null,
    [campaigns, activeCampaignId]
  );
  const [panel, setPanel] = useState<Panel | null>(null);

  if (!campaign) return null;

  const campaignId = campaign.id;
  const locked = campaign.locked;

  const r = campaign.resources;

  const chips = useMemo(
    () => [
      { id: 'attitude', label: 'Attitude', value: '' },
      { id: 'turbo', label: 'Turbo', value: '' },
      { id: 'bite', label: 'Bite', value: String(r.bite ?? 0) },
      { id: 'trouble', label: 'Trouble', value: String(r.trouble ?? 0) },
      { id: 'style', label: 'Style', value: String(r.style ?? 0) },
      { id: 'doom', label: 'Doom', value: String(r.doom ?? 0) },
      { id: 'legacy', label: 'Legacy', value: String(r.legacy ?? 0) },
    ],
    [r.bite, r.trouble, r.style, r.doom, r.legacy]
  );

  const setRes = (patch: Partial<typeof r>) => {
    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      return { ...c, updatedAt: Date.now(), resources: { ...c.resources, ...patch } };
    });
  };

  const ensureEpilogueItem = (kind: 'doom' | 'legacy') => {
    campaignActions.updateCampaign(campaignId, (c) => {
      const ep = c.epilogue ?? { legacies: [], dooms: [] };
      const list = kind === 'doom' ? ep.dooms : ep.legacies;
      const nextList = [...list, { id: crypto.randomUUID(), name: kind === 'doom' ? 'Doom' : 'Legacy' }];
      const nextEp = kind === 'doom' ? { ...ep, dooms: nextList } : { ...ep, legacies: nextList };
      const nextResources = {
        ...c.resources,
        doom: nextEp.dooms.length,
        legacy: nextEp.legacies.length,
      };
      return { ...c, updatedAt: Date.now(), epilogue: nextEp, resources: nextResources };
    });
  };

  const openCampaignMenu = () => setPanel({ kind: 'menu' });

  return (
    <div className="resourceBar">
      <div className="resourceBarTop">
        {/* Campaign label kept on its own line (as requested). */}
        <button className="linkBtn" onClick={openCampaignMenu} title="Campaign menu">
          {campaign.name}
        </button>
        {locked ? <span className="muted small" style={{ marginLeft: 8 }}>(Locked)</span> : null}
      </div>

      <div className="resourceBarItems">
        {chips.map((c) => (
          <button
            key={c.id}
            className="chip"
            onClick={() => setPanel({ kind: c.id as any })}
            disabled={locked && (c.id !== 'doom' && c.id !== 'legacy')}
          >
            <span className="chipLabel">{c.label}</span>
            {c.value ? <span className="chipValue">{c.value}</span> : null}
          </button>
        ))}
      </div>

      {panel && (
        // Popup window: close ONLY via Close buttons (no backdrop click to close)
        <div className="modalBackdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {panel.kind === 'menu' ? (
              <>
                <h3>Campaign</h3>
                <p className="muted small">Manage your campaign and navigation.</p>
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  <button className="btnSecondary" onClick={() => (window.location.href = '#/campaigns')}>Back to landing</button>
                </div>
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => setPanel(null)}>Close</button>
                </div>
              </>
            ) : null}

            {panel.kind === 'attitude' ? (
              <>
                <h3>Attitude</h3>
                <div className="muted small">Boost and Kick are separate resources. Refill per Attitude rules.</div>
                <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
                  <div>
                    <div className="muted small">Boost</div>
                    <CheckboxLine total={10} value={r.attitudeBoost ?? 0} onChange={(v) => setRes({ attitudeBoost: v })} />
                  </div>
                  <div>
                    <div className="muted small">Kick</div>
                    <CheckboxLine total={10} value={r.attitudeKick ?? 0} onChange={(v) => setRes({ attitudeKick: v })} />
                  </div>
                </div>
              </>
            ) : null}

            {panel.kind === 'turbo' ? (
              <>
                <h3>Turbo</h3>
                <div className="muted small">Boost affects dice pools (+1d6 per Boost spent). Turbo can expand with mods.</div>
                <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
                  <div>
                    <div className="muted small">Boost</div>
                    <CheckboxLine total={10} value={r.turboBoost ?? 0} onChange={(v) => setRes({ turboBoost: v })} />
                  </div>
                  <div>
                    <div className="muted small">Kick</div>
                    <CheckboxLine total={10} value={r.turboKick ?? 0} onChange={(v) => setRes({ turboKick: v })} />
                  </div>
                </div>
              </>
            ) : null}

            {panel.kind === 'bite' ? (
              <>
                <h3>Bite</h3>
                <div className="muted small">Player resource to add complications to the run (snags, slams, danger track, etc.).</div>
                <div style={{ marginTop: 10 }}>
                  <CheckboxLine total={12} value={clamp(r.bite ?? 0, 0, 12)} onChange={(v) => setRes({ bite: v })} />
                </div>
                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                  <button className="btn" onClick={() => setPanel(null)}>Close</button>
                </div>
              </>
            ) : null}

            {panel.kind === 'trouble' ? (
              <>
                <h3>Trouble</h3>
                <div className="muted small">Max 8. At 8, a Disaster Roll is triggered.</div>
                <div style={{ marginTop: 10 }}>
                  <CheckboxLine
                    total={8}
                    value={clamp(r.trouble ?? 0, 0, 8)}
                    onChange={(v) => {
                      if (v === 8 && (r.trouble ?? 0) < 8) {
                        if (!confirm('Trouble is reaching 8. Trigger a Disaster Roll?')) return;
                        // mark and log handled by Run page + journal append for now
                        window.dispatchEvent(new CustomEvent('solo:toast', { detail: { message: 'Trouble reached 8 — Disaster Roll triggered', durationMs: 4000 } }));
                        window.dispatchEvent(new CustomEvent('solo:journal-insert-html', { detail: { campaignId, html: `<b>DISASTER ROLL</b><br/>Trouble reached 8. Roll disaster.` } }));
                      }
                      setRes({ trouble: v });
                    }}
                    maxLabel="Max 8"
                  />
                </div>
                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                  <button className="btn" onClick={() => setPanel(null)}>Close</button>
                </div>
              </>
            ) : null}

            {panel.kind === 'style' ? (
              <>
                <h3>Style</h3>
                <div className="muted small">Max 10</div>
                <div style={{ marginTop: 10 }}>
                  <CheckboxLine total={10} value={clamp(r.style ?? 0, 0, 10)} onChange={(v) => setRes({ style: v })} />
                </div>
                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                  <button className="btn" onClick={() => setPanel(null)}>Close</button>
                </div>
              </>
            ) : null}

            {panel.kind === 'doom' ? (
              <>
                <h3>Doom</h3>
                <div className="muted small">Count of accumulated dooms. You can add manually; names are managed in Epilogue.</div>
                <div style={{ marginTop: 10 }}>
                  <CheckboxLine total={12} value={clamp(r.doom ?? 0, 0, 12)} onChange={(v) => setRes({ doom: v })} />
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
                  <button className="btnSecondary" onClick={() => ensureEpilogueItem('doom')} disabled={locked}>+ Add Doom</button>
                  <button className="btn" onClick={() => setPanel(null)}>Close</button>
                </div>
              </>
            ) : null}

            {panel.kind === 'legacy' ? (
              <>
                <h3>Legacy</h3>
                <div className="muted small">Count of accumulated legacies. You can add manually; names are managed in Epilogue.</div>
                <div style={{ marginTop: 10 }}>
                  <CheckboxLine total={12} value={clamp(r.legacy ?? 0, 0, 12)} onChange={(v) => setRes({ legacy: v })} />
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
                  <button className="btnSecondary" onClick={() => ensureEpilogueItem('legacy')} disabled={locked}>+ Add Legacy</button>
                  <button className="btn" onClick={() => setPanel(null)}>Close</button>
                </div>
              </>
            ) : null}

            {/* doom/legacy/menu already render close buttons; others handled inline */}
          </div>
        </div>
      )}
    </div>
  );
}
