import { useState, useCallback, useEffect } from 'react';
import type { CertificateRequest, CertificateNotification } from '../types/certificate.types';
import { certificateService } from '../services/certificateService';

export function useCertificateRequests(userId: string, role: 'student' | 'teacher' | 'admin') {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [notifications] = useState<CertificateNotification[]>([]);
  const [unreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      if (role === 'student') {
        const data = await certificateService.getMyRequests();
        setRequests(data);
      } else if (role === 'teacher') {
        const data = await certificateService.getTeacherRequests();
        setRequests(data);
      } else if (role === 'admin') {
        const data = await certificateService.getAdminRequests();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to load certificate requests:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestCertificate = useCallback(
    async (params: { courseId: string }) => {
      await certificateService.requestCertificate(params.courseId);
      await refresh();
    },
    [refresh]
  );

  const hasExistingRequest = useCallback(
    (courseId: string) => {
      return requests.find(r => r.courseId === courseId) || null;
    },
    [requests]
  );

  const teacherApprove = useCallback(
    async (requestId: string, _teacherName: string) => {
      await certificateService.teacherApprove(requestId);
      await refresh();
    },
    [refresh]
  );

  const teacherDeny = useCallback(
    async (requestId: string, _teacherName: string, reason: string) => {
      await certificateService.teacherDeny(requestId, reason);
      await refresh();
    },
    [refresh]
  );

  const adminApprove = useCallback(
    async (requestId: string, _adminName: string) => {
      await certificateService.adminApprove(requestId);
      await refresh();
    },
    [refresh]
  );

  const adminDeny = useCallback(
    async (requestId: string, _adminName: string, reason: string) => {
      await certificateService.adminDeny(requestId, reason);
      await refresh();
    },
    [refresh]
  );

  const adminUploadPdf = useCallback(
    async (requestId: string, _adminName: string, pdfBase64: string, pdfFileName: string) => {
      await certificateService.uploadPdf(requestId, pdfBase64, pdfFileName);
      await refresh();
    },
    [refresh]
  );

  const markNotifRead = useCallback((_notifId: string) => {
    // Backend notifications handle hoti hain — socket se aati hain
  }, []);

  return {
    requests,
    notifications,
    unreadCount,
    loading,
    refresh,
    requestCertificate,
    hasExistingRequest,
    teacherApprove,
    teacherDeny,
    adminApprove,
    adminDeny,
    adminUploadPdf,
    markNotifRead,
  };
}