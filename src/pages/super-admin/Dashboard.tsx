// src/pages/super-admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { 
  Users, ShieldCheck, BookOpen, TrendingUp, Server, 
  Globe, ArrowUpRight, Megaphone, Eye,
  GraduationCap, UserCheck, UserX, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';


const SuperAdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isServerLogsOpen, setIsServerLogsOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [targetRoles, setTargetRoles] = useState<string[]>(['student', 'teacher', 'admin']);
  const [recentUsers, setRecentUsers] = useState([
    { id: '1', name: 'Sarah Wilson', role: 'Teacher', date: '2 mins ago', status: 'Active', email: 'sarah@example.com' },
    { id: '2', name: 'Mike Johnson', role: 'Student', date: '15 mins ago', status: 'Pending', email: 'mike@example.com' },
    { id: '3', name: 'Emma Davis', role: 'Student', date: '1 hour ago', status: 'Active', email: 'emma@example.com' },
    { id: '4', name: 'James Brown', role: 'Teacher', date: '3 hours ago', status: 'Verified', email: 'james@example.com' },
  ]);
  const [serverLogs] = useState([
    { time: '10:45:23', level: 'INFO', message: 'User authentication successful' },
    { time: '10:44:12', level: 'WARNING', message: 'High memory usage detected' },
    { time: '10:43:01', level: 'INFO', message: 'Course published successfully' },
    { time: '10:42:55', level: 'ERROR', message: 'Failed to send email notification' },
  ]);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAnnouncement } = useData();
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementBody) {
      showToast('Please fill all fields', 'error');
      return;
    }

    addAnnouncement({
      title: announcementTitle,
      message: announcementBody,
      userId: user?.id || '1',
      userRole: 'super-admin',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    showToast('Announcement broadcasted successfully!', 'success');
    setIsBroadcastOpen(false);
    setAnnouncementTitle('');
    setAnnouncementBody('');
  };

  const handleToggleUserStatus = (userId: string) => {
    setRecentUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`User ${u.name} ${newStatus === 'Active' ? 'activated' : 'suspended'}`, 'success');
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleApproveUser = (userId: string) => {
    setRecentUsers(prev => prev.map(u => {
      if (u.id === userId && u.status === 'Pending') {
        showToast(`User ${u.name} approved successfully`, 'success');
        return { ...u, status: 'Active' };
      }
      return u;
    }));
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshStats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Stats refreshed successfully', 'success');
    }, 1000);
  };

  if (isLoading) return <Loader />;

  const stats = [
    { title: 'Total Students', value: '12,456', change: '+12.5%', icon: <GraduationCap className="w-5 h-5" />, path: '/super-admin/manage-users' },
    { title: 'Active Admins', value: '8', change: '+2 new', icon: <ShieldCheck className="w-5 h-5" />, path: '/super-admin/manage-admins' },
    { title: 'Total Courses', value: '567', change: '+23 this month', icon: <BookOpen className="w-5 h-5" />, path: '/super-admin/platform-stats' },
    { title: 'Total Teachers', value: '89', change: '+5 hired', icon: <Users className="w-5 h-5" />, path: '/super-admin/all-teachers' },
  ];

  const growthData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100];

  return (
    <div className="space-y-6">
     

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">Real-time insights and system control.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleRefreshStats}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => setIsBroadcastOpen(true)} 
          >
            <Megaphone className="w-4 h-4" /> Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card 
            key={i} 
            hover
            onClick={() => navigate(s.path)}
            className="cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                {s.icon}
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <p className="text-sm text-gray-500">{s.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Analytics */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900">User Growth</h3>
                <p className="text-xs text-gray-400">Monthly trend</p>
              </div>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {growthData.map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end gap-1 group relative cursor-pointer">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {h * 15} Users
                  </div>
                  <div 
                    className="w-full bg-black rounded-t-sm opacity-80 group-hover:opacity-100 transition-all hover:bg-emerald-600" 
                    style={{ height: `${h}%` }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium px-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* System Health */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">System Status</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-700 font-bold">Operational</span>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {[
                { label: 'Server CPU', val: 24, icon: Server },
                { label: 'Memory Usage', val: 68, icon: Globe },
                { label: 'Database Load', val: 42, icon: BookOpen },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2 text-gray-600">
                      <metric.icon className="w-4 h-4 text-gray-400" /> {metric.label}
                    </span>
                    <span className="font-bold text-gray-900">{metric.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        metric.val > 80 ? 'bg-red-500' : metric.val > 60 ? 'bg-yellow-500' : 'bg-black'
                      }`}
                      style={{ width: `${metric.val}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setIsServerLogsOpen(true)}
              >
                View Server Logs <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Registrations */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Registrations</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/manage-users')}>
            View All Users
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p>{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{u.role}</td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{u.date}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      u.status === 'Active' || u.status === 'Verified' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : u.status === 'Suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        title="View Details"
                        onClick={() => navigate('/super-admin/manage-users')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {u.status === 'Pending' && (
                        <button 
                          onClick={() => handleApproveUser(u.id)}
                          className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600"
                          title="Approve User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`p-1.5 rounded-lg ${
                          u.status === 'Active' || u.status === 'Verified'
                            ? 'hover:bg-red-100 text-red-500'
                            : 'hover:bg-emerald-100 text-emerald-600'
                        }`}
                        title="Toggle Status"
                      >
                        {u.status === 'Active' || u.status === 'Verified' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Broadcast Modal */}
      <Modal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} title="Broadcast Announcement" size="md">
        <form onSubmit={handleBroadcast} className="space-y-4">
          <Input 
            label="Title" 
            placeholder="e.g., System Maintenance Notice" 
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message Body</label>
            <textarea 
              className="input-field min-h-[120px]" 
              placeholder="Type your announcement here..." 
              value={announcementBody}
              onChange={(e) => setAnnouncementBody(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {['student', 'teacher', 'admin'].map((role) => (
                <label key={role} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200">
                  <input 
                    type="checkbox" 
                    checked={targetRoles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTargetRoles([...targetRoles, role]);
                      } else {
                        setTargetRoles(targetRoles.filter(r => r !== role));
                      }
                    }}
                    className="rounded text-black focus:ring-black"
                  />
                  <span className="text-sm capitalize text-gray-700">{role}s</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={targetRoles.length === 0}>
              <Megaphone className="w-4 h-4" /> Send Broadcast
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsBroadcastOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Server Logs Modal */}
      <Modal isOpen={isServerLogsOpen} onClose={() => setIsServerLogsOpen(false)} title="Server Logs" size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Real-time server activity logs</p>
            <Button variant="outline" size="sm" onClick={() => showToast('Logs refreshed', 'success')}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-800">
            <div className="space-y-2 font-mono text-sm">
              {serverLogs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-500">[{log.time}]</span>
                  <span className={`font-bold ${
                    log.level === 'ERROR' ? 'text-red-400' : 
                    log.level === 'WARNING' ? 'text-yellow-400' : 
                    'text-emerald-400'
                  }`}>
                    [{log.level}]
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => showToast('Logs exported', 'success')}>
              Export Logs
            </Button>
            <Button variant="secondary" onClick={() => setIsServerLogsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;