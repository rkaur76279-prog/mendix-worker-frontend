import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  CalendarCheck,
  Wallet,
  Star,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export const WorkerLayout = () => {
  const { worker, logout, toggleAvailability } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    try {
      setToggling(true);
      await toggleAvailability();
    } catch (err) {
      alert('Failed to update availability status.');
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Job Requests', path: '/requests', icon: Inbox },
    { name: 'My Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Schedule', path: '/schedule', icon: CalendarCheck },
    { name: 'Earnings', path: '/earnings', icon: Wallet },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/90 shadow-xs shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xl tracking-tight text-[#0B0B2B]">MENDX</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Specialist Portal</p>
            </div>
          </div>
        </div>

        {/* Worker Profile / Status Card */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm border border-indigo-200 shrink-0">
              {(worker?.fullName || worker?.name)?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{worker?.fullName || worker?.name || 'Specialist'}</p>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="capitalize">{worker?.city || 'Verified Pro'}</span>
              </div>
            </div>
          </div>

          {/* Quick Availability Toggle */}
          <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  worker?.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="text-[11px] font-semibold text-slate-600">
                {worker?.isAvailable !== false ? 'Online & Ready' : 'Shift Offline'}
              </span>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                worker?.isAvailable !== false
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {toggling ? '...' : worker?.isAvailable !== false ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <NavLink
            to="/profile"
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200/90 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tight text-[#0B0B2B]">MENDX PRO</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggle}
            className={`text-[11px] px-2.5 py-1 rounded-full font-bold border flex items-center space-x-1.5 ${
              worker?.isAvailable !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                worker?.isAvailable !== false ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>{worker?.isAvailable !== false ? 'Online' : 'Offline'}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1 z-20 shadow-lg animate-in fade-in duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-rose-600 text-xs font-bold hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-20 md:pb-8 flex flex-col">
        {/* Top desktop header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/90 px-8 items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900">Specialist Workspace</h2>
            <p className="text-[11px] text-slate-500 font-medium">Real-time job allocation &amp; scheduled appointments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold">{worker?.city || 'Mumbai'} Service Hub</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-extrabold text-slate-900">{worker?.fullName || worker?.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{worker?.email}</p>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-2 px-1 shadow-xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 text-[10px] font-bold rounded-lg transition-colors ${
                  isActive ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
