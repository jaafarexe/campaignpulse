export type ChannelType = 'Social' | 'Search' | 'Email' | 'Display';

export type CampaignStatus = 'Active' | 'Paused' | 'Completed' | 'Draft';

export type DateRangePreset = '7d' | '30d' | '90d' | 'ytd';

export type MetricType = 'impressions' | 'clicks' | 'conversions' | 'spend' | 'revenue' | 'roas';

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: ChannelType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  targetAudience: string;
  objective: string;
  dailyData: DailyMetric[];
}

export interface FilterOptions {
  dateRange: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  channels: ChannelType[];
  statuses: CampaignStatus[];
  searchQuery: string;
}

export interface MetricSummary {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number; // percentage (e.g., 2.45%)
  cvr: number; // conversion rate percentage
  roas: number; // multiplier (e.g., 4.2x)
  cpc: number; // cost per click ($)
  cpa: number; // cost per acquisition ($)
  prevImpressions: number;
  prevClicks: number;
  prevConversions: number;
  prevSpend: number;
  prevRevenue: number;
  prevRoas: number;
}
