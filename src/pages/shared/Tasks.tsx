import React, { useState, useEffect, useCallback } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Trash2, MessageSquare, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import {
  getMyTasksApi,
  getTaskUsersApi,
  createTaskApi,
  updateTaskStatusApi,
  addTaskCommentApi,
  deleteTaskApi,
} from '../../api/taskApi';

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  comments: TaskComment[];
}

interface AssignUser {
  _id: string;
  name: string;
  role: string;
  email: string;
}

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AssignUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [commentText, setCommentText] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        getMyTasksApi(),
        getTaskUsersApi(),
      ]);
      setTasks(tasksRes.data?.tasks || []);
      setUsers(usersRes.data?.users || []);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    showToast('Tasks refreshed', 'success');
  };

  const myTasks = tasks.filter(t => {
    const isInvolved = t.assignedToId === user?.id || t.assignedById === user?.id;
    if (!isInvolved) return false;
    if (filter === 'assigned') return t.assignedToId === user?.id;
    if (filter === 'created') return t.assignedById === user?.id;
    return true;
  });

  const handleCreate = async () => {
    if (!title || !assignTo || !dueDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createTaskApi({ title, description: desc, assignedToId: assignTo, dueDate, priority });
      setTasks(prev => [res.data.task, ...prev]);
      showToast('Task created successfully', 'success');
      setShowCreate(false);
      resetForm();
    } catch {
      showToast('Failed to create task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDesc(''); setAssignTo(''); setDueDate(''); setPriority('medium');
  };

  const handleStatusUpdate = async (status: Task['status']) => {
    if (!selectedTask) return;
    try {
      const res = await updateTaskStatusApi(selectedTask._id, status);
      const updated = res.data.task;
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelectedTask(updated);
      showToast(`Task marked as ${status.replace('-', ' ')}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    try {
      const res = await addTaskCommentApi(selectedTask._id, commentText);
      const updated = res.data.task;
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelectedTask(updated);
      setCommentText('');
      showToast('Comment added', 'success');
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteTaskApi(deleteId);
      setTasks(prev => prev.filter(t => t._id !== deleteId));
      if (selectedTask?._id === deleteId) setSelectedTask(null);
      setDeleteId(null);
      showToast('Task deleted', 'info');
    } catch {
      showToast('Failed to delete task', 'error');
    }
  };

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'high': return 'bg-gray-900 text-white';
      case 'medium': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) return <Loader text="Loading tasks..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your tasks and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* Task List */}
        <Card padding="none" className="flex flex-col overflow-hidden">
          <div className="flex p-2 bg-gray-50 border-b border-gray-200">
            {(['all', 'assigned', 'created'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelectedTask(null); }}
                className={`flex-1 py-2 text-xs font-medium uppercase rounded-lg transition-all ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No tasks found</p>
              </div>
            ) : (
              myTasks.map(task => (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTask?._id === task._id ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityStyles(task.priority)}`}>
                      {task.priority}
                    </span>
                    {getStatusIcon(task.status)}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{task.title}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>{task.assignedToId === user?.id ? 'Assigned to me' : task.assignedToName}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Task Detail */}
        <Card padding="none" className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedTask ? (
            <>
              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${selectedTask.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                        : selectedTask.status === 'in-progress' ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityStyles(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                </div>
                {selectedTask.assignedById === user?.id && (
                  <button
                    onClick={() => setDeleteId(selectedTask._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Assigned By', value: selectedTask.assignedByName },
                    { label: 'Assigned To', value: selectedTask.assignedToName },
                    { label: 'Due Date', value: new Date(selectedTask.dueDate).toLocaleDateString() },
                    { label: 'Priority', value: selectedTask.priority },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <span className="block text-gray-500 text-xs mb-1">{item.label}</span>
                      <span className="font-medium text-gray-900 capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Comments ({selectedTask.comments.length})
                  </h3>
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No comments yet</p>
                  ) : (
                    selectedTask.comments.map((comment, i) => (
                      <div key={comment.id || i} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900 text-sm">{comment.userName}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <Button onClick={handleComment} disabled={!commentText.trim()}>Post</Button>
                </div>

                {selectedTask.assignedToId === user?.id && selectedTask.status !== 'completed' && (
                  <div className="flex gap-2">
                    <Button fullWidth onClick={() => handleStatusUpdate('completed')}>
                      <CheckCircle className="w-4 h-4" /> Mark Complete
                    </Button>
                    {selectedTask.status === 'pending' && (
                      <Button variant="outline" fullWidth onClick={() => handleStatusUpdate('in-progress')}>
                        <Clock className="w-4 h-4" /> Start Progress
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">Select a task to view details</p>
            </div>
          )}
        </Card>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Create New Task">
        <div className="space-y-4">
          <Input label="Task Title *" placeholder="e.g. Review monthly report" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To *</label>
            <select className="input-field" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date *" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea className="input-field min-h-[100px] resize-none" placeholder="Task details..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={isSubmitting}>Create Task</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task?"
        message="This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default Tasks;