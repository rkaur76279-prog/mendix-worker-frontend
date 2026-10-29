import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
  RotateCw,
  Building2,
  Coins,
} from 'lucide-react';

export const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEarnings = async () => {
    try {
      setError('');
      const res = await api.getEarnings();
      if (res.success && res.earnings) {
        setEarnings(res.earnings);
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate earnings records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Earnings & Payouts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audited financial breakdown derived directly from completed customer bookings.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadEarnings();
          }}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-xs transition-colors cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3">Reconciling worker payouts...</p>
        </div>
      ) : (
        <>
          {/* Earnings Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Paid Earnings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Realized Earnings
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{(earnings?.totalEarnings || 0).toLocaleString()}
                </span>
                <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{earnings?.totalCompletedJobs || 0} completed orders settled</span>
                </p>
              </div>
            </div>

            {/* Pending Payouts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Order Payouts
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{(earnings?.pendingPayout || 0).toLocaleString()}
                </span>
                <p className="mt-1 text-xs text-amber-600 font-semibold">
                  {earnings?.activeJobsCount || 0} active/in-progress assignments
                </p>
              </div>
            </div>

            {/* Fee Split & Model */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Specialist Commission Split
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {earnings?.payoutRate || '75%'}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Platform overhead & insurance fee: 25%
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Payout Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Job Payout Breakdown</h2>
                <p className="text-xs text-slate-500">Individual ledger of completed work</p>
              </div>
              <Receipt className="w-5 h-5 text-slate-400" />
            </div>

            {(!earnings?.history || earnings.history.length === 0) ? (
              <div className="p-12 text-center">
                <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No completed job payouts yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Once you accept and mark jobs as completed, itemized payout receipts will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
                    <tr>
                      <th className="py-3 px-6">Booking ID</th>
                      <th className="py-3 px-6">Service</th>
                      <th className="py-3 px-6">Customer</th>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6 text-right">Customer Paid</th>
                      <th className="py-3 px-6 text-right">Platform Fee (25%)</th>
                      <th className="py-3 px-6 text-right">Your Net Payout</th>
                      <th className="py-3 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {earnings.history.map((item, idx) => (
                      <tr key={item.bookingId || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-indigo-600">{item.bookingId}</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900">{item.serviceTitle}</td>
                        <td className="py-3.5 px-6 text-slate-600">{item.customerName}</td>
                        <td className="py-3.5 px-6 text-slate-500">{item.date}</td>
                        <td className="py-3.5 px-6 text-right font-medium">₹{item.grossAmount}</td>
                        <td className="py-3.5 px-6 text-right text-slate-400">-₹{item.platformFee}</td>
                        <td className="py-3.5 px-6 text-right font-bold text-emerald-600 text-sm">
                          ₹{item.workerPayout}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
