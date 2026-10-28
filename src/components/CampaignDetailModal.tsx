import React from 'react';
import { Campaign, CampaignStatus } from '../types';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMultiplier,
  formatDate,
  getChannelColor,
  getStatusStyle,
} from '../utils/formatters';
import {
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Eye,
  MousePointerClick,
  Share2,
  Play,
  Pause,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface CampaignDetailModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onUpdateStatus: (campaignId: string, status: CampaignStatus) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  onClose,
  onUpdateStatus,
}) => {
  if (!campaign) return null;

  const channelColor = getChannelColor(campaign.channel);
  const statusStyle = getStatusStyle(campaign.status);

  const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const cvr = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
  const roas = campaign.spend > 0 ? campaign.revenue / campaign.spend : 0;
  const cpc = campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0;
  const cpa = campaign.conversions > 0 ? campaign.spend / campaign.conversions : 0;
  const budgetPacing = campaign.budget > 0 ? (campaign.spend / campaign.budget) * 100 : 0;

  // Mini 14-day trend line for this campaign
  const recentDays = campaign.dailyData.slice(-14);
  const maxRecentSpend = Math.max(...recentDays.map((d) => d.spend), 1);
  const maxRecentRev = Math.max(...recentDays.map((d) => d.revenue), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* Unboxed metadata row */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold" style={{ color: channelColor.primary }}>
                {campaign.channel}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className={`w-2 h-2 rounded-full ${statusStyle.dotColor}`} />
                <span>{campaign.status}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>ID: {campaign.id}</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {campaign.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Total Spend
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                {formatCurrency(campaign.spend)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Budget: {formatCurrency(campaign.budget)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Revenue
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                {formatCurrency(campaign.revenue)}
              </span>
              <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                ROAS {formatMultiplier(roas)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Conversions
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                {formatNumber(campaign.conversions)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                CVR {formatPercent(cvr)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Traffic & CTR
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                {formatNumber(campaign.clicks)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                CTR {formatPercent(ctr)}
              </span>
            </div>
          </div>

          {/* Budget Pacing Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Budget Utilization & Pacing</span>
              <span className="font-mono text-slate-600 tabular-nums">
                {formatCurrency(campaign.spend)} / {formatCurrency(campaign.budget)} ({budgetPacing.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetPacing > 95
                    ? 'bg-rose-500'
                    : budgetPacing > 75
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, budgetPacing)}%` }}
              />
            </div>
          </div>

          {/* Unit Economics Breakdown */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <h4 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Unit Economics & Efficiency
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
              <div>
                <span className="text-slate-400 block text-[11px]">Cost Per Click (CPC)</span>
                <span className="text-base font-bold text-slate-800">{formatCurrency(cpc)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cost Per Acquisition (CPA)</span>
                <span className="text-base font-bold text-slate-800">{formatCurrency(cpa)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Impressions</span>
                <span className="text-base font-bold text-slate-800">{formatNumber(campaign.impressions)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Net Margin</span>
                <span className="text-base font-bold text-emerald-600">
                  {formatCurrency(campaign.revenue - campaign.spend)}
                </span>
              </div>
            </div>
          </div>

          {/* Target Audience & Campaign Strategy */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-800 block mb-1">Target Audience</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {campaign.targetAudience}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">Campaign Objective</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {campaign.objective}
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Flight: {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* 14-Day Micro Daily Performance Chart */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-2">14-Day Spend & Revenue History</h4>
            <div className="h-20 flex items-end gap-1.5 pt-4 pb-1 px-2 bg-slate-50 rounded-lg border border-slate-100">
              {recentDays.map((d, idx) => {
                const spendHeight = Math.max(4, (d.spend / maxRecentSpend) * 44);
                const revHeight = Math.max(4, (d.revenue / maxRecentRev) * 44);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="w-full flex items-end justify-center gap-0.5">
                      <div
                        className="w-1.5 bg-blue-400 rounded-t-xs"
                        style={{ height: `${spendHeight}px` }}
                        title={`Spend: ${formatCurrency(d.spend)}`}
                      />
                      <div
                        className="w-1.5 bg-emerald-500 rounded-t-xs"
                        style={{ height: `${revHeight}px` }}
                        title={`Revenue: ${formatCurrency(d.revenue)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-blue-400" /> Spend
                <span className="w-2 h-2 rounded-xs bg-emerald-500 ml-2" /> Revenue
              </span>
              <span>Past 14 days activity</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
                onUpdateStatus(campaign.id, newStatus);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                campaign.status === 'Active'
                  ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              {campaign.status === 'Active' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Campaign</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Activate Campaign</span>
                </>
              )}
            </button>

            {campaign.status !== 'Completed' && (
              <button
                onClick={() => onUpdateStatus(campaign.id, 'Completed')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
              >
                Mark Completed
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
