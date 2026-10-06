import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useCertificateRequests } from '../../hooks/useCertificateRequests';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const CertificateApprovals: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { requests, teacherApprove, teacherDeny, notifications, markNotifRead, unreadCount } =
    useCertificateRequests(user?.id || '', 'teacher');

  const [denyModal, setDenyModal] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications'>('requests');

  const pendingRequests = requests.filter(
    r => r.status === 'pending' || (r.status === 'admin_approved' && !r.teacherApproved)
  );
  const processedRequests = requests.filter(r => r.teacherApproved || r.teacherDenied);

  const handleApprove = (requestId: string) => {
    try {
      teacherApprove(requestId, user?.name || 'Teacher');
      showToast('✅ Certificate request approved!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeny = () => {
    if (!denyModal || !denyReason.trim()) {
      showToast('Please provide a reason', 'error');
      return;
    }
    try {
      teacherDeny(denyModal, user?.name || 'Teacher', denyReason);
      showToast('Certificate request denied', 'info');
      setDenyModal(null);
      setDenyReason('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'admin_approved':
        return 'text-blue-600 bg-blue-50';
      case 'teacher_approved':
      case 'both_approved':
        return 'text-green-600 bg-green-50';
      case 'uploaded':
        return 'text-emerald-600 bg-emerald-50';
      case 'denied':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve student certificate requests</p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            {unreadCount} new request{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'notifications'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-700">All Caught Up!</h3>
              <p className="text-gray-500 text-sm">No pending certificate requests</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow border-l-4 border-l-gray-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <User className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{req.studentName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <BookOpen className="w-4 h-4" />
                          {req.courseName}
                        </div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            Grade: <strong>{req.grade}</strong>
                          </span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            Score: <strong>{req.score}%</strong>
                          </span>
                          <span className="text-sm text-gray-400">
                            Requested: {new Date(req.requestDate).toLocaleDateString()}
                          </span>
                        </div>
                        {req.adminApproved && (
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Admin has already approved
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${getStatusColor(
                        req.status
                      )}`}
                    >
                      {req.adminApproved ? 'Admin ✓' : 'Pending'}
                    </span>
                  </div>

                  {!req.teacherApproved && !req.teacherDenied && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Button onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setDenyModal(req.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Deny
                      </Button>
                    </div>
                  )}

                  {req.teacherApproved && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>You approved this request</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {processedRequests.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">History</h2>
              <div className="space-y-3">
                {processedRequests.map((req) => (
                  <Card key={req.id} className="opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {req.teacherApproved ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {req.studentName} - {req.courseName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {req.teacherApproved ? '✓ Approved' : '✗ Denied'} on{' '}
                            {req.teacherActionDate && new Date(req.teacherActionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications yet</p>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-all ${
                  !notif.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
                onClick={() => markNotifRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'certificate_request' ? (
                      <Award className="w-5 h-5 text-gray-600" />
                    ) : notif.type === 'certificate_approved' ? (
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.read ? 'font-semibold' : ''} text-gray-800`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={!!denyModal}
        onClose={() => {
          setDenyModal(null);
          setDenyReason('');
        }}
        title="Deny Certificate Request"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-800 font-medium">
                This action cannot be undone. The student will be notified immediately.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Denial *</label>
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Grade does not meet minimum requirements, or other specific reason..."
            />
          </div>

          <div className="flex gap-3">
            <Button fullWidth onClick={handleDeny} className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4" />
              Confirm Deny
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setDenyModal(null);
                setDenyReason('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CertificateApprovals;