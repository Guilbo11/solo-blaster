import React, { useMemo, useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { uuid } from '../../utils/uuid';
import { rollRange } from '../../utils/dice';
import type { Track } from '../types';

function now() {
  return Date.now();
}

export default function RunPage() {
  const campaign = useActiveCampaign();
  const [confirmDisaster, setConfirmDisaster] = useState(false);
  const [trackModal, setTrackModal] = useState<{ type: 'progress' | 'danger' } | null>(null);
  const [trackName, setTrackName] = useState('');
  const [trackLength, setTrackLength] = useState(4);

  const bite = campaign?.resources.bite ?? 0;
  const run = campaign?.run;

  const endRunDisabled = !campaign || campaign.locked || bite > 0;

  const canAdd = Boolean(campaign && !campaign.locked);

  const disasterAlreadyRolled = Boolean(run?.disasterRolled);

  const activeRun = Boolean(run?.isActive);

  const tracks = useMemo(() => run?.tracks ?? [], [run?.tracks]);

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  function log(title: string, body?: string, type: 'note' | 'roll' | 'disaster' | 'track' | 'state' = 'note') {
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      journal: [{ id: uuid(), ts: now(), type, title, body }, ...c.journal],
    }));
  }

  function startRun() {
    if (campaign.locked) return;
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: {
        ...c.run,
        isActive: true,
        biteStart: c.resources.bite,
        disasterRolled: false,
        tracks: [],
      },
    }));
    log('Run started', `Goal: ${campaign.run.goal ?? ''}\nPrize: ${campaign.run.prize ?? ''}`, 'state');
  }

  function setGoal(goal: string) {
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: { ...c.run, goal },
    }));
  }

  function setPrize(prize: string) {
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: { ...c.run, prize },
    }));
  }

  function rollDisaster() {
    if (campaign.locked) return;
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: { ...c.run, disasterRolled: true },
    }));
    // Placeholder: in V1, disaster table is in Tools. Here we just record that it happened.
    log('Disaster Roll', 'Disaster rolled. See Tables/Tools for detailed disaster tables.', 'disaster');
  }

  function endRun() {
    if (endRunDisabled) return;

    if (!disasterAlreadyRolled) {
      setConfirmDisaster(true);
      return;
    }

    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: { ...c.run, isActive: false },
    }));
    log('Run ended', undefined, 'state');
  }

  function spendBite() {
    if (campaign.locked) return;
    if (campaign.resources.bite <= 0) return;
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      resources: { ...c.resources, bite: c.resources.bite - 1 },
    }));
    log('Problem Roll', 'Spent 1 Bite to roll a problem (use Tools tables).', 'roll');
  }

  function addTrack(type: 'progress' | 'danger', name: string, length: number) {
    const t: Track = { id: uuid(), type, name: name.trim() || (type === 'progress' ? 'Progress' : 'Danger'), length, ticks: 0 };
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: { ...c.run, tracks: [t, ...c.run.tracks] },
    }));
    log(`${type === 'progress' ? 'Progress' : 'Danger'} Track added`, `${t.name} (${t.ticks}/${t.length})`, 'track');
  }

  function tickTrack(id: string, delta: number) {
    campaignActions.updateCampaign(campaign.id, (c) => {
      const tracks = c.run.tracks.map((t) => {
        if (t.id !== id) return t;
        const nextTicks = Math.max(0, Math.min(t.length, t.ticks + delta));
        return { ...t, ticks: nextTicks };
      });
      return { ...c, updatedAt: now(), run: { ...c.run, tracks } };
    });
  }

  function clearTrack(id: string) {
    const t = tracks.find((x) => x.id === id);
    if (!t) return;
    if (t.ticks < t.length) return;
    if (!confirm('Clear this track?')) return;
    campaignActions.updateCampaign(campaign.id, (c) => ({
      ...c,
      updatedAt: now(),
      run: { ...c.run, tracks: c.run.tracks.filter((x) => x.id !== id) },
    }));
    log('Track cleared', t.name, 'track');
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Run</h1>
        <p className="muted">A run can only end when Bite is 0.</p>
      </header>

      <section className="card">
        <h2>Run Setup</h2>
        <div className="row">
          <input
            className="input"
            placeholder="Goal"
            value={campaign.run.goal ?? ''}
            onChange={(e) => setGoal(e.target.value)}
            disabled={campaign.locked}
          />
        </div>
        <div className="row">
          <input
            className="input"
            placeholder="Prize"
            value={campaign.run.prize ?? ''}
            onChange={(e) => setPrize(e.target.value)}
            disabled={campaign.locked}
          />
        </div>
        <div className="row">
          <button className="btn" onClick={startRun} disabled={!canAdd || activeRun}>
            Start Run
          </button>
          <div className="muted small" style={{ alignSelf: 'center' }}>
            Status: {activeRun ? 'Active' : 'Not active'}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Run Controls</h2>
          <div className="muted small">Bite: {bite}</div>
        </div>

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn" onClick={spendBite} disabled={!canAdd || bite <= 0}>
            Roll Problem (−1 Bite)
          </button>
          <button className="btnSecondary" onClick={rollDisaster} disabled={!canAdd}>
            Roll Disaster!
          </button>
          <button className={endRunDisabled ? 'btnSecondary' : 'btn'} onClick={endRun} disabled={endRunDisabled}>
            End Run
          </button>
        </div>
        {!disasterAlreadyRolled && <p className="muted small">If you end a run without rolling a disaster, you’ll be prompted.</p>}
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Tracks</h2>
          <div className="row">
            <button className="btnSecondary" onClick={() => { setTrackModal({ type: 'progress' }); setTrackName(''); setTrackLength(4); }} disabled={!canAdd}>
              Add Progress
            </button>
            <button className="btnSecondary" onClick={() => { setTrackModal({ type: 'danger' }); setTrackName(''); setTrackLength(4); }} disabled={!canAdd}>
              Add Danger
            </button>
          </div>
        </div>

        {tracks.length === 0 ? (
          <p className="muted">No tracks yet.</p>
        ) : (
          <div className="list">
            {tracks.map((t) => (
              <div key={t.id} className="listItem">
                <div className="listItemMain">
                  <div className="listItemTitle">{t.type === 'progress' ? 'Progress' : 'Danger'}: {t.name}</div>
                  <div className="muted small">{t.ticks} / {t.length}</div>
                </div>
                <div className="listItemActions">
                  <button className="btnSecondary" onClick={() => tickTrack(t.id, -1)} disabled={!canAdd || t.ticks <= 0}>-</button>
                  <button className="btnSecondary" onClick={() => tickTrack(t.id, 1)} disabled={!canAdd || t.ticks >= t.length}>+</button>
                  <button className="btnSecondary" onClick={() => clearTrack(t.id)} disabled={t.ticks < t.length}>Clear</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {confirmDisaster && (
        <div className="modalBackdrop" onClick={() => setConfirmDisaster(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Are you ready for disaster?</h3>
            <p className="muted">Starting downtime requires a disaster roll.</p>
            <button
              className="btnPastelGreen"
              onClick={() => {
                rollDisaster();
                setConfirmDisaster(false);
                // After rolling disaster, end run:
                campaignActions.updateCampaign(campaign.id, (c) => ({ ...c, updatedAt: now(), run: { ...c.run, isActive: false } }));
                log('Run ended', undefined, 'state');
              }}
            >
              Hell Yeah
            </button>
            <button className="btnPastelRed" onClick={() => setConfirmDisaster(false)}>
              Nope Nope Nope
            </button>
          </div>
        </div>
      )}

      {trackModal && (
        <div className="modalBackdrop" onClick={() => setTrackModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add {trackModal.type === 'progress' ? 'Progress' : 'Danger'} Track</h3>
            <input className="input" placeholder="Track name" value={trackName} onChange={(e) => setTrackName(e.target.value)} />
            <div className="row">
              <label className="muted small" style={{ alignSelf: 'center' }}>Length</label>
              <input className="input" type="number" min={1} max={20} value={trackLength} onChange={(e) => setTrackLength(Number(e.target.value))} />
              <button className="btnSecondary" onClick={() => setTrackLength(rollRange(4, 6))}>Roll (4–6)</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="btnSecondary" onClick={() => setTrackModal(null)}>Cancel</button>
              <button className="btn" onClick={() => { addTrack(trackModal.type, trackName, trackLength); setTrackModal(null); }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
