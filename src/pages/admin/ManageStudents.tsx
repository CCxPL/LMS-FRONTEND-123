import React, { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, Eye, Pencil, Trash2, Filter, Download, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Student } from '../../types/user.types';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

// Define Extended Student Type to include isNew flag
type StudentWithFlag = Student & { isNew?: boolean };

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentWithFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [viewStudent, setViewStudent] = useState<StudentWithFlag | null>(null);
  const [editStudent, setEditStudent] = useState<StudentWithFlag | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ student: StudentWithFlag; action: 'suspend' | 'activate' | 'delete' } | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', grade: '' });

  const { showToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await userService.getStudents();
      setStudents(data);
    } catch (error) {
      showToast('Failed to load students', 'error');
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStudents();
    setIsRefreshing(false);
    showToast('Students refreshed', 'success');
  };

  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (student: StudentWithFlag, newStatus: 'active' | 'suspended') => {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: newStatus } : s));
    showToast(`Student ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success');
    setConfirmAction(null);
  };

  const handleDelete = (student: StudentWithFlag) => {
    setStudents(prev => prev.filter(s => s.id !== student.id));
    showToast(`Student "${student.name}" deleted`, 'info');
    setConfirmAction(null);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setStudents(prev => prev.map(s => 
      s.id === editStudent.id ? { ...s, ...formData } : s
    ));
    showToast('Student updated', 'success');
    setEditStudent(null);
    setFormData({ name: '', email: '', phone: '', grade: '' });
  };

  const openEditModal = (student: StudentWithFlag) => {
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      grade: student.grade || ''
    });
    setEditStudent(student);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Status', 'Enrolled', 'Avg Score', 'Grade'].join(','),
      ...filtered.map(s => [s.name, s.email, s.status, s.enrolledCourses, `${s.averageScore}%`, s.grade || 'N/A'].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-export.csv';
    a.click();
    showToast('Students exported', 'success');
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    suspended: students.filter(s => s.status === 'suspended').length,
  };

  if (isLoading) return <Loader text="Loading students..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage student accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Students</p>
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
              placeholder="Search by name or email..."
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
            {filtered.length} students
          </span>
        </div>
      </Card>

      {/* Students Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Enrolled</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Avg Score</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          student.status === 'suspended' ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-medium flex items-center gap-2 ${student.status === 'suspended' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {student.name}
                            {/* ✅ NEW BADGE IMPLEMENTED */}
                            {student.isNew && (
                              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                NEW
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-gray-900">{student.enrolledCourses}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-bold ${
                        student.averageScore >= 80 ? 'text-emerald-600' :
                        student.averageScore >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{student.grade || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        student.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewStudent(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ 
                            student, 
                            action: student.status === 'active' ? 'suspend' : 'activate' 
                          })}
                          className={`p-2 rounded-lg ${
                            student.status === 'active' 
                              ? 'hover:bg-red-100 text-red-500' 
                              : 'hover:bg-emerald-100 text-emerald-500'
                          }`}
                          title={student.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {student.status === 'active' 
                            ? <Ban className="w-4 h-4 text-gray-500" /> 
                            : <CheckCircle className="w-4 h-4 text-gray-500" />
                          }
                        </button>
                        <button
                          onClick={() => setConfirmAction({ student, action: 'delete' })}
                          className="p-2 hover:bg-red-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* View Student Modal */}
      <Modal
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title="Student Details"
        size="md"
      >
        {viewStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                viewStudent.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
              }`}>
                {viewStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {viewStudent.name}
                  {viewStudent.isNew && (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      NEW
                    </span>
                  )}
                </h3>
                <p className="text-gray-500">{viewStudent.email}</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${
                  viewStudent.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {viewStudent.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewStudent.enrolledCourses}</p>
                <p className="text-sm text-gray-500">Enrolled</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewStudent.completedCourses || 0}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${
                  viewStudent.averageScore >= 80 ? 'text-emerald-600' :
                  viewStudent.averageScore >= 60 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {viewStudent.averageScore}%
                </p>
                <p className="text-sm text-gray-500">Avg Score</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{viewStudent.grade || 'N/A'}</p>
                <p className="text-sm text-gray-500">Grade</p>
              </div>
            </div>

            {viewStudent.phone && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{viewStudent.phone}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { setViewStudent(null); openEditModal(viewStudent); }}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
              <Button 
                variant={viewStudent.status === 'active' ? 'danger' : 'success'}
                className="flex-1"
                onClick={() => { 
                  setViewStudent(null); 
                  setConfirmAction({ 
                    student: viewStudent, 
                    action: viewStudent.status === 'active' ? 'suspend' : 'activate' 
                  }); 
                }}
              >
                {viewStudent.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editStudent} onClose={() => { setEditStudent(null); setFormData({ name: '', email: '', phone: '', grade: '' }); }} title="Edit Student">
        <form onSubmit={handleEditStudent} className="space-y-4">
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
            label="Grade"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            placeholder="e.g., A, B+, C"
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => { setEditStudent(null); setFormData({ name: '', email: '', phone: '', grade: '' }); }}>
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
            handleDelete(confirmAction.student);
          } else {
            handleStatusChange(
              confirmAction.student, 
              confirmAction.action === 'activate' ? 'active' : 'suspended'
            );
          }
        }}
        title={
          confirmAction?.action === 'delete' ? 'Delete Student?' :
          confirmAction?.action === 'suspend' ? 'Suspend Student?' :
          'Activate Student?'
        }
        message={
          confirmAction?.action === 'delete' 
            ? `Are you sure you want to delete "${confirmAction?.student.name}"? This cannot be undone.`
            : `Are you sure you want to ${confirmAction?.action} "${confirmAction?.student.name}"?`
        }
        confirmText={confirmAction?.action === 'delete' ? 'Delete' : confirmAction?.action === 'suspend' ? 'Suspend' : 'Activate'}
        type={confirmAction?.action === 'delete' || confirmAction?.action === 'suspend' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default ManageStudents;