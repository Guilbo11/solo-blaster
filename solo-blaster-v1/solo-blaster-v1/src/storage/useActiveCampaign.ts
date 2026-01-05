import { useMemo } from 'react';
import { useCampaignStore } from './useCampaignStore';
import type { Campaign } from '../app/types';

export function useActiveCampaign(): Campaign | null {
  const { campaigns, activeCampaignId } = useCampaignStore();
  return useMemo(() => {
    if (!activeCampaignId) return null;
    return campaigns.find((c) => c.id === activeCampaignId) ?? null;
  }, [campaigns, activeCampaignId]);
}
