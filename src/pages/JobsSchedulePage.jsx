import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  CalendarCheck,
  Clock,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Inbox,
  Play,
  Briefcase,
  Star,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { JobCard, getStatusStyle } from '../components/Jobs/JobCard';
import { JobDetailsDrawer } from '../components/Jobs/JobDetailsDrawer';
import { ScheduleCalendarView } from '../components/Jobs/ScheduleCalendarView';
import { CustomerReviewsView } from '../components/Jobs/CustomerReviewsView';

export const JobsSchedulePage = () => {
  const { worker, toggleAvailability } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary page view: 'jobs' | 'schedule' | 'reviews'
  const activeView = searchParams.get('view') || 'jobs';
  // Active job status tab: 'all' | 'pending' | 'accepted' | 'in-progress' | 'completed' | 'rejected' | 'cancelled'
  const activeTab = searchParams.get('tab') || 'all';

  // State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected job for Details Drawer
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [layoutMode, setLayoutMode] = useState('cards'); // 'cards' | 'table'

  const payoutRate = worker?.payoutRate || 0.75;

  // Load all data
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError('');

      const [statsRes, jobsRes, scheduleRes] = await Promise.all([
        api.getJobStats().catch(() => ({ success: false })),
        api.getJobs({
          tab: activeTab,
          search: searchQuery,
          category: categoryFilter !== 'all' ? categoryFilter : '',
          timeframe: timeframeFilter !== 'all' ? timeframeFilter : '',
          sort: sortBy,
        }),
        api.getSchedule().catch(() => ({ success: false })),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (jobsRes.success) {
        setJobs(jobsRes.bookings || []);
      }
      if (scheduleRes.success) {
        setScheduleData(scheduleRes.schedule);
      }
    } catch (err) {
      console.error('[JobsSchedule load error]:', err);
      setError(err.message || 'Failed to fetch jobs and schedule data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, categoryFilter, timeframeFilter, sortBy]);

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabId);
    newParams.set('view', 'jobs');
    setSearchParams(newParams);
  };

  // Handle View Switch
  const handleViewChange = (viewId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', viewId);
    setSearchParams(newParams);
  };

  // Action: Accept
  const handleAcceptJob = async (job) => {
    const id = job.bookingId || job._id;
    try {
      setActionLoadingId(id);
      setError('');
      setSuccessMsg('');
      const res = await api.acceptJob(id);
      if (res.success) {
        setSuccessMsg(res.message || 'Job successfully accepted and added to your schedule!');
        if (selectedJob && (selectedJob.bookingId === id || selectedJob._id === id)) {
          setSelectedJob(res.booking);
        }
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept job.');
      await loadData();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Reject
  const handleRejectJob = async (job, reason = 'Declined by specialist') => {
    const id = job.bookingId || job._id;
    try {
      setActionLoadingId(id);
      setError('');
      setSuccessMsg('');
      const res = await api.rejectJob(id, reason);
      if (res.success) {
        setSuccessMsg(res.message || 'Job rejected/released.');
        setDrawerOpen(false);
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to process rejection.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Start
  const handleStartJob = async (job) => {
    const id = job.bookingId || job._id;
    try {
      setActionLoadingId(id);
      setError('');
      setSuccessMsg('');
      const res = await api.updateJobStatus(id, 'in-progress');
      if (res.success) {
        setSuccessMsg('Job marked as In-Progress.');
        if (selectedJob && (selectedJob.bookingId === id || selectedJob._id === id)) {
          setSelectedJob(res.booking);
        }
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to start job.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Complete
  const handleCompleteJob = async (job) => {
    const id = job.bookingId || job._id;
    try {
      setActionLoadingId(id);
      setError('');
      setSuccessMsg('');
      const res = await api.updateJobStatus(id, 'completed');
      if (res.success) {
        setSuccessMsg('Job successfully marked as Completed! Payout has been recorded.');
        if (selectedJob && (selectedJob.bookingId === id || selectedJob._id === id)) {
          setSelectedJob(res.booking);
        }
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to complete job.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Details Drawer
  const handleOpenDrawer = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  // Client-side quick search filtering
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter((j) => {
      return (
        j.bookingId?.toLowerCase().includes(q) ||
        j.serviceTitle?.toLowerCase().includes(q) ||
        j.customerInfo?.name?.toLowerCase().includes(q) ||
        j.customerInfo?.city?.toLowerCase().includes(q) ||
        j.service?.category?.toLowerCase().includes(q)
      );
    });
  }, [jobs, searchQuery]);

  // Extract unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      if (j.service?.category) set.add(j.service.category);
    });
    return Array.from(set);
  }, [jobs]);

  // Status Tab Definitions with Real Counts
  const tabs = [
    { id: 'all', label: 'All Jobs', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'accepted', label: 'Accepted', count: stats.accepted },
    { id: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { id: 'completed', label: 'Completed', count: stats.completed },
    { id: 'rejected', label: 'Rejected', count: stats.rejected },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
            <span className="text-slate-300">•</span>
            {/* Real-time backend availability badge */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  worker?.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="font-medium">
                {worker?.isAvailable !== false ? 'Accepting Service Calls' : 'Offline'}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Jobs & Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage your service requests, plan your workday, and track every job in one place.
          </p>
        </div>

        {/* Header Right Actions & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handleViewChange('jobs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeView === 'jobs'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Jobs</span>
            </button>
            <button
              onClick={() => handleViewChange('schedule')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeView === 'schedule'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
            <button
              onClick={() => handleViewChange('reviews')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeView === 'reviews'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Reviews</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Reload backend data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-3 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Job Statistics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            id: 'all',
            label: 'Total Jobs',
            count: stats.total,
            icon: Briefcase,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            border: 'hover:border-indigo-300',
          },
          {
            id: 'pending',
            label: 'Pending Requests',
            count: stats.pending,
            icon: Inbox,
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            border: 'hover:border-amber-300',
          },
          {
            id: 'accepted',
            label: 'Accepted Jobs',
            count: stats.accepted,
            icon: CalendarCheck,
            color: 'text-blue-600 bg-blue-50 border-blue-100',
            border: 'hover:border-blue-300',
          },
          {
            id: 'in-progress',
            label: 'In Progress',
            count: stats.inProgress,
            icon: Play,
            color: 'text-purple-600 bg-purple-50 border-purple-100',
            border: 'hover:border-purple-300',
          },
          {
            id: 'completed',
            label: 'Completed',
            count: stats.completed,
            icon: CheckCircle2,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            border: 'hover:border-emerald-300',
          },
          {
            id: 'rejected',
            label: 'Rejected',
            count: stats.rejected,
            icon: AlertTriangle,
            color: 'text-rose-600 bg-rose-50 border-rose-100',
            border: 'hover:border-rose-300',
          },
        ].map((card) => {
          const Icon = card.icon;
          const isSelected = activeTab === card.id && activeView === 'jobs';
          return (
            <button
              key={card.id}
              onClick={() => handleTabChange(card.id)}
              className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer shadow-xs relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                  : `border-slate-200/80 ${card.border}`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg border shrink-0 ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{card.count}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area Based on activeView */}
      {activeView === 'jobs' && (
        <div className="space-y-5">
          {/* 3. Job Management Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-xs flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-1.5">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Search, Filters, and Sorting Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking ID, service title, customer, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter and Sort Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Category Filter */}
              {uniqueCategories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {/* Timeframe Filter */}
              <select
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming First</option>
                <option value="past">Past / Fulfilled</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="upcoming">Scheduled Time</option>
                <option value="oldest">Oldest First</option>
                <option value="recent_completed">Recently Completed</option>
              </select>

              {/* Grid / Table layout switcher */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setLayoutMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    layoutMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Card Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    layoutMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. Jobs Listing: Cards or Table */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-3 font-medium">Syncing live dispatch requests...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No jobs match your filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'all'
                  ? 'There are currently no jobs available in your service zone.'
                  : `No records currently in the '${activeTab}' status tab.`}
              </p>
              {activeTab !== 'all' && (
                <button
                  onClick={() => handleTabChange('all')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  View All Jobs
                </button>
              )}
            </div>
          ) : layoutMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id || job.bookingId}
                  job={job}
                  workerId={worker?._id}
                  payoutRate={payoutRate}
                  onViewDetails={handleOpenDrawer}
                  onAccept={handleAcceptJob}
                  onReject={handleRejectJob}
                  onStart={handleStartJob}
                  onComplete={handleCompleteJob}
                  actionLoadingId={actionLoadingId}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Ref & Service</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Payout</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.map((job) => {
                      const statusConfig = getStatusStyle(job.bookingStatus);
                      const grossTotal = job.priceBreakdown?.total || 799;
                      const workerPayout = Math.round(grossTotal * payoutRate);

                      return (
                        <tr
                          key={job._id || job.bookingId}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] mr-2">
                              {job.bookingId}
                            </span>
                            <span className="font-bold text-slate-900">{job.serviceTitle}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {job.service?.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {job.customerInfo?.name || 'Customer'}
                            </span>
                            <span className="text-slate-400 text-[11px] truncate max-w-[150px] block">
                              {job.customerInfo?.address}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800 block">{job.bookingDate}</span>
                            <span className="text-slate-500 text-[11px]">{job.timeSlot}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${statusConfig.badge}`}
                            >
                              <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                              <span>{statusConfig.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                            ₹{workerPayout}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenDrawer(job)}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <ScheduleCalendarView
          schedule={scheduleData}
          allJobs={jobs}
          onViewJob={handleOpenDrawer}
          onStartJob={handleStartJob}
          onCompleteJob={handleCompleteJob}
        />
      )}

      {/* Reviews View */}
      {activeView === 'reviews' && <CustomerReviewsView />}

      {/* 6. Slide-Over Job Details Drawer */}
      <JobDetailsDrawer
        job={selectedJob}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workerId={worker?._id}
        payoutRate={payoutRate}
        onAccept={handleAcceptJob}
        onReject={handleRejectJob}
        onStart={handleStartJob}
        onComplete={handleCompleteJob}
        actionLoading={Boolean(actionLoadingId)}
      />
    </div>
  );
};
export default JobsSchedulePage;
