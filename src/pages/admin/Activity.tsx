import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { 
  Clock, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw, 
  Eye 
} from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  action: string;
  detail: string;
  time: string;
  type: 'user' | 'course' | 'system' | 'teacher';
  user?: string;
  date: Date;
}

const Activity: React.FC = () => {
  const { showToast } = useToast();
  
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', icon: <User className="w-5 h-5" />, action: 'New student registered', detail: 'Aakash Student joined the platform', time: '5 min ago', type: 'user', user: 'Aakash', date: new Date(Date.now() - 5 * 60000) },
    { id: '2', icon: <BookOpen className="w-5 h-5" />, action: 'Course published', detail: '"React.js Complete" was approved', time: '15 min ago', type: 'course', user: 'Admin', date: new Date(Date.now() - 15 * 60000) },
    { id: '3', icon: <ShieldCheck className="w-5 h-5" />, action: 'Teacher approved', detail: 'Dr. Fatima was approved as instructor', time: '1 hour ago', type: 'teacher', user: 'Admin', date: new Date(Date.now() - 60 * 60000) },
    { id: '4', icon: <User className="w-5 h-5" />, action: 'Student suspended', detail: 'Usman was suspended', time: '2 hours ago', type: 'user', user: 'Admin', date: new Date(Date.now() - 2 * 60 * 60000) },
    { id: '5', icon: <BookOpen className="w-5 h-5" />, action: 'Course rejected', detail: '"SEO Basics" was rejected', time: '3 hours ago', type: 'course', user: 'Admin', date: new Date(Date.now() - 3 * 60 * 60000) },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.detail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = activity.date.toDateString() === new Date().toDateString();
    } else if (dateFilter === 'week') {
      matchesDate = activity.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Activity logs refreshed', 'success');
    }, 1000);
  };

  const handleExport = () => {
    const csv = [
      ['Action', 'Detail', 'Type', 'User', 'Time'].join(','),
      ...filteredActivities.map(a => [a.action, a.detail, a.type, a.user || 'N/A', a.time].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity-logs.csv';
    link.click();
    showToast('Activity logs exported', 'success');
  };

  const handleClearAll = () => {
    setActivities([]);
    setShowClearConfirm(false);
    showToast('All activity logs cleared', 'info');
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    showToast('Activity deleted', 'info');
  };

  const stats = {
    total: activities.length,
    users: activities.filter(a => a.type === 'user').length,
    courses: activities.filter(a => a.type === 'course').length,
    system: activities.filter(a => a.type === 'system').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Track all platform activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="outline" onClick={() => setShowClearConfirm(true)} disabled={activities.length === 0}>
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'User', value: stats.users },
          { label: 'Course', value: stats.courses },
          { label: 'System', value: stats.system },
        ].map((stat, idx) => (
          <Card key={idx} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Types</option>
                <option value="user">User</option>
                <option value="course">Course</option>
                <option value="teacher">Teacher</option>
                <option value="system">System</option>
              </select>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Activity List */}
      <Card padding="none">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-medium text-gray-500">No activities found</p>
            <p className="text-sm text-gray-400 mt-1">Activities will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{activity.detail}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-400 mt-1">By: {activity.user}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedActivity(activity)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Activity Detail Modal */}
      <Modal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title="Activity Details"
        size="sm"
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto text-gray-600">
              {selectedActivity.icon}
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">{selectedActivity.action}</h3>
              <p className="text-gray-500 mt-1">{selectedActivity.detail}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900 capitalize">{selectedActivity.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">By</span>
                <span className="font-medium text-gray-900">{selectedActivity.user || 'System'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{selectedActivity.time}</span>
              </div>
            </div>

            <Button variant="outline" fullWidth onClick={() => setSelectedActivity(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Clear Confirm */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear All Activities?"
        message="This will permanently delete all activity logs."
        confirmText="Clear All"
        type="danger"
      />
    </div>
  );
};

export default Activity;