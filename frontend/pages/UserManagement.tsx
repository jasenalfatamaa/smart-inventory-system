
import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, KeyRound } from 'lucide-react';
import { useAuth } from '../context';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { User, UserRole } from '../types';
import { toast } from 'sonner';

const UserManagement: React.FC = () => {
  const { allUsers, addUser, updateUser, deleteUser, resetPassword, user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [pass, setPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser?.id) {
      await updateUser(selectedUser as User);
    } else {
      const u: User = {
        id: `u_${Date.now()}`,
        name: selectedUser?.name || '',
        username: selectedUser?.username || '',
        email: selectedUser?.email || '',
        role: selectedUser?.role || 'ADMIN',
        avatar: `https://ui-avatars.com/api/?name=${selectedUser?.name}&background=38BDF8&color=fff`
      };
      await addUser(u, pass || 'pass123');
    }
    setIsModalOpen(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser?.email) {
      await resetPassword(selectedUser.email, newPass);
      setIsResetModalOpen(false);
      setNewPass('');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <Button onClick={() => { setSelectedUser({ role: 'ADMIN' }); setPass(''); setIsModalOpen(true); }} icon={<UserPlus size={18} className="mr-2" />}>
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUsers.map(u => (
          <Card key={u.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={u.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{u.name}</p>
                <p className="text-xs text-slate-500 truncate">@{u.username} • {u.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'SUPER_ADMIN' ? 'bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-500'}`}>
                {u.role.replace('_', ' ')}
              </span>
              <div className="flex gap-1">
                {currentUser?.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => { setSelectedUser(u); setNewPass(''); setIsResetModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                    title="Reset Password"
                  >
                    <KeyRound size={16} />
                  </button>
                )}
                <button
                  onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                  className="p-1.5 text-slate-400 hover:text-sky-500 transition-colors"
                  title="Edit User"
                >
                  <Edit2 size={16} />
                </button>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={async () => { if (confirm('Delete user?')) await deleteUser(u.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* User Modal (Invite/Edit) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser?.id ? 'Edit User' : 'Invite New User'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={selectedUser?.name || ''} onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })} required />
          <Input label="Username" value={selectedUser?.username || ''} onChange={e => setSelectedUser({ ...selectedUser, username: e.target.value })} required />
          <Input label="Email Address" type="email" value={selectedUser?.email || ''} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} required />

          {!selectedUser?.id && (
            <Input label="Initial Password" type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">System Role</label>
            <select
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20"
              value={selectedUser?.role}
              onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{selectedUser?.id ? 'Update' : 'Invite User'}</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal (Super Admin Only) */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Password" size="sm">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-slate-500">Resetting password for <strong>{selectedUser?.name}</strong>.</p>
          <Input
            label="New Password"
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="Min. 8 characters"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="warning">Reset Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;