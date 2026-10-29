import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldCheck, User, Calendar, RotateCw } from 'lucide-react';
import { api } from '../../services/api';

export const CustomerReviewsView = () => {
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getReviews();
      if (res.success) {
        setReviewsData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Fetching verified homeowner reviews...</p>
      </div>
    );
  }

  const { stats, reviews = [] } = reviewsData || {};
  const total = stats?.totalReviews || 0;
  const avg = stats?.averageRating || 0;
  const dist = stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Rating Score Summary */}
        <div className="flex items-center space-x-6">
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center min-w-[120px]">
            <span className="text-3xl font-black text-amber-900 block leading-tight">
              {avg.toFixed(1)}
            </span>
            <div className="flex justify-center my-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-amber-700">
              {total} Verified {total === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Technician Reputation</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Ratings and feedback submitted by homeowners after verified completion of service orders.
            </p>
            <div className="mt-3 flex items-center space-x-2 text-xs text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Genuine Client Walkthrough Reviews</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution Bars */}
        <div className="w-full md:w-64 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = dist[stars] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={stars} className="flex items-center space-x-2">
                <span className="w-3 text-slate-600 font-bold">{stars}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-[10px] text-slate-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Client Testimonials ({reviews.length})
          </h4>
          <button
            onClick={loadReviews}
            className="flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Reviews</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Reviews Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Complete assigned jobs to receive ratings and reviews from homeowners on the Mendx platform.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block leading-tight">
                        {rev.customerName || 'Verified Homeowner'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {rev.customerLocation || 'Chicago, IL'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">{rev.rating}.0</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 italic bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  "{rev.comment}"
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="font-semibold text-slate-600">
                    Service: {rev.serviceTitle || rev.service?.name}
                  </span>
                  <span>
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
