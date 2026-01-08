import React, { useState } from 'react';
import { campaignActions } from '../../storage/useCampaignStore';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { CANON_WORLDS, CANON_WORLD_NAMES, hazardLabel } from '../../compendiums/worlds';
import { makeWorldFromRolls, rollWorldColours, rollWorldLandscape, rollWorldRuins, rollWorldTwist } from '../../tables/worldMakerTables';

function toast(message: string) {
  window.dispatchEvent(new CustomEvent('solo:toast', { detail: { message, durationMs: 4000 } }));
}

export default function WorldsPage() {
  const campaign = useActiveCampaign();
  const [createOpen, setCreateOpen] = useState(false);

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  const worlds = Array.isArray(campaign.worlds) ? campaign.worlds : [];

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Worlds</h2>
        <button className="btn" onClick={() => setCreateOpen(true)} disabled={campaign.locked}>Create World</button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="h3">Canon Worlds</div>
        <div className="muted small" style={{ marginTop: 4 }}>Reference (from the book). Use Portal Discovery to find portals between adjacent worlds.</div>
        <div style={{ marginTop: 10 }}>
          {CANON_WORLDS.map((w) => (
            <details key={w.id} className="details">
              <summary>
                <strong>{w.displayName}</strong>
                <span className="muted" style={{ marginLeft: 8 }}>{hazardLabel(w.hazard)}</span>
              </summary>

              <div className="muted" style={{ marginTop: 8 }}>
                <div className="h4" style={{ marginTop: 6 }}>PROBLEMS</div>
                <ul>
                  {w.problems.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>

                <div className="h4" style={{ marginTop: 10 }}>CHECKPOINTS</div>
                <ul>
                  {w.checkpoints.map((c, idx) => <li key={idx}>{c}</li>)}
                </ul>

                {w.featuredLocations.length > 0 && (
                  <>
                    <div className="h4" style={{ marginTop: 10 }}>FEATURED LOCATIONS</div>
                    {w.featuredLocations.map((loc, idx) => (
                      <details key={idx} className="details" style={{ marginTop: 6 }}>
                        <summary><strong>{loc.name}</strong></summary>
                        <p className="muted">{loc.description}</p>
                      </details>
                    ))}
                  </>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="h3">Custom Worlds</div>
        <div className="muted small" style={{ marginTop: 4 }}>Created with Make a World. Adjacencies are manual.</div>

        {worlds.length === 0 ? (
          <p className="muted" style={{ marginTop: 10 }}>No custom worlds yet.</p>
        ) : (
          <div style={{ marginTop: 10 }}>
            {worlds.map((w) => (
              <details key={w.id} className="details">
                <summary><strong>{w.name}</strong></summary>
                <div className="muted small" style={{ marginTop: 6 }}>
                  {w.colours?.length ? <div><strong>Colours:</strong> {w.colours.join(', ')}</div> : null}
                  {w.landscape ? <div><strong>Landscape:</strong> {w.landscape}</div> : null}
                  {w.ruins ? <div><strong>Ruins:</strong> {w.ruins}</div> : null}
                  {w.twist ? <div><strong>Twist:</strong> {w.twist}</div> : null}
                  <div style={{ marginTop: 6 }}><strong>Adjacencies:</strong> {Array.isArray(w.adjacencies) && w.adjacencies.length ? w.adjacencies.join(', ') : '—'}</div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateWorldModal
          campaignId={campaign.id}
          locked={campaign.locked}
          existingWorldNames={[...CANON_WORLD_NAMES, ...worlds.map((w) => w.name)]}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}

function CreateWorldModal(props: {
  campaignId: string;
  locked: boolean;
  existingWorldNames: string[];
  onClose: () => void;
}) {
  const { campaignId, locked, existingWorldNames, onClose } = props;
  const [name, setName] = useState('');
  const [colours, setColours] = useState<string[]>(rollWorldColours());
  const [landscape, setLandscape] = useState<string>(rollWorldLandscape());
  const [ruins, setRuins] = useState(() => {
    const r = rollWorldRuins();
    return `${r.value} (d66 ${r.roll})`;
  });
  const [twist, setTwist] = useState(() => {
    const r = rollWorldTwist();
    return `${r.value} (d66 ${r.roll})`;
  });

  const [adj, setAdj] = useState<string[]>([]);

  const toggleAdj = (worldName: string) => {
    setAdj((prev) => (prev.includes(worldName) ? prev.filter((x) => x !== worldName) : [...prev, worldName]));
  };

  const confirm = () => {
    if (locked) return;
    const worldName = name.trim() || 'Unnamed World';
    const cleanedAdj = Array.from(new Set(adj)).filter((x) => x !== worldName);
    const w = makeWorldFromRolls({
      name: worldName,
      colours,
      landscape,
      ruins,
      twist,
      adjacencies: cleanedAdj,
    });

    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      const worlds = Array.isArray(c.worlds) ? c.worlds : [];
      return { ...c, updatedAt: Date.now(), worlds: [...worlds, w] };
    });

    toast(`World created: ${worldName}`);
    onClose();
  };

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create World</h3>
        <div className="muted small">Make a World (book tables). Adjacencies are manual.</div>

        <div style={{ marginTop: 12 }}>
          <div className="fieldLabel">World name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="h3">World maker</div>
          <div className="row" style={{ gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <button className="btnSecondary" onClick={() => setColours(rollWorldColours())}>Roll colours</button>
            <button className="btnSecondary" onClick={() => setLandscape(rollWorldLandscape())}>Roll landscape</button>
            <button className="btnSecondary" onClick={() => {
              const r = rollWorldRuins();
              setRuins(`${r.value} (d66 ${r.roll})`);
            }}>Roll ruins</button>
            <button className="btnSecondary" onClick={() => {
              const r = rollWorldTwist();
              setTwist(`${r.value} (d66 ${r.roll})`);
            }}>Roll twist</button>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            <div><strong>Colours:</strong> {colours.join(', ')}</div>
            <div><strong>Landscape:</strong> {landscape}</div>
            <div><strong>Ruins:</strong> {ruins}</div>
            <div><strong>Twist:</strong> {twist}</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="h3">Adjacencies</div>
          <div className="muted small" style={{ marginTop: 4 }}>
            Pick which worlds are adjacent to this one. Portal Discovery can only be used between adjacent worlds.
          </div>

          <div className="chips" style={{ marginTop: 10 }}>
            {existingWorldNames.map((w) => (
              <button
                key={w}
                className={adj.includes(w) ? 'chip active' : 'chip'}
                onClick={() => toggleAdj(w)}
                type="button"
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
          <button className="btnSecondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={confirm} disabled={locked}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
