import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookMarked, 
  Users, 
  Repeat, 
  AlertCircle, 
  BookOpen, 
  Clock, 
  X 
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { isAdmin, isMember } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/books', label: 'Manage Books', icon: BookMarked },
    { to: '/admin/members', label: 'Manage Members', icon: Users },
    { to: '/admin/loans', label: 'Borrowing Records', icon: Repeat },
    { to: '/admin/overdue', label: 'Overdue Loans', icon: AlertCircle },
    { to: '/catalogue', label: 'Browse Catalogue', icon: BookOpen },
  ];

  const memberLinks = [
    { to: '/catalogue', label: 'Book Catalogue', icon: BookOpen },
    { to: '/member/history', label: 'My Borrowing History', icon: Clock },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 
        transition-transform duration-200 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full py-4 px-3">
          <div className="flex items-center justify-between px-3 mb-4 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Administration' : 'Student Portal'}
            </span>
          </div>

          <nav className="space-y-1.5 flex-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 px-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">University Library LMS</p>
              <p>v1.0.0 &bull; Fast, Secure, Cloud Ready</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
