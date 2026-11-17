import React, { useState, useEffect } from 'react';
import { membersApi } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { 
  Clock, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';

export function MemberHistoryPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await membersApi.getMyLoans();
      setLoans(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch personal borrowing history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const activeLoans = loans.filter(l => l.status !== 'RETURNED');
  const returnedLoans = loans.filter(l => l.status === 'RETURNED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Borrowing History</h1>
          <p className="text-sm text-slate-500">Your personal university library record of active loans and past returns</p>
        </div>

        <button
          onClick={loadHistory}
          title="Refresh history"
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Retrieving your borrowing records..." />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Borrowing History"
          description="You haven't borrowed any books from the university library yet. Check out the catalogue to explore available titles."
        />
      ) : (
        <div className="space-y-8">
          {/* Section 1: Currently Borrowed Books (FR-50) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Currently Borrowed Books</h2>
              <Badge status="BORROWED" count={activeLoans.length} />
            </div>

            {activeLoans.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">
                You currently have no unreturned library books.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLoans.map((loan) => {
                  const isOverdue = loan.status === 'OVERDUE';
                  return (
                    <div 
                      key={loan.loan_id}
                      className={`bg-white rounded-2xl p-5 border shadow-xs transition flex flex-col justify-between ${
                        isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono text-slate-400">Loan #{loan.loan_id}</span>
                          <Badge status={loan.status} />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 mb-1">
                          {loan.book?.title}
                        </h3>
                        <p className="text-xs text-slate-600 mb-3">
                          By <span className="font-medium text-slate-800">{loan.book?.author}</span> &bull; {loan.book?.category}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Borrowed On:</span>
                          </span>
                          <span className="font-medium text-slate-800">{loan.borrowed_at}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className={isOverdue ? 'font-bold text-rose-600' : ''}>Expected Due Date:</span>
                          </span>
                          <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                            {loan.due_date}
                          </span>
                        </div>
                        {isOverdue && (
                          <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center space-x-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>This loan is past due date. Please return it to the library desk.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Previously Returned Books (FR-51) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Returned History</h2>
              <Badge status="RETURNED" count={returnedLoans.length} />
            </div>

            {returnedLoans.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">
                No past returned books in your history.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Loan ID</th>
                        <th className="px-5 py-3.5">Book Title & Author</th>
                        <th className="px-5 py-3.5">Borrowed Date</th>
                        <th className="px-5 py-3.5">Due Date</th>
                        <th className="px-5 py-3.5">Actual Return Date</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {returnedLoans.map((loan) => (
                        <tr key={loan.loan_id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{loan.loan_id}</td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900">{loan.book?.title}</div>
                            <div className="text-xs text-slate-500">{loan.book?.author}</div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-600">{loan.borrowed_at}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-600">{loan.due_date}</td>
                          <td className="px-5 py-3.5 text-xs font-medium text-emerald-700">
                            {loan.returned_at}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge status="RETURNED" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
