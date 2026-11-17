import React, { useState, useEffect } from 'react';
import { booksApi, loansApi } from '../../api/client';
import { BookFormModal } from '../../components/books/BookFormModal';
import { BorrowModal } from '../../components/books/BorrowModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Repeat, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [preselectedBookId, setPreselectedBookId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await booksApi.getAll({
        search: searchTerm,
        category: categoryFilter
      });
      setBooks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch books collection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  const handleCreateOrUpdate = async (data) => {
    if (editingBook) {
      await booksApi.update(editingBook.book_id, data);
      setSuccessMsg(`Book '${data.title}' updated successfully.`);
    } else {
      await booksApi.create(data);
      setSuccessMsg(`Book '${data.title}' created successfully.`);
    }
    loadBooks();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      await booksApi.delete(bookToDelete.book_id);
      setDeleteConfirmOpen(false);
      setBookToDelete(null);
      setSuccessMsg(`Book '${bookToDelete.title}' removed safely.`);
      loadBooks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Cannot delete book.');
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBorrow = async (data) => {
    await loansApi.borrow(data);
    setSuccessMsg('Book issued / loan created successfully.');
    loadBooks();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Derive unique categories from current books
  const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Management</h1>
          <p className="text-sm text-slate-500">Add, inspect, update, and manage the university book collection</p>
        </div>

        <button
          onClick={() => {
            setEditingBook(null);
            setFormModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
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

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, author, ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={loadBooks}
            title="Refresh books list"
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <LoadingSpinner message="Fetching library catalogue..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No books found"
          description={searchTerm ? `No books matched "${searchTerm}". Try a different keyword.` : "Your library currently has no book titles registered."}
          action={
            <button
              onClick={() => {
                setEditingBook(null);
                setFormModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Add First Book
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Title & Author</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">ISBN</th>
                  <th className="px-5 py-3.5 text-center">Available / Total</th>
                  <th className="px-5 py-3.5 text-center">Borrowed</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => {
                  const isAvailable = book.available_copies > 0;
                  return (
                    <tr key={book.book_id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{book.book_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{book.title}</div>
                        <div className="text-xs text-slate-500">{book.author}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                        {book.isbn || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge 
                          status={isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'} 
                          count={`${book.available_copies} / ${book.total_copies}`}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-slate-700">
                        {book.borrowed_copies}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setPreselectedBookId(book.book_id);
                            setBorrowModalOpen(true);
                          }}
                          disabled={!isAvailable}
                          title={isAvailable ? "Issue this book" : "No copies available"}
                          className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <Repeat className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setFormModalOpen(true);
                          }}
                          title="Edit book details"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setBookToDelete(book);
                            setDeleteConfirmOpen(true);
                          }}
                          title="Remove book"
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Book Modal */}
      <BookFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingBook}
      />

      {/* Quick Issue Loan Modal */}
      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onBorrowSuccess={handleBorrow}
        preselectedBookId={preselectedBookId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove Book Record"
        message={`Are you sure you want to remove "${bookToDelete?.title}"? (FR-13: Deletion will be rejected if this book has active loans).`}
        confirmText="Remove Book"
      />
    </div>
  );
}
