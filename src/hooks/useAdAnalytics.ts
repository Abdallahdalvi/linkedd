import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdImpressionData {
  totalImpressions: number;
  impressionsByType: Record<string, number>;
  impressionsByBlock: { blockId: string; title: string; impressions: number }[];
}

interface AdClickData {
  totalClicks: number;
  clicksByType: Record<string, number>;
  clicksByBlock: { blockId: string; title: string; clicks: number }[];
}

interface AdRewardData {
  totalRewards: number;
  rewardsByBlock: { blockId: string; title: string; rewards: number }[];
}

interface AdAnalyticsData {
  impressions: AdImpressionData;
  clicks: AdClickData;
  rewards: AdRewardData;
  ctr: number;
  rewardRate: number;
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

const getDateFromRange = (range: DateRange): Date | null => {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
};

export function useAdAnalytics(profileId: string | undefined, dateRange: DateRange = '30d') {
  const [data, setData] = useState<AdAnalyticsData>({
    impressions: {
      totalImpressions: 0,
      impressionsByType: {},
      impressionsByBlock: [],
    },
    clicks: {
      totalClicks: 0,
      clicksByType: {},
      clicksByBlock: [],
    },
    rewards: {
      totalRewards: 0,
      rewardsByBlock: [],
    },
    ctr: 0,
    rewardRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAdAnalytics = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      const startDate = getDateFromRange(dateRange);

      // Fetch ad impressions
      let impressionQuery = supabase
        .from('analytics_events')
        .select('*, blocks(title)')
        .eq('profile_id', profileId)
        .eq('event_type', 'ad_impression');

      if (startDate) {
        impressionQuery = impressionQuery.gte('created_at', startDate.toISOString());
      }

      const { data: impressions, error: impressionError } = await impressionQuery;

      // Fetch ad clicks
      let clickQuery = supabase
        .from('analytics_events')
        .select('*, blocks(title)')
        .eq('profile_id', profileId)
        .eq('event_type', 'ad_click');

      if (startDate) {
        clickQuery = clickQuery.gte('created_at', startDate.toISOString());
      }

      const { data: clicks, error: clickError } = await clickQuery;

      // Fetch ad rewards (rewarded video completions)
      let rewardQuery = supabase
        .from('analytics_events')
        .select('*, blocks(title)')
        .eq('profile_id', profileId)
        .eq('event_type', 'ad_reward');

      if (startDate) {
        rewardQuery = rewardQuery.gte('created_at', startDate.toISOString());
      }

      const { data: rewards, error: rewardError } = await rewardQuery;

      if (impressionError || clickError || rewardError) {
        console.error('Error fetching ad analytics:', { impressionError, clickError, rewardError });
        setLoading(false);
        return;
      }

      // Process impressions
      const impressionsByType: Record<string, number> = {};
      const impressionsByBlockMap: Record<string, { title: string; count: number }> = {};

      (impressions || []).forEach((event: any) => {
        const adType = event.browser || 'unknown'; // Using browser field to store ad type
        impressionsByType[adType] = (impressionsByType[adType] || 0) + 1;

        if (event.block_id) {
          if (!impressionsByBlockMap[event.block_id]) {
            impressionsByBlockMap[event.block_id] = {
              title: event.blocks?.title || 'Unknown Block',
              count: 0,
            };
          }
          impressionsByBlockMap[event.block_id].count++;
        }
      });

      // Process clicks
      const clicksByType: Record<string, number> = {};
      const clicksByBlockMap: Record<string, { title: string; count: number }> = {};

      (clicks || []).forEach((event: any) => {
        const adType = event.browser || 'unknown';
        clicksByType[adType] = (clicksByType[adType] || 0) + 1;

        if (event.block_id) {
          if (!clicksByBlockMap[event.block_id]) {
            clicksByBlockMap[event.block_id] = {
              title: event.blocks?.title || 'Unknown Block',
              count: 0,
            };
          }
          clicksByBlockMap[event.block_id].count++;
        }
      });

      // Process rewards
      const rewardsByBlockMap: Record<string, { title: string; count: number }> = {};

      (rewards || []).forEach((event: any) => {
        if (event.block_id) {
          if (!rewardsByBlockMap[event.block_id]) {
            rewardsByBlockMap[event.block_id] = {
              title: event.blocks?.title || 'Unknown Block',
              count: 0,
            };
          }
          rewardsByBlockMap[event.block_id].count++;
        }
      });

      const totalImpressions = impressions?.length || 0;
      const totalClicks = clicks?.length || 0;
      const totalRewards = rewards?.length || 0;

      setData({
        impressions: {
          totalImpressions,
          impressionsByType,
          impressionsByBlock: Object.entries(impressionsByBlockMap)
            .map(([blockId, { title, count }]) => ({ blockId, title, impressions: count }))
            .sort((a, b) => b.impressions - a.impressions),
        },
        clicks: {
          totalClicks,
          clicksByType,
          clicksByBlock: Object.entries(clicksByBlockMap)
            .map(([blockId, { title, count }]) => ({ blockId, title, clicks: count }))
            .sort((a, b) => b.clicks - a.clicks),
        },
        rewards: {
          totalRewards,
          rewardsByBlock: Object.entries(rewardsByBlockMap)
            .map(([blockId, { title, count }]) => ({ blockId, title, rewards: count }))
            .sort((a, b) => b.rewards - a.rewards),
        },
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        rewardRate: totalImpressions > 0 ? (totalRewards / totalImpressions) * 100 : 0,
      });
    } catch (err) {
      console.error('Ad analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [profileId, dateRange]);

  useEffect(() => {
    fetchAdAnalytics();
  }, [fetchAdAnalytics]);

  // Set up realtime subscription
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`ad-analytics-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const eventType = (payload.new as any)?.event_type;
          if (['ad_impression', 'ad_click', 'ad_reward'].includes(eventType)) {
            fetchAdAnalytics();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchAdAnalytics]);

  return { ...data, loading, refetch: fetchAdAnalytics };
}

// Helper function to track ad events
export async function trackAdEvent(
  profileId: string,
  blockId: string,
  eventType: 'ad_impression' | 'ad_click' | 'ad_reward',
  adType: 'google' | 'custom' = 'custom'
) {
  try {
    const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);

    await supabase.from('analytics_events').insert({
      profile_id: profileId,
      block_id: blockId,
      event_type: eventType,
      visitor_id: visitorId,
      browser: adType, // Storing ad type in browser field
      device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    });
  } catch (error) {
    console.error('Error tracking ad event:', error);
  }
}
