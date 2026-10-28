import React from 'react';
import { DateRangePreset } from '../types';
import { Plus, Download, Calendar, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  dateRange: DateRangePreset;
  setDateRange: (range: DateRangePreset) => void;
  onOpenNewCampaignModal: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  dateRange,
  setDateRange,
  onOpenNewCampaignModal,
  onExportCSV,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'campaigns':
        return 'All Campaigns';
      case 'channels':
        return 'Channel Breakdown';
      case 'trends':
        return 'Performance Trends';
      default:
        return 'Marketing Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-20">
      {/* Zone 1: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0">
        <span className="font-semibold text-slate-900">CampaignPulse</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500">Marketing Analytics</span>
        <span className="text-slate-300">/</span>
        <span className="text-indigo-600 font-semibold">{getTabTitle()}</span>
      </div>

      {/* Zone 2: Date Range Filter Buttons */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <span className="flex items-center gap-1 px-2 text-xs text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>Range:</span>
        </span>
        {(
          [
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '90d', label: '90D' },
            { id: 'ytd', label: 'YTD' },
          ] as { id: DateRangePreset; label: string }[]
        ).map((preset) => {
          const isActive = dateRange === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setDateRange(preset.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onExportCSV}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
          title="Export complete campaign report"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onOpenNewCampaignModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Campaign</span>
        </button>
      </div>
    </header>
  );
};
