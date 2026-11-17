import React, { useState, useEffect } from 'react';
import { membersApi } from '../../api/client';
import { MemberFormModal } from '../../components/members/MemberFormModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

export function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await membersApi.getAll({ search: searchTerm });
      setMembers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch registered members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateOrUpdate = async (data) => {
    if (editingMember) {
      await membersApi.update(editingMember.member_id, data);
      setSuccessMsg(`Member '${data.full_name}' updated successfully.`);
    } else {
      await membersApi.create(data);
      setSuccessMsg(`Member '${data.full_name}' registered successfully with student catalogue login.`);
    }
    loadMembers();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      await membersApi.delete(memberToDelete.member_id);
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
      setSuccessMsg(`Member record removed safely.`);
      loadMembers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Cannot delete member.');
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Member Management</h1>
          <p className="text-sm text-slate-500">Register, inspect, and update student and faculty library members</p>
        </div>

        <button
          onClick={() => {
            setEditingMember(null);
            setFormModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Member</span>
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
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
          />
        </div>

        <button
          onClick={loadMembers}
          title="Refresh members list"
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Members Table */}
      {loading ? (
        <LoadingSpinner message="Fetching members directory..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registered members found"
          description={searchTerm ? `No members matched "${searchTerm}".` : "There are currently no registered library members."}
          action={
            <button
              onClick={() => {
                setEditingMember(null);
                setFormModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Register First Member
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Member ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Registration Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.member_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{member.member_id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{member.full_name}</div>
                      <div className="text-xs text-slate-400">Student / Faculty Member</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5 text-slate-700 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.phone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.registration_date}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setFormModalOpen(true);
                        }}
                        title="Edit member details"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setMemberToDelete(member);
                          setDeleteConfirmOpen(true);
                        }}
                        title="Remove member"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <MemberFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingMember}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove Member Record"
        message={`Are you sure you want to remove "${memberToDelete?.full_name}"? (FR-23: Removal will be rejected if this member has active unreturned loans).`}
        confirmText="Remove Member"
      />
    </div>
  );
}
