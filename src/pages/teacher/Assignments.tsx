import React, { useEffect, useState } from 'react';
import { Plus, Eye, Calendar, FileText, Pencil, Trash2, Search, Filter, Download, RefreshCw, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Assignment } from '../../types/course.types';
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';

const TeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Assignment | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseName: '',
    courseId: '',
    dueDate: '',
    totalMarks: 100
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await courseService.getAssignments();
      setAssignments(data);
    } catch (error) {
      showToast('Failed to load assignments', 'error');
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssignments();
    setIsRefreshing(false);
    showToast('Assignments refreshed', 'success');
  };

  const filtered = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      courseName: formData.courseName,
      courseId: formData.courseId,
      dueDate: formData.dueDate,
      totalMarks: formData.totalMarks,
      status: 'pending',
      submissionsCount: 0,
      createdAt: new Date().toISOString()
    };

    setAssignments(prev => [newAssignment, ...prev]);
    showToast('Assignment created successfully!', 'success');
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAssignment) return;

    setAssignments(prev => prev.map(a => 
      a.id === editAssignment.id 
        ? { ...a, ...formData }
        : a
    ));
    showToast('Assignment updated successfully!', 'success');
    setEditAssignment(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setAssignments(prev => prev.filter(a => a.id !== deleteConfirm.id));
    showToast('Assignment deleted successfully', 'info');
    setDeleteConfirm(null);
  };

  const openEditModal = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      courseName: assignment.courseName,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks
    });
    setEditAssignment(assignment);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseName: '',
      courseId: '',
      dueDate: '',
      totalMarks: 100
    });
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Course', 'Due Date', 'Marks', 'Status', 'Submissions'].join(','),
      ...filtered.map(a => [a.title, a.courseName, a.dueDate, a.totalMarks, a.status, a.submissionsCount || 0].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assignments.csv';
    link.click();
    showToast('Assignments exported', 'success');
  };

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'graded': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) return <Loader text="Loading assignments..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage course assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Create Assignment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
        <Card className="text-center p-4 bg-amber-50">
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          <p className="text-xs text-amber-700">Pending</p>
        </Card>
        <Card className="text-center p-4 bg-blue-50">
          <p className="text-2xl font-bold text-blue-700">{stats.submitted}</p>
          <p className="text-xs text-blue-700">Submitted</p>
        </Card>
        <Card className="text-center p-4 bg-emerald-50">
          <p className="text-2xl font-bold text-emerald-700">{stats.graded}</p>
          <p className="text-xs text-emerald-700">Graded</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search assignments..."
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
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} assignment(s)
          </span>
        </div>
      </Card>

      {/* Assignments List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No assignments found</p>
          <p className="text-gray-400 text-sm mb-4">Create your first assignment to get started</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Create Assignment
          </Button>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Assignment</th>
                  <th className="px-4 py-4 text-left font-semibold">Course</th>
                  <th className="px-4 py-4 text-center font-semibold">Due Date</th>
                  <th className="px-4 py-4 text-center font-semibold">Marks</th>
                  <th className="px-4 py-4 text-center font-semibold">Submissions</th>
                  <th className="px-4 py-4 text-center font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{assignment.title}</p>
                        {assignment.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{assignment.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{assignment.courseName}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" /> {assignment.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-gray-900">{assignment.totalMarks}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" /> {assignment.submissionsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusStyle(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewAssignment(assignment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(assignment)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
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
        </Card>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => { setIsCreateModalOpen(false); resetForm(); }} 
        title="Create Assignment" 
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Assignment Title *" 
            placeholder="Enter assignment title" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required 
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
              className="input-field min-h-[100px]" 
              placeholder="Describe the assignment..." 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date *</label>
              <input 
                type="date" 
                className="input-field"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required 
              />
            </div>
            <Input 
              label="Total Marks *" 
              type="number" 
              placeholder="100" 
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course *</label>
            <select 
              className="input-field" 
              value={formData.courseId}
              onChange={(e) => {
                const selected = e.target.selectedOptions[0];
                setFormData({ 
                  ...formData, 
                  courseId: e.target.value,
                  courseName: selected?.text || ''
                });
              }}
              required
            >
              <option value="">Select Course</option>
              <option value="1">React.js Complete Course</option>
              <option value="2">Python for Data Science</option>
              <option value="3">Node.js Backend Development</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Create Assignment</Button>
            <Button type="button" variant="secondary" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editAssignment} 
        onClose={() => { setEditAssignment(null); resetForm(); }} 
        title="Edit Assignment" 
        size="lg"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input 
            label="Assignment Title *" 
            placeholder="Enter assignment title" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required 
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
              className="input-field min-h-[100px]" 
              placeholder="Describe the assignment..." 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date *</label>
              <input 
                type="date" 
                className="input-field"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required 
              />
            </div>
            <Input 
              label="Total Marks *" 
              type="number" 
              placeholder="100" 
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
              required 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => { setEditAssignment(null); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={!!viewAssignment} 
        onClose={() => setViewAssignment(null)} 
        title="Assignment Details" 
        size="md"
      >
        {viewAssignment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900">{viewAssignment.title}</h3>
              <p className="text-sm text-gray-500">{viewAssignment.courseName}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full border mt-2 inline-block ${getStatusStyle(viewAssignment.status)}`}>
                {viewAssignment.status}
              </span>
            </div>
            
            {viewAssignment.description && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{viewAssignment.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="font-bold text-gray-900">{viewAssignment.dueDate}</p>
                <p className="text-xs text-gray-500">Due Date</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FileText className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="font-bold text-gray-900">{viewAssignment.totalMarks}</p>
                <p className="text-xs text-gray-500">Total Marks</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="font-bold text-blue-600">{viewAssignment.submissionsCount || 0}</p>
              <p className="text-xs text-blue-600">Submissions</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={() => { setViewAssignment(null); openEditModal(viewAssignment); }}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
              <Button variant="secondary" onClick={() => setViewAssignment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Assignment?"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default TeacherAssignments;