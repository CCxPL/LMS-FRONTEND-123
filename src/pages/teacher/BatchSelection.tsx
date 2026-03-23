// src/pages/teacher/BatchSelection.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, CheckSquare, Square, Plus,
  Calendar, ArrowRight, Search, Layers, ChevronDown,
  ChevronUp, Trash2, XCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { batchService } from '../../services/batchService';
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';
import type { Course } from '../../types/course.types';
import type { Batch } from '../../types/batch.types';

const BatchSelection: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStart, setNewStart] = useState('');

  const [deleteBatch, setDeleteBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    if (!courseId) return;
    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData || null);
      const batchData = batchService.getBatchesByCourse(courseId);
      setBatches(batchData);
    } catch {
      showToast('Failed to load', 'error');
    }
    setIsLoading(false);
  };

  const toggleBatch = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredBatches = batches.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredBatches.length > 0 && filteredBatches.every(b => selectedIds.includes(b.id));

  const selectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBatches.map(b => b.id));
    }
  };

  const selectAllActive = () => {
    setSelectedIds(batches.filter(b => b.status === 'active').map(b => b.id));
  };

  const handleProceed = () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one batch', 'error');
      return;
    }
    sessionStorage.setItem('selectedBatches', JSON.stringify(selectedIds));
    sessionStorage.setItem('selectedCourseId', courseId || '');
    navigate(`/teacher/course/${courseId}`);
  };

  const handleCreate = () => {
    if (!newName.trim() || !courseId) {
      showToast('Batch name required', 'error');
      return;
    }
    const batch: Batch = {
      id: `batch-${Date.now()}`,
      name: newName,
      courseId,
      description: newDesc || undefined,
      studentCount: 0,
      startDate: newStart || new Date().toISOString().split('T')[0],
      status: 'upcoming',
      color: 'blue',
      students: [],
    };
    batchService.createBatch(batch);
    setBatches(prev => [...prev, batch]);
    setShowCreateModal(false);
    setNewName(''); setNewDesc(''); setNewStart('');
    showToast('Batch created!', 'success');
  };

  const handleDelete = () => {
    if (!deleteBatch) return;
    batchService.deleteBatch(deleteBatch.id);
    setBatches(prev => prev.filter(b => b.id !== deleteBatch.id));
    setSelectedIds(prev => prev.filter(id => id !== deleteBatch.id));
    showToast('Batch deleted', 'info');
    setDeleteBatch(null);
  };

  const selectedBatches = batches.filter(b => selectedIds.includes(b.id));
  const totalStudents = selectedBatches.reduce((s, b) => s + b.studentCount, 0);

  if (isLoading) return <Loader text="Loading batches..." />;
  
  if (!course) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Course not found</p>
      <Button className="mt-4" onClick={() => navigate('/teacher/my-courses')}>Go Back</Button>
    </div>
  );

  return (
    <div className={`space-y-6 ${selectedIds.length > 0 ? 'pb-28' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/my-courses')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <p className="text-sm text-gray-500 mb-1">Select Batches for</p>
            <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-xs text-gray-400 mt-1">{batches.length} batch(es) available</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="w-4 h-4" /> New Batch
        </Button>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{batches.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-green-600">{batches.filter(b => b.status === 'active').length}</p>
          <p className="text-xs text-gray-500">Active</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-gray-600">{batches.reduce((s, b) => s + b.studentCount, 0)}</p>
          <p className="text-xs text-gray-500">Students</p>
        </Card>
      </div>

      {/* Search + Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1">
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <span className="text-sm text-gray-500 self-center whitespace-nowrap">
            {selectedIds.length} selected
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
          <button 
            onClick={selectAll} 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={selectAllActive} 
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Active Only
          </button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setSelectedIds([])} 
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </Card>

      {/* Batch List */}
      {filteredBatches.length === 0 ? (
        <Card className="text-center py-12">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">No Batches Found</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first batch</p>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4" /> Create Batch
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBatches.map(batch => {
            const isSelected = selectedIds.includes(batch.id);
            const isExpanded = expandedBatch === batch.id;

            return (
              <Card 
                key={batch.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-blue-500 bg-blue-50/50' 
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleBatch(batch.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isSelected 
                      ? <CheckSquare className="w-5 h-5 text-blue-600" />
                      : <Square className="w-5 h-5 text-gray-300" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{batch.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        batch.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {batch.studentCount} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(batch.startDate).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      {batch.description && (
                        <span className="hidden sm:inline text-gray-400">
                          {batch.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => { 
                        e.stopPropagation(); 
                        setExpandedBatch(isExpanded ? null : batch.id); 
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      {isExpanded 
                        ? <ChevronUp className="w-4 h-4" /> 
                        : <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={e => { 
                        e.stopPropagation(); 
                        setDeleteBatch(batch); 
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div 
                    className="mt-4 pt-4 border-t border-gray-100"
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Students ({batch.students.length})
                    </p>
                    
                    {batch.students.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {batch.students.map(student => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-400">{student.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${student.progress}%` }} 
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{student.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No students enrolled yet
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ✅ FIXED BOTTOM BAR - Proper positioning */}
      {selectedIds.length > 0 && (
        <div 
          className="fixed bottom-0 right-0 z-50 bg-white border-t border-gray-200 shadow-xl"
          style={{ 
            left: 'var(--sidebar-width, 256px)',
            width: 'calc(100% - var(--sidebar-width, 256px))'
          }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedIds.length} Batch{selectedIds.length > 1 ? 'es' : ''} Selected
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalStudents} students will receive content
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Selected batch names */}
                <div className="hidden md:flex items-center gap-2">
                  {selectedBatches.slice(0, 2).map(b => (
                    <span 
                      key={b.id} 
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {b.name}
                    </span>
                  ))}
                  {selectedIds.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{selectedIds.length - 2} more
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedIds([])}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Clear selection"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                
                <Button 
                  onClick={handleProceed} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title="Create New Batch" 
        size="sm"
      >
        <div className="space-y-4">
          <Input 
            label="Batch Name *" 
            placeholder="e.g., Morning Batch - Jan 2025" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              rows={2}
              placeholder="e.g., Mon-Fri, 9:00 AM - 11:00 AM" 
              value={newDesc} 
              onChange={e => setNewDesc(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={newStart} 
              onChange={e => setNewStart(e.target.value)} 
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreate} className="flex-1">
              <Plus className="w-4 h-4" /> Create Batch
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteBatch}
        onClose={() => setDeleteBatch(null)}
        onConfirm={handleDelete}
        title="Delete Batch?"
        message={`Are you sure you want to delete "${deleteBatch?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default BatchSelection;