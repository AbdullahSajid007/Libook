import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export function BookFormModal({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [availableCopies, setAvailableCopies] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setCategory(initialData.category || '');
      setIsbn(initialData.isbn || '');
      setTotalCopies(initialData.total_copies ?? 1);
      setAvailableCopies(initialData.available_copies ?? 1);
    } else {
      setTitle('');
      setAuthor('');
      setCategory('');
      setIsbn('');
      setTotalCopies(1);
      setAvailableCopies(1);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !author.trim() || !category.trim()) {
      setError('Title, author, and category are required.');
      return;
    }

    if (totalCopies < 0) {
      setError('Total copies cannot be negative.');
      return;
    }

    const payload = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn.trim() || null,
      total_copies: parseInt(totalCopies, 10),
    };

    if (initialData) {
      payload.available_copies = parseInt(availableCopies, 10);
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please check inputs.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Book Details' : 'Add New Book to Collection'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Book Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Introduction to Algorithms"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Author <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Thomas H. Cormen"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              ISBN (Unique Identifier)
            </label>
            <input
              type="text"
              placeholder="e.g. 978-0262033848"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Total Copies <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={totalCopies}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setTotalCopies(val);
                if (!initialData) setAvailableCopies(val);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>
        </div>

        {initialData && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Note: </span>
            Currently {initialData.available_copies} of {initialData.total_copies} copies available.
            Borrowed copies: {initialData.borrowed_copies}.
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update Book' : 'Add Book')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
