import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { worker } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', title: '', message: '' });

  const payoutRate = worker?.payoutRate || 0.75;

  const loadJob = async () => {
    try {
      setError('');
      const res = await api.getJobDetails(id);
      if (res.success && res.booking) {
        setBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  // Actions
  const handleAcceptJob = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.acceptJob(id);
      if (res.success) {
        setSuccessMsg('You have accepted this job! It is now on your schedule.');
        setBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to accept job.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartJob = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.updateJobStatus(id, 'in-progress');
      if (res.success) {
        setSuccessMsg('Job marked as In-Progress.');
        setBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to start job.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.updateJobStatus(id, 'completed');
      if (res.success) {
        setSuccessMsg('Congratulations! Job marked as Completed.');
        setBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete job.');
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, type: '', title: '', message: '' });
    }
  };

  const handleRejectJob = async (reason = 'Scheduling conflict') => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.rejectJob(id, reason);
      if (res.success) {
        setSuccessMsg('Job released back to the general request pool.');
        setTimeout(() => {
          navigate('/jobs');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to release job.');
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, type: '', title: '', message: '' });
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Fetching job specifications...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Job Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Could not retrieve information for this booking.'}</p>
        <Link
          to="/jobs"
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Jobs</span>
        </Link>
      </div>
    );
  }

  const isAssignedToMe = booking.assignedWorker && booking.assignedWorker.toString() === worker?._id?.toString();
  const isUnassigned = !booking.assignedWorker;

  const grossTotal = booking.priceBreakdown?.total || 799;
  const workerPayout = Math.round(grossTotal * payoutRate);
  const platformFee = grossTotal - workerPayout;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </Link>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Ref: {booking.bookingId}
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-100">
                {booking.bookingId}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                  booking.bookingStatus === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : booking.bookingStatus === 'in-progress'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {booking.bookingStatus}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{booking.serviceTitle}</h1>
            <p className="text-xs text-slate-500 mt-1">Tier: {booking.proTier || 'Master Specialist'}</p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Take-Home Payout</span>
            <span className="text-2xl font-extrabold text-slate-900">₹{workerPayout}</span>
            <span className="text-[11px] text-slate-500 block">({Math.round(payoutRate * 100)}% of customer payment)</span>
          </div>
        </div>

        {/* Schedule & Location summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-sm">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Service Date & Time</p>
              <p className="font-semibold text-slate-900 mt-0.5">{booking.bookingDate}</p>
              <p className="text-xs text-slate-500">{booking.timeSlot}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Service Location</p>
              <p className="font-semibold text-slate-900 mt-0.5">{booking.customerInfo?.address}</p>
              <p className="text-xs text-slate-500">{booking.customerInfo?.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info & Special Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Customer Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block">Client Name</span>
                <span className="font-medium text-slate-800">{booking.customerInfo?.name || 'Customer'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block">Phone Contact</span>
                {booking.customerInfo?.phone ? (
                  <a
                    href={`tel:${booking.customerInfo.phone}`}
                    className="font-medium text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <span>{booking.customerInfo.phone}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500">Not provided</span>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 block">Exact Address</span>
                <span className="text-slate-700 font-medium">
                  {booking.customerInfo?.address}, {booking.customerInfo?.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Instructions & Payment breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Order Instructions & Payout</h2>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
              Customer Instructions
            </span>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 min-h-[60px]">
              {booking.customerInstructions ? (
                <span>"{booking.customerInstructions}"</span>
              ) : (
                <span className="text-slate-400 italic">No specific instructions left by customer.</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Customer Total Bill</span>
              <span className="font-medium">₹{grossTotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Platform Service Fee (25%)</span>
              <span>-₹{platformFee}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
              <span>Net Worker Payout</span>
              <span className="text-emerald-600">₹{workerPayout}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Payment Status</span>
              <span className="uppercase font-semibold text-slate-600">{booking.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-800">Job Action Controls</p>
          <p className="text-[11px] text-slate-500">
            {booking.bookingStatus === 'completed'
              ? 'This job has already been fulfilled and closed.'
              : isUnassigned
              ? 'Claim this order to add it to your schedule.'
              : 'Update progress as you arrive on site and complete the service.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* If unassigned request */}
          {isUnassigned && (
            <button
              onClick={handleAcceptJob}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {actionLoading ? 'Processing...' : 'Accept Job'}
            </button>
          )}

          {/* If assigned to this worker and status is 'assigned' */}
          {isAssignedToMe && booking.bookingStatus === 'assigned' && (
            <>
              <button
                onClick={() =>
                  setConfirmModal({
                    open: true,
                    type: 'reject',
                    title: 'Release Job Back to Pool?',
                    message:
                      'Are you sure you want to release this job? It will be made available for other specialists to claim.',
                  })
                }
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Release Job
              </button>
              <button
                onClick={handleStartJob}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Job</span>
              </button>
            </>
          )}

          {/* If assigned to this worker and status is 'in-progress' */}
          {isAssignedToMe && booking.bookingStatus === 'in-progress' && (
            <button
              onClick={() =>
                setConfirmModal({
                  open: true,
                  type: 'complete',
                  title: 'Mark Job as Completed?',
                  message:
                    'Please confirm that all requested tasks and customer walkthrough have been completed satisfactorily.',
                })
              }
              disabled={actionLoading}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Completed</span>
            </button>
          )}

          {/* If completed */}
          {booking.bookingStatus === 'completed' && (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Job Completed & Payout Processed</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{confirmModal.title}</h3>
            <p className="text-xs text-slate-600">{confirmModal.message}</p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal({ open: false, type: '', title: '', message: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'complete') handleCompleteJob();
                  if (confirmModal.type === 'reject') handleRejectJob();
                }}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer ${
                  confirmModal.type === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
