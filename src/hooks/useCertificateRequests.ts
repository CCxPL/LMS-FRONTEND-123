import { useState, useCallback, useEffect } from 'react';
import type { CertificateRequest, CertificateNotification } from '../types/certificate.types';
import * as certService from '../services/certificateService';

export function useCertificateRequests(userId: string, role: 'student' | 'teacher' | 'admin') {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [notifications, setNotifications] = useState<CertificateNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      if (role === 'student') {
        setRequests(certService.getStudentRequests(userId));
      } else if (role === 'teacher') {
        setRequests(certService.getTeacherCertificateRequests(userId));
      } else if (role === 'admin') {
        setRequests(certService.getAdminCertificateRequests());
      }

      setNotifications(certService.getCertificateNotifications(userId));
      setUnreadCount(certService.getUnreadCertNotificationCount(userId));
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const requestCertificate = useCallback(
    (params: {
      studentName: string;
      courseId: string;
      courseName: string;
      instructorId: string;
      instructorName: string;
      grade: string;
      score: number;
      adminId: string;
    }) => {
      const result = certService.createCertificateRequest({
        studentId: userId,
        ...params,
      });
      refresh();
      return result;
    },
    [userId, refresh]
  );

  const hasExistingRequest = useCallback(
    (courseId: string) => {
      return certService.hasExistingRequest(userId, courseId);
    },
    [userId]
  );

  const teacherApprove = useCallback(
    (requestId: string, teacherName: string) => {
      certService.teacherApproveCertificate(requestId, userId, teacherName, 'admin-1');
      refresh();
    },
    [userId, refresh]
  );

  const teacherDeny = useCallback(
    (requestId: string, teacherName: string, reason: string) => {
      certService.teacherDenyCertificate(requestId, userId, teacherName, reason);
      refresh();
    },
    [userId, refresh]
  );

  const adminApprove = useCallback(
    (requestId: string, adminName: string) => {
      certService.adminApproveCertificate(requestId, userId, adminName);
      refresh();
    },
    [userId, refresh]
  );

  const adminDeny = useCallback(
    (requestId: string, adminName: string, reason: string) => {
      certService.adminDenyCertificate(requestId, userId, adminName, reason);
      refresh();
    },
    [userId, refresh]
  );

  const adminUploadPdf = useCallback(
    (requestId: string, adminName: string, pdfBase64: string, pdfFileName: string) => {
      certService.adminUploadCertificatePdf(requestId, userId, adminName, pdfBase64, pdfFileName);
      refresh();
    },
    [userId, refresh]
  );

  const markNotifRead = useCallback((notifId: string) => {
    certService.markCertNotificationRead(notifId);
    refresh();
  }, [refresh]);

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