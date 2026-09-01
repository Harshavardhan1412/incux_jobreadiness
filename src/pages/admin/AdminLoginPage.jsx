import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  BrainCircuit,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  User
} from 'lucide-react';

export const AdminLoginPage = () => {
  const { loginAdmin, navigateTo } = useApp();
  const [email, setEmail] = useState('admin@readysetjob.com');
  const [password, setPassword] = useState('AdminPass@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginAdmin();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo */}
        <div 
          onClick={() => navigateTo('dashboard')}
          className="flex items-center justify-center gap-3 cursor-pointer group mb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tight">
              ReadySet<span className="text-brand-400">Job</span>
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Admin & Recruiter Portal
            </span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Administrator Sign In
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Manage assessments, evaluate candidate benchmarks, and generate placement reports.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-850 py-8 px-6 sm:px-10 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 focus:bg-slate-950 text-xs sm:text-sm rounded-xl border border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Reset instructions sent to admin recovery email.'); }} className="text-[11px] font-semibold text-brand-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 focus:bg-slate-950 text-xs sm:text-sm rounded-xl border border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-400">Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={loginAdmin}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1-Click Instant Admin Access</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-500">
            Candidate looking for assessments?{' '}
            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="font-bold text-brand-400 hover:underline"
            >
              Candidate Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
