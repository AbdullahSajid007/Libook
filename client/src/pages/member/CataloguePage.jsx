import React, { useState, useEffect } from 'react';
import { booksApi } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { 
  BookOpen, 
  Search, 
  BookMarked, 
  CheckCircle, 
  XCircle, 
  RefreshCw 
} from 'lucide-react';

export function CataloguePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('ALL'); // 'ALL' | 'TITLE' | 'AUTHOR'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  const loadCatalogue = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm.trim()) {
        if (searchField === 'TITLE') {
          params.title = searchTerm.trim();
        } else if (searchField === 'AUTHOR') {
          params.author = searchTerm.trim();
        } else {
          params.search = searchTerm.trim();
        }
      }
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const res = await booksApi.getAll(params);
      setBooks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to search catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalogue();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, searchField, selectedCategory]);

  const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Library Catalogue</h1>
        <p className="text-sm text-slate-500">Explore textbooks, references, and monitor real-time copy availability</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Search and Filter Bar (FR-26, 27, 28) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search catalogue by ${searchField.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white font-medium text-slate-700"
            >
              <option value="ALL">Search All Fields</option>
              <option value="TITLE">Title Only</option>
              <option value="AUTHOR">Author Only</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white font-medium text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={loadCatalogue}
              title="Refresh catalogue"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Catalogue Cards Grid (FR-25, 29) */}
      {loading ? (
        <LoadingSpinner message="Searching library catalogue..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books matched your search"
          description={searchTerm ? `No library books found matching "${searchTerm}". Try checking your spelling or selecting "Search All Fields".` : "The catalogue is currently empty."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => {
            const isAvailable = book.available_copies > 0;
            return (
              <div 
                key={book.book_id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide uppercase">
                      {book.category}
                    </span>
                    <Badge 
                      status={isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} 
                      count={`${book.available_copies}/${book.total_copies}`}
                    />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-3 font-medium">
                    By <span className="text-slate-800">{book.author}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono">{book.isbn ? `ISBN: ${book.isbn}` : 'Local Record'}</span>
                  <div className="flex items-center space-x-1">
                    {isAvailable ? (
                      <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ready to borrow</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-amber-700 font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>All copies out</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
