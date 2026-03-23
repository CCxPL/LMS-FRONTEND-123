// src/pages/admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';

import {
  Users,
  GraduationCap,
  Activity,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Calendar,
  MessageSquare,
  RefreshCw,
  Eye,
  Bell
} from 'lucide-react';

interface PendingItem {
  id: number;
  type: 'Course' | 'Teacher';
  title: string;
  by: string;
  date: string;
  avatar: string;
  description?: string;
}

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pendingItems, setPendingItems] = useState<PendingItem[]>([
    { id: 1, type: 'Course', title: 'Advanced Node.js', by: 'Prof. Ahmad', date: '2h ago', avatar: 'PA', description: 'Complete Node.js course.' },
    { id: 2, type: 'Teacher', title: 'New Instructor', by: 'Dr. Sarah', date: '5h ago', avatar: 'DS', description: 'Dr. Sarah applied as instructor.' },
    { id: 3, type: 'Course', title: 'Docker Basics', by: 'Eng. Hassan', date: '1d ago', avatar: 'EH', description: 'Docker for beginners.' },
  ]);

  const [liveFeed, setLiveFeed] = useState([
    { id: 1, text: 'New student registration', time: '2m ago' },
    { id: 2, text: 'Course "React" updated', time: '15m ago' },
    { id: 3, text: 'Server backup completed', time: '1h ago' },
    { id: 4, text: '5 assignments submitted', time: '2h ago' },
  ]);

  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ item: PendingItem; action: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleApprove = (item: PendingItem) => {
    setPendingItems(prev => prev.filter(p => p.id !== item.id));
    showToast(`${item.type} "${item.title}" approved!`, 'success');
    setLiveFeed(prev => [{ id: Date.now(), text: `${item.type} approved`, time: 'Just now' }, ...prev.slice(0, 3)]);
    setConfirmAction(null);
    setSelectedItem(null);
  };

  const handleReject = (item: PendingItem) => {
    setPendingItems(prev => prev.filter(p => p.id !== item.id));
    showToast(`${item.type} "${item.title}" rejected.`, 'error');
    setConfirmAction(null);
    setSelectedItem(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Dashboard refreshed', 'success');
    }, 1000);
  };

  if (isLoading) return <Loader />;

  const stats = [
    { title: 'Total Teachers', value: '45', change: '+5 this week', icon: <Users className="w-5 h-5" />, path: '/admin/manage-teachers' },
    { title: 'Active Students', value: '1,234', change: '98% retention', icon: <GraduationCap className="w-5 h-5" />, path: '/admin/manage-students' },
    { title: 'Course Completion', value: '78%', change: '+12% vs last mo', icon: <Activity className="w-5 h-5" />, path: '/admin/manage-courses' },
    { title: 'Pending Reviews', value: String(pendingItems.length), change: 'Requires action', icon: <ClipboardCheck className="w-5 h-5" />, path: '#' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-black rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name || 'Admin'}!</h1>
            <p className="text-gray-400 text-sm">Manage your institution's daily operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-6">
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/manage-teachers')}>
            <Users className="w-4 h-4" /> Teachers
          </Button>
          <Button variant="ghost" size="sm" className="text-white border-white/20" onClick={() => navigate('/admin/messages')}>
            <MessageSquare className="w-4 h-4" /> Messages
          </Button>
          <Button variant="ghost" size="sm" className="text-white border-white/20" onClick={() => navigate('/admin/notifications')}>
            <Bell className="w-4 h-4" /> Notifications
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card
            key={i}
            hover
            onClick={() => s.path !== '#' && navigate(s.path)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                {s.icon}
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                {s.change}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase">{s.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending */}
        <Card padding="none" className="lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Pending Actions</h3>
            {pendingItems.length > 0 && (
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                {pendingItems.length} Waiting
              </span>
            )}
          </div>

          <div className="p-4 space-y-3">
            {pendingItems.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">All tasks completed!</p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-700">
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.type} • {item.by} • {item.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setConfirmAction({ item, action: 'approve' })}
                      className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmAction({ item, action: 'reject' })}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <XCircle className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live Feed */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Live Feed</h3>
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          </div>
          <div className="space-y-6 relative">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-100" />
            {liveFeed.map((a) => (
              <div key={a.id} className="relative flex items-center gap-4 pl-6">
                <div className="absolute left-0 w-4 h-4 rounded-full border-4 border-white bg-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.text}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/activity')}
            className="w-full mt-6 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </Card>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={!!selectedItem && !confirmAction}
        onClose={() => setSelectedItem(null)}
        title={`${selectedItem?.type} Details`}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-700">
                {selectedItem.avatar}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.title}</h3>
                <p className="text-gray-500">By {selectedItem.by}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">{selectedItem.description}</p>
            </div>
            <div className="flex gap-3">
              <Button fullWidth onClick={() => setConfirmAction({ item: selectedItem, action: 'approve' })}>
                Approve
              </Button>
              <Button variant="outline" fullWidth onClick={() => setConfirmAction({ item: selectedItem, action: 'reject' })}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.action === 'approve') handleApprove(confirmAction.item);
          else if (confirmAction?.action === 'reject') handleReject(confirmAction.item);
        }}
        title={confirmAction?.action === 'approve' ? 'Approve?' : 'Reject?'}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.item.title}"?`}
        confirmText={confirmAction?.action === 'approve' ? 'Approve' : 'Reject'}
        type={confirmAction?.action === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
};

export default AdminDashboard;