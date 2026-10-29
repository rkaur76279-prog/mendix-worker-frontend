import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  Star,
  Sparkles,
} from 'lucide-react';
import { getStatusStyle } from './JobCard';

export const ScheduleCalendarView = ({
  schedule,
  allJobs,
  onViewJob,
  onStartJob,
  onCompleteJob,
}) => {
  const [scheduleSubView, setScheduleSubView] = useState('month'); // 'month' | 'agenda'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 24)); // October 24, 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-10-24');

  const { today = [], tomorrow = [], upcoming = [], past = [] } = schedule || {};

  // Calendar generation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create date lookup for jobs
  const jobsByDate = {};
  (allJobs || []).forEach((j) => {
    if (j.bookingDate) {
      if (!jobsByDate[j.bookingDate]) jobsByDate[j.bookingDate] = [];
      jobsByDate[j.bookingDate].push(j);
    }
  });

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const setToday = () => {
    const now = new Date(2026, 9, 24);
    setCurrentDate(now);
    setSelectedDateStr('2026-10-24');
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const selectedDateJobs = jobsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Schedule Top View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Worker Schedule & Agenda</h3>
            <p className="text-xs text-slate-500">Plan dispatch times and review upcoming appointments</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setScheduleSubView('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              scheduleSubView === 'month'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar Grid
          </button>
          <button
            onClick={() => setScheduleSubView('agenda')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              scheduleSubView === 'agenda'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chronological Agenda
          </button>
        </div>
      </div>

      {/* Calendar Grid View */}
      {scheduleSubView === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Picker Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900">{monthName}</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={setToday}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={prevMonth}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5 text-xs">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 rounded-xl bg-slate-50/50" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDateStr === dateKey;
                const isToday = dateKey === '2026-10-24';
                const dayJobs = jobsByDate[dateKey] || [];

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDateStr(dateKey)}
                    className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : isToday
                        ? 'border-slate-300 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-indigo-700'
                            : isToday
                            ? 'w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[11px]'
                            : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayJobs.length > 0 && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1 rounded-sm">
                          {dayJobs.length}
                        </span>
                      )}
                    </div>

                    {/* Miniature job pills in date cell */}
                    {dayJobs.length > 0 && (
                      <div className="space-y-0.5 overflow-hidden">
                        {dayJobs.slice(0, 1).map((j) => (
                          <div
                            key={j._id || j.bookingId}
                            className={`text-[9px] font-medium px-1 py-0.5 rounded truncate ${
                              j.bookingStatus === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : j.bookingStatus === 'in-progress'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {j.timeSlot?.split('-')[0] || ''} {j.serviceTitle}
                          </div>
                        ))}
                        {dayJobs.length > 1 && (
                          <div className="text-[9px] text-slate-400 font-semibold pl-0.5">
                            +{dayJobs.length - 1} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Day Schedule
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h4>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  {selectedDateJobs.length} {selectedDateJobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>

              {/* Jobs List on selected date */}
              <div className="mt-4 space-y-3">
                {selectedDateJobs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium">No service calls scheduled for this date.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Pick another date on the calendar.</p>
                  </div>
                ) : (
                  selectedDateJobs.map((j) => {
                    const statusConfig = getStatusStyle(j.bookingStatus);
                    return (
                      <div
                        key={j._id || j.bookingId}
                        onClick={() => onViewJob(j)}
                        className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {j.bookingId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {j.serviceTitle}
                          </h5>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{j.timeSlot}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[130px]">{j.customerInfo?.city}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-600 font-medium">{j.customerInfo?.name}</span>
                          <span className="text-xs font-extrabold text-slate-900">
                            ₹{Math.round((j.priceBreakdown?.total || 799) * 0.75)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Agenda View */}
      {scheduleSubView === 'agenda' && (
        <div className="space-y-6">
          {/* Today's Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Today's Scheduled Appointments ({today.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500">2026-10-24</span>
            </div>

            {today.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No jobs currently scheduled for today.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {today.map((j) => (
                  <div
                    key={j._id || j.bookingId}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {j.bookingId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${getStatusStyle(j.bookingStatus).badge}`}>
                          {j.bookingStatus}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900">{j.serviceTitle}</h5>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-semibold text-slate-800">{j.timeSlot}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{j.customerInfo?.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        Payout: ₹{Math.round((j.priceBreakdown?.total || 799) * 0.75)}
                      </span>
                      <button
                        onClick={() => onViewJob(j)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tomorrow's Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Tomorrow's Scheduled Bookings ({tomorrow.length})
              </h4>
              <span className="text-xs text-slate-500">2026-10-25</span>
            </div>

            {tomorrow.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No bookings scheduled for tomorrow.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tomorrow.map((j) => (
                  <div
                    key={j._id || j.bookingId}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {j.bookingId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${getStatusStyle(j.bookingStatus).badge}`}>
                          {j.bookingStatus}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900">{j.serviceTitle}</h5>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-semibold text-slate-800">{j.timeSlot}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{j.customerInfo?.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        Payout: ₹{Math.round((j.priceBreakdown?.total || 799) * 0.75)}
                      </span>
                      <button
                        onClick={() => onViewJob(j)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Completed Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Fulfilled Service History ({past.length})
              </h4>
              <span className="text-xs text-slate-500">Past completions</span>
            </div>

            {past.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No past jobs on record.</p>
            ) : (
              <div className="space-y-3">
                {past.map((j) => (
                  <div
                    key={j._id || j.bookingId}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {j.bookingId}
                        </span>
                        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Fulfilled</span>
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{j.bookingDate}</span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900">{j.serviceTitle}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Client: <span className="text-slate-700">{j.customerInfo?.name}</span> ({j.customerInfo?.city})
                      </p>

                      {j.review && (
                        <div className="mt-2 text-xs flex items-center space-x-1.5 text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{j.review.rating}.0</span>
                          <span className="italic text-slate-600">"{j.review.comment}"</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Payout Earned</span>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{Math.round((j.priceBreakdown?.total || 799) * 0.75)}
                        </span>
                      </div>
                      <button
                        onClick={() => onViewJob(j)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
