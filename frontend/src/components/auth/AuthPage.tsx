import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, registerUser, clearError } from '../../store/authSlice';
import { Lock, Mail, User, AlertCircle, Eye, EyeOff, ArrowLeft, Key } from 'lucide-react';
import { apiClient } from '../../api/client';

import { Logo } from '../common/Logo';

interface AuthPageProps {
  onClose?: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

export const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot/Reset password specific states
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotToken, setForgotToken] = useState<string | null>(null);
  
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    setValidationError(null);
    setForgotSuccess(null);
    setForgotToken(null);
    setResetSuccess(null);
  }, [view, dispatch]);

  const isLogin = view === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (view === 'login') {
      dispatch(loginUser({ email, password }));
    } else if (view === 'signup') {
      const resultAction = await dispatch(registerUser({ email, password, full_name: fullName || undefined }));
      if (registerUser.fulfilled.match(resultAction)) {
        // Automatically log the user in after registration
        dispatch(loginUser({ email, password }));
      }
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setForgotSuccess(null);
    setForgotToken(null);

    if (!email) {
      setValidationError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setForgotSuccess(response.data.message);
      setForgotToken(response.data.token);
      // Pre-populate the reset token field for the next screen
      setResetToken(response.data.token);
      
      // Navigate to reset password view after a short delay
      setTimeout(() => {
        setView('reset');
      }, 3500);
    } catch (err: any) {
      setValidationError(err.response?.data?.detail || 'Failed to generate password reset token.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setResetSuccess(null);

    if (!resetToken || !newPassword) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters long.');
      return;
    }

    setResetLoading(true);
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token: resetToken,
        new_password: newPassword
      });
      setResetSuccess(response.data.message);
      
      // Navigate back to login view after success
      setTimeout(() => {
        setView('login');
      }, 3500);
    } catch (err: any) {
      setValidationError(err.response?.data?.detail || 'Failed to reset password. The token may be expired or invalid.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-[#5C432E] font-sans antialiased overflow-hidden">
      {/* Left side: Premium Branding & Visual Element */}
      <div className="flex-1 hidden md:flex flex-col justify-between p-12 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 relative border-r border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_50%)]" />
        
        {/* Brand Header */}
        <Logo className="relative z-10" iconSize={36} logoColorClass="text-indigo-500" />

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg">
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-3 py-1.5 rounded-full inline-block mb-6 tracking-widest uppercase">
            AI-POWERED CANDIDATE EVALUATION
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-100 tracking-tight leading-tight">
            Analyze. Grade. Hire.
          </h2>
          <p className="text-slate-500 mt-4 text-xs font-semibold leading-relaxed">
            Upload resumes, check ATS compliance, grade bullet points, map keywords, and find candidates who fit your openings perfectly with CV Dada.
          </p>
        </div>

        {/* Quote/Trust indicator */}
        <div className="relative z-10 text-[10px] font-bold text-slate-600 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session Engine v1.0.2 • Celery Distributed Queue Enabled</span>
        </div>
      </div>

      {/* Right side: Login / Signup / Recovery Form Card */}
      <div className="w-full md:w-[500px] flex items-center justify-center p-8 bg-[#5C432E] border-l border-[#4a3424]/50 relative">
        <div className="absolute inset-0 md:hidden bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.08),transparent_50%)]" />
        
        <div className="w-full max-w-sm relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl ring-1 ring-gray-200/80 p-8 shadow-xl">
          {onClose && (
            <button 
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-white transition-colors mb-6 cursor-pointer border-0 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          )}

          {/* Header */}
          <div className="text-center md:text-left mb-8">
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              {view === 'login' && 'Sign in to dashboard'}
              {view === 'signup' && 'Create recruiter account'}
              {view === 'forgot' && 'Recover password'}
              {view === 'reset' && 'Reset your password'}
            </h1>
            <p className="text-slate-600 text-xs mt-2 font-medium">
              {view === 'login' && 'Welcome back. Enter your credentials to access the talent pool.'}
              {view === 'signup' && 'Get started by creating local authentication credentials.'}
              {view === 'forgot' && 'Enter your email address to generate a recovery token.'}
              {view === 'reset' && 'Enter the reset token and your secure new password.'}
            </p>
          </div>

          {/* Error alerts */}
          {(error || validationError) && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-xs text-rose-500 mb-6 animate-slide-up">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Authorization Error</p>
                <p className="mt-0.5 font-semibold text-rose-600">{error || validationError}</p>
              </div>
            </div>
          )}

          {/* Success Alerts */}
          {forgotSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-xs text-emerald-600 mb-6 animate-slide-up">
              <span className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 font-bold">✓</span>
              <div className="w-full">
                <p className="font-bold text-slate-900">Token Generated</p>
                <p className="mt-0.5 font-semibold text-emerald-600">{forgotSuccess}</p>
                {forgotToken && (
                  <div className="mt-2.5 p-2 bg-slate-900 text-slate-200 rounded-xl select-all break-all font-mono text-[9px] leading-normal ring-1 ring-white/10">
                    {forgotToken}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-slate-500 font-semibold animate-pulse">Redirecting to Reset screen...</p>
              </div>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-xs text-emerald-600 mb-6 animate-slide-up">
              <span className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 font-bold">✓</span>
              <div>
                <p className="font-bold text-slate-900">Password Reset</p>
                <p className="mt-0.5 font-semibold text-emerald-600">{resetSuccess}</p>
                <p className="mt-2 text-[10px] text-slate-500 font-semibold animate-pulse">Redirecting to Sign In...</p>
              </div>
            </div>
          )}

          {/* Form Content switcher */}
          {(view === 'login' || view === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Only for signup) */}
              {view === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 bg-white border border-[#4a3424] rounded-full pl-10.5 pr-4 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Email Address <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-white border border-[#4a3424] rounded-full pl-10.5 pr-4 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Password <span className="text-indigo-600">*</span>
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 bg-white border border-[#4a3424] rounded-full pl-10.5 pr-11 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gray-900 hover:bg-indigo-650 active:bg-gray-950 disabled:bg-[#3a281c] disabled:text-slate-500 text-white font-bold text-xs rounded-full shadow-sm hover:shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center border-0"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Forgot view form */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Email Address <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-white border border-[#4a3424] rounded-full pl-10.5 pr-4 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full h-11 bg-gray-900 hover:bg-indigo-650 active:bg-gray-950 disabled:bg-[#3a281c] disabled:text-slate-500 text-white font-bold text-xs rounded-full shadow-sm hover:shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center border-0"
              >
                {forgotLoading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Generate Recovery Token'
                )}
              </button>
            </form>
          )}

          {/* Reset view form */}
          {view === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-slide-up">
              {/* Token field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Recovery Token <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Paste recovery token here"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full h-11 bg-white border border-[#4a3424] rounded-full pl-10.5 pr-4 text-slate-900 text-xs placeholder-slate-400 font-mono focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* New password field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                  New Password <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 bg-white border border-[#4a3424] rounded-full pl-10.5 pr-11 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full h-11 bg-gray-900 hover:bg-indigo-650 active:bg-gray-950 disabled:bg-[#3a281c] disabled:text-slate-500 text-white font-bold text-xs rounded-full shadow-sm hover:shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center border-0"
              >
                {resetLoading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Toggle Switch */}
          <div className="mt-8 text-center text-xs font-semibold">
            {isLogin && (
              <>
                <span className="text-slate-600">Don't have an account?</span>{' '}
                <button
                  onClick={() => setView('signup')}
                  className="text-indigo-600 hover:text-indigo-500 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Sign Up
                </button>
              </>
            )}
            {view === 'signup' && (
              <>
                <span className="text-slate-600">Already have an account?</span>{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-indigo-600 hover:text-indigo-500 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Sign In
                </button>
              </>
            )}
            {(view === 'forgot' || view === 'reset') && (
              <button
                onClick={() => setView('login')}
                className="text-indigo-600 hover:text-indigo-500 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0 flex items-center gap-1.5 justify-center mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
