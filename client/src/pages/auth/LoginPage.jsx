import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Shield, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username.trim(), password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/catalogue');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">University Library</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to access library records and catalogue</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or member username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Helpers */}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Admin123!')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 rounded-xl text-xs font-semibold transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin / Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('alice.walker', 'Member123!')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 text-teal-800 rounded-xl text-xs font-semibold transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
