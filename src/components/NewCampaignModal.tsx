import React, { useState } from 'react';
import { Campaign, ChannelType, CampaignStatus, DailyMetric } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCampaign: (newCampaign: Campaign) => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onAddCampaign,
}) => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<ChannelType>('Search');
  const [budget, setBudget] = useState<string>('25000');
  const [targetAudience, setTargetAudience] = useState('');
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('Active');
  const [startDate, setStartDate] = useState('2026-10-24');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a campaign name');
      return;
    }
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setError('Please provide a valid budget');
      return;
    }

    // Generate initial realistic sample data for 30 days
    const daysCount = 30;
    const initialSpend = Math.round(numBudget * 0.25);
    const roasBenchmark = channel === 'Email' ? 6.2 : channel === 'Search' ? 4.5 : channel === 'Social' ? 3.4 : 2.4;
    const ctrBenchmark = channel === 'Email' ? 0.08 : channel === 'Search' ? 0.042 : channel === 'Social' ? 0.023 : 0.009;
    const cvrBenchmark = channel === 'Email' ? 0.055 : channel === 'Search' ? 0.048 : channel === 'Social' ? 0.024 : 0.019;

    const initialImpressions = Math.round(initialSpend * (channel === 'Display' ? 120 : channel === 'Social' ? 50 : 15));
    const initialClicks = Math.round(initialImpressions * ctrBenchmark);
    const initialConversions = Math.round(initialClicks * cvrBenchmark);
    const initialRevenue = Math.round(initialSpend * roasBenchmark);

    // Create 30 days history
    const dailyData: DailyMetric[] = [];
    const today = new Date(2026, 9, 24);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dailySpend = Math.round(initialSpend / daysCount);
      const dailyImpressions = Math.round(initialImpressions / daysCount);
      const dailyClicks = Math.max(1, Math.round(initialClicks / daysCount));
      const dailyConversions = Math.max(1, Math.round(initialConversions / daysCount));
      const dailyRevenue = Math.round(initialRevenue / daysCount);

      dailyData.push({
        date: dateStr,
        impressions: dailyImpressions,
        clicks: dailyClicks,
        conversions: dailyConversions,
        spend: dailySpend,
        revenue: dailyRevenue,
      });
    }

    const newCampaign: Campaign = {
      id: `camp-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      channel,
      status,
      startDate,
      endDate,
      budget: numBudget,
      spend: initialSpend,
      impressions: initialImpressions,
      clicks: initialClicks,
      conversions: initialConversions,
      revenue: initialRevenue,
      targetAudience: targetAudience.trim() || `Targeted ${channel} audience segment`,
      objective: objective.trim() || 'Accelerate conversion volume and high-intent acquisition',
      dailyData,
    };

    onAddCampaign(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create New Campaign</h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure budget, targeting, and launch channel</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Q4 Black Friday - Search High Intent"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Search">Search (Google / Bing)</option>
                <option value="Social">Social (Meta / LinkedIn / X)</option>
                <option value="Email">Email (Lifecycle & Drops)</option>
                <option value="Display">Display (Programmatic & GDN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">Active (Launch immediately)</option>
                <option value="Draft">Draft (Save for review)</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Budget ($)</label>
              <input
                type="number"
                min="500"
                step="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
            <input
              type="text"
              placeholder="e.g. Enterprise marketing managers searching analytics tools"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Objective</label>
            <input
              type="text"
              placeholder="e.g. Drive 1,000+ trial signups with positive ROAS"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Launch Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
