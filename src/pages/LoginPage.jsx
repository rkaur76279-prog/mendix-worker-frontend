import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import OtpVerificationView from '../components/OtpVerificationView';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeData, setChallengeData] = useState(null);
  const [isOtpStep, setIsOtpStep] = useState(false);

  const { login, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your registered specialist email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim().toLowerCase(), password);
      if (res && res.requiresOtp && res.challengeId) {
        setChallengeData(res);
        setIsOtpStep(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    if (!challengeData?.challengeId) {
      throw new Error('No active verification session. Please sign in again.');
    }
    const user = await verifyOtp(challengeData.challengeId, code);
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 700);
    return user;
  };

  const handleResendOtp = async () => {
    if (!challengeData?.challengeId) {
      throw new Error('No active verification session.');
    }
    return await resendOtp(challengeData.challengeId);
  };

  const handleBackToLogin = () => {
    setIsOtpStep(false);
    setChallengeData(null);
    setError('');
  };

  const handleDemoFill = () => {
    setIsOtpStep(false);
    setChallengeData(null);
    setEmail('pro@mendx.com');
    setPassword('propassword123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Mendx Pro Specialist
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage service orders, schedule & field payouts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {isOtpStep ? (
          <div className="shadow-sm border border-slate-200 rounded-2xl bg-white">
            <OtpVerificationView
              challengeId={challengeData?.challengeId}
              maskedEmail={challengeData?.maskedEmail}
              expiresInSeconds={challengeData?.expiresInSeconds || 300}
              resendCooldownSeconds={challengeData?.resendCooldownSeconds || 60}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBackToLogin={handleBackToLogin}
            />
          </div>
        ) : (
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Specialist Email
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="technician@mendx.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In & Verify Security Code</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Preload */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Demo Specialist Account</span>
                </div>
                <p className="mt-1 text-xs text-indigo-700">
                  Email: <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-900">pro@mendx.com</code> <br />
                  Password: <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-900">propassword123</code>
                </p>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="mt-3 w-full py-1.5 px-3 bg-white text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  Auto-fill Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          Looking for customer booking? Go to{' '}
          <a href="http://localhost:5173" className="font-semibold text-indigo-600 hover:underline">
            Mendx Customer App
          </a>
        </p>
      </div>
    </div>
  );
};
