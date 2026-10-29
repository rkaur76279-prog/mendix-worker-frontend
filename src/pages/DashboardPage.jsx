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
} from 'lucide-react';

export const DashboardPage = () => {
  const { worker, toggleAvailability } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setError('');
      const [jobsRes, earningsRes] = await Promise.all([
        api.getJobs('all'),
        api.getEarnings(),
      ]);

      if (jobsRes.success) {
        setJobs(jobsRes.bookings || []);
      }
      if (earningsRes.success) {
        setEarnings(earningsRes.earnings);
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
  const newRequests = jobs.filter((j) => !j.assignedWorker && ['confirmed', 'pending'].includes(j.bookingStatus));
  const activeJobs = jobs.filter(
    (j) => j.assignedWorker && ['assigned', 'in-progress'].includes(j.bookingStatus)
  );
  const completedJobs = jobs.filter(
    (j) => j.assignedWorker && j.bookingStatus === 'completed'
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysJobs = activeJobs.filter((j) => j.bookingDate === todayStr);

  const payoutRate = worker?.payoutRate || 0.75;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Gathering live jobs and metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Pro Specialist Hub
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {worker?.fullName || 'Technician'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Service territory: <span className="font-semibold text-slate-700">{worker?.serviceArea || 'Mumbai & Suburbs'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            to="/requests"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-200 transition-colors"
          >
            <Inbox className="w-4 h-4" />
            <span>Review New Requests ({newRequests.length})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Open Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{newRequests.length}</span>
            <p className="mt-1 text-xs text-slate-500">Unassigned customer orders</p>
          </div>
          <Link
            to="/requests"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View job board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Active / In-Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Active Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{activeJobs.length}</span>
            <p className="mt-1 text-xs text-slate-500">Assigned / In Progress</p>
          </div>
          <Link
            to="/jobs"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Open schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {earnings?.totalCompletedJobs ?? completedJobs.length}
            </span>
            <p className="mt-1 text-xs text-slate-500">Delivered successfully</p>
          </div>
          <Link
            to="/jobs?status=completed"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View job history</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Net Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Payouts</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{(earnings?.totalEarnings || 0).toLocaleString()}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Rate: {earnings?.payoutRate || '75%'} net take-home
            </p>
          </div>
          <Link
            to="/earnings"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Financial breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Sections: Active Jobs & Available Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned In-Queue</h2>
              <p className="text-xs text-slate-500">Tasks needing execution or completion</p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No active assigned jobs</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Check the open Job Requests board to accept new bookings in your service zone.
              </p>
              <Link
                to="/requests"
                className="mt-4 inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                Browse Job Requests
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.slice(0, 3).map((job) => (
                <div
                  key={job._id || job.bookingId}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all bg-slate-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {job.bookingId}
                      </span>
                      <h3 className="mt-1.5 font-bold text-slate-900 text-sm">{job.serviceTitle}</h3>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                        job.bookingStatus === 'in-progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {job.bookingStatus}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.bookingDate} • {job.timeSlot}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.customerInfo?.city || 'Local Area'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Est. Payout: ₹{Math.round((job.priceBreakdown?.total || 799) * payoutRate)}
                    </span>
                    <Link
                      to={`/jobs/${job.bookingId || job._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
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

        {/* Immediate Job Requests Opportunity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Available Job Requests</h2>
              <p className="text-xs text-slate-500">Unclaimed orders ready for acceptance</p>
            </div>
            <Link
              to="/requests"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {newRequests.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No open requests right now</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                All bookings are currently assigned. Stay online to be notified when customer requests arrive!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {newRequests.slice(0, 3).map((job) => (
                <div
                  key={job._id || job.bookingId}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-200 transition-all bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-500">{job.bookingId}</span>
                        <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          Ready to Accept
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm">{job.serviceTitle}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-emerald-600">
                        ₹{Math.round((job.priceBreakdown?.total || 799) * payoutRate)}
                      </p>
                      <p className="text-[10px] text-slate-400">Worker Payout</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.bookingDate} ({job.timeSlot})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.customerInfo?.city || 'Local'}</span>
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <Link
                      to={`/jobs/${job.bookingId || job._id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                      View & Accept
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
