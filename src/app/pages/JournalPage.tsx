import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';
import { JournalChapter } from '../types';
import { uuid } from '../../utils/uuid';

function clampHtml(html: string) {
  return typeof html === 'string' ? html : '';
}

function mergeChaptersToLegacyHtml(chapters: JournalChapter[]) {
  // Keeps old builds safe by maintaining journalHtml.
  return chapters
    .map((ch) => {
      const title = ch.title?.trim() ? ch.title.trim() : 'Chapter';
      return `<h2>${escapeHtml(title)}</h2>${ch.html || ''}`;
    })
    .join('<br/>');
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

type EditorRefs = Record<string, HTMLDivElement | null>;

export default function JournalPage() {
  const campaign = useActiveCampaign();
  const campaignId = campaign?.id;
  const isLocked = Boolean(campaign?.locked);

  const storedChapters = useMemo(() => {
    const raw = Array.isArray(campaign?.journalChapters) ? campaign!.journalChapters! : [];
    if (raw.length) return raw;
    // Back-compat: migrate from legacy journalHtml.
    const legacy = clampHtml(campaign?.journalHtml ?? '');
    const now = Date.now();
    return [{ id: uuid(), title: 'Journal', html: legacy, createdAt: now, updatedAt: now } satisfies JournalChapter];
  }, [campaign?.journalChapters, campaign?.journalHtml]);

  // Local UI state (collapsed by default).
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const editorRefs = useRef<EditorRefs>({});

  const journalChapterId = useMemo(() => {
    const j = storedChapters.find((c) => c.title?.trim() === 'Journal');
    return (j ?? storedChapters[0])?.id ?? null;
  }, [storedChapters]);

  const activeChapterId = useMemo(() => {
    const nonJournal = storedChapters.filter((c) => c.id !== journalChapterId);
    if (!nonJournal.length) return null;
    return nonJournal.reduce((best, c) => (c.updatedAt > best.updatedAt ? c : best)).id;
  }, [storedChapters, journalChapterId]);

  const journalHtml = useMemo(() => {
    if (!journalChapterId) return '';
    return storedChapters.find((c) => c.id === journalChapterId)?.html ?? '';
  }, [storedChapters, journalChapterId]);

  // Keep open state reset when campaign changes.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const ch of storedChapters) next[ch.id] = false;
    setOpen(next);
    // Auto-open the Journal section (editable scratchpad).
    if (journalChapterId) setOpen((prev) => ({ ...prev, [journalChapterId]: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const setEditorRef = (id: string, node: HTMLDivElement | null) => {
    editorRefs.current[id] = node;
  };

  const persist = (chapters: JournalChapter[]) => {
    if (!campaignId) return;
    const now = Date.now();
    campaignActions.updateCampaign(campaignId, (c) => ({
      ...c,
      updatedAt: now,
      journalChapters: chapters,
      journalHtml: mergeChaptersToLegacyHtml(chapters),
    }));
  };

  const updateChapter = (id: string, patch: Partial<JournalChapter>) => {
    const now = Date.now();
    const next = storedChapters.map((ch) => (ch.id === id ? { ...ch, ...patch, updatedAt: now } : ch));
    persist(next);
  };

  const addChapter = () => {
    if (!campaignId || isLocked) return;
    const title = (prompt('Chapter title?') ?? '').trim() || `Chapter ${storedChapters.length + 1}`;
    const now = Date.now();
    const next: JournalChapter[] = [
      { id: uuid(), title, html: '', createdAt: now, updatedAt: now } satisfies JournalChapter,
      ...storedChapters,
    ];
    persist(next);
    setOpen((prev) => ({ ...prev, [next[0].id]: true }));
    // New chapters are read-only until you push content from "Journal".
  };

  const deleteChapter = (id: string) => {
    if (isLocked) return;
    if (!confirm('Delete this chapter?')) return;
    const next = storedChapters.filter((ch) => ch.id !== id);
    persist(next.length ? next : [{ id: uuid(), title: 'Journal', html: '', createdAt: Date.now(), updatedAt: Date.now() }]);
  };

  const moveChapter = (id: string, dir: -1 | 1) => {
    if (isLocked) return;
    const idx = storedChapters.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= storedChapters.length) return;
    const next = [...storedChapters];
    const tmp = next[idx];
    next[idx] = next[swap];
    next[swap] = tmp;
    persist(next);
  };

  const exec = (cmd: string, value?: string) => {
    try {
      document.execCommand(cmd, false, value);
    } catch {
      // ignore
    }
  };

  const onAnyEditorInput = (id: string) => {
    // Only the "Journal" chapter is editable.
    if (id !== journalChapterId) return;
    const node = editorRefs.current[id];
    if (!node) return;
    updateChapter(id, { html: node.innerHTML });
  };

  // Allow other parts of the app to append formatted HTML to the journal.
  useEffect(() => {
    if (!campaignId) return;
    const onInsert = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { html?: string; campaignId?: string };
      if (detail?.campaignId && detail.campaignId !== campaignId) return;
      const html = String(detail?.html ?? '');
      if (!html.trim()) return;

      const targetId = journalChapterId ?? storedChapters[0]?.id;
      if (!targetId) return;
      const node = editorRefs.current[targetId];
      if (node) {
        node.innerHTML = (node.innerHTML || '') + `<br/>${html}`;
      }
      const next = storedChapters.map((ch) => (ch.id === targetId ? { ...ch, html: (ch.html || '') + `<br/>${html}`, updatedAt: Date.now() } : ch));
      persist(next);
    };

    window.addEventListener('solo:journal-insert-html', onInsert as any);
    return () => window.removeEventListener('solo:journal-insert-html', onInsert as any);
  }, [campaignId, journalChapterId, storedChapters]);

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Journal</h1>
        <p className="muted">Chapters are collapsed by default. Rolls and oracles can be appended automatically.</p>
      </header>

      <section className="card">
        <div className="row" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={addChapter} disabled={isLocked}>+ Chapter</button>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {storedChapters.map((ch, idx) => {
            const isOpen = Boolean(open[ch.id]);
            const isJournal = ch.id === journalChapterId;
            const isActive = ch.id === activeChapterId;
            return (
              <div key={ch.id} className="subcard">
                <div
                  className="row"
                  style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  onClick={() => setOpen((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                >
                  <div className="row" style={{ gap: 10, alignItems: 'center', flex: 1 }}>
                    <span className="muted" style={{ minWidth: 18 }}>{isOpen ? '▾' : '▸'}</span>
                    {isJournal ? (
                      <input
                        className="input"
                        value={ch.title}
                        onChange={(e) => updateChapter(ch.id, { title: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isLocked}
                        style={{ fontWeight: 800 }}
                      />
                    ) : (
                      <div style={{ fontWeight: 800, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.6)', flex: 1 }}>
                        {ch.title}
                        {isActive ? <span className="badge">Active</span> : null}
                      </div>
                    )}
                  </div>
                  <div className="row" style={{ gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button className="btnSecondary" type="button" onClick={() => moveChapter(ch.id, -1)} disabled={isLocked || idx === 0} title="Move up">↑</button>
                    <button className="btnSecondary" type="button" onClick={() => moveChapter(ch.id, 1)} disabled={isLocked || idx === storedChapters.length - 1} title="Move down">↓</button>
                    <button className="btnSecondary" type="button" onClick={() => deleteChapter(ch.id)} disabled={isLocked} title="Delete">🗑️</button>
                  </div>
                </div>

                {isOpen ? (
                  <div style={{ marginTop: 10 }}>
                    {isJournal ? (
                      <div className="toolbar">
                        <button className="toolBtn" onClick={() => exec('bold')} disabled={isLocked}><strong>B</strong></button>
                        <button className="toolBtn" onClick={() => exec('italic')} disabled={isLocked}><em>I</em></button>
                        <button className="toolBtn" onClick={() => exec('underline')} disabled={isLocked}><u>U</u></button>
                        <span className="toolSep" />
                        <button className="toolBtn" onClick={() => exec('formatBlock', 'H2')} disabled={isLocked}>H2</button>
                        <button className="toolBtn" onClick={() => exec('formatBlock', 'P')} disabled={isLocked}>P</button>
                        <span className="toolSep" />
                        <button className="toolBtn" onClick={() => exec('insertUnorderedList')} disabled={isLocked}>• List</button>
                        <button className="toolBtn" onClick={() => exec('insertOrderedList')} disabled={isLocked}>1. List</button>
                        <button
                          className="toolBtn"
                          onClick={() => {
                            const url = prompt('Link URL?');
                            if (!url) return;
                            exec('createLink', url);
                          }}
                          disabled={isLocked}
                        >
                          🔗
                        </button>
                      </div>
                    ) : (
                      <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 10 }}>
                        <button
                          className="btn"
                          type="button"
                          disabled={isLocked || !journalChapterId}
                          onClick={() => {
                            if (!journalChapterId) return;
                            updateChapter(ch.id, { html: journalHtml });
                            window.dispatchEvent(new CustomEvent('solo:toast', { detail: { message: `Updated chapter: ${ch.title}`, durationMs: 2500 } }));
                          }}
                        >
                          Update chapter
                        </button>
                      </div>
                    )}
                    <div
                      ref={(node) => setEditorRef(ch.id, node)}
                      className="journalEditor"
                      contentEditable={!isLocked && isJournal}
                      suppressContentEditableWarning
                      onInput={() => onAnyEditorInput(ch.id)}
                      onBlur={() => onAnyEditorInput(ch.id)}
                      dangerouslySetInnerHTML={{ __html: ch.html || '' }}
                    />
                    {isLocked ? <p className="muted small" style={{ marginTop: 8 }}>Campaign is locked. Journal is read-only.</p> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
