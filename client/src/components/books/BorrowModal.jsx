import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { membersApi, booksApi } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function BorrowModal({ isOpen, onClose, onBorrowSuccess, preselectedBookId = null }) {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId || '');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [borrowedAt, setBorrowedAt] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      async function fetchOptions() {
        setLoadingOptions(true);
        setError('');
        try {
          const [mRes, bRes] = await Promise.all([
            membersApi.getAll({ limit: 200 }),
            booksApi.getAll({ limit: 200 })
          ]);
          setMembers(mRes.data || []);
          setBooks(bRes.data || []);
          if (preselectedBookId) {
            setSelectedBookId(preselectedBookId);
          }
        } catch (err) {
          setError('Failed to load members or books list');
        } finally {
          setLoadingOptions(false);
        }
      }
      fetchOptions();
    }
  }, [isOpen, preselectedBookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMemberId) {
      setError('Please select a member.');
      return;
    }
    if (!selectedBookId) {
      setError('Please select a book.');
      return;
    }
    if (new Date(dueDate) < new Date(borrowedAt)) {
      setError('Expected return date cannot be before borrowing date.');
      return;
    }

    setSubmitting(true);
    try {
      await onBorrowSuccess({
        member_id: parseInt(selectedMemberId, 10),
        book_id: parseInt(selectedBookId, 10),
        borrowed_at: borrowedAt,
        due_date: dueDate
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to borrow book.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBook = books.find(b => b.book_id === parseInt(selectedBookId, 10));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue / Borrow Book">
      {loadingOptions ? (
        <LoadingSpinner message="Loading library records..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Member <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m.member_id} value={m.member_id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Book <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="">-- Choose Book --</option>
              {books.map(b => (
                <option 
                  key={b.book_id} 
                  value={b.book_id}
                  disabled={b.available_copies <= 0}
                >
                  {b.title} by {b.author} - ({b.available_copies > 0 ? `${b.available_copies} available` : 'OUT OF STOCK'})
                </option>
              ))}
            </select>
          </div>

          {selectedBook && (
            <div className={`p-3 rounded-xl border text-xs ${
              selectedBook.available_copies > 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="font-semibold">{selectedBook.title}</span>: {selectedBook.available_copies} available copy / {selectedBook.total_copies} total.
              {selectedBook.available_copies <= 0 && ' (Cannot issue - no copies currently available)'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Borrowing Date
              </label>
              <input
                type="date"
                required
                value={borrowedAt}
                onChange={(e) => setBorrowedAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Expected Return Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (selectedBook && selectedBook.available_copies <= 0)}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition"
            >
              {submitting ? 'Processing...' : 'Confirm Borrow'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
