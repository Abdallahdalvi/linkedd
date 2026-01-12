import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeOptions {
  enabled?: boolean;
  onProfileChange?: (payload: any) => void;
  onBlocksChange?: (payload: any) => void;
}

export function useRealtimeProfile(profileId: string | undefined, options: RealtimeOptions = {}) {
  const { enabled = true, onProfileChange, onBlocksChange } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!profileId || !enabled) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`profile-${profileId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'link_profiles',
            filter: `id=eq.${profileId}`,
          },
          (payload) => {
            console.log('Profile change:', payload);
            setLastUpdate(new Date());
            onProfileChange?.(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blocks',
            filter: `profile_id=eq.${profileId}`,
          },
          (payload) => {
            console.log('Blocks change:', payload);
            setLastUpdate(new Date());
            onBlocksChange?.(payload);
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [profileId, enabled, onProfileChange, onBlocksChange]);

  return {
    isConnected,
    lastUpdate,
  };
}

// Hook for realtime analytics updates
export function useRealtimeAnalytics(profileId: string | undefined, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [viewCount, setViewCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!profileId || !enabled) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`analytics-${profileId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'analytics_events',
            filter: `profile_id=eq.${profileId}`,
          },
          (payload) => {
            const event = payload.new as { event_type: string };
            if (event.event_type === 'page_view') {
              setViewCount((prev) => prev + 1);
            } else if (event.event_type === 'click') {
              setClickCount((prev) => prev + 1);
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [profileId, enabled]);

  const resetCounts = useCallback(() => {
    setViewCount(0);
    setClickCount(0);
  }, []);

  return {
    viewCount,
    clickCount,
    isConnected,
    resetCounts,
  };
}
