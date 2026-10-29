import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Inbox,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RotateCw,
  Sparkles,
  User,
  Check,
} from 'lucide-react';

export const JobRequestsPage = () => {
  const { worker } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const payoutRate = worker?.payoutRate || 0.75;

  const loadRequests = async () => {
    try {
      setError('');
      const res = await api.getJobs('requests');
      if (res.success) {
        setRequests(res.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch available requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      setAcceptingId(id);
      setError('');
      setSuccessMsg('');
      const res = await api.acceptJob(id);
      if (res.success) {
        setSuccessMsg(res.message || 'Job successfully accepted!');
        // Remove from open requests
        setRequests((prev) => prev.filter((r) => r.bookingId !== id && r._id !== id));
        setTimeout(() => {
          navigate(`/jobs/${id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to accept job. It may have been claimed by another specialist.');
      loadRequests();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and claim unassigned customer orders available in your service area.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            loadRequests();
          }}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-xs transition-colors cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Pool</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3">Scanning for available orders...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Open Job Requests</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            All customer bookings in your zone are currently assigned or in progress. Check back shortly or keep your status marked Available.
          </p>
          <Link
            to="/jobs"
            className="mt-5 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <span>View My Assigned Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((job) => {
            const customerTotal = job.priceBreakdown?.total || 799;
            const workerPayout = Math.round(customerTotal * payoutRate);
            const isAccepting = acceptingId === (job.bookingId || job._id);

            return (
              <div
                key={job._id || job.bookingId}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Top tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {job.bookingId}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Open Request
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{job.serviceTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">Tier: {job.proTier || 'Master Specialist'}</p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{job.bookingDate} • {job.timeSlot}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{job.customerInfo?.address || job.customerInfo?.city || 'Local Customer'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{job.customerInfo?.name || 'Homeowner'}</span>
                    </div>
                  </div>

                  {job.customerInstructions && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 italic line-clamp-2">
                      "{job.customerInstructions}"
                    </div>
                  )}
                </div>

                {/* Footer Payout & Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Payout</span>
                    <span className="text-lg font-extrabold text-slate-900">₹{workerPayout}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/jobs/${job.bookingId || job._id}`}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleAccept(job.bookingId || job._id)}
                      disabled={isAccepting}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isAccepting ? (
                        <span>Accepting...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Job</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
