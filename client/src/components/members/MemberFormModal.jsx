import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export function MemberFormModal({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setRegistrationDate(initialData.registration_date || new Date().toISOString().split('T')[0]);
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      registration_date: registrationDate
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Member Information' : 'Register New Member'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="e.g. john.doe@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +1-555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Registration Date
            </label>
            <input
              type="date"
              required
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-0.5">Note on Member Account:</p>
          Registering a member also provisions student catalogue access with default password <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">Member123!</code>.
        </div>

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
            {isLoading ? 'Saving...' : (initialData ? 'Update Member' : 'Register Member')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
