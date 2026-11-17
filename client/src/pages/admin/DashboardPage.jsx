import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, loansApi } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { BorrowModal } from '../../components/books/BorrowModal';
import { BookFormModal } from '../../components/books/BookFormModal';
import { MemberFormModal } from '../../components/members/MemberFormModal';
import { booksApi, membersApi } from '../../api/client';
import { 
  BookMarked, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  Plus, 
  Repeat, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, loansRes] = await Promise.all([
        dashboardApi.getSummary(),
        loansApi.getAll({ limit: 5 })
      ]);
      setSummary(sumRes.data);
      setRecentLoans(loansRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateBook = async (data) => {
    await booksApi.create(data);
    loadDashboardData();
  };

  const handleCreateMember = async (data) => {
    await membersApi.create(data);
    loadDashboardData();
  };

  const handleBorrowBook = async (data) => {
    await loansApi.borrow(data);
    loadDashboardData();
  };

  if (loading && !summary) {
    return <LoadingSpinner message="Calculating live library statistics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Librarian Dashboard</h1>
          <p className="text-sm text-slate-500">Live library circulation, inventory metrics, and overdue loans</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDashboardData}
            title="Refresh statistics"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          
          <button
            onClick={() => setBorrowModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition"
          >
            <Repeat className="w-4 h-4" />
            <span>Issue Loan</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadDashboardData} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* 4 Required Metric Cards (FR-55, 56, 57, 58) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Books"
          value={summary?.total_books ?? 0}
          subtitle={`${summary?.total_physical_copies ?? 0} physical copies`}
          icon={BookMarked}
          color="emerald"
        />

        <StatCard
          title="Registered Members"
          value={summary?.total_members ?? 0}
          subtitle="Active readers"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Currently Borrowed"
          value={summary?.currently_borrowed ?? 0}
          subtitle="Active book copies out"
          icon={BookOpen}
          color="purple"
        />

        <StatCard
          title="Overdue Loans"
          value={summary?.overdue_loans ?? 0}
          subtitle={summary?.overdue_loans > 0 ? "Action required" : "All on schedule"}
          icon={AlertTriangle}
          color={summary?.overdue_loans > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Quick Management Operations</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setBorrowModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition"
          >
            <Repeat className="w-4 h-4" />
            <span>Issue / Borrow Book</span>
          </button>

          <button
            onClick={() => setBookModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add New Book Record</span>
          </button>

          <button
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Register New Member</span>
          </button>

          <Link
            to="/admin/overdue"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold transition ml-auto"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>View All Overdue ({summary?.overdue_loans ?? 0})</span>
          </Link>
        </div>
      </div>

      {/* Recent Loans Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Circulation Activity</h2>
            <p className="text-xs text-slate-500">Most recent borrowing and return actions</p>
          </div>
          <Link
            to="/admin/loans"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Loan ID</th>
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Book Title</th>
                <th className="px-5 py-3.5">Borrow Date</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLoans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No circulation activity yet. Use "Issue Loan" above.
                  </td>
                </tr>
              ) : (
                recentLoans.map((loan) => (
                  <tr key={loan.loan_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{loan.loan_id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {loan.member?.full_name || `Member #${loan.member_id}`}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {loan.book?.title || `Book #${loan.book_id}`}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{loan.borrowed_at}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{loan.due_date}</td>
                    <td className="px-5 py-3.5">
                      <Badge status={loan.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onBorrowSuccess={handleBorrowBook}
      />

      <BookFormModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSubmit={handleCreateBook}
      />

      <MemberFormModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSubmit={handleCreateMember}
      />
    </div>
  );
}
