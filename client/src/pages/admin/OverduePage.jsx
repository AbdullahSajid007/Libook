import React, { useState, useEffect } from 'react';
import { loansApi } from '../../api/client';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Calendar, 
  Mail, 
  Check 
} from 'lucide-react';

export function OverduePage() {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);
  const [isReturning, setIsReturning] = useState(false);

  const loadOverdue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await loansApi.getOverdue();
      setOverdueLoans(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch overdue loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverdue();
  }, []);

  const confirmReturn = async () => {
    if (!loanToReturn) return;
    setIsReturning(true);
    setError('');
    try {
      await loansApi.returnLoan(loanToReturn.loan_id);
      setReturnConfirmOpen(false);
      setLoanToReturn(null);
      setSuccessMsg(`Overdue book '${loanToReturn.book?.title}' marked as returned successfully.`);
      loadOverdue();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to process return.');
      setReturnConfirmOpen(false);
    } finally {
      setIsReturning(false);
    }
  };

  const getDaysOverdue = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overdue Loans Tracking</h1>
            <Badge status="OVERDUE" count={overdueLoans.length} />
          </div>
          <p className="text-sm text-slate-500">Books currently borrowed whose expected return date has passed</p>
        </div>

        <button
          onClick={loadOverdue}
          title="Refresh overdue records"
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Overdue Table */}
      {loading ? (
        <LoadingSpinner message="Scanning library due dates..." />
      ) : overdueLoans.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No Overdue Loans!"
          description="All active library loans are within their expected return dates. Excellent record keeping!"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between text-xs text-rose-800 font-medium">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{overdueLoans.length} active loan(s) require attention and return processing.</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Loan ID</th>
                  <th className="px-5 py-3.5">Member Details</th>
                  <th className="px-5 py-3.5">Book Details</th>
                  <th className="px-5 py-3.5">Borrowed On</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Days Late</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueLoans.map((loan) => {
                  const daysLate = getDaysOverdue(loan.due_date);
                  return (
                    <tr key={loan.loan_id} className="hover:bg-rose-50/30 transition">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{loan.loan_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{loan.member?.full_name}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{loan.member?.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{loan.book?.title}</div>
                        <div className="text-xs text-slate-500">{loan.book?.author}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{loan.borrowed_at}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-rose-600">{loan.due_date}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          {daysLate} day{daysLate === 1 ? '' : 's'} late
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setLoanToReturn(loan);
                            setReturnConfirmOpen(true);
                          }}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Process Return</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Confirmation Dialog */}
      <ConfirmDialog
        isOpen={returnConfirmOpen}
        onClose={() => setReturnConfirmOpen(false)}
        onConfirm={confirmReturn}
        isLoading={isReturning}
        isDestructive={false}
        title="Process Return for Overdue Book"
        message={`Confirm return for "${loanToReturn?.book?.title}" borrowed by ${loanToReturn?.member?.full_name}? The loan will be marked RETURNED and removed from the overdue list immediately (FR-47).`}
        confirmText="Confirm Return"
      />
    </div>
  );
}
