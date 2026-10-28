import React from 'react';
import { MetricSummary } from '../types';
import { formatCurrency, formatNumber, formatPercent, formatMultiplier } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointerClick, Target, BarChart2 } from 'lucide-react';

interface KPICardsProps {
  summary: MetricSummary;
  sparklineData: {
    impressions: number[];
    clicks: number[];
    conversions: number[];
    spend: number[];
    revenue: number[];
  };
  dateRangeLabel: string;
}

// Mini SVG sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 110;
  const height = 32;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, sparklineData, dateRangeLabel }) => {
  // Calculate percentage changes
  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const spendTrend = calcTrend(summary.spend, summary.prevSpend);
  const revenueTrend = calcTrend(summary.revenue, summary.prevRevenue);
  const roasTrend = calcTrend(summary.roas, summary.prevRoas);
  const impTrend = calcTrend(summary.impressions, summary.prevImpressions);
  const clickTrend = calcTrend(summary.clicks, summary.prevClicks);
  const convTrend = calcTrend(summary.conversions, summary.prevConversions);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Revenue & ROAS */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatCurrency(summary.revenue, true)}
          </span>
          <span className="text-xs font-mono font-medium text-emerald-600 tabular-nums">
            {formatMultiplier(summary.roas)} ROAS
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-1">
            {revenueTrend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span
              className={`text-xs font-mono font-semibold tabular-nums ${
                revenueTrend >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {revenueTrend >= 0 ? '+' : ''}
              {revenueTrend.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">vs prev {dateRangeLabel}</span>
          </div>
          <Sparkline data={sparklineData.revenue} color="#10b981" />
        </div>
      </div>

      {/* 2. Total Ad Spend */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ad Spend</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatCurrency(summary.spend, true)}
          </span>
          <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
            CPC {formatCurrency(summary.cpc)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-600">
              {spendTrend >= 0 ? '+' : ''}
              {spendTrend.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">spend pacing</span>
          </div>
          <Sparkline data={sparklineData.spend} color="#3b82f6" />
        </div>
      </div>

      {/* 3. Conversions & CPA */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conversions</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatNumber(summary.conversions)}
          </span>
          <span className="text-xs font-mono font-medium text-purple-700 tabular-nums">
            {formatPercent(summary.cvr)} CVR
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-1">
            {convTrend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span
              className={`text-xs font-mono font-semibold tabular-nums ${
                convTrend >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {convTrend >= 0 ? '+' : ''}
              {convTrend.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">CPA {formatCurrency(summary.cpa)}</span>
          </div>
          <Sparkline data={sparklineData.conversions} color="#8b5cf6" />
        </div>
      </div>

      {/* 4. Clicks & CTR */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clicks</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatNumber(summary.clicks, true)}
          </span>
          <span className="text-xs font-mono font-medium text-indigo-700 tabular-nums">
            {formatPercent(summary.ctr)} CTR
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-1">
            {clickTrend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span
              className={`text-xs font-mono font-semibold tabular-nums ${
                clickTrend >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {clickTrend >= 0 ? '+' : ''}
              {clickTrend.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">traffic</span>
          </div>
          <Sparkline data={sparklineData.clicks} color="#6366f1" />
        </div>
      </div>

      {/* 5. Impressions */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Impressions</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatNumber(summary.impressions, true)}
          </span>
          <span className="text-xs font-mono font-medium text-amber-700 tabular-nums">
            Reach
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-1">
            {impTrend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span
              className={`text-xs font-mono font-semibold tabular-nums ${
                impTrend >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {impTrend >= 0 ? '+' : ''}
              {impTrend.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">volume</span>
          </div>
          <Sparkline data={sparklineData.impressions} color="#f59e0b" />
        </div>
      </div>
    </div>
  );
};
