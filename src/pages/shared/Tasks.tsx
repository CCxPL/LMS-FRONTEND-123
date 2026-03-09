import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DEMO_USERS } from '../../utils/constants';

// ✅ Local Task Type Define
interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

interface Task {
  id: string;
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

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { tasks, createTask, updateTaskStatus, addTaskComment, deleteTask } = useData();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<'all' | 'assigned' | 'created'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [commentText, setCommentText] = useState('');

  // ✅ Cast tasks to local Task type
  const myTasks = useMemo(() => {
    if (!user) return [];
    const typedTasks = tasks as Task[];
    let list = typedTasks.filter(t => t.assignedToId === user.id || t.assignedById === user.id);
    
    if (filter === 'assigned') list = list.filter(t => t.assignedToId === user.id);
    if (filter === 'created') list = list.filter(t => t.assignedById === user.id);
    
    return list;
  }, [tasks, user, filter]);

  const handleCreate = () => {
    if (!title || !assignTo || !dueDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const assignee = DEMO_USERS.find(u => u.id === assignTo);
    
    createTask({
      title,
      description: desc,
      assignedById: user!.id,
      assignedByName: user!.name,
      assignedByRole: user!.role,
      assignedToId: assignTo,
      assignedToName: assignee?.name || 'Unknown',
      assignedToRole: assignee?.role || 'student',
      status: 'pending',
      priority,
      dueDate,
    });

    showToast('Task created successfully', 'success');
    setShowCreate(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setAssignTo('');
    setDueDate('');
    setPriority('medium');
  };

  const handleStatusUpdate = (status: Task['status']) => {
    if (selectedTask) {
      updateTaskStatus(selectedTask.id, status);
      setSelectedTask(prev => prev ? { ...prev, status } : null);
      showToast(`Task marked as ${status.replace('-', ' ')}`, 'success');
    }
  };

  const handleComment = () => {
    if (!commentText.trim() || !selectedTask) return;
    const newComment: TaskComment = {
      id: Date.now().toString(),
      userId: user!.id,
      userName: user!.name,
      body: commentText,
      createdAt: new Date().toISOString()
    };
    addTaskComment(selectedTask.id, newComment);
    setSelectedTask(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    setCommentText('');
    showToast('Comment added', 'success');
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteTask(deleteId);
      if (selectedTask?.id === deleteId) setSelectedTask(null);
      setDeleteId(null);
      showToast('Task deleted', 'info');
    }
  };

  // ✅ Handle task selection with proper typing
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const getPriorityStyles = (p: string) => {
    switch(p) {
      case 'high': return 'bg-gray-900 text-white';
      case 'medium': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-gray-700" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your tasks and assignments</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus className="w-4 h-4" />}>
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* Task List */}
        <Card padding="none" className="flex flex-col overflow-hidden">
          <div className="flex p-2 bg-gray-50 border-b border-gray-200">
            {(['all', 'assigned', 'created'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelectedTask(null); }}
                className={`flex-1 py-2 text-xs font-medium uppercase rounded-lg transition-all ${
                  filter === f 
                    ? 'bg-white shadow text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
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
                  key={task.id}
                  onClick={() => handleTaskSelect(task)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTask?.id === task.id 
                      ? 'border-black bg-gray-50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityStyles(task.priority)}`}>
                      {task.priority}
                    </span>
                    {getStatusIcon(task.status)}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{task.title}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>{task.assignedToName === user?.name ? 'Assigned to me' : task.assignedToName}</span>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      selectedTask.status === 'completed' 
                        ? 'bg-gray-900 text-white' 
                        : selectedTask.status === 'in-progress'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                </div>
                {selectedTask.assignedById === user?.id && (
                  <button 
                    onClick={() => setDeleteId(selectedTask.id)} 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                    { label: 'Due Date', value: selectedTask.dueDate },
                    { label: 'Priority', value: selectedTask.priority }
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
                    selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900 text-sm">{comment.userName}</span>
                          <span className="text-xs text-gray-400">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <Button onClick={handleComment} disabled={!commentText.trim()}>Post</Button>
                </div>
                
                {selectedTask.assignedToId === user?.id && selectedTask.status !== 'completed' && (
                  <div className="flex gap-2">
                    <Button 
                      fullWidth
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      Mark Complete
                    </Button>
                    {selectedTask.status === 'pending' && (
                      <Button 
                        variant="outline"
                        fullWidth
                        onClick={() => handleStatusUpdate('in-progress')}
                      >
                        Start Progress
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
          <Input 
            label="Task Title" 
            placeholder="e.g. Review monthly report" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={assignTo} 
              onChange={(e) => setAssignTo(e.target.value)}
            >
              <option value="">Select User</option>
              {DEMO_USERS.filter(u => u.id !== user?.id).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.replace('-', ' ')})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Due Date" 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={priority} 
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px] resize-none"
              placeholder="Task details..." 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate}>Create Task</Button>
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