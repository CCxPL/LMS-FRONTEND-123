import React, { useMemo, useState } from 'react';
import {
  Award,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useCertificateRequests } from '../../hooks/useCertificateRequests';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Certificates: React.FC = () => {
  const { user } = useAuth();
  const { getCertificatesForStudent } = useData();
  const { showToast } = useToast();

  const { requests, requestCertificate, hasExistingRequest } = useCertificateRequests(
    user?.id || '',
    'student'
  );

  const [previewCert, setPreviewCert] = useState<any>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const certs = useMemo(() => {
    return getCertificatesForStudent(user?.id || '');
  }, [getCertificatesForStudent, user?.id]);

  const handleRequestCertificate = (cert: any) => {
    try {
      const courseId = cert.courseId || cert.id;

      const existing = hasExistingRequest(courseId);
      if (existing) {
        showToast('Certificate already requested for this course!', 'error');
        return;
      }

      requestCertificate({
        studentName: cert.studentName || user?.name || 'Student',
        courseId,
        courseName: cert.courseName || cert.name || 'Course',
        instructorId: cert.instructorId || cert.teacherId || 'teacher-1',
        instructorName: cert.instructorName || 'Instructor',
        grade: cert.grade || 'A',
        score: Number(cert.score ?? 0),
        adminId: 'admin-1',
      });

      showToast('✅ Certificate request sent! Waiting for approval.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to request certificate', 'error');
    }
  };

  const getRequestStatus = (cert: any) => {
    const courseId = cert.courseId || cert.id;
    return requests.find((r) => r.courseId === courseId);
  };

  const handleDownloadPdf = (request: any) => {
    if (!request?.pdfUrl) {
      showToast('PDF not available yet', 'warning');
      return;
    }

    const link = document.createElement('a');
    link.href = request.pdfUrl;
    link.download = request.pdfFileName || `Certificate-${request.courseName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Certificate downloaded!', 'success');
  };

  const handlePreviewPdf = (request: any) => {
    if (!request?.pdfUrl) {
      showToast('PDF not available for preview', 'warning');
      return;
    }
    setPreviewPdfUrl(request.pdfUrl);
    setPreviewCert(request);
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const configs: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      pending: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: <Clock className="w-3.5 h-3.5" />,
        label: 'Pending Approval',
      },
      teacher_approved: {
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: <Clock className="w-3.5 h-3.5" />,
        label: 'Teacher Approved • Awaiting Admin',
      },
      admin_approved: {
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: <Clock className="w-3.5 h-3.5" />,
        label: 'Admin Approved • Awaiting Teacher',
      },
      both_approved: {
        color: 'bg-purple-100 text-purple-700 border-purple-300',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        label: 'Approved • Certificate Being Prepared',
      },
      uploaded: {
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: 'Certificate Ready!',
      },
      denied: {
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: 'Denied',
      },
    };

    const config = configs[status] || configs.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-500 text-sm mt-1">
          Request, track, and download your certificates
        </p>
      </div>

      {certs.length === 0 && requests.length === 0 ? (
        <Card className="text-center py-16">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Certificates Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Complete courses and pass assessments to earn certificates.
          </p>
          <Button onClick={() => (window.location.href = '/student/my-courses')}>
            Go to Courses
          </Button>
        </Card>
      ) : (
        <>
          {/* Pending Requests */}
          {requests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Requests</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((request) => {
                  const isReady = request.status === 'uploaded';
                  const isDenied = request.status === 'denied';
                  const isPending = !isReady && !isDenied;

                  return (
                    <Card
                      key={request.id}
                      padding="none"
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Header */}
                      <div className="bg-black text-white p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-white/20 rounded-tl-3xl m-4" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-white/20 rounded-br-3xl m-4" />

                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Certificate of Completion
                          </p>
                          <h3 className="text-2xl font-bold mb-2">{request.courseName}</h3>
                          <p className="text-gray-400 text-sm">Awarded to</p>
                          <p className="text-lg font-medium text-white mt-1">
                            {request.studentName}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-900">{request.grade}</p>
                            <p className="text-xs text-gray-500">Grade</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-900">{request.score}%</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-900">
                              {request.requestDate
                                ? new Date(request.requestDate).toLocaleDateString(undefined, {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">Requested</p>
                          </div>
                        </div>

                        <div className="flex justify-center mb-4">
                          <StatusBadge status={request.status} />
                        </div>

                        {isDenied && request.denyReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-red-700">Denied Reason:</p>
                                <p className="text-sm text-red-600">{request.denyReason}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                          Instructor: <strong>{request.instructorName}</strong>
                        </div>

                        <div className="flex gap-3">
                          {isPending && (
                            <Button fullWidth disabled className="opacity-60 cursor-not-allowed">
                              <Clock className="w-4 h-4" />
                              Awaiting Approval...
                            </Button>
                          )}

                          {isReady && (
                            <>
                              <Button
                                fullWidth
                                onClick={() => handlePreviewPdf(request)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Eye className="w-4 h-4" /> Preview
                              </Button>
                              <Button
                                fullWidth
                                onClick={() => handleDownloadPdf(request)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Download className="w-4 h-4" /> Download
                              </Button>
                            </>
                          )}

                          {isDenied && (
                            <Button
                              fullWidth
                              variant="outline"
                              onClick={() => showToast('Please contact your instructor for re-evaluation', 'info')}
                            >
                              <AlertCircle className="w-4 h-4" />
                              Request Denied
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Eligible Certificates */}
          {certs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Eligible for Certificate</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certs.map((cert: any) => {
                  const request = getRequestStatus(cert);
                  if (request) return null; // already requested

                  return (
                    <Card
                      key={cert.id}
                      padding="none"
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="bg-black text-white p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-white/20 rounded-tl-3xl m-4" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-white/20 rounded-br-3xl m-4" />

                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Certificate of Completion
                          </p>
                          <h3 className="text-2xl font-bold mb-2">{cert.courseName}</h3>
                          <p className="text-gray-400 text-sm">Awarded to</p>
                          <p className="text-lg font-medium text-white mt-1">
                            {user?.name || 'Student'}
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-900">{cert.grade}</p>
                            <p className="text-xs text-gray-500">Grade</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-900">{cert.score}%</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-900">Now</p>
                            <p className="text-xs text-gray-500">Available</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                          Instructor: <strong>{cert.instructorName || 'Instructor'}</strong>
                        </div>

                        <Button
                          fullWidth
                          onClick={() => handleRequestCertificate(cert)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                          Request Certificate
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* PDF Preview Modal */}
      <Modal
        isOpen={!!previewPdfUrl}
        onClose={() => {
          setPreviewPdfUrl(null);
          setPreviewCert(null);
        }}
        title="Certificate Preview"
      >
        {previewCert && previewPdfUrl && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '70vh' }}>
              <iframe src={previewPdfUrl} className="w-full h-full" title="Certificate PDF" />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Verified Certificate</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                <p>
                  Student: <strong>{previewCert.studentName}</strong>
                </p>
                <p>
                  Course: <strong>{previewCert.courseName}</strong>
                </p>
                <p>
                  Grade:{' '}
                  <strong>
                    {previewCert.grade} ({previewCert.score}%)
                  </strong>
                </p>
                <p>
                  Issued:{' '}
                  <strong>
                    {new Date(previewCert.issueDate || Date.now()).toLocaleDateString()}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button fullWidth onClick={() => handleDownloadPdf(previewCert)} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Download Certificate
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setPreviewPdfUrl(null);
                  setPreviewCert(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Certificates;