import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from '../../api/notificationApi';

const Notifications: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getMyNotificationsApi();
      setNotifications(res.data?.notifications || []);
    } catch {
      showToast('Failed to load notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !(n.readBy ?? []).length).length;

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, readBy: ['marked'] })));
      showToast('All notifications marked as read', 'success');
    } catch {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleClear = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      showToast('Notification removed', 'info');
    } catch {
      showToast('Failed to remove notification', 'error');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(prev => prev.map(n =>
        n._id === id ? { ...n, readBy: ['marked'] } : n
      ));
    } catch { }
  };

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success': return <CheckCircle className={`${iconClass} text-gray-700`} />;
      case 'warning': return <AlertTriangle className={`${iconClass} text-gray-700`} />;
      case 'error': return <XCircle className={`${iconClass} text-gray-700`} />;
      default: return <Info className={`${iconClass} text-gray-700`} />;
    }
  };

  if (isLoading) return <Loader text="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll} icon={<CheckCheck className="w-4 h-4" />}>
            Mark All Read
          </Button>
        )}
      </div>

      <div className="max-w-3xl">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => {
              const isRead = (notif.readBy ?? []).length > 0;
              return (
                <div
                  key={notif._id}
                  onClick={() => !isRead && handleMarkRead(notif._id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${isRead
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-gray-50 border-gray-300 shadow-sm'
                    }`}
                >
                  {!isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-black rounded-full" />
                  )}

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-gray-100 shrink-0">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className={`text-sm ${isRead ? 'font-medium' : 'font-bold'} text-gray-900`}>
                        {notif.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleClear(notif._id); }}
                      className="absolute bottom-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;