import React, { useState } from 'react';
import { Campaign } from '../types';
import { formatCurrency, formatNumber, formatMultiplier, formatPercent, getChannelColor, getStatusStyle } from '../utils/formatters';
import { Award, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

interface TopCampaignsLeaderboardProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
}

export const TopCampaignsLeaderboard: React.FC<TopCampaignsLeaderboardProps> = ({
  campaigns,
  onSelectCampaign,
}) => {
  const [rankBy, setRankBy] = useState<'roas' | 'revenue' | 'conversions'>('roas');

  const sortedCampaigns = [...campaigns]
    .sort((a, b) => {
      if (rankBy === 'roas') {
        const roasA = a.spend > 0 ? a.revenue / a.spend : 0;
        const roasB = b.spend > 0 ? b.revenue / b.spend : 0;
        return roasB - roasA;
      }
      if (rankBy === 'revenue') {
        return b.revenue - a.revenue;
      }
      return b.conversions - a.conversions;
    })
    .slice(0, 5);

  const maxVal =
    sortedCampaigns.length > 0
      ? rankBy === 'roas'
        ? Math.max(...sortedCampaigns.map((c) => (c.spend > 0 ? c.revenue / c.spend : 0)))
        : Math.max(...sortedCampaigns.map((c) => c[rankBy]))
      : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header & Metric Picker */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Top Performing Campaigns</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by marketing return and conversion efficiency</p>
          </div>
        </div>

        {/* Rank By switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setRankBy('roas')}
            className={`px-2 py-1 rounded-md transition-colors ${
              rankBy === 'roas' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ROAS
          </button>
          <button
            onClick={() => setRankBy('revenue')}
            className={`px-2 py-1 rounded-md transition-colors ${
              rankBy === 'revenue' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setRankBy('conversions')}
            className={`px-2 py-1 rounded-md transition-colors ${
              rankBy === 'conversions' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversions
          </button>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-3 my-3">
        {sortedCampaigns.map((camp, index) => {
          const roas = camp.spend > 0 ? camp.revenue / camp.spend : 0;
          const channelColor = getChannelColor(camp.channel);
          const statusStyle = getStatusStyle(camp.status);
          const currentVal = rankBy === 'roas' ? roas : camp[rankBy];
          const barPercent = (currentVal / maxVal) * 100;

          return (
            <div
              key={camp.id}
              onClick={() => onSelectCampaign(camp)}
              className="group p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      index === 0
                        ? 'bg-amber-100 text-amber-800'
                        : index === 1
                        ? 'bg-slate-200 text-slate-700'
                        : index === 2
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {camp.name}
                    </h4>
                    {/* Unboxed metadata per Section 1.A zero-pill discipline */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium" style={{ color: channelColor.primary }}>
                        {camp.channel}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotColor}`} />
                        <span>{camp.status}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Budget: {formatCurrency(camp.budget, true)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-slate-900 tabular-nums flex items-center justify-end gap-1">
                    {rankBy === 'roas' && (
                      <span className="text-emerald-600 font-bold">{formatMultiplier(roas)}</span>
                    )}
                    {rankBy === 'revenue' && formatCurrency(camp.revenue, true)}
                    {rankBy === 'conversions' && `${formatNumber(camp.conversions)} conv.`}
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Spend: {formatCurrency(camp.spend, true)}
                  </div>
                </div>
              </div>

              {/* Relative performance bar */}
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.max(5, barPercent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">Calculated based on current active period</span>
        <span className="text-[11px] font-medium text-indigo-600">Click any campaign for deep-dive</span>
      </div>
    </div>
  );
};
