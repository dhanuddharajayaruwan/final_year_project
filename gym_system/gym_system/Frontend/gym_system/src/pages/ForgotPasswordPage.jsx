import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import authService from '../services/auth.service';

// ─── Step indicators ──────────────────────────────────────────────────────────
const STEPS = ['Email Check', 'Verify OTP', 'Reset Password'];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((label, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              transition-all duration-300
              ${done   ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'  : ''}
              ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-110' : ''}
              ${!done && !active ? 'bg-gray-800 text-gray-500 border border-gray-700' : ''}
            `}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${
              active ? 'text-red-500' : done ? 'text-green-500' : 'text-gray-600'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-10 mx-1 mb-5 transition-all duration-300 ${done ? 'bg-green-600' : 'bg-gray-800'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Email Step ───────────────────────────────────────────────────────────────
const EmailStep = ({ onSuccess }) => {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Email is required.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');

    setLoading(true);
    try {
      await authService.sendOtp(email);
      onSuccess(email);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Forgot Password?</h2>
        <p className="text-gray-400 text-sm mt-2">Enter your registered email and we'll send you a code.</p>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="fp-email">Email Address</label>
          <input
            id="fp-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border border-gray-800 focus:ring-red-600 focus:border-red-600 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 mt-2 rounded hover:bg-red-700 transition uppercase tracking-widest text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending OTP...
            </span>
          ) : 'Send OTP'}
        </button>
      </form>

      <p className="text-gray-500 text-sm text-center mt-6">
        Remembered it?{' '}
        <Link to="/login" className="text-red-500 hover:text-red-400 transition font-bold">Back to Login</Link>
      </p>
    </>
  );
};

// ─── OTP Step ─────────────────────────────────────────────────────────────────
const OtpStep = ({ email, onSuccess, onBack }) => {
  const [otp,      setOtp]      = useState(['', '', '', '', '', '']);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(60); // seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // 1-minute countdown before resend is allowed
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (i, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[i] = value.slice(-1); // keep last digit
    setOtp(next);
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return setError('Please enter the complete 6-digit code.');
    setError('');
    setLoading(true);
    try {
      await authService.verifyOtp(email, code);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setResendMsg('');
    try {
      await authService.resendOtp(email);
      setResendMsg('A new OTP has been sent to your email!');
      setOtp(['', '', '', '', '', '']);
      setCooldown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
      // restart countdown
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Enter OTP</h2>
        <p className="text-gray-400 text-sm mt-2">
          We sent a 6-digit code to <span className="text-red-400 font-semibold">{maskedEmail}</span>
        </p>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}
      {resendMsg && (
        <div className="bg-green-600/20 border border-green-600 text-green-400 text-sm px-4 py-3 rounded mb-5 text-center font-semibold">
          {resendMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP boxes */}
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-12 h-14 text-center text-2xl font-bold rounded-lg
                bg-[#121212] border-2 text-white
                focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30
                transition-all duration-200
                ${digit ? 'border-red-600 shadow-md shadow-red-600/20' : 'border-gray-700'}
              `}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition uppercase tracking-widest text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Verifying...
            </span>
          ) : 'Verify OTP'}
        </button>
      </form>

      {/* Resend section */}
      <div className="mt-5 text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-red-500 hover:text-red-400 text-sm font-bold transition underline underline-offset-2"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            Resend OTP in{' '}
            <span className="text-red-400 font-bold tabular-nums">{String(Math.floor(cooldown / 60)).padStart(2, '0')}:{String(cooldown % 60).padStart(2, '0')}</span>
          </p>
        )}
      </div>

      <button
        onClick={onBack}
        className="mt-4 w-full text-gray-500 hover:text-gray-300 text-sm text-center transition font-semibold flex items-center justify-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>
    </>
  );
};

// ─── Reset Password Step ──────────────────────────────────────────────────────
const ResetStep = ({ email }) => {
  const navigate = useNavigate();
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);

  const strength = (() => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 6)  return { label: 'Too short', color: 'bg-red-600', width: '20%' };
    if (password.length < 8)  return { label: 'Weak',      color: 'bg-orange-500', width: '40%' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'bg-yellow-500', width: '60%' };
    if (password.length >= 10 && /[!@#$%^&*]/.test(password)) return { label: 'Strong', color: 'bg-green-500', width: '100%' };
    return { label: 'Good', color: 'bg-green-600', width: '80%' };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await authService.resetPasswordWithOtp(email, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600/10 border-2 border-green-600/40 mb-6 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Password Reset!</h3>
        <p className="text-gray-400 text-sm mt-2">Your password has been updated successfully.</p>
        <p className="text-gray-500 text-xs mt-3">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">New Password</h2>
        <p className="text-gray-400 text-sm mt-2">Choose a strong password for your account.</p>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New password */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="new-password">New Password</label>
          <div className="relative">
            <input
              id="new-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border border-gray-800 focus:ring-red-600 focus:border-red-600 transition pr-12"
            />
            <EyeToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
          </div>
          {/* Strength bar */}
          {password && (
            <div className="mt-2">
              <div className="h-1 w-full bg-gray-800 rounded">
                <div className={`h-1 rounded transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <p className="text-xs mt-1 text-gray-500">{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="confirm-password">Confirm Password</label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border transition pr-12 ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-600 focus:ring-red-600'
                  : confirmPassword && password === confirmPassword
                    ? 'border-green-600 focus:ring-green-600'
                    : 'border-gray-800 focus:ring-red-600 focus:border-red-600'
              }`}
            />
            <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 mt-2 rounded hover:bg-red-700 transition uppercase tracking-widest text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Resetting...
            </span>
          ) : 'Reset Password'}
        </button>
      </form>
    </>
  );
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onClose }) => (
  <div className="bg-red-600/20 border border-red-600 text-red-400 text-sm px-4 py-3 rounded mb-5 flex justify-between items-center">
    <span>{message}</span>
    <button onClick={onClose} className="hover:opacity-70 transition ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
);

const EyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition"
  >
    {show ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const [step,  setStep]  = useState(0);  // 0 = email, 1 = otp, 2 = reset
  const [email, setEmail] = useState('');

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col justify-center items-center px-4 relative pt-24 pb-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-transparent pointer-events-none" />

        <div className="z-10 w-full max-w-md bg-[#1a1a1a] p-8 md:p-10 rounded-lg shadow-2xl border border-gray-800">
          {/* Brand */}
          <div className="text-center mb-6">
            <Link to="/" className="font-extrabold text-3xl tracking-widest cursor-pointer inline-block">
              <span className="text-red-600 font-bold">C</span>YLON
              <span className="text-red-600 font-bold ml-1">F</span>ORCE
            </Link>
          </div>

          <StepBar current={step} />

          {step === 0 && (
            <EmailStep onSuccess={(e) => { setEmail(e); setStep(1); }} />
          )}
          {step === 1 && (
            <OtpStep
              email={email}
              onSuccess={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <ResetStep email={email} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
