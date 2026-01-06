import React, { useEffect, useState } from 'react';

export type ToastDetail = { message: string; durationMs?: number };

export default function ToastHost() {
  const [toast, setToast] = useState<{ message: string; until: number } | null>(null);

  useEffect(() => {
    const onToast = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as ToastDetail;
      const msg = String(detail?.message ?? '').trim();
      if (!msg) return;
      const duration = Math.max(500, Math.min(10000, Number(detail?.durationMs ?? 4000)));
      setToast({ message: msg, until: Date.now() + duration });
    };
    window.addEventListener('solo:toast', onToast as any);
    return () => window.removeEventListener('solo:toast', onToast as any);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const ms = Math.max(0, toast.until - Date.now());
    const t = window.setTimeout(() => setToast(null), ms);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className="toast">
      {toast.message}
    </div>
  );
}
