import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/journal', label: 'Journal' },
  { path: '/character', label: 'Character' },
  { path: '/worlds', label: 'Worlds' },
  { path: '/run', label: 'Run' },
  { path: '/npcs', label: 'NPCs' },
  { path: '/downtime', label: 'Downtime' },
  { path: '/epilogue', label: 'Epilogue' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottomNav">
      {tabs.map((t) => {
        const active = location.pathname === t.path;
        return (
          <button
            key={t.path}
            className={active ? 'tabBtn active' : 'tabBtn'}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
