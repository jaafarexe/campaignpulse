import React, { useState, useMemo } from 'react';
import { Campaign, ChannelType, CampaignStatus } from '../types';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMultiplier,
  getChannelColor,
  getStatusStyle,
  exportCampaignsToCSV,
} from '../utils/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  SlidersHorizontal,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Share2,
  Search as SearchIcon,
  Mail,
  Monitor,
} from 'lucide-react';

interface CampaignsTableProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onUpdateStatus: (campaignId: string, newStatus: CampaignStatus) => void;
  onOpenNewCampaignModal: () => void;
}

type SortField =
  | 'name'
  | 'channel'
  | 'status'
  | 'spend'
  | 'impressions'
  | 'clicks'
  | 'ctr'
  | 'conversions'
  | 'cvr'
  | 'revenue'
  | 'roas';

const CHANNEL_ICONS: Record<ChannelType, React.ElementType> = {
  Social: Share2,
  Search: SearchIcon,
  Email: Mail,
  Display: Monitor,
};

export const CampaignsTable: React.FC<CampaignsTableProps> = ({
  campaigns,
  onSelectCampaign,
  onUpdateStatus,
  onOpenNewCampaignModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'All' | ChannelType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CampaignStatus>('All');
  const [sortField, setSortField] = useState<SortField>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesAudience = c.targetAudience.toLowerCase().includes(query);
        const matchesObjective = c.objective.toLowerCase().includes(query);
        if (!matchesName && !matchesAudience && !matchesObjective) return false;
      }

      // Channel
      if (channelFilter !== 'All' && c.channel !== channelFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [campaigns, searchQuery, channelFilter, statusFilter]);

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'channel':
          valA = a.channel;
          valB = b.channel;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'spend':
          valA = a.spend;
          valB = b.spend;
          break;
        case 'impressions':
          valA = a.impressions;
          valB = b.impressions;
          break;
        case 'clicks':
          valA = a.clicks;
          valB = b.clicks;
          break;
        case 'ctr':
          valA = a.impressions > 0 ? a.clicks / a.impressions : 0;
          valB = b.impressions > 0 ? b.clicks / b.impressions : 0;
          break;
        case 'conversions':
          valA = a.conversions;
          valB = b.conversions;
          break;
        case 'cvr':
          valA = a.clicks > 0 ? a.conversions / a.clicks : 0;
          valB = b.clicks > 0 ? b.conversions / b.clicks : 0;
          break;
        case 'revenue':
          valA = a.revenue;
          valB = b.revenue;
          break;
        case 'roas':
          valA = a.spend > 0 ? a.revenue / a.spend : 0;
          valB = b.spend > 0 ? b.revenue / b.spend : 0;
          break;
        default:
          valA = a.spend;
          valB = b.spend;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCampaigns, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(sortedCampaigns.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportSelected = () => {
    const toExport =
      selectedIds.size > 0
        ? campaigns.filter((c) => selectedIds.has(c.id))
        : sortedCampaigns;
    exportCampaignsToCSV(toExport);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setChannelFilter('All');
    setStatusFilter('All');
  };

  const isFiltered = searchQuery !== '' || channelFilter !== 'All' || statusFilter !== 'All';

  // Total summary of current filtered table view
  const totalSpend = sortedCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = sortedCampaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, audience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Channel Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['All', 'Search', 'Social', 'Email', 'Display'] as const).map((ch) => {
              const active = channelFilter === ch;
              return (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    active ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 ml-1"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}</span>
          </button>

          <button
            onClick={onOpenNewCampaignModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold tracking-tight">
              <th className="py-2.5 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    sortedCampaigns.length > 0 && selectedIds.size === sortedCampaigns.length
                  }
                  onChange={handleSelectAll}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
              </th>

              {/* Campaign Name */}
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3.5 cursor-pointer hover:text-slate-900 min-w-[220px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Campaign</span>
                  {sortField === 'name' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>

              {/* Channel */}
              <th
                onClick={() => handleSort('channel')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <span>Channel</span>
                  {sortField === 'channel' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Status */}
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {sortField === 'status' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Spend */}
              <th
                onClick={() => handleSort('spend')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Spend</span>
                  {sortField === 'spend' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Impressions */}
              <th
                onClick={() => handleSort('impressions')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Impr.</span>
                  {sortField === 'impressions' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Clicks */}
              <th
                onClick={() => handleSort('clicks')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Clicks</span>
                  {sortField === 'clicks' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* CTR */}
              <th
                onClick={() => handleSort('ctr')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>CTR</span>
                  {sortField === 'ctr' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Conversions */}
              <th
                onClick={() => handleSort('conversions')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Conv.</span>
                  {sortField === 'conversions' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Conv Rate */}
              <th
                onClick={() => handleSort('cvr')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>CVR</span>
                  {sortField === 'cvr' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Revenue */}
              <th
                onClick={() => handleSort('revenue')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Revenue</span>
                  {sortField === 'revenue' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* ROAS */}
              <th
                onClick={() => handleSort('roas')}
                className="py-2.5 px-3.5 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>ROAS</span>
                  {sortField === 'roas' &&
                    (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {/* Quick Actions */}
              <th className="py-2.5 px-3 text-center w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedCampaigns.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium text-slate-600">No campaigns found matching criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term</p>
                  <button
                    onClick={resetFilters}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            ) : (
              sortedCampaigns.map((camp) => {
                const isSelected = selectedIds.has(camp.id);
                const channelColor = getChannelColor(camp.channel);
                const statusStyle = getStatusStyle(camp.status);
                const ChannelIcon = CHANNEL_ICONS[camp.channel];

                const ctr = camp.impressions > 0 ? (camp.clicks / camp.impressions) * 100 : 0;
                const cvr = camp.clicks > 0 ? (camp.conversions / camp.clicks) * 100 : 0;
                const roas = camp.spend > 0 ? camp.revenue / camp.spend : 0;

                return (
                  <tr
                    key={camp.id}
                    className={`hover:bg-slate-50/70 transition-colors group ${
                      isSelected ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(camp.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </td>

                    {/* Campaign Name */}
                    <td
                      className="py-3 px-3.5 cursor-pointer"
                      onClick={() => onSelectCampaign(camp)}
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {camp.objective}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <ChannelIcon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: channelColor.primary }}
                        />
                        <span>{camp.channel}</span>
                      </div>
                    </td>

                    {/* Status with clean unboxed indicator */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusStyle.dotColor}`} />
                        <span>{camp.status}</span>
                      </div>
                    </td>

                    {/* Spend */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                      {formatCurrency(camp.spend)}
                    </td>

                    {/* Impressions */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatNumber(camp.impressions)}
                    </td>

                    {/* Clicks */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatNumber(camp.clicks)}
                    </td>

                    {/* CTR */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-700">
                      {formatPercent(ctr)}
                    </td>

                    {/* Conversions */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 font-semibold">
                      {formatNumber(camp.conversions)}
                    </td>

                    {/* CVR */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatPercent(cvr)}
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 font-bold">
                      {formatCurrency(camp.revenue)}
                    </td>

                    {/* ROAS with subtle color tier */}
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`font-bold ${
                          roas >= 4.0
                            ? 'text-emerald-600'
                            : roas >= 2.5
                            ? 'text-slate-800'
                            : 'text-amber-600'
                        }`}
                      >
                        {formatMultiplier(roas)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectCampaign(camp)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="View Campaign Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const newStatus: CampaignStatus =
                              camp.status === 'Active' ? 'Paused' : 'Active';
                            onUpdateStatus(camp.id, newStatus);
                          }}
                          className={`p-1 rounded transition-colors ${
                            camp.status === 'Active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={camp.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
                        >
                          {camp.status === 'Active' ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary & Count */}
      <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span>Showing </span>
          <span className="font-semibold font-mono text-slate-900">{sortedCampaigns.length}</span>
          <span> of </span>
          <span className="font-semibold font-mono text-slate-900">{campaigns.length}</span>
          <span> total campaigns</span>
        </div>

        {/* Aggregated Totals of current view */}
        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <div>
            <span className="text-slate-400 mr-1.5">View Spend:</span>
            <span className="font-bold text-slate-900">{formatCurrency(totalSpend, true)}</span>
          </div>
          <div>
            <span className="text-slate-400 mr-1.5">View Revenue:</span>
            <span className="font-bold text-slate-900">{formatCurrency(totalRevenue, true)}</span>
          </div>
          <div>
            <span className="text-slate-400 mr-1.5">Avg ROAS:</span>
            <span className="font-bold text-emerald-600">{formatMultiplier(totalROAS)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
