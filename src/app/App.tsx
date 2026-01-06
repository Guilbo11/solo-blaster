import React, { useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../storage/useCampaignStore';
import CampaignsPage from './pages/CampaignsPage';
import SheetPage from './pages/SheetPage';
import RunPage from './pages/RunPage';
import DowntimePage from './pages/DowntimePage';
import EpiloguePage from './pages/EpiloguePage';
import ToolsPage from './pages/ToolsPage';
import CharacterPage from './pages/CharacterPage';
import JournalPage from './pages/JournalPage';
import BottomNav from '../components/BottomNav';
import ResourceBar from '../components/ResourceBar';
import FloatingActions from '../components/FloatingActions';
import ToastHost from '../components/ToastHost';

export default function App() {
  const { activeCampaignId } = useCampaignStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Always return to landing page on hard refresh/reload.
  useEffect(() => {
    if (location.pathname !== '/campaigns') {
      navigate('/campaigns', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showShell = useMemo(() => {
    // Always show shell once a campaign is selected; landing is /campaigns
    return location.pathname !== '/campaigns';
  }, [location.pathname]);

  return (
    <div className="appRoot">
      {showShell && (
        <>
          <ResourceBar />
          <FloatingActions />
          <div className="appBody">
            {!activeCampaignId ? (
              <div className="emptyState">
                <p>No active campaign selected.</p>
                <button className="btn" onClick={() => navigate('/campaigns')}>Go to Campaigns</button>
              </div>
            ) : (
              <Routes>
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/sheet" element={<SheetPage />} />
                <Route path="/character" element={<CharacterPage />} />
                <Route path="/run" element={<RunPage />} />
                <Route path="/downtime" element={<DowntimePage />} />
                <Route path="/epilogue" element={<EpiloguePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="*" element={<Navigate to="/sheet" replace />} />
              </Routes>
            )}
          </div>
          <BottomNav />
          <ToastHost />
        </>
      )}

      {!showShell && (
        <Routes>
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="*" element={<Navigate to="/campaigns" replace />} />
        </Routes>
      )}
    </div>
  );
}
