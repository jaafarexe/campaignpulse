import { Campaign, DailyMetric, DateRangePreset, FilterOptions, MetricSummary } from '../types';

// Helper to generate daily metric records going back 90 days from Oct 24, 2026
function generateDailyHistory(
  baseSpend: number,
  baseImpressions: number,
  baseCtr: number, // 0.02 = 2%
  baseCvr: number, // 0.03 = 3%
  baseRoas: number, // 3.5 = 3.5x
  daysCount: number = 90
): DailyMetric[] {
  const result: DailyMetric[] = [];
  const today = new Date(2026, 9, 24); // Oct 24, 2026

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Add realistic weekday vs weekend variance & slight upward trend
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : 0.95;
    const trendMultiplier = 1 + (daysCount - i) * 0.003; // slight growth over time
    const noise = 0.85 + Math.random() * 0.3; // 15% random variation

    const dailySpend = Math.round((baseSpend / daysCount) * weekendMultiplier * trendMultiplier * noise);
    const dailyImpressions = Math.round((baseImpressions / daysCount) * weekendMultiplier * trendMultiplier * noise);
    
    // Clicks based on CTR with slight noise
    const ctrVariance = 0.9 + Math.random() * 0.2;
    const dailyClicks = Math.max(1, Math.round(dailyImpressions * baseCtr * ctrVariance));
    
    // Conversions based on CVR with slight noise
    const cvrVariance = 0.85 + Math.random() * 0.3;
    const dailyConversions = Math.max(1, Math.round(dailyClicks * baseCvr * cvrVariance));

    // Revenue based on Spend * ROAS
    const roasVariance = 0.9 + Math.random() * 0.25;
    const dailyRevenue = Math.round(dailySpend * baseRoas * roasVariance);

    result.push({
      date: dateStr,
      impressions: dailyImpressions,
      clicks: dailyClicks,
      conversions: dailyConversions,
      spend: dailySpend,
      revenue: dailyRevenue,
    });
  }

  return result;
}

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-01',
    name: 'Google Search - High Intent Brand & Core',
    channel: 'Search',
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    budget: 45000,
    spend: 34200,
    impressions: 485000,
    clicks: 21825,
    conversions: 1047,
    revenue: 168400,
    targetAudience: 'In-market enterprise decision makers searching high-intent software keywords',
    objective: 'Drive qualified pipeline demos and enterprise inbound signups',
    dailyData: generateDailyHistory(34200, 485000, 0.045, 0.048, 4.92, 90),
  },
  {
    id: 'camp-02',
    name: 'Instagram Reels & Stories - Autumn Momentum',
    channel: 'Social',
    status: 'Active',
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    budget: 38000,
    spend: 29500,
    impressions: 1420000,
    clicks: 34080,
    conversions: 784,
    revenue: 97350,
    targetAudience: 'Modern professionals & team leads aged 24-45 interested in productivity tools',
    objective: 'Top-of-funnel customer acquisition with interactive short-form video',
    dailyData: generateDailyHistory(29500, 1420000, 0.024, 0.023, 3.3, 90),
  },
  {
    id: 'camp-03',
    name: 'VIP Loyalty & Lifecycle Re-engagement Flow',
    channel: 'Email',
    status: 'Active',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    budget: 12000,
    spend: 8400,
    impressions: 165000,
    clicks: 14850,
    conversions: 920,
    revenue: 65520,
    targetAudience: 'Registered subscribers with active evaluation or previous subscription accounts',
    objective: 'Reactivate dormant accounts and drive multi-seat enterprise upgrades',
    dailyData: generateDailyHistory(8400, 165000, 0.09, 0.062, 7.8, 90),
  },
  {
    id: 'camp-04',
    name: 'Google Display Network - Smart Dynamic Remarketing',
    channel: 'Display',
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    budget: 25000,
    spend: 18600,
    impressions: 2150000,
    clicks: 19350,
    conversions: 426,
    revenue: 46500,
    targetAudience: 'Website visitors who viewed pricing or features within the last 30 days',
    objective: 'Maintain brand recall and recapture cart/signup abandonment',
    dailyData: generateDailyHistory(18600, 2150000, 0.009, 0.022, 2.5, 90),
  },
  {
    id: 'camp-05',
    name: 'LinkedIn Sponsored Content - B2B Executive Series',
    channel: 'Social',
    status: 'Active',
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    budget: 30000,
    spend: 21400,
    impressions: 320000,
    clicks: 8640,
    conversions: 388,
    revenue: 92020,
    targetAudience: 'VP of Marketing, CMOs, Growth Leads in North America & Europe',
    objective: 'Direct enterprise lead generation with gated 2026 Benchmark Report',
    dailyData: generateDailyHistory(21400, 320000, 0.027, 0.045, 4.3, 90),
  },
  {
    id: 'camp-06',
    name: 'Competitor Alternative Keywords - Exact Match',
    channel: 'Search',
    status: 'Active',
    startDate: '2026-08-20',
    endDate: '2026-11-20',
    budget: 22000,
    spend: 16800,
    impressions: 195000,
    clicks: 7410,
    conversions: 370,
    revenue: 58800,
    targetAudience: 'Buyers searching competitor comparison terms and replacement alternatives',
    objective: 'Capture high-urgency switcher intent with side-by-side feature matrix',
    dailyData: generateDailyHistory(16800, 195000, 0.038, 0.05, 3.5, 90),
  },
  {
    id: 'camp-07',
    name: 'Product Newsletter - Feature Drop Bi-Weekly',
    channel: 'Email',
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    budget: 8000,
    spend: 5200,
    impressions: 110000,
    clicks: 8800,
    conversions: 412,
    revenue: 33280,
    targetAudience: 'All active free tier users and trial account operators',
    objective: 'Announce v3 workflow automations to trigger immediate plan upgrades',
    dailyData: generateDailyHistory(5200, 110000, 0.08, 0.047, 6.4, 90),
  },
  {
    id: 'camp-08',
    name: 'Programmatic Tech Publisher Contextual Ads',
    channel: 'Display',
    status: 'Paused',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    budget: 18000,
    spend: 15400,
    impressions: 1650000,
    clicks: 11550,
    conversions: 208,
    revenue: 29260,
    targetAudience: 'Readers on premium software review portals and digital marketing blogs',
    objective: 'Category awareness and top-of-mind brand anchoring',
    dailyData: generateDailyHistory(15400, 1650000, 0.007, 0.018, 1.9, 90),
  },
  {
    id: 'camp-09',
    name: 'YouTube Pre-Roll - 30s Interactive Product Walkthrough',
    channel: 'Social',
    status: 'Active',
    startDate: '2026-09-10',
    endDate: '2026-11-30',
    budget: 28000,
    spend: 19800,
    impressions: 890000,
    clicks: 16020,
    conversions: 352,
    revenue: 55440,
    targetAudience: 'Tech & analytics enthusiasts watching SaaS tutorials and growth case studies',
    objective: 'Visual product demonstration leading to free 14-day trial signup',
    dailyData: generateDailyHistory(19800, 890000, 0.018, 0.022, 2.8, 90),
  },
  {
    id: 'camp-10',
    name: 'Summer Growth Sprint - Retargeting Special',
    channel: 'Search',
    status: 'Completed',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    budget: 35000,
    spend: 34800,
    impressions: 420000,
    clicks: 15540,
    conversions: 699,
    revenue: 139200,
    targetAudience: 'Mid-market businesses seeking summer annual discounts',
    objective: 'Drive annual upfront subscriptions with 20% discount offer',
    dailyData: generateDailyHistory(34800, 420000, 0.037, 0.045, 4.0, 90),
  },
  {
    id: 'camp-11',
    name: 'Webinar Series Promotion - Automation at Scale',
    channel: 'Email',
    status: 'Completed',
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    budget: 9500,
    spend: 8100,
    impressions: 95000,
    clicks: 7600,
    conversions: 456,
    revenue: 43740,
    targetAudience: 'Marketing automation directors and operations specialists',
    objective: 'Webinar attendee registration and post-session sales follow-up conversion',
    dailyData: generateDailyHistory(8100, 95000, 0.08, 0.06, 5.4, 90),
  },
  {
    id: 'camp-12',
    name: 'Q4 Black Friday & Cyber Week Pre-Warm',
    channel: 'Social',
    status: 'Draft',
    startDate: '2026-11-01',
    endDate: '2026-12-05',
    budget: 50000,
    spend: 1200,
    impressions: 48000,
    clicks: 1440,
    conversions: 52,
    revenue: 4800,
    targetAudience: 'Early reservation list for exclusive Black Friday enterprise tier benefits',
    objective: 'Build VIP priority waitlist before public seasonal push',
    dailyData: generateDailyHistory(1200, 48000, 0.03, 0.036, 4.0, 90),
  },
];

const LOCAL_STORAGE_KEY = 'campaign_pulse_campaigns_v1';

export function loadStoredCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read campaigns from localStorage', e);
  }
  return INITIAL_CAMPAIGNS;
}

export function saveStoredCampaigns(campaigns: Campaign[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.warn('Could not save campaigns to localStorage', e);
  }
}

export function resetStoredCampaigns(): Campaign[] {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear localStorage', e);
  }
  return INITIAL_CAMPAIGNS;
}

// Compute aggregate metrics for a given subset of campaigns and date range
export function computeAggregates(
  campaigns: Campaign[],
  preset: DateRangePreset
): {
  summary: MetricSummary;
  dailyTimeline: {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    roas: number;
    ctr: number;
    cvr: number;
  }[];
} {
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : preset === '90d' ? 90 : 90; // 90 days max in mock
  const today = new Date(2026, 9, 24);

  // Group by date
  const dateMap: Record<
    string,
    { impressions: number; clicks: number; conversions: number; spend: number; revenue: number }
  > = {};

  // Initialize all dates in current period
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    dateMap[dateStr] = { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
  }

  // Also collect previous period for comparison trend %
  let prevImpressions = 0;
  let prevClicks = 0;
  let prevConversions = 0;
  let prevSpend = 0;
  let prevRevenue = 0;

  campaigns.forEach((camp) => {
    const count = camp.dailyData.length;
    // Current period is last `days` entries
    const currentSlice = camp.dailyData.slice(Math.max(0, count - days));
    // Previous period is `days` entries before that
    const prevSlice = camp.dailyData.slice(Math.max(0, count - days * 2), Math.max(0, count - days));

    currentSlice.forEach((item) => {
      if (dateMap[item.date]) {
        dateMap[item.date].impressions += item.impressions;
        dateMap[item.date].clicks += item.clicks;
        dateMap[item.date].conversions += item.conversions;
        dateMap[item.date].spend += item.spend;
        dateMap[item.date].revenue += item.revenue;
      }
    });

    prevSlice.forEach((item) => {
      prevImpressions += item.impressions;
      prevClicks += item.clicks;
      prevConversions += item.conversions;
      prevSpend += item.spend;
      prevRevenue += item.revenue;
    });
  });

  // If no previous slice exists, calculate a realistic synthetic prior
  if (prevSpend === 0) {
    prevImpressions = Math.round(Object.values(dateMap).reduce((acc, v) => acc + v.impressions, 0) * 0.91);
    prevClicks = Math.round(Object.values(dateMap).reduce((acc, v) => acc + v.clicks, 0) * 0.92);
    prevConversions = Math.round(Object.values(dateMap).reduce((acc, v) => acc + v.conversions, 0) * 0.88);
    prevSpend = Math.round(Object.values(dateMap).reduce((acc, v) => acc + v.spend, 0) * 0.94);
    prevRevenue = Math.round(Object.values(dateMap).reduce((acc, v) => acc + v.revenue, 0) * 0.89);
  }

  const sortedDates = Object.keys(dateMap).sort();
  const dailyTimeline = sortedDates.map((date) => {
    const d = dateMap[date];
    const roas = d.spend > 0 ? Number((d.revenue / d.spend).toFixed(2)) : 0;
    const ctr = d.impressions > 0 ? Number(((d.clicks / d.impressions) * 100).toFixed(2)) : 0;
    const cvr = d.clicks > 0 ? Number(((d.conversions / d.clicks) * 100).toFixed(2)) : 0;

    return {
      date,
      ...d,
      roas,
      ctr,
      cvr,
    };
  });

  const totalImpressions = dailyTimeline.reduce((acc, v) => acc + v.impressions, 0);
  const totalClicks = dailyTimeline.reduce((acc, v) => acc + v.clicks, 0);
  const totalConversions = dailyTimeline.reduce((acc, v) => acc + v.conversions, 0);
  const totalSpend = dailyTimeline.reduce((acc, v) => acc + v.spend, 0);
  const totalRevenue = dailyTimeline.reduce((acc, v) => acc + v.revenue, 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const prevRoas = prevSpend > 0 ? prevRevenue / prevSpend : 0;

  const summary: MetricSummary = {
    impressions: totalImpressions,
    clicks: totalClicks,
    conversions: totalConversions,
    spend: totalSpend,
    revenue: totalRevenue,
    ctr,
    cvr,
    roas,
    cpc,
    cpa,
    prevImpressions,
    prevClicks,
    prevConversions,
    prevSpend,
    prevRevenue,
    prevRoas,
  };

  return { summary, dailyTimeline };
}
