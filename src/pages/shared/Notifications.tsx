import React, { useMemo } from 'react';
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markRead, markAllRead, clearNotification } = useData();
  const { showToast } = useToast();

  const myNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.userId === user.id || n.userId === 'all');
  }, [notifications, user]);

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleMarkAll = () => {
    if (user) {
      markAllRead(user.id);
      showToast('All notifications marked as read', 'success');
    }
  };

  const handleClear = (id: string) => {
    clearNotification(id);
    showToast('Notification removed', 'info');
  };

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch(type) {
      case 'success': return <CheckCircle className={`${iconClass} text-gray-700`} />;
      case 'warning': return <AlertTriangle className={`${iconClass} text-gray-700`} />;
      case 'error': return <XCircle className={`${iconClass} text-gray-700`} />;
      default: return <Info className={`${iconClass} text-gray-700`} />;
    }
  };

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
        {myNotifications.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myNotifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => !notif.read && markRead(notif.id)}
                className={`relative p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
                  notif.read 
                    ? 'bg-white border-gray-200 hover:border-gray-300' 
                    : 'bg-gray-50 border-gray-300 shadow-sm'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-black rounded-full" />
                )}
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-gray-100 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className={`text-sm ${notif.read ? 'font-medium' : 'font-bold'} text-gray-900`}>
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
                    onClick={(e) => { e.stopPropagation(); handleClear(notif.id); }}
                    className="absolute bottom-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;