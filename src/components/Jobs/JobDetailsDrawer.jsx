import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  DollarSign,
  Star,
  Check,
  Ban,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { getStatusStyle } from './JobCard';

export const JobDetailsDrawer = ({
  job,
  isOpen,
  onClose,
  workerId,
  payoutRate = 0.75,
  onAccept,
  onReject,
  onStart,
  onComplete,
  actionLoading,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);

  if (!isOpen || !job) return null;

  const isAssignedToMe =
    job.assignedWorker &&
    (job.assignedWorker._id || job.assignedWorker).toString() === workerId?.toString();
  const isUnassigned = !job.assignedWorker;
  const isRejectedByMe = job.rejections?.some(
    (r) => (r.worker?._id || r.worker)?.toString() === workerId?.toString()
  );

  const statusConfig = getStatusStyle(
    isRejectedByMe && !isAssignedToMe ? 'rejected' : job.bookingStatus
  );

  const grossTotal = job.priceBreakdown?.total || 799;
  const workerPayout = Math.round(grossTotal * payoutRate);
  const platformFee = grossTotal - workerPayout;

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    onReject(job, rejectReason || 'Scheduling conflict');
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleConfirmComplete = () => {
    onComplete(job);
    setConfirmComplete(false);
  };

  // Timeline events calculation based on actual backend data
  const timelineEvents = [
    {
      title: 'Request Created',
      description: 'Customer scheduled the service call',
      time: job.createdAt ? new Date(job.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Created',
      done: true,
      current: job.bookingStatus === 'confirmed' || job.bookingStatus === 'pending',
    },
    {
      title: 'Technician Assigned',
      description: isAssignedToMe ? 'Claimed and assigned to your calendar' : 'Awaiting specialist acceptance',
      time: ['assigned', 'in-progress', 'completed'].includes(job.bookingStatus) ? 'Confirmed' : null,
      done: ['assigned', 'in-progress', 'completed'].includes(job.bookingStatus),
      current: job.bookingStatus === 'assigned',
    },
    {
      title: 'Job In-Progress',
      description: job.startedAt ? `Started at ${new Date(job.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Technician arrival & execution',
      time: job.startedAt ? new Date(job.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
      done: ['in-progress', 'completed'].includes(job.bookingStatus),
      current: job.bookingStatus === 'in-progress',
    },
    {
      title: 'Service Completed',
      description: job.completedAt ? `Finished at ${new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Customer signoff & payout clearance',
      time: job.completedAt ? new Date(job.completedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
      done: job.bookingStatus === 'completed',
      current: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                {job.bookingId}
              </span>
              <span
                className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Schedule conflict warning banner if any */}
            {job.scheduleConflict && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center space-x-2 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Potential Schedule Conflict</span>
                </div>
                <p className="text-amber-700">
                  You already have <strong>{job.scheduleConflict.bookingId}</strong> ({job.scheduleConflict.serviceTitle}) scheduled for {job.scheduleConflict.bookingDate} at {job.scheduleConflict.timeSlot}.
                </p>
              </div>
            )}

            {/* Service Title & Image */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {job.service?.category || 'Home Service'}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {job.serviceTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tier: <span className="font-semibold text-slate-700">{job.proTier || 'Master Specialist'}</span>
                </p>
              </div>
              {job.service?.image && (
                <img
                  src={job.service.image}
                  alt={job.serviceTitle}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                />
              )}
            </div>

            {/* Schedule Details Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Scheduled Date</span>
                  <span className="text-sm font-bold text-slate-900">{job.bookingDate}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Time Slot</span>
                  <span className="text-sm font-bold text-slate-900">{job.timeSlot}</span>
                  {job.service?.duration && (
                    <span className="text-[10px] text-slate-500 block">Est: {job.service.duration}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Information
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-3 text-slate-700">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900 text-sm">
                    {job.customerInfo?.name || 'Customer'}
                  </span>
                </div>

                {job.customerInfo?.phone && (
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{job.customerInfo.phone}</span>
                    </div>
                    <a
                      href={`tel:${job.customerInfo.phone}`}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <span>Call Client</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="flex items-start space-x-3 text-slate-700 pt-1">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-900 font-medium">
                      {job.customerInfo?.address}
                    </span>
                    <span className="text-slate-500 block">
                      {job.customerInfo?.city}
                    </span>
                  </div>
                </div>
              </div>

              {job.customerInstructions && (
                <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900">
                  <span className="font-bold text-amber-800 block mb-0.5">Special Instructions:</span>
                  <p className="italic">"{job.customerInstructions}"</p>
                </div>
              )}
            </div>

            {/* Financial & Payout Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment Breakdown
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full capitalize">
                  {job.paymentStatus || 'Pending'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Customer Total Bill</span>
                  <span className="font-semibold text-slate-800">₹{grossTotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform Commission (25%)</span>
                  <span>-₹{platformFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                  <span>Your Net Payout</span>
                  <span className="text-emerald-600 font-black">₹{workerPayout}</span>
                </div>
              </div>
            </div>

            {/* Customer Review Section if available */}
            {job.review && (
              <div className="bg-gradient-to-br from-amber-50/80 to-white rounded-2xl border border-amber-200/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-black text-sm text-amber-900">{job.review.rating}.0 / 5.0 Rating</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(job.review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic">"{job.review.comment}"</p>
                <p className="text-[11px] font-bold text-slate-500">
                  — {job.review.customerName || 'Verified Homeowner'}
                </p>
              </div>
            )}

            {/* Real Timestamps Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Job Lifecycle Timeline
              </h3>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        evt.done
                          ? 'bg-emerald-500 border-white text-white shadow-xs'
                          : evt.current
                          ? 'bg-indigo-600 border-white text-white shadow-xs'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {evt.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            evt.done || evt.current ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {evt.title}
                        </span>
                        {evt.time && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {evt.time}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Form Drawer Expansion */}
            {showRejectForm && (
              <form onSubmit={handleRejectSubmit} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800">
                    {isAssignedToMe ? 'Release Job Reason' : 'Decline Job Reason'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict, distance too far, outside service hours..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </form>
            )}

            {/* Completion Confirmation Alert */}
            {confirmComplete && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Confirm Job Completion</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Confirm that the service has been performed to high standards and the customer has conducted a walkthrough.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => setConfirmComplete(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmComplete}
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Yes, Mark Completed
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Sticky Action Footer */}
          <div className="p-5 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Take-Home Pay</span>
              <span className="text-xl font-extrabold text-slate-900">₹{workerPayout}</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Unassigned open request */}
              {isUnassigned && !isRejectedByMe && (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => onAccept(job)}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{actionLoading ? 'Claiming...' : 'Accept Job'}</span>
                  </button>
                </>
              )}

              {/* Assigned */}
              {isAssignedToMe && job.bookingStatus === 'assigned' && (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Release Job
                  </button>
                  <button
                    onClick={() => onStart(job)}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Job</span>
                  </button>
                </>
              )}

              {/* In-Progress */}
              {isAssignedToMe && job.bookingStatus === 'in-progress' && (
                <button
                  onClick={() => setConfirmComplete(true)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>
              )}

              {/* Completed */}
              {job.bookingStatus === 'completed' && (
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Job Fulfilled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
