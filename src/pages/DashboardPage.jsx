import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Inbox,
  CalendarCheck,
  CheckCircle2,
  Wallet,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Briefcase,
  Play,
  RotateCw,
  Star,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage = () => {
  const { worker } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [earnings, setEarnings] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setError('');
      const [jobsRes, statsRes, earningsRes, reviewsRes] = await Promise.all([
        api.getJobs('all').catch(() => ({ success: false, bookings: [] })),
        api.getJobStats().catch(() => ({ success: false })),
        api.getEarnings().catch(() => ({ success: false })),
        api.getReviews().catch(() => ({ success: false })),
      ]);

      if (jobsRes.success) {
        setJobs(jobsRes.bookings || []);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (earningsRes.success && earningsRes.earnings) {
        setEarnings(earningsRes.earnings);
      }
      if (reviewsRes.success) {
        setReviewsData(reviewsRes);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Group metrics
  const newRequests = jobs.filter(
    (j) => !j.assignedWorker && ['confirmed', 'pending'].includes(j.bookingStatus)
  );
  const activeJobs = jobs.filter(
    (j) => j.assignedWorker && ['assigned', 'in-progress'].includes(j.bookingStatus)
  );

  const payoutRate = worker?.payoutRate || 0.75;
  const avgRating = reviewsData?.stats?.averageRating || 5.0;
  const totalReviews = reviewsData?.stats?.totalReviews || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
          Syncing Mendx live job dispatch &amp; metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              MENDX PRO SPECIALIST
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#0B0B2B]">
            Welcome back, {worker?.fullName || worker?.name || 'Technician'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium">
            Active service territory:{' '}
            <span className="font-bold text-slate-800">{worker?.serviceArea || `${worker?.city || 'Mumbai'} & Suburbs`}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Refresh dashboard"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync Records</span>
          </button>

          <Link
            to="/requests"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors"
          >
            <Inbox className="w-4 h-4" />
            <span>New Requests ({stats.pending})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Managed
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#0B0B2B]">{stats.total}</span>
            <p className="mt-0.5 text-[11px] text-slate-500">Service requests pipeline</p>
          </div>
          <Link
            to="/jobs?tab=all"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>All jobs log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Open Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              New Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#0B0B2B]">{stats.pending}</span>
            <p className="mt-0.5 text-[11px] text-slate-500">Awaiting technician claim</p>
          </div>
          <Link
            to="/requests"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Review pool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Total Realized Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-700">
              ₹{(earnings?.totalEarnings || 0).toLocaleString()}
            </span>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Rate: {earnings?.payoutRate || '75%'} net take-home
            </p>
          </div>
          <Link
            to="/earnings"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Payout records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Average Rating & Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rating &amp; Reviews
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#0B0B2B]">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {totalReviews} verified customer reviews
            </p>
          </div>
          <Link
            to="/reviews"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Client feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. Operational Status Cards Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/jobs?tab=accepted"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">Accepted Jobs</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.accepted}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Assigned to your shift</p>
        </Link>

        <Link
          to="/jobs?tab=in-progress"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">In Progress</span>
            <Play className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.inProgress}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Work actively under way</p>
        </Link>

        <Link
          to="/jobs?tab=completed"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.completed}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Customer verified signoffs</p>
        </Link>

        <Link
          to="/jobs?tab=rejected"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">Rejected / Released</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.rejected}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Returned to dispatch pool</p>
        </Link>
      </div>

      {/* 4. Active Tasks & Open Job Requests Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active In-Queue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned In-Queue</h2>
              <p className="text-xs text-slate-500">Upcoming appointments ready for execution</p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No active assigned jobs</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Check the open Job Requests board to accept new bookings in your service zone.
              </p>
              <Link
                to="/requests"
                className="mt-3.5 inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                Browse Job Requests
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.slice(0, 3).map((job) => (
                <div
                  key={job._id || job.bookingId}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all bg-slate-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {job.bookingId}
                      </span>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm">{job.serviceTitle}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize ${
                        job.bookingStatus === 'in-progress'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {job.bookingStatus}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.bookingDate} ({job.timeSlot})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px]">{job.customerInfo?.city}</span>
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      Take-Home: ₹{Math.round((job.priceBreakdown?.total || 799) * payoutRate)}
                    </span>
                    <Link
                      to={`/jobs/${job.bookingId || job._id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <span>Action Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Open Job Requests */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Available Job Requests</h2>
              <p className="text-xs text-slate-500">Unclaimed customer calls ready for acceptance</p>
            </div>
            <Link
              to="/requests"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Explore all ({newRequests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {newRequests.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No open requests right now</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                All bookings are currently assigned. Stay online to be notified when customer requests arrive!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {newRequests.slice(0, 3).map((job) => (
                <div
                  key={job._id || job.bookingId}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all bg-white shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500">{job.bookingId}</span>
                        <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded border border-emerald-200">
                          Ready to Accept
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm">{job.serviceTitle}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-700">
                        ₹{Math.round((job.priceBreakdown?.total || 799) * payoutRate)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">Specialist Payout</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.bookingDate} ({job.timeSlot})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{job.customerInfo?.city || 'Local'}</span>
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <Link
                      to={`/jobs/${job.bookingId || job._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                    >
                      View &amp; Accept
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
