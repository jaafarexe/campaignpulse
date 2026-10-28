import React, { useState, useMemo } from 'react';
import { Campaign, ChannelType } from '../types';
import { formatCurrency, formatNumber, formatPercent, formatMultiplier, getChannelColor } from '../utils/formatters';
import { PieChart, DollarSign, Target, MousePointer, Share2, Search, Mail, Monitor } from 'lucide-react';

interface ChannelBreakdownProps {
  campaigns: Campaign[];
  selectedChannelFilter: ChannelType[];
  onChannelSelect: (channel: ChannelType) => void;
}

const CHANNEL_ICONS: Record<ChannelType, React.ElementType> = {
  Social: Share2,
  Search: Search,
  Email: Mail,
  Display: Monitor,
};

export const ChannelBreakdown: React.FC<ChannelBreakdownProps> = ({
  campaigns,
  selectedChannelFilter,
  onChannelSelect,
}) => {
  const [metricMode, setMetricMode] = useState<'spend' | 'revenue' | 'conversions'>('revenue');
  const [hoveredChannel, setHoveredChannel] = useState<ChannelType | null>(null);

  const channels: ChannelType[] = ['Search', 'Social', 'Email', 'Display'];

  // Calculate aggregates per channel
  const stats = useMemo(() => {
    return channels.map((channel) => {
      const channelCamps = campaigns.filter((c) => c.channel === channel);
      const spend = channelCamps.reduce((acc, c) => acc + c.spend, 0);
      const revenue = channelCamps.reduce((acc, c) => acc + c.revenue, 0);
      const impressions = channelCamps.reduce((acc, c) => acc + c.impressions, 0);
      const clicks = channelCamps.reduce((acc, c) => acc + c.clicks, 0);
      const conversions = channelCamps.reduce((acc, c) => acc + c.conversions, 0);

      const roas = spend > 0 ? revenue / spend : 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;

      return {
        channel,
        campaignsCount: channelCamps.length,
        spend,
        revenue,
        impressions,
        clicks,
        conversions,
        roas,
        ctr,
        cvr,
        cpc,
        cpa,
      };
    });
  }, [campaigns]);

  const totalMetric = useMemo(() => {
    return stats.reduce((acc, s) => acc + s[metricMode], 0) || 1;
  }, [stats, metricMode]);

  // SVG Donut calculation
  const donutSlices = useMemo(() => {
    const size = 180;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;

    return stats.map((s) => {
      const value = s[metricMode];
      const share = value / totalMetric;
      const strokeDasharray = `${share * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;

      accumulatedAngle += share;

      return {
        channel: s.channel,
        share,
        strokeDasharray,
        strokeDashoffset,
        color: getChannelColor(s.channel).primary,
      };
    });
  }, [stats, metricMode, totalMetric]);

  const activeStat = stats.find((s) => s.channel === (hoveredChannel || 'Search')) || stats[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header with Mode Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Channel Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribution and ROI comparison across marketing channels</p>
        </div>

        {/* Segmented control for Donut metric */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => setMetricMode('revenue')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              metricMode === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetricMode('spend')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              metricMode === 'spend' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spend
          </button>
          <button
            onClick={() => setMetricMode('conversions')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              metricMode === 'conversions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversions
          </button>
        </div>
      </div>

      {/* Main Visual: Donut on left, Channel Efficiency Table on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center">
        {/* Donut Chart with center detail */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
              <circle
                cx="90"
                cy="90"
                r={(180 - 28) / 2}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="28"
              />
              {donutSlices.map((slice) => {
                const isHovered = hoveredChannel === slice.channel;
                return (
                  <circle
                    key={slice.channel}
                    cx="90"
                    cy="90"
                    r={(180 - 28) / 2}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? 34 : 28}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredChannel(slice.channel)}
                    onMouseLeave={() => setHoveredChannel(null)}
                    onClick={() => onChannelSelect(slice.channel)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {hoveredChannel || 'Total'} {metricMode}
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {metricMode === 'conversions'
                  ? formatNumber(hoveredChannel ? activeStat.conversions : totalMetric)
                  : formatCurrency(hoveredChannel ? activeStat[metricMode] : totalMetric, true)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {hoveredChannel ? `${formatPercent((activeStat[metricMode] / totalMetric) * 100, 1)} share` : 'Across All'}
              </span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 text-center">
            Click slice to filter dashboard
          </div>
        </div>

        {/* Channel Bars & Metrics List */}
        <div className="md:col-span-7 space-y-2.5">
          {stats.map((s) => {
            const channelColor = getChannelColor(s.channel);
            const isHovered = hoveredChannel === s.channel;
            const isFiltered = selectedChannelFilter.includes(s.channel);
            const Icon = CHANNEL_ICONS[s.channel];
            const share = (s[metricMode] / totalMetric) * 100;

            return (
              <div
                key={s.channel}
                onMouseEnter={() => setHoveredChannel(s.channel)}
                onMouseLeave={() => setHoveredChannel(null)}
                onClick={() => onChannelSelect(s.channel)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isHovered || isFiltered
                    ? 'border-slate-300 bg-slate-50/90 shadow-2xs'
                    : 'border-slate-100 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: channelColor.primary }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900">{s.channel}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        {s.campaignsCount} {s.campaignsCount === 1 ? 'campaign' : 'campaigns'}
                      </span>
                    </div>
                  </div>

                  {/* Share % and Key Stat */}
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                        {metricMode === 'conversions' ? formatNumber(s.conversions) : formatCurrency(s[metricMode], true)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                        {formatPercent(share, 1)}
                      </div>
                    </div>
                    <div className="text-right pl-2 border-l border-slate-200">
                      <div className="text-xs font-bold font-mono text-emerald-600 tabular-nums">
                        {formatMultiplier(s.roas)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ROAS</div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(2, share)}%`,
                      backgroundColor: channelColor.primary,
                    }}
                  />
                </div>

                {/* Mini metrics footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tabular-nums mt-1.5 pt-1 border-t border-slate-100/70">
                  <span>Spend: {formatCurrency(s.spend, true)}</span>
                  <span>CTR: {formatPercent(s.ctr)}</span>
                  <span>CVR: {formatPercent(s.cvr)}</span>
                  <span>CPA: {formatCurrency(s.cpa)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
