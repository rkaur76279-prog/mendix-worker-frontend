import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowRight,
  Check,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Eye,
  Star,
} from 'lucide-react';

export const getStatusStyle = (status) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending Request',
      };
    case 'assigned':
    case 'accepted':
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-600',
        label: 'Accepted / Scheduled',
      };
    case 'in-progress':
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-600 animate-pulse',
        label: 'In Progress',
      };
    case 'completed':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'Completed',
      };
    case 'rejected':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Rejected',
      };
    case 'cancelled':
      return {
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
        label: 'Cancelled',
      };
    default:
      return {
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status || 'Unknown',
      };
  }
};

export const JobCard = ({
  job,
  workerId,
  payoutRate = 0.75,
  onViewDetails,
  onAccept,
  onReject,
  onStart,
  onComplete,
  actionLoadingId,
}) => {
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
  const isProcessing = actionLoadingId === (job.bookingId || job._id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
              {job.bookingId}
            </span>
            {job.proTier && (
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline-block bg-slate-100 px-2 py-0.5 rounded-md">
                {job.proTier}
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Service Title */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {job.serviceTitle}
            </h3>
            {job.service?.category && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{job.service.category}</p>
            )}
          </div>
          {job.service?.image && (
            <img
              src={job.service.image}
              alt={job.serviceTitle}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100 shadow-xs"
            />
          )}
        </div>

        {/* Schedule & Address Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-800">{job.bookingDate}</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{job.timeSlot}</span>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="truncate text-slate-600">
              {job.customerInfo?.address || job.customerInfo?.city || 'Local area'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium truncate max-w-[140px]">
                {job.customerInfo?.name || 'Customer'}
              </span>
            </div>
            {job.customerInfo?.phone && (
              <a
                href={`tel:${job.customerInfo.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            )}
          </div>

          {/* Rating preview if completed */}
          {job.review && (
            <div className="mt-2 p-2 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center space-x-1.5 text-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold text-xs">{job.review.rating}.0</span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-slate-600 truncate italic">"{job.review.comment}"</span>
            </div>
          )}

          {/* Rejection reason badge if rejected */}
          {isRejectedByMe && (
            <div className="mt-2 p-2 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-700">
              <span className="font-semibold">Rejected: </span>
              {job.rejections?.find((r) => (r.worker?._id || r.worker)?.toString() === workerId?.toString())?.reason ||
                'Declined by you'}
            </div>
          )}
        </div>
      </div>

      {/* Footer Payout & Action Buttons */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Worker Payout
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-extrabold text-slate-900">₹{workerPayout}</span>
            <span className="text-[10px] text-slate-400">({Math.round(payoutRate * 100)}%)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(job)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {/* Actions based on role and status */}
          {isUnassigned && !isRejectedByMe && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onReject(job)}
                disabled={isProcessing}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Decline request"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept(job)}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Claiming...' : 'Accept'}</span>
              </button>
            </div>
          )}

          {isAssignedToMe && job.bookingStatus === 'assigned' && (
            <button
              onClick={() => onStart(job)}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Job</span>
            </button>
          )}

          {isAssignedToMe && job.bookingStatus === 'in-progress' && (
            <button
              onClick={() => onComplete(job)}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
