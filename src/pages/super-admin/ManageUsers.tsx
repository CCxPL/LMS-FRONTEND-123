import React, { useEffect, useState, useRef } from 'react';
import { Search, Filter, MoreVertical, Eye, Pencil, Trash2, UserCheck, UserX, Shield, Download, UploadCloud, FileText, Check, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { User } from '../../types/user.types';
import { ROLE_LABELS } from '../../utils/constants';
import type { UserRole } from '../../types/auth.types';
import { useToast } from '../../context/ToastContext';
import { getSuperAdminUsersApi, removeUserApi, changeUserRoleApi, toggleUserStatusApi } from '../../api/superadminApi';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: any; type: 'delete' | 'toggle' | 'role-change'; newRole?: string } | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [newlyAddedEmails, setNewlyAddedEmails] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    status: 'active'
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await getSuperAdminUsersApi({ limit: 100 });
      const mapped = (res.data.users || []).map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'SuperAdmin' ? 'super-admin' :
          u.role === 'Admin' ? 'admin' :
            u.role === 'Teacher' ? 'teacher' : 'student',
        status: u.isActive ? 'active' : 'suspended',
        createdAt: new Date(u.createdAt).toLocaleDateString(),
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
      }));
      setUsers(mapped);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async () => {
    if (!confirmAction) return;
    try {
      await toggleUserStatusApi(confirmAction.user.id);
      setUsers(prev => prev.map(u =>
        u.id === confirmAction.user.id
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      ));
      showToast(`User ${confirmAction.user.status === 'active' ? 'suspended' : 'activated'} successfully`, 'success');
    } catch (error) {
      showToast('Failed to update user status', 'error');
    }
    setConfirmAction(null);
  };

  const handleDelete = async () => {
    if (!confirmAction) return;
    try {
      await removeUserApi(confirmAction.user.id);
      setUsers(prev => prev.filter(u => u.id !== confirmAction.user.id));
      showToast('User deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
    setConfirmAction(null);
  };

  const handleRoleChange = async () => {
    if (!confirmAction || !confirmAction.newRole) return;

    // Frontend role → Backend role map
    const roleMap: Record<string, string> = {
      'student': 'Student',
      'teacher': 'Teacher',
      'admin': 'Admin',
      'super-admin': 'SuperAdmin',
    };

    try {
      await changeUserRoleApi(confirmAction.user.id, roleMap[confirmAction.newRole] || confirmAction.newRole);
      setUsers(prev => prev.map(u =>
        u.id === confirmAction.user.id
          ? { ...u, role: confirmAction.newRole }
          : u
      ));
      showToast(`User role changed to ${confirmAction.newRole}`, 'success');
    } catch (error) {
      showToast('Failed to change role', 'error');
    }
    setConfirmAction(null);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setUsers(prev => prev.map(u =>
      u.id === editUser.id ? { ...u, ...formData } : u
    ));
    showToast('User updated successfully', 'success');
    setEditUser(null);
    resetForm();
  };

  const openEditModal = (user: any) => {
    setFormData({ name: user.name, email: user.email, role: user.role as UserRole, status: user.status });
    setEditUser(user);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'student', status: 'active' });
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      showToast('Please select users and an action', 'error');
      return;
    }
    if (bulkAction === 'delete') {
      for (const id of selectedUsers) {
        await removeUserApi(id).catch(() => { });
      }
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      showToast(`${selectedUsers.length} user(s) deleted`, 'success');
    } else if (bulkAction === 'suspend') {
      for (const id of selectedUsers) {
        await toggleUserStatusApi(id).catch(() => { });
      }
      setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'suspended' } : u));
      showToast(`${selectedUsers.length} user(s) suspended`, 'success');
    } else if (bulkAction === 'activate') {
      for (const id of selectedUsers) {
        await toggleUserStatusApi(id).catch(() => { });
      }
      setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'active' } : u));
      showToast(`${selectedUsers.length} user(s) activated`, 'success');
    }
    setSelectedUsers([]);
    setBulkAction('');
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Joined', 'Last Login'].join(','),
      ...filteredUsers.map(u => [u.name, u.email, u.role, u.status, u.createdAt, u.lastLogin || 'Never'].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Users exported successfully', 'success');
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }
    return fullText;
  };

  const parseUsersFromText = (text: string): any[] => {
    const users: any[] = [];
    let cleanText = text.replace(/User Role Status Report.*?Actions/i, "");
    const pattern = /(.+?)\s+(Admin|Teacher|Student|Super\s+Admin)\s+(Active|Inactive)\s+(\d{2}-[A-Za-z]{3}-\d{4})/gi;
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      let rawName = match[1].trim();
      let role = match[2];
      let status = match[3];
      const garbageCleaner = /^(Edit\/Delete|View\/Edit|View|All Access|\d{2}-[A-Za-z]{3}-\d{4})\s*/i;
      let cleanName = rawName.replace(garbageCleaner, '').replace(garbageCleaner, '').trim();
      cleanName = cleanName.replace(/[^a-zA-Z\s.]/g, '').trim();
      if (cleanName.length < 2) continue;
      const email = cleanName.toLowerCase().replace(/\s+/g, '.') + '@university.com';
      const normalizedRole = role.toLowerCase().replace('super admin', 'super-admin');
      users.push({ name: cleanName, email, role: normalizedRole, status: status.toLowerCase() });
    }
    if (users.length === 0) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = text.match(emailRegex);
      if (emails) {
        [...new Set(emails)].forEach(email => {
          users.push({ name: email.split('@')[0], email, role: 'student', status: 'active' });
        });
      }
    }
    return users;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { showToast('Please upload a valid PDF file', 'error'); return; }
    setIsImporting(true);
    showToast('Scanning PDF...', 'info');
    try {
      const extractedText = await extractTextFromPDF(file);
      const parsedUsers = parseUsersFromText(extractedText);
      if (parsedUsers.length === 0) {
        showToast('No users found in PDF.', 'error');
      } else {
        showToast(`Found ${parsedUsers.length} users.`, 'success');
        setImportedData(parsedUsers);
      }
    } catch (error) {
      showToast('Failed to read PDF file.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importedData || importedData.length === 0) return;
    try {
      showToast(`Importing ${importedData.length} users...`, 'info');
      const newEmails = importedData.map(u => u.email);
      setNewlyAddedEmails(prev => [...prev, ...newEmails]);
      await loadUsers();
      showToast(`Successfully imported ${importedData.length} users`, 'success');
    } catch (error) {
      showToast('Import failed', 'error');
    }
    setImportedData(null);
  };

  if (isLoading) return <Loader text="Loading users..." />;

  return (
    <div>
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title">Manage All Users</h1>
          <p className="text-gray-500 text-sm">View and manage all platform users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {isImporting ? 'Scanning...' : 'Smart Import Users'}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={<Search className="w-4 h-4" />} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
                <option value="all">All Roles</option>
                <option value="super-admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <span className="text-sm text-gray-500">{filteredUsers.length} user(s) found</span>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{selectedUsers.length} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="input-field w-auto">
              <option value="">Select Action</option>
              <option value="activate">Activate</option>
              <option value="suspend">Suspend</option>
              <option value="delete">Delete</option>
            </select>
            <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction}>Apply</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])}>Clear Selection</Button>
          </div>
        )}
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">
                  <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                </th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Last Login</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">No users found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.status === 'active' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                          <span className={`text-sm font-bold ${user.status === 'active' ? 'text-blue-600' : 'text-gray-500'}`}>{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            {newlyAddedEmails.includes(user.email) && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white animate-pulse shadow-sm">NEW</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${user.role === 'super-admin' ? 'badge-purple' : user.role === 'admin' ? 'badge-blue' : user.role === 'teacher' ? 'badge-green' : 'badge-gray'}`}>
                        {ROLE_LABELS[user.role as UserRole] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.lastLogin || 'Never'}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === user.id ? null : user.id); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {activeDropdown === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                            <button onClick={() => { setViewUser(user); setActiveDropdown(null); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button onClick={() => { openEditModal(user); setActiveDropdown(null); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Pencil className="w-4 h-4" /> Edit User
                            </button>
                            {user.role !== 'super-admin' && (
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <p className="px-4 py-1 text-xs text-gray-400 uppercase">Change Role</p>
                                {['student', 'teacher', 'admin'].filter(r => r !== user.role).map(role => (
                                  <button key={role} onClick={() => { setConfirmAction({ user, type: 'role-change', newRole: role }); setActiveDropdown(null); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Make {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <button onClick={() => { setConfirmAction({ user, type: 'toggle' }); setActiveDropdown(null); }} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${user.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                                {user.status === 'active' ? <><UserX className="w-4 h-4" /> Suspend User</> : <><UserCheck className="w-4 h-4" /> Activate User</>}
                              </button>
                              <button onClick={() => { setConfirmAction({ user, type: 'delete' }); setActiveDropdown(null); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete User
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View User Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="md">
        {viewUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${viewUser.status === 'active' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                <span className={`text-3xl font-bold ${viewUser.status === 'active' ? 'text-blue-600' : 'text-gray-500'}`}>{viewUser.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewUser.name}</h3>
                <p className="text-gray-500">{viewUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`badge ${viewUser.role === 'super-admin' ? 'badge-purple' : viewUser.role === 'admin' ? 'badge-blue' : viewUser.role === 'teacher' ? 'badge-green' : 'badge-gray'}`}>
                    {ROLE_LABELS[viewUser.role as UserRole] || viewUser.role}
                  </span>
                  <span className={`badge ${viewUser.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{viewUser.status}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Joined Date</p>
                <p className="font-bold text-gray-900">{viewUser.createdAt}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-bold text-gray-900">{viewUser.lastLogin || 'Never'}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button className="flex-1" onClick={() => { setViewUser(null); openEditModal(viewUser); }}><Pencil className="w-4 h-4" /> Edit User</Button>
              <Button variant={viewUser.status === 'active' ? 'outline' : 'success'} onClick={() => { setViewUser(null); setConfirmAction({ user: viewUser, type: 'toggle' }); }}>
                {viewUser.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
              <Button variant="secondary" onClick={() => setViewUser(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => { setEditUser(null); resetForm(); }} title="Edit User" size="md">
        <form onSubmit={handleEditUser} className="space-y-4">
          <Input label="Full Name *" placeholder="Enter user name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email Address *" type="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="input-field">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => { setEditUser(null); resetForm(); }}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.type === 'delete' ? handleDelete : confirmAction?.type === 'role-change' ? handleRoleChange : handleToggleStatus}
        title={confirmAction?.type === 'delete' ? 'Delete User?' : confirmAction?.type === 'role-change' ? 'Change User Role?' : 'Change Status?'}
        message={
          confirmAction?.type === 'delete' ? `Are you sure you want to delete "${confirmAction?.user.name}"? This action cannot be undone.` :
            confirmAction?.type === 'role-change' ? `Are you sure you want to change "${confirmAction?.user.name}" role to ${confirmAction?.newRole}?` :
              `Are you sure you want to ${confirmAction?.user.status === 'active' ? 'suspend' : 'activate'} "${confirmAction?.user.name}"?`
        }
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'role-change' ? 'Change Role' : 'Confirm'}
        type={confirmAction?.type === 'delete' ? 'danger' : 'warning'}
      />

      {/* PDF Import Preview Modal */}
      <Modal isOpen={!!importedData} onClose={() => setImportedData(null)} title="PDF Data Extracted" size="lg">
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex gap-3 items-start">
            <FileText className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-800 text-sm">Scan Successful</h4>
              <p className="text-xs text-emerald-600">Found <strong>{importedData?.length}</strong> users. Please review before importing.</p>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {importedData?.map((d, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium">{d.name}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{d.email}</td>
                    <td className="px-4 py-2 capitalize">{d.role}</td>
                    <td className="px-4 py-2 capitalize text-emerald-600">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={confirmImport}><Check className="w-4 h-4" /> Import All Users</Button>
            <Button variant="secondary" onClick={() => setImportedData(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;