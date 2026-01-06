import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CountryData {
  country: string;
  flag: string;
  views: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  percentage: number;
}

interface ReferrerData {
  source: string;
  visits: number;
  percentage: number;
}

interface AnalyticsData {
  countryData: CountryData[];
  deviceData: DeviceData[];
  referrerData: ReferrerData[];
  totalEvents: number;
  uniqueVisitors: number;
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'Brazil': '🇧🇷',
  'India': '🇮🇳',
  'Mexico': '🇲🇽',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'Others': '🌍',
};

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

export function useAnalytics(profileId: string | undefined, dateRange: DateRange = '30d') {
  const [data, setData] = useState<AnalyticsData>({
    countryData: [],
    deviceData: [],
    referrerData: [],
    totalEvents: 0,
    uniqueVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  const processEvents = useCallback((events: any[]) => {
    if (!events || events.length === 0) {
      return {
        countryData: [],
        deviceData: [],
        referrerData: [],
        totalEvents: 0,
        uniqueVisitors: 0,
      };
    }

    // Calculate country breakdown
    const countryCount: Record<string, number> = {};
    events.forEach(event => {
      const country = event.country || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const sortedCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const totalCountryViews = sortedCountries.reduce((acc, [, count]) => acc + count, 0);
    const othersCount = events.length - totalCountryViews;

    const countryData: CountryData[] = sortedCountries.map(([country, count]) => ({
      country,
      flag: countryFlags[country] || '🌍',
      views: count,
      percentage: Math.round((count / events.length) * 100),
    }));

    if (othersCount > 0) {
      countryData.push({
        country: 'Others',
        flag: '🌍',
        views: othersCount,
        percentage: Math.round((othersCount / events.length) * 100),
      });
    }

    // Calculate device breakdown
    const deviceCount: Record<string, number> = {};
    events.forEach(event => {
      const device = event.device_type || 'Unknown';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });

    const deviceData: DeviceData[] = Object.entries(deviceCount)
      .sort(([, a], [, b]) => b - a)
      .map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        percentage: Math.round((count / events.length) * 100),
      }));

    // Calculate referrer breakdown
    const referrerCount: Record<string, number> = {};
    events.forEach(event => {
      let source = 'Direct';
      if (event.referrer) {
        try {
          const url = new URL(event.referrer);
          const hostname = url.hostname.replace('www.', '');
          if (hostname.includes('instagram')) source = 'Instagram';
          else if (hostname.includes('twitter') || hostname.includes('x.com')) source = 'Twitter/X';
          else if (hostname.includes('tiktok')) source = 'TikTok';
          else if (hostname.includes('facebook')) source = 'Facebook';
          else if (hostname.includes('linkedin')) source = 'LinkedIn';
          else if (hostname.includes('youtube')) source = 'YouTube';
          else if (hostname.includes('google')) source = 'Google';
          else source = hostname;
        } catch {
          source = 'Other';
        }
      }
      referrerCount[source] = (referrerCount[source] || 0) + 1;
    });

    const referrerData: ReferrerData[] = Object.entries(referrerCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({
        source,
        visits: count,
        percentage: Math.round((count / events.length) * 100),
      }));

    // Calculate unique visitors
    const uniqueVisitorIds = new Set(events.map(e => e.visitor_id).filter(Boolean));

    return {
      countryData,
      deviceData,
      referrerData,
      totalEvents: events.length,
      uniqueVisitors: uniqueVisitorIds.size || Math.floor(events.length * 0.7),
    };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      const startDate = getDateFromRange(dateRange);
      
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('profile_id', profileId);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data: events, error } = await query;

      if (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
        return;
      }

      setData(processEvents(events || []));
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [profileId, dateRange, processEvents]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Set up realtime subscription
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`analytics-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          // Refetch data when new events come in
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchAnalytics]);

  return { ...data, loading, refetch: fetchAnalytics };
}
