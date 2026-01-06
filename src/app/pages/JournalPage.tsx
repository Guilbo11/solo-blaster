import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useActiveCampaign } from '../../storage/useActiveCampaign';
import { campaignActions } from '../../storage/useCampaignStore';

function clampHtml(html: string) {
  return typeof html === 'string' ? html : '';
}

export default function JournalPage() {
  const campaign = useActiveCampaign();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [draftHtml, setDraftHtml] = useState<string>('');

  const campaignId = campaign?.id;
  const isLocked = Boolean(campaign?.locked);

  const storedHtml = useMemo(() => clampHtml(campaign?.journalHtml ?? ''), [campaign?.journalHtml]);

  useEffect(() => {
    setDraftHtml(storedHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = storedHtml;
    }
  }, [storedHtml, campaignId]);

  const exec = (cmd: string, value?: string) => {
    try {
      document.execCommand(cmd, false, value);
      if (editorRef.current) setDraftHtml(editorRef.current.innerHTML);
    } catch {
      // ignore
    }
  };

  const setBlock = (kind: 'P' | 'H1' | 'H2' | 'H3') => exec('formatBlock', kind);

  const save = () => {
    if (!campaignId) return;
    const html = editorRef.current ? editorRef.current.innerHTML : draftHtml;
    campaignActions.updateCampaign(campaignId, (c) => ({ ...c, updatedAt: Date.now(), journalHtml: html }));
  };

  // Allow other parts of the app to append formatted HTML to the journal.
  useEffect(() => {
    if (!campaignId) return;
    const onInsert = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { html?: string; campaignId?: string };
      if (detail?.campaignId && detail.campaignId !== campaignId) return;
      const html = String(detail?.html ?? '');
      if (!html.trim()) return;

      // Update editor UI if on this tab.
      if (editorRef.current) {
        const isFocused = document.activeElement === editorRef.current;
        if (isFocused) {
          try {
            document.execCommand('insertHTML', false, `<br/>${html}`);
          } catch {
            editorRef.current.innerHTML = (editorRef.current.innerHTML || '') + `<br/>${html}`;
          }
        } else {
          editorRef.current.innerHTML = (editorRef.current.innerHTML || '') + `<br/>${html}`;
        }
        setDraftHtml(editorRef.current.innerHTML);
      }

      // Persist.
      campaignActions.updateCampaign(campaignId, (c) => ({
        ...c,
        updatedAt: Date.now(),
        journalHtml: (c.journalHtml || '') + `<br/>${html}`,
      }));
    };

    window.addEventListener('solo:journal-insert-html', onInsert as any);
    return () => window.removeEventListener('solo:journal-insert-html', onInsert as any);
  }, [campaignId]);

  if (!campaign) return <div className="page"><p className="muted">No active campaign.</p></div>;

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Journal</h1>
        <p className="muted">Rich notes per campaign. Rolls and oracles can be appended automatically.</p>
      </header>

      <section className="card">
        <div className="toolbar">
          <button className="toolBtn" onClick={() => exec('bold')} disabled={isLocked}><strong>B</strong></button>
          <button className="toolBtn" onClick={() => exec('italic')} disabled={isLocked}><em>I</em></button>
          <button className="toolBtn" onClick={() => exec('underline')} disabled={isLocked}><u>U</u></button>
          <span className="toolSep" />
          <button className="toolBtn" onClick={() => setBlock('H1')} disabled={isLocked}>H1</button>
          <button className="toolBtn" onClick={() => setBlock('H2')} disabled={isLocked}>H2</button>
          <button className="toolBtn" onClick={() => setBlock('P')} disabled={isLocked}>P</button>
          <span className="toolSep" />
          <button className="toolBtn" onClick={() => exec('insertUnorderedList')} disabled={isLocked}>• List</button>
          <button className="toolBtn" onClick={() => exec('insertOrderedList')} disabled={isLocked}>1. List</button>
          <button className="toolBtn" onClick={() => exec('formatBlock', 'blockquote')} disabled={isLocked}>❝</button>
          <span className="toolSep" />
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
          <span style={{ flex: 1 }} />
          <button className="btnSecondary" onClick={save} disabled={isLocked}>Save</button>
        </div>

        <div
          ref={editorRef}
          className="journalEditor"
          contentEditable={!isLocked}
          suppressContentEditableWarning
          onInput={() => {
            if (editorRef.current) setDraftHtml(editorRef.current.innerHTML);
          }}
          onBlur={save}
        />

        {isLocked ? <p className="muted small" style={{ marginTop: 8 }}>Campaign is locked. Journal is read-only.</p> : null}
      </section>
    </div>
  );
}
