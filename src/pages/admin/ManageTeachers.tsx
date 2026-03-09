import React, { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, Eye, Pencil, Trash2, Filter, Download, RefreshCw, Plus, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Teacher } from '../../types/user.types';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const ManageTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ teacher: Teacher; action: 'suspend' | 'activate' | 'delete' } | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialization: '' });

  const { showToast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await userService.getTeachers();
      setTeachers(data);
    } catch (error) {
      showToast('Failed to load teachers', 'error');
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTeachers();
    setIsRefreshing(false);
    showToast('Teachers refreshed', 'success');
  };

  const filtered = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (teacher: Teacher, newStatus: 'active' | 'suspended') => {
    setTeachers(prev => prev.map(t => t.id === teacher.id ? { ...t, status: newStatus } : t));
    showToast(`Teacher ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success');
    setConfirmAction(null);
  };

  const handleDelete = (teacher: Teacher) => {
    setTeachers(prev => prev.filter(t => t.id !== teacher.id));
    showToast(`Teacher "${teacher.name}" deleted`, 'info');
    setConfirmAction(null);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'teacher',
      status: 'active',
      specialization: formData.specialization,
      coursesCount: 0,
      studentsCount: 0,
      rating: 0,
      createdAt: new Date().toISOString()
    };
    setTeachers(prev => [newTeacher, ...prev]);
    showToast('Teacher added successfully', 'success');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacher) return;
    setTeachers(prev => prev.map(t => 
      t.id === editTeacher.id ? { ...t, ...formData } : t
    ));
    showToast('Teacher updated', 'success');
    setEditTeacher(null);
    resetForm();
  };

  const openEditModal = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      specialization: teacher.specialization
    });
    setEditTeacher(teacher);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', specialization: '' });
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Specialization', 'Courses', 'Students', 'Rating', 'Status'].join(','),
      ...filtered.map(t => [t.name, t.email, t.specialization, t.coursesCount, t.studentsCount, t.rating, t.status].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers-export.csv';
    a.click();
    showToast('Teachers exported', 'success');
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    suspended: teachers.filter(t => t.status === 'suspended').length,
  };

  if (isLoading) return <Loader text="Loading teachers..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage teacher accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Teachers</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
          <p className="text-xs text-gray-500">Suspended</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 self-center bg-gray-100 px-3 py-2 rounded-lg">
            {filtered.length} teachers
          </span>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No teachers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Courses</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Students</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          teacher.status === 'suspended' ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-medium ${teacher.status === 'suspended' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {teacher.name}
                          </p>
                          <p className="text-xs text-gray-500">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{teacher.specialization}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-gray-900">{teacher.coursesCount}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-gray-900">{teacher.studentsCount}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-gray-700 fill-gray-700" />
                        <span className="text-sm font-medium">{teacher.rating || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        teacher.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewTeacher(teacher)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ 
                            teacher, 
                            action: teacher.status === 'active' ? 'suspend' : 'activate' 
                          })}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title={teacher.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {teacher.status === 'active' 
                            ? <Ban className="w-4 h-4 text-gray-500" /> 
                            : <CheckCircle className="w-4 h-4 text-gray-500" />
                          }
                        </button>
                        <button
                          onClick={() => setConfirmAction({ teacher, action: 'delete' })}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Modal isOpen={!!viewTeacher} onClose={() => setViewTeacher(null)} title="Teacher Details">
        {viewTeacher && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700">
                {viewTeacher.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewTeacher.name}</h3>
                <p className="text-gray-500">{viewTeacher.email}</p>
                <p className="text-sm text-gray-400 mt-1">{viewTeacher.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewTeacher.coursesCount}</p>
                <p className="text-sm text-gray-500">Courses</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewTeacher.studentsCount}</p>
                <p className="text-sm text-gray-500">Students</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-gray-700 fill-gray-700" />
                  <p className="text-2xl font-bold text-gray-900">{viewTeacher.rating || 'N/A'}</p>
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button fullWidth onClick={() => { setViewTeacher(null); openEditModal(viewTeacher); }}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setViewTeacher(null);
                  setConfirmAction({
                    teacher: viewTeacher,
                    action: viewTeacher.status === 'active' ? 'suspend' : 'activate'
                  });
                }}
              >
                {viewTeacher.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Add Teacher">
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="e.g., Web Development"
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" fullWidth>Add Teacher</Button>
            <Button type="button" variant="outline" fullWidth onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTeacher} onClose={() => { setEditTeacher(null); resetForm(); }} title="Edit Teacher">
        <form onSubmit={handleEditTeacher} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" fullWidth>Save Changes</Button>
            <Button type="button" variant="outline" fullWidth onClick={() => { setEditTeacher(null); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.action === 'delete') {
            handleDelete(confirmAction.teacher);
          } else {
            handleStatusChange(confirmAction.teacher, confirmAction.action === 'activate' ? 'active' : 'suspended');
          }
        }}
        title={
          confirmAction?.action === 'delete' ? 'Delete Teacher?' :
          confirmAction?.action === 'suspend' ? 'Suspend Teacher?' : 'Activate Teacher?'
        }
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.teacher.name}"?`}
        confirmText={confirmAction?.action === 'delete' ? 'Delete' : confirmAction?.action === 'suspend' ? 'Suspend' : 'Activate'}
        type={confirmAction?.action === 'delete' || confirmAction?.action === 'suspend' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default ManageTeachers;