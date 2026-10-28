import { Campaign, ChannelType, CampaignStatus } from '../types';

export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 10_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, compact: boolean = false): string {
  if (compact && Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(num) >= 10_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
}

export function formatMultiplier(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0.00x';
  return `${value.toFixed(decimals)}x`;
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getChannelColor(channel: ChannelType): {
  primary: string;
  bgLight: string;
  border: string;
  text: string;
} {
  switch (channel) {
    case 'Social':
      return {
        primary: '#3b82f6', // Blue
        bgLight: '#eff6ff',
        border: '#bfdbfe',
        text: '#1d4ed8',
      };
    case 'Search':
      return {
        primary: '#10b981', // Emerald
        bgLight: '#ecfdf5',
        border: '#a7f3d0',
        text: '#047857',
      };
    case 'Email':
      return {
        primary: '#8b5cf6', // Violet
        bgLight: '#f5f3ff',
        border: '#ddd6fe',
        text: '#6d28d9',
      };
    case 'Display':
      return {
        primary: '#f59e0b', // Amber
        bgLight: '#fffbeb',
        border: '#fde68a',
        text: '#b45309',
      };
    default:
      return {
        primary: '#64748b',
        bgLight: '#f8fafc',
        border: '#cbd5e1',
        text: '#334155',
      };
  }
}

export function getStatusStyle(status: CampaignStatus): {
  dotColor: string;
  textColor: string;
  label: string;
} {
  switch (status) {
    case 'Active':
      return {
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        label: 'Active',
      };
    case 'Paused':
      return {
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        label: 'Paused',
      };
    case 'Completed':
      return {
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-600',
        label: 'Completed',
      };
    case 'Draft':
      return {
        dotColor: 'bg-indigo-400',
        textColor: 'text-indigo-600',
        label: 'Draft',
      };
  }
}

export function exportCampaignsToCSV(campaigns: Campaign[]): void {
  const headers = [
    'Campaign Name',
    'Channel',
    'Status',
    'Start Date',
    'End Date',
    'Budget ($)',
    'Spend ($)',
    'Impressions',
    'Clicks',
    'CTR (%)',
    'Conversions',
    'Conv. Rate (%)',
    'Revenue ($)',
    'ROAS (x)',
    'CPC ($)',
    'CPA ($)',
  ];

  const rows = campaigns.map((c) => {
    const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0';
    const cvr = c.clicks > 0 ? ((c.conversions / c.clicks) * 100).toFixed(2) : '0';
    const roas = c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : '0';
    const cpc = c.clicks > 0 ? (c.spend / c.clicks).toFixed(2) : '0';
    const cpa = c.conversions > 0 ? (c.spend / c.conversions).toFixed(2) : '0';

    return [
      `"${c.name.replace(/"/g, '""')}"`,
      c.channel,
      c.status,
      c.startDate,
      c.endDate,
      c.budget.toFixed(2),
      c.spend.toFixed(2),
      c.impressions,
      c.clicks,
      ctr,
      c.conversions,
      cvr,
      c.revenue.toFixed(2),
      roas,
      cpc,
      cpa,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CampaignPulse_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
