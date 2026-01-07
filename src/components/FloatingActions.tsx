import React, { useMemo, useState } from 'react';
import { getActiveCampaign, campaignActions } from '../storage/useCampaignStore';
import { TABLES, rollTable } from '../tables/soloTables';
import { OTHER_GEAR } from '../compendiums/otherGear';
import { CANON_WORLDS } from '../compendiums/worlds';

function toast(message: string) {
  window.dispatchEvent(new CustomEvent('solo:toast', { detail: { message, durationMs: 4000 } }));
}

function journalAppend(campaignId: string, html: string) {
  window.dispatchEvent(new CustomEvent('solo:journal-insert-html', { detail: { campaignId, html } }));
}

export default function FloatingActions() {
  const campaign = getActiveCampaign();
  const campaignId = campaign?.id;
  const locked = Boolean(campaign?.locked);

  const [oracleOpen, setOracleOpen] = useState(false);
  const [rollOpen, setRollOpen] = useState(false);

  return (
    <>
      <div className="floatingActions">
        <button className="fab" aria-label="Roll dice" onClick={() => setRollOpen(true)} disabled={!campaignId || locked}>🎲</button>
        <button className="fab" aria-label="Oracles" onClick={() => setOracleOpen(true)} disabled={!campaignId}>🌀</button>
      </div>

      {rollOpen && campaignId && (
        <DiceRollModal
          campaignId={campaignId}
          onClose={() => setRollOpen(false)}
        />
      )}

      {oracleOpen && campaignId && (
        <OraclePanel
          campaignId={campaignId}
          onClose={() => setOracleOpen(false)}
        />
      )}
    </>
  );
}

function DiceRollModal({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const campaign = getActiveCampaign();
  const turboBoost = campaign?.resources.turboBoost ?? 0;
  const turboKick = campaign?.resources.turboKick ?? 0;
  const [boost, setBoost] = useState(0);
  const [kick, setKick] = useState(0);
  const [trick, setTrick] = useState(false);

  const remaining = useMemo(() => ({
    boost: Math.max(0, turboBoost - boost),
    kick: Math.max(0, turboKick - kick),
  }), [turboBoost, turboKick, boost, kick]);

  const roll = () => {
    // Pool is 1d6 +1d6 per boost.
    const diceCount = 1 + boost;
    const results: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      results.push(Math.floor(Math.random()*6)+1);
    }
    const kept = Math.max(...results);

    const outcome = kept <= 3 ? 'FAIL' : kept <= 5 ? 'MIXED SUCCESS' : 'FULL SUCCESS';
    const complicationWorse = trick && kept <= 5;

    // Deduct resources.
    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      const next = { ...c.resources };
      next.turboBoost = Math.max(0, next.turboBoost - boost);
      next.turboKick = Math.max(0, next.turboKick - kick);
      // On MIXED or FULL success + Trick: gain 1 Style.
      if (trick && kept >= 4) {
        next.style = Math.min(10, (next.style || 0) + 1);
      }
      return { ...c, updatedAt: Date.now(), resources: next };
    });

    const toaster = `${outcome} — ${kept} (${trick ? 'Trick' : 'No Trick'}${trick && kept >= 4 ? ', Style +1' : ''})`;
    toast(toaster);

    const html = buildRollHtml({
      outcome,
      results,
      kept,
      boostSpent: boost,
      kickSpent: kick,
      trick,
      complicationWorse,
      styleGained: trick && kept >= 4 ? 1 : 0,
    });
    journalAppend(campaignId, html);

    onClose();
  };

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Roll Dice</h3>
        <div className="muted small">Base: 1d6 (+1d6 per Boost)</div>

        <div style={{ marginTop: 12 }}>
          <div className="fieldLabel">Boost</div>
          <div className="row">
            <div className="muted small" style={{ minWidth: 110 }}>You have: {turboBoost}</div>
            <button className="btnSecondary" onClick={() => setBoost((x) => Math.max(0, x - 1))}>-</button>
            <div style={{ minWidth: 26, textAlign: 'center' }}>{boost}</div>
            <button className="btnSecondary" onClick={() => setBoost((x) => Math.min(turboBoost, x + 1))}>+</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="fieldLabel">Kick</div>
          <div className="row">
            <div className="muted small" style={{ minWidth: 110 }}>You have: {turboKick}</div>
            <button className="btnSecondary" onClick={() => setKick((x) => Math.max(0, x - 1))}>-</button>
            <div style={{ minWidth: 26, textAlign: 'center' }}>{kick}</div>
            <button className="btnSecondary" onClick={() => setKick((x) => Math.min(turboKick, x + 1))}>+</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="row" style={{ gap: 10 }}>
            <input type="checkbox" checked={trick} onChange={(e) => setTrick(e.target.checked)} />
            <span>Attempt a Trick (on success: gain 1 Style; on 1–5: complications are worse)</span>
          </label>
        </div>

        <div className="muted small" style={{ marginTop: 10 }}>
          Remaining after roll: Boost {remaining.boost} · Kick {remaining.kick}
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
          <button className="btnSecondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={roll}>Roll Dice</button>
        </div>
      </div>
    </div>
  );
}

function buildRollHtml(args: {
  outcome: string;
  results: number[];
  kept: number;
  boostSpent: number;
  kickSpent: number;
  trick: boolean;
  complicationWorse: boolean;
  styleGained: number;
}) {
  const { outcome, results, kept, boostSpent, kickSpent, trick, complicationWorse, styleGained } = args;
  const lines: string[] = [];
  lines.push(`<strong>${escapeHtml(outcome)}</strong>`);
  lines.push(`Dice: ${escapeHtml(results.join(', '))} → kept ${kept}`);
  lines.push(`Boost spent: ${boostSpent}`);
  lines.push(`Kick spent: ${kickSpent}`);
  lines.push(`Trick: ${trick ? 'Yes' : 'No'}`);

  if (outcome !== 'FAIL') {
    if (styleGained) lines.push(`Style gained from the roll: ${styleGained}`);
    lines.push(`Kick used in the roll: ${kickSpent}`);
    lines.push(`Decide how you want to use it.`);
  } else {
    lines.push(`With complication (player chooses).${complicationWorse ? ' (Worse)' : ''}`);
  }

  if (complicationWorse && outcome !== 'FULL SUCCESS') {
    lines.push(`Complication: worse`);
  }

  return `<div>${lines.map((l) => `<div>${l}</div>`).join('')}</div>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function OraclePanel({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const campaign = getActiveCampaign();
  const customWorlds = Array.isArray(campaign?.worlds) ? campaign!.worlds! : [];
  const [open, setOpen] = useState<{ [k: string]: boolean }>({});
  const [selectedTable, setSelectedTable] = useState(TABLES[0]?.id ?? 'slogans');

  const toggle = (k: string) => setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

  const doRollTable = () => {
    const r = rollTable(selectedTable);
    if (!r) return;
    const t = TABLES.find((x) => x.id === selectedTable);
    const title = t?.name ?? selectedTable;
    toast(`${title}: ${r.value}`);
    journalAppend(campaignId, `<div><strong>SUCCESS</strong></div><div>${escapeHtml(title)}</div><div>${escapeHtml(r.value)}</div>`);
  };

  return (
    <div className="sidePanelBackdrop" onClick={onClose}>
      <div className="sidePanel" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="h2">Oracles & Tools</div>
          <button className="btnSecondary" onClick={onClose}>Close</button>
        </div>

        <div className="panelSection">
          <button className="collapseHeader" onClick={() => toggle('tables')}>▸ Roll a Table</button>
          {open.tables && (
            <div className="panelBody">
              <select className="input" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                {TABLES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn" onClick={doRollTable}>Roll</button>
              </div>
            </div>
          )}
        </div>

        <div className="panelSection">
          <button className="collapseHeader" onClick={() => toggle('otherGear')}>▸ Other Gear</button>
          {open.otherGear && (
            <div className="panelBody">
              {OTHER_GEAR.map((g) => (
                <details key={g.id} className="details">
                  <summary><strong>{g.name}</strong></summary>
                  <p className="muted">{g.description}</p>
                </details>
              ))}
            </div>
          )}
        </div>

        <div className="panelSection">
          <button className="collapseHeader" onClick={() => toggle('worlds')}>▸ Worlds</button>
          {open.worlds && (
            <div className="panelBody">
              {CANON_WORLDS.map((w) => (
                <details key={w.id} className="details">
                  <summary><strong>{w.name}</strong></summary>
                  <pre className="pre" style={{ whiteSpace: 'pre-wrap' }}>{w.body}</pre>
                </details>
              ))}

              {customWorlds.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="muted small" style={{ marginBottom: 6 }}>Custom Worlds</div>
                  {customWorlds.map((w) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
