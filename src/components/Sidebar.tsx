import React from 'react';
import {
  LayoutDashboard,
  Megaphone,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SidebarProps {
  activeTab: 'overview' | 'campaigns' | 'channels' | 'trends';
  setActiveTab: (tab: 'overview' | 'campaigns' | 'channels' | 'trends') => void;
  totalSpend: number;
  totalBudget: number;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  totalSpend,
  totalBudget,
  onResetData,
}) => {
  const budgetPercent = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  const navItems: { id: 'overview' | 'campaigns' | 'channels' | 'trends'; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'channels', label: 'Channels', icon: PieChart },
    { id: 'trends', label: 'Performance Trends', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Top Brand & Navigation */}
      <div>
        {/* Brand Area */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              CampaignPulse
            </h1>
            <span className="text-[11px] font-medium text-slate-400">Marketing Analytics</span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Budget Pacing Meter & User Info */}
      <div className="p-4 space-y-4 border-t border-slate-800/80">
        {/* Total Ad Spend Pacing */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 font-medium">Q4 Budget Pacing</span>
            <span className="text-indigo-400 font-mono font-semibold tabular-nums">
              {budgetPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
            <span>{formatCurrency(totalSpend, true)}</span>
            <span>Target: {formatCurrency(totalBudget, true)}</span>
          </div>
        </div>

        {/* Reset to Sample Data */}
        <button
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
          title="Restore original sample demo campaigns"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>

        {/* User Workspace Profile */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            CP
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">Marketing Director</div>
            <div className="text-[11px] text-slate-400 truncate">Enterprise Analytics</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
