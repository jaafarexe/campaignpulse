import React, { useState, useMemo, useRef } from 'react';
import { MetricType } from '../types';
import { formatCurrency, formatNumber, formatPercent, formatMultiplier, formatDate } from '../utils/formatters';
import { Calendar, Layers, Activity } from 'lucide-react';

interface TimelineDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  cvr: number;
}

interface OverTimeChartProps {
  data: TimelineDataPoint[];
}

const METRIC_CONFIG: Record<
  MetricType,
  {
    label: string;
    color: string;
    format: (v: number) => string;
    unit: string;
  }
> = {
  revenue: {
    label: 'Revenue',
    color: '#10b981', // Emerald
    format: (v) => formatCurrency(v),
    unit: '$',
  },
  spend: {
    label: 'Spend',
    color: '#3b82f6', // Blue
    format: (v) => formatCurrency(v),
    unit: '$',
  },
  impressions: {
    label: 'Impressions',
    color: '#f59e0b', // Amber
    format: (v) => formatNumber(v),
    unit: 'views',
  },
  clicks: {
    label: 'Clicks',
    color: '#6366f1', // Indigo
    format: (v) => formatNumber(v),
    unit: 'clicks',
  },
  conversions: {
    label: 'Conversions',
    color: '#8b5cf6', // Violet
    format: (v) => formatNumber(v),
    unit: 'leads/sales',
  },
  roas: {
    label: 'ROAS',
    color: '#ec4899', // Pink
    format: (v) => formatMultiplier(v),
    unit: 'multiplier',
  },
};

export const OverTimeChart: React.FC<OverTimeChartProps> = ({ data }) => {
  const [primaryMetric, setPrimaryMetric] = useState<MetricType>('revenue');
  const [secondaryMetric, setSecondaryMetric] = useState<MetricType | 'none'>('spend');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group data if necessary or use daily
  const displayData = data;

  const width = 860;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };

  const primaryValues = useMemo(() => {
    return displayData.map((d) => d[primaryMetric]);
  }, [displayData, primaryMetric]);

  const secondaryValues = useMemo(() => {
    if (secondaryMetric === 'none') return [];
    return displayData.map((d) => d[secondaryMetric]);
  }, [displayData, secondaryMetric]);

  // Max and Min scales
  const primaryMax = useMemo(() => {
    const max = Math.max(...primaryValues, 1);
    return max * 1.1; // Add 10% headroom
  }, [primaryValues]);

  const secondaryMax = useMemo(() => {
    if (secondaryMetric === 'none' || secondaryValues.length === 0) return 1;
    const max = Math.max(...secondaryValues, 1);
    return max * 1.1;
  }, [secondaryValues, secondaryMetric]);

  // Coordinates builder
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getPoints = (values: number[], max: number) => {
    if (values.length === 0) return '';
    return values
      .map((val, idx) => {
        const x = padding.left + (idx / Math.max(1, values.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (val / max) * chartHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const primaryPoints = getPoints(primaryValues, primaryMax);
  const secondaryPoints = secondaryMetric !== 'none' ? getPoints(secondaryValues, secondaryMax) : '';

  // Area path for primary
  const primaryArea = useMemo(() => {
    if (primaryValues.length < 2) return '';
    const firstX = padding.left;
    const lastX = padding.left + chartWidth;
    const bottomY = padding.top + chartHeight;
    return `${primaryPoints} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [primaryPoints, primaryValues, chartWidth, chartHeight, padding]);

  // Grid lines (4 horizontal steps)
  const gridSteps = 4;
  const yGridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const ratio = i / gridSteps;
    const y = padding.top + chartHeight * (1 - ratio);
    const value = primaryMax * ratio;
    return { y, value };
  });

  // Calculate mouse position for interactive tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || displayData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    if (relativeX < padding.left || relativeX > width - padding.right) {
      setHoverIndex(null);
      return;
    }

    const effectiveWidth = width - padding.left - padding.right;
    const normalized = (relativeX - padding.left) / effectiveWidth;
    const index = Math.round(normalized * (displayData.length - 1));
    const clampedIndex = Math.max(0, Math.min(displayData.length - 1, index));
    setHoverIndex(clampedIndex);
  };

  const activePoint = hoverIndex !== null ? displayData[hoverIndex] : displayData[displayData.length - 1];
  const activeX =
    hoverIndex !== null
      ? padding.left + (hoverIndex / Math.max(1, displayData.length - 1)) * chartWidth
      : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs" ref={containerRef}>
      {/* Top Chart Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Performance Over Time</h3>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {displayData.length} Days Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare growth trends across campaign volume, engagement, and revenue efficiency
          </p>
        </div>

        {/* Metric Selector & Comparison Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Metric Buttons */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-lg">
            {(['revenue', 'spend', 'impressions', 'clicks', 'conversions', 'roas'] as MetricType[]).map((m) => {
              const active = primaryMetric === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setPrimaryMetric(m);
                    if (secondaryMetric === m) setSecondaryMetric('none');
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {METRIC_CONFIG[m].label}
                </button>
              );
            })}
          </div>

          {/* Secondary Comparison Select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400">Compare:</span>
            <select
              value={secondaryMetric}
              onChange={(e) => setSecondaryMetric(e.target.value as MetricType | 'none')}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="none">None</option>
              {(['spend', 'revenue', 'clicks', 'impressions', 'conversions', 'roas'] as MetricType[])
                .filter((m) => m !== primaryMetric)
                .map((m) => (
                  <option key={m} value={m}>
                    {METRIC_CONFIG[m].label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Point Detail Summary Banner */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-3.5 my-3 bg-slate-50/80 rounded-lg border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 font-mono">{formatDate(activePoint.date)}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              {hoverIndex !== null ? 'Inspect Date' : 'Latest Available'}
            </span>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: METRIC_CONFIG[primaryMetric].color }}
              />
              <span className="text-slate-500">{METRIC_CONFIG[primaryMetric].label}:</span>
              <span className="font-bold font-mono text-slate-900 tabular-nums">
                {METRIC_CONFIG[primaryMetric].format(activePoint[primaryMetric])}
              </span>
            </div>

            {secondaryMetric !== 'none' && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white"
                  style={{ backgroundColor: METRIC_CONFIG[secondaryMetric].color }}
                />
                <span className="text-slate-500">{METRIC_CONFIG[secondaryMetric].label}:</span>
                <span className="font-bold font-mono text-slate-900 tabular-nums">
                  {METRIC_CONFIG[secondaryMetric].format(activePoint[secondaryMetric])}
                </span>
              </div>
            )}

            <div className="text-slate-400 hidden sm:inline">·</div>

            <div className="flex items-center gap-3 text-slate-500 font-mono tabular-nums text-[11px]">
              <span>CTR: {formatPercent(activePoint.ctr)}</span>
              <span>CVR: {formatPercent(activePoint.cvr)}</span>
              <span>ROAS: {formatMultiplier(activePoint.roas)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main SVG Area/Line Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={METRIC_CONFIG[primaryMetric].color} stopOpacity="0.28" />
              <stop offset="85%" stopColor={METRIC_CONFIG[primaryMetric].color} stopOpacity="0.02" />
              <stop offset="100%" stopColor={METRIC_CONFIG[primaryMetric].color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yGridLines.map(({ y, value }, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={i === 0 ? '' : '3 3'}
                strokeWidth={i === 0 ? '1.5' : '1'}
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 tabular-nums"
              >
                {METRIC_CONFIG[primaryMetric].format(value)}
              </text>
            </g>
          ))}

          {/* Primary Metric Fill Area */}
          {primaryArea && <path d={`M ${primaryArea}`} fill="url(#primaryAreaGrad)" />}

          {/* Secondary Metric Line (dashed for high contrast distinction) */}
          {secondaryMetric !== 'none' && secondaryPoints && (
            <polyline
              fill="none"
              stroke={METRIC_CONFIG[secondaryMetric].color}
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={secondaryPoints}
            />
          )}

          {/* Primary Metric Line */}
          {primaryPoints && (
            <polyline
              fill="none"
              stroke={METRIC_CONFIG[primaryMetric].color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={primaryPoints}
            />
          )}

          {/* Interactive Hover Crosshair */}
          {activeX !== null && hoverIndex !== null && (
            <g>
              <line
                x1={activeX}
                y1={padding.top}
                x2={activeX}
                y2={padding.top + chartHeight}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Point dot on primary */}
              <circle
                cx={activeX}
                cy={
                  padding.top +
                  chartHeight -
                  (displayData[hoverIndex][primaryMetric] / primaryMax) * chartHeight
                }
                r="5"
                fill={METRIC_CONFIG[primaryMetric].color}
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Point dot on secondary if active */}
              {secondaryMetric !== 'none' && (
                <circle
                  cx={activeX}
                  cy={
                    padding.top +
                    chartHeight -
                    (displayData[hoverIndex][secondaryMetric] / secondaryMax) * chartHeight
                  }
                  r="5"
                  fill={METRIC_CONFIG[secondaryMetric].color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* X-Axis Date Ticks */}
          {displayData.map((d, idx) => {
            // Pick ~6-8 evenly spaced labels
            const step = Math.max(1, Math.floor(displayData.length / 6));
            if (idx % step !== 0 && idx !== displayData.length - 1) return null;

            const x = padding.left + (idx / Math.max(1, displayData.length - 1)) * chartWidth;
            const [, m, day] = d.date.split('-');

            return (
              <text
                key={d.date}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-400 tabular-nums"
              >
                {`${m}/${day}`}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend & Guide */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-1 rounded-full"
              style={{ backgroundColor: METRIC_CONFIG[primaryMetric].color }}
            />
            <span className="font-medium text-slate-700">{METRIC_CONFIG[primaryMetric].label} (Primary)</span>
          </div>

          {secondaryMetric !== 'none' && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 border-b-2 border-dashed"
                style={{ borderColor: METRIC_CONFIG[secondaryMetric].color }}
              />
              <span className="font-medium text-slate-700">
                {METRIC_CONFIG[secondaryMetric].label} (Secondary Scale)
              </span>
            </div>
          )}
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Tip: Hover over data points to inspect daily performance metrics
        </span>
      </div>
    </div>
  );
};
