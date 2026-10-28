import React, { useState, useMemo, useEffect } from 'react';
import { Campaign, ChannelType, CampaignStatus, DateRangePreset } from './types';
import {
  loadStoredCampaigns,
  saveStoredCampaigns,
  resetStoredCampaigns,
  computeAggregates,
} from './data/mockData';
import { exportCampaignsToCSV, formatCurrency, formatNumber } from './utils/formatters';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { OverTimeChart } from './components/OverTimeChart';
import { ChannelBreakdown } from './components/ChannelBreakdown';
import { TopCampaignsLeaderboard } from './components/TopCampaignsLeaderboard';
import { CampaignsTable } from './components/CampaignsTable';
import { CampaignDetailModal } from './components/CampaignDetailModal';
import { NewCampaignModal } from './components/NewCampaignModal';
import { Menu, X, RotateCcw } from 'lucide-react';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(loadStoredCampaigns);
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'channels' | 'trends'>('overview');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<ChannelType[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    saveStoredCampaigns(campaigns);
  }, [campaigns]);

  // Handle resetting data
  const handleResetData = () => {
    if (window.confirm('Reset all campaigns and metrics to original demo data?')) {
      const initial = resetStoredCampaigns();
      setCampaigns(initial);
      setSelectedChannelFilter([]);
    }
  };

  // Update status of a campaign
  const handleUpdateStatus = (campaignId: string, newStatus: CampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c))
    );
    if (selectedCampaign && selectedCampaign.id === campaignId) {
      setSelectedCampaign((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Add new campaign
  const handleAddCampaign = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
    setSelectedCampaign(newCampaign);
  };

  // Filter campaigns by channel if a channel is clicked
  const filteredCampaigns = useMemo(() => {
    if (selectedChannelFilter.length === 0) return campaigns;
    return campaigns.filter((c) => selectedChannelFilter.includes(c.channel));
  }, [campaigns, selectedChannelFilter]);

  // Aggregate metrics calculation
  const { summary, dailyTimeline } = useMemo(() => {
    return computeAggregates(filteredCampaigns, dateRange);
  }, [filteredCampaigns, dateRange]);

  // Sparkline data
  const sparklineData = useMemo(() => {
    return {
      impressions: dailyTimeline.map((d) => d.impressions),
      clicks: dailyTimeline.map((d) => d.clicks),
      conversions: dailyTimeline.map((d) => d.conversions),
      spend: dailyTimeline.map((d) => d.spend),
      revenue: dailyTimeline.map((d) => d.revenue),
    };
  }, [dailyTimeline]);

  // Budget totals for sidebar
  const totalSpend = useMemo(() => campaigns.reduce((acc, c) => acc + c.spend, 0), [campaigns]);
  const totalBudget = useMemo(() => campaigns.reduce((acc, c) => acc + c.budget, 0), [campaigns]);

  const handleChannelSelect = (channel: ChannelType) => {
    setSelectedChannelFilter((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleExportAll = () => {
    exportCampaignsToCSV(filteredCampaigns);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              totalSpend={totalSpend}
              totalBudget={totalBudget}
              onResetData={handleResetData}
            />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalSpend={totalSpend}
          totalBudget={totalBudget}
          onResetData={handleResetData}
        />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-900 text-sm">CampaignPulse</span>
          </div>
          <button
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md"
          >
            + Campaign
          </button>
        </div>

        {/* Desktop Header compliant with Top Bar Contract */}
        <Header
          activeTab={activeTab}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onOpenNewCampaignModal={() => setIsNewCampaignModalOpen(true)}
          onExportCSV={handleExportAll}
        />

        {/* Dashboard Canvas Area */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Active channel filter banner if any */}
          {selectedChannelFilter.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-4 py-2.5 text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Filtered by Channels:</span>
                <span className="font-medium">{selectedChannelFilter.join(', ')}</span>
              </div>
              <button
                onClick={() => setSelectedChannelFilter([])}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
              >
                Clear channel filter
              </button>
            </div>
          )}

          {/* 1. KPI Cards Strip */}
          <KPICards
            summary={summary}
            sparklineData={sparklineData}
            dateRangeLabel={dateRange.toUpperCase()}
          />

          {/* Tab Content Views */}
          {activeTab === 'overview' && (
            <>
              {/* 2-Column Split: Performance Over Time + Channel Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 flex flex-col">
                  <OverTimeChart data={dailyTimeline} />
                </div>
                <div className="lg:col-span-5 flex flex-col">
                  <ChannelBreakdown
                    campaigns={campaigns}
                    selectedChannelFilter={selectedChannelFilter}
                    onChannelSelect={handleChannelSelect}
                  />
                </div>
              </div>

              {/* Top Campaigns Spotlight Leaderboard */}
              <TopCampaignsLeaderboard
                campaigns={filteredCampaigns}
                onSelectCampaign={(c) => setSelectedCampaign(c)}
              />

              {/* Full Campaigns Data Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                    Campaign Performance Table
                  </h3>
                  <span className="text-xs text-slate-500">
                    Sort by any metric or click campaign for deep inspection
                  </span>
                </div>
                <CampaignsTable
                  campaigns={campaigns}
                  onSelectCampaign={(c) => setSelectedCampaign(c)}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenNewCampaignModal={() => setIsNewCampaignModalOpen(true)}
                />
              </div>
            </>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Inventory</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage active campaigns, adjust flight statuses, inspect budget allocation, and export reporting data
                </p>
              </div>
              <CampaignsTable
                campaigns={campaigns}
                onSelectCampaign={(c) => setSelectedCampaign(c)}
                onUpdateStatus={handleUpdateStatus}
                onOpenNewCampaignModal={() => setIsNewCampaignModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Channel Attribution & ROI</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Detailed distribution of spend and conversion efficiency across Search, Social, Email, and Display
                </p>
              </div>
              <ChannelBreakdown
                campaigns={campaigns}
                selectedChannelFilter={selectedChannelFilter}
                onChannelSelect={handleChannelSelect}
              />
              <TopCampaignsLeaderboard
                campaigns={filteredCampaigns}
                onSelectCampaign={(c) => setSelectedCampaign(c)}
              />
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Growth Trends</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect daily trajectory across impressions, traffic, conversions, and ROAS
                </p>
              </div>
              <OverTimeChart data={dailyTimeline} />
            </div>
          )}
        </main>
      </div>

      {/* Deep-dive Campaign Detail Modal */}
      <CampaignDetailModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Create New Campaign Modal */}
      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        onAddCampaign={handleAddCampaign}
      />
    </div>
  );
}
