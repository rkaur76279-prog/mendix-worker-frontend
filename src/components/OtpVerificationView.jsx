import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Lock,
} from 'lucide-react';

export default function OtpVerificationView({
  challengeId,
  maskedEmail,
  expiresInSeconds = 300,
  resendCooldownSeconds = 60,
  onVerify,
  onResend,
  onBackToLogin,
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('Verification code sent to your specialist email.');
  const [isSuccess, setIsSuccess] = useState(false);

  // Expiration countdown (in seconds)
  const [expiryTimer, setExpiryTimer] = useState(expiresInSeconds);
  // Resend cooldown timer (in seconds)
  const [cooldownTimer, setCooldownTimer] = useState(resendCooldownSeconds);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (expiryTimer <= 0) return;
    const interval = setInterval(() => {
      setExpiryTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTimer]);

  useEffect(() => {
    if (cooldownTimer <= 0) return;
    const interval = setInterval(() => {
      setCooldownTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '');

    if (!digit) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    if (digit.length > 1) {
      handlePastedCode(digit);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = digit[0];
    setOtpDigits(updated);
    setErrorMessage('');

    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    handlePastedCode(pasted);
  };

  const handlePastedCode = (code) => {
    const digits = code.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < digits.length; i++) {
      updated[i] = digits[i];
    }
    setOtpDigits(updated);
    setErrorMessage('');

    const nextIdx = Math.min(digits.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (expiryTimer <= 0) {
      setErrorMessage('Verification code has expired. Please request a new code.');
      return;
    }

    setErrorMessage('');
    setVerifyLoading(true);

    try {
      await onVerify(fullOtp);
      setIsSuccess(true);
      setSuccessMessage('Code verified successfully! Entering specialist dashboard...');
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect verification code. Please try again.');
      inputRefs.current[0]?.focus();
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldownTimer > 0 || resendLoading) return;

    setResendLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await onResend();
      setSuccessMessage(res?.message || 'A fresh verification code has been sent.');
      setOtpDigits(['', '', '', '', '', '']);
      setCooldownTimer(res?.resendCooldownSeconds || 60);
      setExpiryTimer(res?.expiresInSeconds || 300);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otpDigits.every((d) => d !== '');

  return (
    <div className="w-full bg-white rounded-2xl p-6 sm:p-8 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onBackToLogin}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Specialist Login</span>
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs border border-indigo-100">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verify Specialist Identity
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
          We've sent a 6-digit security code to your registered Mendx Pro email. Enter the code to authorize this session.
        </p>

        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
          <Mail className="w-3.5 h-3.5 text-indigo-600" />
          <span>{maskedEmail || 'specialist email'}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Enter 6-Digit Code
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifyLoading || isSuccess}
                className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border transition-all ${
                  digit
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'
                } ${errorMessage ? 'border-rose-400 bg-rose-50/50' : ''}`}
                autoComplete="off"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Code expires in:</span>
          <span className={`font-mono font-bold ${expiryTimer < 60 ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatTime(expiryTimer)}
          </span>
          {expiryTimer === 0 && (
            <span className="text-xs font-bold text-rose-600 ml-1">(Expired)</span>
          )}
        </div>

        <button
          type="submit"
          disabled={verifyLoading || !isOtpComplete || expiryTimer === 0 || isSuccess}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          {verifyLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Authorization...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Access Granted! Loading...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Verify & Access Console</span>
            </>
          )}
        </button>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Didn't receive the email code?
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldownTimer > 0 || resendLoading || isSuccess}
            className={`font-semibold transition-colors inline-flex items-center gap-1.5 ${
              cooldownTimer > 0 || resendLoading || isSuccess
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-indigo-600 hover:underline'
            }`}
          >
            {resendLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resending...</span>
              </>
            ) : cooldownTimer > 0 ? (
              <span>Resend code in {cooldownTimer}s</span>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

