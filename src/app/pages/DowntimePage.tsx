import React, { useMemo, useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { BEATS, type Beat } from '../../compendiums/beats';
import { SIGNATURE_GEAR, canAfford, type SignatureMod } from '../../compendiums/signatureGear';
import { uuid } from '../../utils/uuid';
import { adjacentTo, areAdjacent, getAllWorldNames, CANON_PORTAL_WORLDS } from '../../utils/worldAdjacency';

type BeatModal =
  | { kind: 'doomName'; beat: Beat }
  | { kind: 'legacyName'; beat: Beat }
  | { kind: 'inTheLab'; beat: Beat }
  | { kind: 'portalDiscovery'; beat: Beat };


function toast(message: string) {
  window.dispatchEvent(new CustomEvent('solo:toast', { detail: { message, durationMs: 4000 } }));
}

function d6() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function DowntimePage() {
  const campaign = useActiveCampaign();
  const [modal, setModal] = useState<BeatModal | null>(null);
  const [pendingBeat, setPendingBeat] = useState<Beat | null>(null);
  const [nameInput, setNameInput] = useState('');

  // In the Lab UI state
  const [labTab, setLabTab] = useState<'install' | 'uninstall' | 'exchange' | 'roll'>('install');
  const [exchangeFrom, setExchangeFrom] = useState<'coil' | 'disc' | 'lens' | 'gem'>('coil');
  const [exchangeTo, setExchangeTo] = useState<'coil' | 'disc' | 'lens' | 'gem'>('disc');

  // Portal Discovery UI state
  const [worldA, setWorldA] = useState<string>('Null');
  const [worldB, setWorldB] = useState<string>('Vastiche');

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  const campaignId = campaign.id;
  const isLocked = campaign.locked;

  const allWorldNames = useMemo(() => getAllWorldNames(campaign), [campaign.worlds]);
  const adjacentToA = useMemo(() => adjacentTo(campaign, worldA), [campaign.worlds, worldA]);

  const grouped = useMemo(() => {
    const m = new Map<string, Beat[]>();
    for (const b of BEATS) {
      const key = b.section;
      m.set(key, [...(m.get(key) ?? []), b]);
    }
    return Array.from(m.entries());
  }, []);

  function logToJournal(title: string, body?: string) {
    campaignActions.updateCampaign(campaignId, (c) => ({
      ...c,
      updatedAt: Date.now(),
      journal: [{ id: uuid(), ts: Date.now(), type: 'note', title, body }, ...c.journal],
    }));
  }

  function applyResourcesDelta(delta: Partial<typeof campaign.resources>) {
    campaignActions.updateCampaign(campaignId, (c) => {
      if (c.locked) return c;
      const r = c.resources;
      const next = { ...r };

      if (typeof delta.style === 'number') next.style = Math.max(0, (r.style ?? 0) + delta.style);
      if (typeof delta.trouble === 'number') next.trouble = Math.max(0, Math.min(8, (r.trouble ?? 0) + delta.trouble));
      if (typeof delta.doom === 'number') next.doom = Math.max(0, (r.doom ?? 0) + delta.doom);
      if (typeof delta.legacy === 'number') next.legacy = Math.max(0, (r.legacy ?? 0) + delta.legacy);

      return { ...c, updatedAt: Date.now(), resources: next };
    });
  }

  function addEpilogueItem(kind: 'doom' | 'legacy', name: string) {
    const trimmed = name.trim() || (kind === 'doom' ? 'Doom' : 'Legacy');
    campaignActions.updateCampaign(campaignId, (c) => {
      const ep = c.epilogue ?? { legacies: [], dooms: [] };
      const list = kind === 'doom' ? ep.dooms : ep.legacies;
      const nextList = [...list, { id: uuid(), name: trimmed }];
      const nextEp = kind === 'doom' ? { ...ep, dooms: nextList } : { ...ep, legacies: nextList };
      const nextResources = {
        ...c.resources,
        doom: nextEp.dooms.length,
        legacy: nextEp.legacies.length,
      };
      return { ...c, updatedAt: Date.now(), epilogue: nextEp, resources: nextResources };
    });
  }

  function removeEpilogueItems(kind: 'doom' | 'legacy', count: number) {
    if (count <= 0) return;
    campaignActions.updateCampaign(campaignId, (c) => {
      const ep = c.epilogue ?? { legacies: [], dooms: [] };
      const list = kind === 'doom' ? ep.dooms : ep.legacies;
      const nextList = list.slice(0, Math.max(0, list.length - count));
      const nextEp = kind === 'doom' ? { ...ep, dooms: nextList } : { ...ep, legacies: nextList };
      const nextResources = {
        ...c.resources,
        doom: nextEp.dooms.length,
        legacy: nextEp.legacies.length,
      };
      return { ...c, updatedAt: Date.now(), epilogue: nextEp, resources: nextResources };
    });
  }

  function canPay(beat: Beat) {
    if (beat.cost.currency === 'style') return (campaign.resources.style ?? 0) >= beat.cost.amount;
    // Trouble-cost beats are always allowed, per spec.
    return true;
  }

  function startApplyBeat(beat: Beat) {
    if (isLocked) return;
    if (beat.cost.currency === 'style' && !canPay(beat)) {
      toast('Not enough Style.');
      return;
    }

    // If trouble cost would push to 8, we confirm through ResourceBar already; but Downtime needs to handle it too.
    if (beat.cost.currency === 'trouble') {
      const nextTrouble = Math.min(8, (campaign.resources.trouble ?? 0) + beat.cost.amount);
      if (nextTrouble === 8 && (campaign.resources.trouble ?? 0) < 8) {
        const ok = confirm('Trouble will reach 8. This triggers a Disaster Roll. Continue?');
        if (!ok) return;
        window.dispatchEvent(new CustomEvent('solo:journal-insert-html', { detail: { campaignId, html: `<b>DISASTER ROLL</b><br/>Trouble reached 8 from a Beat. Roll disaster.` } }));
      }
    }

    setPendingBeat(beat);

    // Special beats
    if (beat.effects?.special === 'in-the-lab') {
      setLabTab('install');
      setModal({ kind: 'inTheLab', beat });
      return;
    }
    if (beat.effects?.special === 'portal-discovery') {
      setWorldA('Null');
      setWorldB('Vastiche');
      setModal({ kind: 'portalDiscovery', beat });
      return;
    }

    // Naming prompts
    if (beat.effects?.addDoomName) {
      setNameInput('');
      setModal({ kind: 'doomName', beat });
      return;
    }
    if (beat.effects?.addLegacyName) {
      setNameInput('');
      setModal({ kind: 'legacyName', beat });
      return;
    }

    // Otherwise, apply immediately.
    finalizeBeat(beat, undefined);
  }

  function payCost(beat: Beat) {
    if (beat.cost.currency === 'style') {
      applyResourcesDelta({ style: -beat.cost.amount });
    } else {
      applyResourcesDelta({ trouble: +beat.cost.amount });
    }
  }

  function applyEffects(beat: Beat, extraName?: string) {
    const ef = beat.effects;

    // Deltas
    if (ef?.style) applyResourcesDelta({ style: ef.style });
    if (ef?.trouble) applyResourcesDelta({ trouble: ef.trouble });

    // Doom / Legacy adjustments
    if (typeof ef?.doom === 'number') {
      if (ef.doom > 0) {
        addEpilogueItem('doom', extraName || 'Doom');
      } else if (ef.doom < 0) {
        removeEpilogueItems('doom', Math.abs(ef.doom));
      }
    }
    if (typeof ef?.legacy === 'number') {
      if (ef.legacy > 0) {
        addEpilogueItem('legacy', extraName || 'Legacy');
      } else if (ef.legacy < 0) {
        removeEpilogueItems('legacy', Math.abs(ef.legacy));
      }
    }

    // Trait gain: V1 logs to journal; Character page already supports multiple traits.
    if (ef?.gainTrait) {
      logToJournal('Trait gained', `Gain ${ef.gainTrait.count} trait(s)${ef.gainTrait.allowAllPlaybooks ? ' (any playbook)' : ''}. Choose on Character page.`);
      toast('Trait gain logged. Choose on Character page.');
    }
  }

  function finalizeBeat(beat: Beat, extraName?: string) {
    payCost(beat);
    applyEffects(beat, extraName);
    logToJournal(`Beat: ${beat.name}`, `Cost: ${beat.cost.amount} ${beat.cost.currency}\n${beat.effectText}`);
    toast('Beat applied.');
    setPendingBeat(null);
  }

  // In The Lab helpers
  const sigGearId = campaign.character.signatureGear?.gearId;
  const sigGear = useMemo(() => (sigGearId ? SIGNATURE_GEAR.find((g) => g.id === sigGearId) ?? null : null), [sigGearId]);
  const installed = campaign.character.signatureGear?.installedMods ?? [];
  const inv = campaign.character.components;

  function installMod(mod: SignatureMod) {
    if (!pendingBeat) return;
    if (!canAfford(mod.costParsed, inv)) return;
    campaignActions.updateCampaign(campaignId, (c) => {
      const ch = c.character;
      const sg = ch.signatureGear;
      if (!sg) return c;
      const nextInv = {
        coil: ch.components.coil - (mod.costParsed.coil || 0),
        disc: ch.components.disc - (mod.costParsed.disc || 0),
        lens: ch.components.lens - (mod.costParsed.lens || 0),
        gem: ch.components.gem - (mod.costParsed.gem || 0),
      };
      const nextInstalled = Array.from(new Set([...(sg.installedMods ?? []), mod.name]));
      return {
        ...c,
        updatedAt: Date.now(),
        character: {
          ...ch,
          components: nextInv,
          ownedMods: Array.from(new Set([...(ch.ownedMods ?? []), mod.name])),
          signatureGear: { ...sg, installedMods: nextInstalled },
        },
      };
    });
    toast(`Installed: ${mod.name}`);
  }

  function uninstallMod(modName: string) {
    if (!pendingBeat || !sigGear) return;
    const mod = sigGear.mods.find((m) => m.name === modName);
    if (!mod) return;
    campaignActions.updateCampaign(campaignId, (c) => {
      const ch = c.character;
      const sg = ch.signatureGear;
      if (!sg) return c;
      const nextInv = {
        coil: ch.components.coil + (mod.costParsed.coil || 0),
        disc: ch.components.disc + (mod.costParsed.disc || 0),
        lens: ch.components.lens + (mod.costParsed.lens || 0),
        gem: ch.components.gem + (mod.costParsed.gem || 0),
      };
      const nextInstalled = (sg.installedMods ?? []).filter((n) => n !== modName);
      return {
        ...c,
        updatedAt: Date.now(),
        character: {
          ...ch,
          components: nextInv,
          signatureGear: { ...sg, installedMods: nextInstalled },
        },
      };
    });
    toast(`Uninstalled: ${modName}`);
  }

  function exchangeComponents() {
    if (!pendingBeat) return;
    if (exchangeFrom === exchangeTo) return;
    const have = inv[exchangeFrom];
    if (have < 3) return;
    campaignActions.updateCampaign(campaignId, (c) => {
      const ch = c.character;
      const nextInv = { ...ch.components };
      nextInv[exchangeFrom] = Math.max(0, nextInv[exchangeFrom] - 3);
      nextInv[exchangeTo] = nextInv[exchangeTo] + 1;
      return { ...c, updatedAt: Date.now(), character: { ...ch, components: nextInv } };
    });
    toast('Exchanged components.');
  }

  function rollComponentGain() {
    // In the Lab: rolling to gain components costs +1 style per roll.
    if (!pendingBeat) return;
    if ((campaign.resources.style ?? 0) < 1) {
      toast('Not enough Style to roll.');
      return;
    }
    // Pay 1 style per roll
    applyResourcesDelta({ style: -1 });
    const r = d6();
    const gains: Array<'coil' | 'disc' | 'lens' | 'gem'> = ['coil', 'disc', 'lens', 'gem'];
    let picked: 'coil' | 'disc' | 'lens' | 'gem' | null = null;
    let extraRoll = false;
    if (r >= 1 && r <= 4) picked = gains[r - 1];
    if (r === 5) {
      picked = exchangeTo;
    }
    if (r === 6) {
      picked = exchangeTo;
      extraRoll = true;
    }

    if (picked) {
      campaignActions.updateCampaign(campaignId, (c) => {
        const ch = c.character;
        const nextInv = { ...ch.components, [picked!]: ch.components[picked!] + 1 };
        return { ...c, updatedAt: Date.now(), character: { ...ch, components: nextInv } };
      });
      logToJournal('In the Lab: component gain', `Rolled ${r} → +1 ${picked}${extraRoll ? ' (roll again)' : ''}`);
      toast(`+1 ${picked}${extraRoll ? ' (roll again)' : ''}`);
    }
  }

  function doPortalDiscovery() {
    if (!pendingBeat) return;
    if (!areAdjacent(campaign, worldA, worldB)) {
      toast('World B must be adjacent to World A.');
      return;
    }
    const r = d6();
    const outcomes = [
      'one-way to A',
      'one-way to B',
      'two-way portal zone',
      'unstable portal zone',
      'hidden portal zone',
      'wild portal zone',
    ];
    const outcome = outcomes[r - 1] ?? outcomes[0];
    campaignActions.updateCampaign(campaignId, (c) => {
      const ch = c.character;
      const existing = Array.isArray(ch.portals) ? ch.portals : [];
      // Translate outcome into a stored portal record.
      let from = worldA;
      let to = worldB;
      let twoWay = false;
      let note = '';
      if (outcome === 'one-way to A') {
        from = worldB;
        to = worldA;
        twoWay = false;
      } else if (outcome === 'one-way to B') {
        from = worldA;
        to = worldB;
        twoWay = false;
      } else {
        twoWay = true;
        note = outcome === 'two-way portal zone' ? '' : outcome;
      }

      const already = existing.some((p: any) => {
        if (p.twoWay) {
          return (p.from === worldA && p.to === worldB) || (p.from === worldB && p.to === worldA);
        }
        return p.from === from && p.to === to;
      });
      const nextPortals = already ? existing : [...existing, { id: uuid(), from, to, twoWay, note }];
      return { ...c, updatedAt: Date.now(), character: { ...ch, portals: nextPortals } };
    });
    logToJournal('Portal Discovery', `A: ${worldA}\nB: ${worldB}\nRoll: ${r} → ${outcome}`);
    toast(`Portal Discovery: ${outcome}`);
    finalizeBeat(pendingBeat);
    setModal(null);
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Downtime</h1>
        <p className="muted">Buy and apply Beats. Style-cost beats require enough Style. Trouble-cost beats are always allowed.</p>
      </header>

      {grouped.map(([section, beats]) => (
        <section key={section} className="card">
          <h2>{section}</h2>
          <div className="list">
            {beats.map((b) => (
              <div key={b.id} className="listItem">
                <div className="listItemMain">
                  <div className="listItemTitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span>
                      {b.name} <span className="muted small">({b.cost.amount} {b.cost.currency})</span>
                    </span>
                    <button
                      className="toolBtn"
                      type="button"
                      title="Info"
                      onClick={() => alert(`${b.name}\n\n${b.effectText}\n\nCost: ${b.cost.amount} ${b.cost.currency}`)}
                    >
                      i
                    </button>
                  </div>
                  <div className="muted small">{b.effectText}</div>
                </div>
                <div className="listItemActions">
                  <button className="btn" onClick={() => startApplyBeat(b)} disabled={isLocked || !canPay(b)}>
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {modal?.kind === 'doomName' && pendingBeat ? (
        <div className="modalBackdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Add Doom</h2>
            <p className="muted">Name the Doom (keep it short).</p>
            <input className="input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Doom name" />
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn btnGhost" onClick={() => { setModal(null); setPendingBeat(null); }}>Cancel</button>
              <button className="btn" onClick={() => { finalizeBeat(pendingBeat, nameInput); setModal(null); }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modal?.kind === 'legacyName' && pendingBeat ? (
        <div className="modalBackdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Add Legacy</h2>
            <p className="muted">Name the Legacy (keep it short).</p>
            <input className="input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Legacy name" />
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn btnGhost" onClick={() => { setModal(null); setPendingBeat(null); }}>Cancel</button>
              <button className="btn" onClick={() => { finalizeBeat(pendingBeat, nameInput); setModal(null); }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modal?.kind === 'inTheLab' && pendingBeat ? (
        <div className="modalBackdrop">
          <div className="modal modalTall" role="dialog" aria-modal="true">
            <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
              <h2>In the Lab</h2>
              <button className="btn btnGhost" onClick={() => { setModal(null); finalizeBeat(pendingBeat); }}>
                Done
              </button>
            </div>

            <p className="muted small">Actions here are available after paying the beat cost (1 style). Rolling for a component costs +1 style per roll.</p>

            <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {(['install','uninstall','exchange','roll'] as const).map((t) => (
                <button key={t} className={labTab === t ? 'btn btnSelected' : 'btn btnGhost'} onClick={() => setLabTab(t)}>
                  {t === 'install' ? 'Install Mods' : t === 'uninstall' ? 'Uninstall Mods' : t === 'exchange' ? 'Exchange' : 'Roll Component'}
                </button>
              ))}
            </div>

            <div className="muted" style={{ marginTop: 10 }}>
              Inventory: {inv.coil} Coils, {inv.disc} Discs, {inv.lens} Lenses, {inv.gem} Gems
            </div>

            {labTab === 'install' ? (
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {!sigGear ? <p className="muted">No signature gear selected.</p> : null}
                {sigGear ? sigGear.mods.filter((m) => !installed.includes(m.name)).map((m) => {
                  const ok = canAfford(m.costParsed, inv);
                  return (
                    <div key={m.name} className="subcard">
                      <div className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn" onClick={() => installMod(m)} disabled={!ok}>Install: {m.name}</button>
                        <span className="muted small">Cost: {m.cost}</span>
                      </div>
                      <div className="muted small" style={{ marginTop: 6 }}>{m.description}</div>
                    </div>
                  );
                }) : null}
              </div>
            ) : null}

            {labTab === 'uninstall' ? (
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {installed.length === 0 ? <p className="muted">No installed mods.</p> : null}
                {installed.map((m) => (
                  <div key={m} className="subcard">
                    <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontWeight: 800 }}>{m}</div>
                      <button className="btn btnGhost" onClick={() => uninstallMod(m)}>Uninstall</button>
                    </div>
                    <div className="muted small" style={{ marginTop: 6 }}>Salvages the components used to install it.</div>
                  </div>
                ))}
              </div>
            ) : null}

            {labTab === 'exchange' ? (
              <div style={{ marginTop: 12 }}>
                <div className="fieldLabel">Exchange three matching components for one component of your choice</div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <select className="select" value={exchangeFrom} onChange={(e) => setExchangeFrom(e.target.value as any)}>
                    <option value="coil">Coil</option>
                    <option value="disc">Disc</option>
                    <option value="lens">Lens</option>
                    <option value="gem">Gem</option>
                  </select>
                  <span className="muted">→</span>
                  <select className="select" value={exchangeTo} onChange={(e) => setExchangeTo(e.target.value as any)}>
                    <option value="coil">Coil</option>
                    <option value="disc">Disc</option>
                    <option value="lens">Lens</option>
                    <option value="gem">Gem</option>
                  </select>
                  <button className="btn" onClick={exchangeComponents} disabled={exchangeFrom === exchangeTo || inv[exchangeFrom] < 3}>
                    Exchange
                  </button>
                </div>
                {inv[exchangeFrom] < 3 ? <p className="muted small" style={{ marginTop: 8 }}>You need 3 {exchangeFrom}s.</p> : null}
              </div>
            ) : null}

            {labTab === 'roll' ? (
              <div style={{ marginTop: 12 }}>
                <p className="muted small">Roll to gain 1 random component. Costs 1 Style per roll. On a 6, you gain +1 (choose) and roll again.</p>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <select className="select" value={exchangeTo} onChange={(e) => setExchangeTo(e.target.value as any)}>
                    <option value="coil">Choose: Coil</option>
                    <option value="disc">Choose: Disc</option>
                    <option value="lens">Choose: Lens</option>
                    <option value="gem">Choose: Gem</option>
                  </select>
                  <button className="btn" onClick={rollComponentGain} disabled={(campaign.resources.style ?? 0) < 1}>
                    Pay 1 Style + Roll
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {modal?.kind === 'portalDiscovery' && pendingBeat ? (
        <div className="modalBackdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h2>Portal Discovery</h2>
            <p className="muted small">Choose bordering worlds (A and B). B must be adjacent to A.</p>

            <div className="fieldLabel">World A</div>
            <select className="select" value={worldA} onChange={(e) => {
              const a = e.target.value;
              setWorldA(a);
              const nextAdj = allWorldNames.filter((w) => areAdjacent(a, w));
              if (!nextAdj.includes(worldB)) setWorldB(nextAdj[0] ?? a);
            }}>
              {allWorldNames.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>

            <div className="fieldLabel" style={{ marginTop: 10 }}>World B (adjacent)</div>
            <select className="select" value={worldB} onChange={(e) => setWorldB(e.target.value)}>
              {adjacentToA.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>

            <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn btnGhost" onClick={() => { setModal(null); setPendingBeat(null); }}>Cancel</button>
              <button className="btn" onClick={doPortalDiscovery}>Roll</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
