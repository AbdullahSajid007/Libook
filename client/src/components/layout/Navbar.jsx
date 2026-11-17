import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';

export function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">Libook</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                  University LMS
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800">{user.username}</span>
                  <span className="text-xs text-slate-500 flex items-center justify-end space-x-1">
                    {isAdmin ? <Shield className="w-3 h-3 text-emerald-600" /> : <UserIcon className="w-3 h-3 text-teal-600" />}
                    <span>{user.role}</span>
                  </span>
                </div>
                <Badge status={user.role} />
                <button
                  onClick={logout}
                  title="Log out"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
