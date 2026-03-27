import React, { useState, useRef } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Upload,
  AlertTriangle,
  FileText,
  Eye,
  Send,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useCertificateRequests } from '../../hooks/useCertificateRequests';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const CertificateManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { requests, adminApprove, adminDeny, adminUploadPdf, notifications, markNotifRead, unreadCount } =
    useCertificateRequests(user?.id || '', 'admin');

  const [denyModal, setDenyModal] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [uploadModal, setUploadModal] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'upload' | 'all' | 'notifications'>('pending');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingRequests = requests.filter(
    r => r.status === 'pending' || (r.status === 'teacher_approved' && !r.adminApproved)
  );
  const needUploadRequests = requests.filter(r => r.status === 'both_approved');
  const allRequests = requests;
  const uploadedRequests = requests.filter(r => r.status === 'uploaded');

  const handleApprove = (requestId: string) => {
    try {
      adminApprove(requestId, user?.name || 'Admin');
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
      adminDeny(denyModal, user?.name || 'Admin', denyReason);
      showToast('Certificate request denied', 'info');
      setDenyModal(null);
      setDenyReason('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please upload a PDF file only', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadModal || !uploadedFile) {
      showToast('Please select a PDF file', 'error');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(uploadedFile);
      adminUploadPdf(uploadModal, user?.name || 'Admin', base64, uploadedFile.name);
      showToast('✅ Certificate uploaded and sent to student! 🎉', 'success');
      setUploadModal(null);
      setUploadedFile(null);
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      teacher_approved: { color: 'bg-blue-100 text-blue-700', label: 'Teacher ✓' },
      admin_approved: { color: 'bg-indigo-100 text-indigo-700', label: 'You ✓' },
      both_approved: { color: 'bg-purple-100 text-purple-700', label: 'Upload Needed' },
      uploaded: { color: 'bg-green-100 text-green-700', label: 'Delivered' },
      denied: { color: 'bg-red-100 text-red-700', label: 'Denied' },
    };
    return configs[status] || configs.pending;
  };

  const RequestCard: React.FC<{ req: any; showActions?: boolean }> = ({ req, showActions = false }) => {
    const statusConfig = getStatusConfig(req.status);

    return (
      <Card className="hover:shadow-md transition-shadow">
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
                <span className="text-sm text-gray-400">{new Date(req.requestDate).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-3 mt-3 flex-wrap">
                <div
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                    req.teacherApproved
                      ? 'bg-green-50 text-green-700 font-medium'
                      : req.teacherDenied
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {req.teacherApproved ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : req.teacherDenied ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  Teacher: {req.teacherApproved ? '✓ OK' : req.teacherDenied ? '✗ Denied' : 'Pending'}
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                    req.adminApproved
                      ? 'bg-green-50 text-green-700 font-medium'
                      : req.adminDenied
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {req.adminApproved ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : req.adminDenied ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  Admin: {req.adminApproved ? '✓ OK' : req.adminDenied ? '✗ Denied' : 'Pending'}
                </div>
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {showActions && !req.adminApproved && !req.adminDenied && (
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

        {req.status === 'both_approved' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600 animate-pulse shrink-0" />
                <p className="text-sm text-purple-800 font-medium">
                  Both approvals received! Upload the certificate PDF now.
                </p>
              </div>
            </div>
            <Button onClick={() => setUploadModal(req.id)} className="bg-purple-600 hover:bg-purple-700 w-full">
              <Upload className="w-4 h-4" />
              Upload Certificate PDF
            </Button>
          </div>
        )}

        {req.status === 'uploaded' && req.pdfUrl && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewPdf({ url: req.pdfUrl!, name: req.pdfFileName || 'certificate.pdf' })}
                className="flex-1"
              >
                <Eye className="w-4 h-4" />
                View PDF
              </Button>
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium px-3 py-2 bg-green-50 rounded-lg whitespace-nowrap">
                <CheckCircle className="w-4 h-4" />
                Delivered
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-gray-500 text-sm mt-1">Approve requests and upload certificates</p>
        </div>
        <div className="flex items-center gap-3">
          {needUploadRequests.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
              <Upload className="w-4 h-4" />
              {needUploadRequests.length} need upload
            </span>
          )}
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pending', count: pendingRequests.length, color: 'bg-yellow-500' },
          { label: 'Need Upload', count: needUploadRequests.length, color: 'bg-purple-500' },
          { label: 'Delivered', count: uploadedRequests.length, color: 'bg-green-500' },
          {
            label: 'Denied',
            count: requests.filter(r => r.status === 'denied').length,
            color: 'bg-red-500',
          },
          { label: 'Total', count: requests.length, color: 'bg-gray-700' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <span className="text-white font-bold">{stat.count}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { key: 'pending', label: `Pending (${pendingRequests.length})` },
          { key: 'upload', label: `Upload Needed (${needUploadRequests.length})` },
          { key: 'all', label: `All (${allRequests.length})` },
          { key: 'notifications', label: 'Notifications' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative ${
              activeTab === tab.key
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key === 'notifications' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No Pending Requests</h3>
              <p className="text-gray-500 text-sm">All certificate requests have been processed</p>
            </Card>
          ) : (
            pendingRequests.map((req) => (
              <RequestCard key={req.id} req={req} showActions />
            ))
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-4">
          {needUploadRequests.length === 0 ? (
            <Card className="text-center py-12">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No Uploads Needed</h3>
              <p className="text-gray-500 text-sm">All certificates are uploaded</p>
            </Card>
          ) : (
            needUploadRequests.map((req) => (
              <RequestCard key={req.id} req={req} />
            ))
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="space-y-4">
          {allRequests.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No certificate requests yet</p>
            </Card>
          ) : (
            allRequests.map((req) => (
              <RequestCard key={req.id} req={req} showActions={!req.adminApproved && !req.adminDenied} />
            ))
          )}
        </div>
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
                onClick={() => {
                  markNotifRead(notif.id);
                  if (notif.type === 'certificate_upload_needed') {
                    setActiveTab('upload');
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'certificate_request' ? (
                      <Award className="w-5 h-5 text-gray-600" />
                    ) : notif.type === 'certificate_upload_needed' ? (
                      <Upload className="w-5 h-5 text-gray-600" />
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
                    {notif.type === 'certificate_upload_needed' && notif.actionRequired && (
                      <Button
                        size="sm"
                        className="mt-2 bg-purple-600 hover:bg-purple-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadModal(notif.certificateRequestId);
                        }}
                      >
                        <Upload className="w-3 h-3" />
                        Upload Now
                      </Button>
                    )}
                  </div>
                  {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={!!uploadModal}
        onClose={() => {
          setUploadModal(null);
          setUploadedFile(null);
        }}
        title="Upload Certificate PDF"
      >
        {uploadModal && (
          <div className="space-y-6">
            {(() => {
              const req = requests.find(r => r.id === uploadModal);
              if (!req) return null;
              return (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Student</p>
                      <p className="font-semibold text-gray-900">{req.studentName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Course</p>
                      <p className="font-semibold text-gray-900">{req.courseName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Grade</p>
                      <p className="font-semibold text-gray-900">
                        {req.grade} ({req.score}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Instructor</p>
                      <p className="font-semibold text-gray-900">{req.instructorName}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploadedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div>
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Click to change</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">Click to upload certificate PDF</p>
                  <p className="text-xs text-gray-400 mt-1">PDF only, max 10MB</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Once uploaded, the certificate will be immediately available for the student to download and preview.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                fullWidth
                onClick={handleUploadSubmit}
                disabled={!uploadedFile || uploading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Upload & Send to Student
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setUploadModal(null);
                  setUploadedFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
                This will deny the request. The student will be notified.
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
              placeholder="Please provide a reason..."
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

      <Modal
        isOpen={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        title="Certificate Preview"
      >
        {previewPdf && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '60vh' }}>
              <iframe src={previewPdf.url} className="w-full h-full" title="Certificate PDF" />
            </div>
            <Button variant="outline" fullWidth onClick={() => setPreviewPdf(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificateManagement;