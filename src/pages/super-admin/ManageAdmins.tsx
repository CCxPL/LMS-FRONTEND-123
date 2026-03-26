import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, ShieldCheck, ShieldX } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getSuperAdminUsersApi, createAdminApi, removeUserApi, toggleUserStatusApi } from '../../api/superadminApi';

const PERMISSIONS_LIST = [
  { key: 'manage-teachers', label: 'Manage Teachers' },
  { key: 'manage-courses', label: 'Manage Courses' },
  { key: 'manage-students', label: 'Manage Students' },
  { key: 'view-analytics', label: 'View Analytics' },
  { key: 'manage-payments', label: 'Manage Payments' },
  { key: 'manage-settings', label: 'Manage Settings' },
];

const ManageAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewAdmin, setViewAdmin] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'delete' | 'toggle'; admin?: any } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: ['manage-teachers', 'manage-courses', 'manage-students', 'view-analytics'] as string[]
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await getSuperAdminUsersApi({ role: 'Admin', limit: 100 });
      const mapped = (res?.data?.users || []).map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        status: u.isActive ? 'active' : 'suspended',
        role: 'admin',
        permissions: ['manage-teachers', 'manage-courses', 'manage-students', 'view-analytics'],
        managedTeachers: 0,
        managedStudents: 0,
        createdAt: new Date(u.createdAt).toLocaleDateString(),
      }));
      setAdmins(mapped);
    } catch (error) {
      showToast('Failed to load admins', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    try {
      await createAdminApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      showToast('Admin created successfully!', 'success');
      setIsAddModalOpen(false);
      resetForm();
      await loadAdmins();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to create admin', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmAction) return;
    try {
      await removeUserApi(confirmAction.id);
      setAdmins(prev => prev.filter(a => a.id !== confirmAction.id));
      showToast('Admin deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete admin', 'error');
    }
    setConfirmAction(null);
  };

  const handleToggleStatus = async () => {
    if (!confirmAction) return;
    try {
      await toggleUserStatusApi(confirmAction.id);
      setAdmins(prev => prev.map(a =>
        a.id === confirmAction.id
          ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' }
          : a
      ));
      const admin = admins.find(a => a.id === confirmAction.id);
      showToast(`Admin ${admin?.status === 'active' ? 'suspended' : 'activated'} successfully`, 'success');
    } catch (error) {
      showToast('Failed to update admin status', 'error');
    }
    setConfirmAction(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      permissions: ['manage-teachers', 'manage-courses', 'manage-students', 'view-analytics']
    });
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  if (isLoading) return <Loader text="Loading admins..." />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title mb-0">Manage Admins</h1>
          <p className="text-gray-500 text-sm mt-1">Control system access and hierarchy</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add New Admin
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <span className="text-sm text-gray-500">{filteredAdmins.length} admin(s) found</span>
        </div>
      </Card>

      {filteredAdmins.length === 0 ? (
        <Card className="text-center py-12">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No admins found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first admin</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Admin
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.map((admin) => (
            <Card key={admin.id} hover className={admin.status === 'suspended' ? 'opacity-75 bg-gray-50' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${admin.status === 'active' ? 'bg-black text-white' : 'bg-red-100 text-red-600'}`}>
                    <span className="text-lg font-bold">{admin.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${admin.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {admin.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{admin.managedTeachers}</p>
                  <p className="text-xs text-gray-500">Teachers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{admin.managedStudents}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">Permissions: {admin.permissions.length}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewAdmin(admin)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={admin.status === 'active' ? 'outline' : 'success'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmAction({ id: admin.id, type: 'toggle', admin })}
                  >
                    {admin.status === 'active' ? <ShieldX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setConfirmAction({ id: admin.id, type: 'delete', admin })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Admin Modal */}
      <Modal isOpen={!!viewAdmin} onClose={() => setViewAdmin(null)} title="Admin Details" size="md">
        {viewAdmin && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${viewAdmin.status === 'active' ? 'bg-black text-white' : 'bg-red-100 text-red-600'}`}>
                <span className="text-2xl font-bold">{viewAdmin.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewAdmin.name}</h3>
                <p className="text-gray-500">{viewAdmin.email}</p>
                <span className={`inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full uppercase ${viewAdmin.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {viewAdmin.status}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {viewAdmin.permissions.map((perm: string) => (
                  <span key={perm} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200">
                    {perm.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setViewAdmin(null)} className="flex-1">Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Add New Admin"
        size="md"
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <Input label="Full Name *" placeholder="Enter admin name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email Address *" type="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Password *" type="password" placeholder="Create password (min 6 chars)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Permissions</label>
            <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
              {PERMISSIONS_LIST.map((perm) => (
                <label key={perm.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                  <input type="checkbox" checked={formData.permissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} className="rounded border-gray-300 text-black focus:ring-black" />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Create Admin</Button>
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.type === 'delete' ? handleDelete : handleToggleStatus}
        title={confirmAction?.type === 'delete' ? 'Delete Admin?' : 'Change Status?'}
        message={
          confirmAction?.type === 'delete'
            ? `Are you sure you want to delete "${confirmAction?.admin?.name}"? This cannot be undone.`
            : `Are you sure you want to ${confirmAction?.admin?.status === 'active' ? 'suspend' : 'activate'} "${confirmAction?.admin?.name}"?`
        }
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        type={confirmAction?.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default ManageAdmins;