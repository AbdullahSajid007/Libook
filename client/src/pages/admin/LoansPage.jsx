import React, { useState, useEffect } from 'react';
import { loansApi } from '../../api/client';
import { BorrowModal } from '../../components/books/BorrowModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { 
  Repeat, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';

export function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);
  const [isReturning, setIsReturning] = useState(false);

  const loadLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await loansApi.getAll({ status: statusFilter });
      setLoans(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch borrowing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [statusFilter]);

  const handleBorrowSuccess = async (data) => {
    await loansApi.borrow(data);
    setSuccessMsg('Book borrowed successfully. Availability updated atomically.');
    loadLoans();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const confirmReturn = async () => {
    if (!loanToReturn) return;
    setIsReturning(true);
    setError('');
    try {
      await loansApi.returnLoan(loanToReturn.loan_id);
      setReturnConfirmOpen(false);
      setLoanToReturn(null);
      setSuccessMsg('Book returned successfully. Available copy count restored.');
      loadLoans();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to process return.');
      setReturnConfirmOpen(false);
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Circulation & Borrowing Records</h1>
          <p className="text-sm text-slate-500">Track all active, returned, and overdue book loans across the university</p>
        </div>

        <button
          onClick={() => setBorrowModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition"
        >
          <Repeat className="w-4 h-4" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Controls */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'BORROWED', 'OVERDUE', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition uppercase tracking-wider ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={loadLoans}
          title="Refresh loan records"
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition ml-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Loans Table */}
      {loading ? (
        <LoadingSpinner message="Loading circulation records..." />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No loan records found"
          description={`There are currently no loans matching the filter "${statusFilter}".`}
          action={
            <button
              onClick={() => setBorrowModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Issue First Book
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Loan ID</th>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Book Details</th>
                  <th className="px-5 py-3.5">Borrowed On</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Returned On</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => {
                  const isActive = loan.status !== 'RETURNED';
                  const isOverdue = loan.status === 'OVERDUE';
                  return (
                    <tr key={loan.loan_id} className={`hover:bg-slate-50/80 transition ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{loan.loan_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {loan.member?.full_name || `Member #${loan.member_id}`}
                        </div>
                        <div className="text-xs text-slate-400">{loan.member?.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {loan.book?.title || `Book #${loan.book_id}`}
                        </div>
                        <div className="text-xs text-slate-400">
                          {loan.book?.author} &bull; <span className="font-mono">{loan.book?.isbn || 'No ISBN'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{loan.borrowed_at}</td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                        {loan.due_date}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {loan.returned_at || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={loan.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isActive ? (
                          <button
                            onClick={() => {
                              setLoanToReturn(loan);
                              setReturnConfirmOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Returned</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onBorrowSuccess={handleBorrowSuccess}
      />

      {/* Return Confirmation Dialog */}
      <ConfirmDialog
        isOpen={returnConfirmOpen}
        onClose={() => setReturnConfirmOpen(false)}
        onConfirm={confirmReturn}
        isLoading={isReturning}
        isDestructive={false}
        title="Process Book Return"
        message={`Confirm return of "${loanToReturn?.book?.title}" borrowed by ${loanToReturn?.member?.full_name}? The available copies count will automatically increase by 1.`}
        confirmText="Confirm Return"
      />
    </div>
  );
}
