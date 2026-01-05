import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/sheet', label: 'Sheet' },
  { path: '/run', label: 'Run' },
  { path: '/downtime', label: 'Downtime' },
  { path: '/epilogue', label: 'Epilogue' },
  { path: '/tools', label: 'Tables/Tools' },
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
