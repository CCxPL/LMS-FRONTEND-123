import React, { useEffect, useState } from 'react';
import { Search, Star, Eye, Pencil, Trash2, UserCheck, UserX, Plus, Filter, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getSuperAdminUsersApi, removeUserApi, toggleUserStatusApi } from '../../api/superadminApi';

const AllTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [viewTeacher, setViewTeacher] = useState<any | null>(null);
  const [editTeacher, setEditTeacher] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ teacher: any; type: 'delete' | 'toggle' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    bio: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await getSuperAdminUsersApi({ role: 'Teacher', limit: 100 });
      const mapped = (res.data.users || []).map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        specialization: u.specialization || 'General',
        phone: u.phone || '',
        bio: u.bio || '',
        rating: 0,
        coursesCount: 0,
        studentsCount: 0,
        status: u.isActive ? 'active' : 'inactive',
        role: 'teacher',
        joinedDate: new Date(u.createdAt).toLocaleDateString(),
        createdAt: u.createdAt,
        avatar: '',
      }));
      setTeachers(mapped as any);
    } catch (error) {
      showToast('Failed to load teachers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.specialization) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const newTeacher = {
      id: `teacher-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      specialization: formData.specialization,
      phone: formData.phone,
      bio: formData.bio,
      rating: 0,
      coursesCount: 0,
      studentsCount: 0,
      status: 'active',
      role: 'teacher',
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      avatar: ''
    };

    setTeachers(prev => [newTeacher, ...prev]);
    showToast('Teacher added successfully!', 'success');
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacher) return;

    setTeachers(prev => prev.map(t => 
      t.id === editTeacher.id 
        ? { ...t, ...formData }
        : t
    ));
    showToast('Teacher updated successfully!', 'success');
    setEditTeacher(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!confirmAction) return;
    try {
      await removeUserApi(confirmAction.teacher.id);
      setTeachers(prev => prev.filter(t => t.id !== confirmAction.teacher.id));
      showToast('Teacher deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete teacher', 'error');
    }
    setConfirmAction(null);
  };

  const handleToggleStatus = async () => {
    if (!confirmAction) return;
    try {
      await toggleUserStatusApi(confirmAction.teacher.id);
      setTeachers(prev => prev.map(t => 
        t.id === confirmAction.teacher.id 
          ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
          : t
      ));
      showToast(`Teacher ${confirmAction.teacher.status === 'active' ? 'deactivated' : 'activated'} successfully!`, 'success');
    } catch (error) {
      showToast('Failed to update teacher status', 'error');
    }
    setConfirmAction(null);
  };

  const openEditModal = (teacher: any) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      specialization: teacher.specialization,
      phone: teacher.phone || '',
      bio: teacher.bio || ''
    });
    setEditTeacher(teacher);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', specialization: '', phone: '', bio: '' });
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Specialization', 'Phone', 'Status', 'Joined'].join(','),
      ...filtered.map(t => [t.name, t.email, t.specialization, t.phone || 'N/A', t.status, t.joinedDate || 'N/A'].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teachers.csv';
    link.click();
    showToast('Teachers exported', 'success');
  };

  if (isLoading) return <Loader text="Loading teachers..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">All Teachers</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all registered teachers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="input-field w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} teacher(s)
          </span>
        </div>
      </Card>

      {/* Teachers Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No teachers found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <Button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher) => (
            <Card key={teacher.id} hover className={teacher.status === 'inactive' ? 'opacity-75 bg-gray-50' : ''}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  teacher.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <span className="text-xl font-bold">{teacher.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{teacher.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{teacher.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-gray-900 fill-current" />
                    <span className="text-xs font-medium text-gray-700">{teacher.rating || 'N/A'}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  teacher.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {teacher.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{teacher.coursesCount}</p>
                  <p className="text-xs text-gray-500">Courses</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{teacher.studentsCount}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3 truncate">{teacher.email}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setViewTeacher(teacher)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditModal(teacher)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={teacher.status === 'active' ? 'outline' : 'success'} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setConfirmAction({ teacher, type: 'toggle' })}
                  >
                    {teacher.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setConfirmAction({ teacher, type: 'delete' })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Teacher Modal */}
      <Modal 
        isOpen={!!viewTeacher} 
        onClose={() => setViewTeacher(null)} 
        title="Teacher Details"
        size="md"
      >
        {viewTeacher && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                viewTeacher.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <span className="text-3xl font-bold">{viewTeacher.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewTeacher.name}</h3>
                <p className="text-gray-500">{viewTeacher.specialization}</p>
                <span className={`inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full uppercase ${
                  viewTeacher.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {viewTeacher.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewTeacher.coursesCount}</p>
                <p className="text-sm text-gray-500">Total Courses</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewTeacher.studentsCount}</p>
                <p className="text-sm text-gray-500">Total Students</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 font-medium">{viewTeacher.email}</p>
              </div>
              {viewTeacher.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 font-medium">{viewTeacher.phone}</p>
                </div>
              )}
              {viewTeacher.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-gray-900 text-sm leading-relaxed">{viewTeacher.bio}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button className="flex-1" onClick={() => { setViewTeacher(null); openEditModal(viewTeacher); }}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
              <Button variant="secondary" onClick={() => setViewTeacher(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isAddModalOpen || !!editTeacher} 
        onClose={() => { setIsAddModalOpen(false); setEditTeacher(null); resetForm(); }} 
        title={editTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="md"
      >
        <form onSubmit={editTeacher ? handleEditTeacher : handleAddTeacher} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Enter teacher name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Specialization *"
            placeholder="e.g., Mathematics, Physics"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              className="input-field min-h-25"
              placeholder="Enter teacher bio..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editTeacher ? 'Save Changes' : 'Add Teacher'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); setEditTeacher(null); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.type === 'delete' ? handleDelete : handleToggleStatus}
        title={confirmAction?.type === 'delete' ? 'Delete Teacher?' : 'Change Status?'}
        message={confirmAction?.type === 'delete' 
          ? `Are you sure you want to delete "${confirmAction?.teacher.name}"? This action cannot be undone.`
          : `Are you sure you want to ${confirmAction?.teacher.status === 'active' ? 'deactivate' : 'activate'} "${confirmAction?.teacher.name}"?`
        }
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        type={confirmAction?.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default AllTeachers;