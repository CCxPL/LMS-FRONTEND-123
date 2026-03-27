import type { CertificateRequest, CertificateNotification } from '../types/certificate.types';

// In-memory database
let certificateRequests: CertificateRequest[] = [];
let certificateNotifications: CertificateNotification[] = [];

function generateId(): string {
  return `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateNotifId(): string {
  return `cn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function computeStatus(req: CertificateRequest): any {
  if (req.teacherDenied || req.adminDenied) return 'denied';
  if (req.pdfUrl) return 'uploaded';
  if (req.teacherApproved && req.adminApproved) return 'both_approved';
  if (req.teacherApproved && !req.adminApproved) return 'teacher_approved';
  if (!req.teacherApproved && req.adminApproved) return 'admin_approved';
  return 'pending';
}

function addNotification(notif: Omit<CertificateNotification, 'id' | 'createdAt' | 'read'>): void {
  certificateNotifications.unshift({
    ...notif,
    id: generateNotifId(),
    createdAt: new Date().toISOString(),
    read: false,
  });
}

// ─── Student APIs ───────────────────────────────────────
export function createCertificateRequest(params: {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  grade: string;
  score: number;
  adminId: string;
}): CertificateRequest {
  const existing = certificateRequests.find(
    r =>
      r.studentId === params.studentId &&
      r.courseId === params.courseId &&
      (r.status === 'pending' ||
        r.status === 'teacher_approved' ||
        r.status === 'admin_approved' ||
        r.status === 'both_approved')
  );

  if (existing) {
    throw new Error('Certificate already requested for this course');
  }

  const newRequest: CertificateRequest = {
    id: generateId(),
    studentId: params.studentId,
    studentName: params.studentName,
    courseId: params.courseId,
    courseName: params.courseName,
    instructorId: params.instructorId,
    instructorName: params.instructorName,
    grade: params.grade,
    score: params.score,
    requestDate: new Date().toISOString(),
    status: 'pending',
    teacherApproved: false,
    adminApproved: false,
    teacherDenied: false,
    adminDenied: false,
  };

  certificateRequests.unshift(newRequest);

  // Notify Teacher
  addNotification({
    type: 'certificate_request',
    certificateRequestId: newRequest.id,
    fromUserId: params.studentId,
    fromUserName: params.studentName,
    toUserId: params.instructorId,
    toUserRole: 'teacher',
    message: `${params.studentName} has requested a certificate for "${params.courseName}". Grade: ${params.grade} (${params.score}%). Please review and approve or deny.`,
    actionRequired: true,
  });

  // Notify Admin
  addNotification({
    type: 'certificate_request',
    certificateRequestId: newRequest.id,
    fromUserId: params.studentId,
    fromUserName: params.studentName,
    toUserId: params.adminId,
    toUserRole: 'admin',
    message: `${params.studentName} has requested a certificate for "${params.courseName}". Grade: ${params.grade} (${params.score}%). Please review and approve or deny.`,
    actionRequired: true,
  });

  return newRequest;
}

export function getStudentRequests(studentId: string): CertificateRequest[] {
  return certificateRequests.filter(r => r.studentId === studentId);
}

export function hasExistingRequest(studentId: string, courseId: string): CertificateRequest | undefined {
  return certificateRequests.find(
    r =>
      r.studentId === studentId &&
      r.courseId === courseId &&
      (r.status === 'pending' ||
        r.status === 'teacher_approved' ||
        r.status === 'admin_approved' ||
        r.status === 'both_approved')
  );
}

// ─── Teacher APIs ───────────────────────────────────────
export function getTeacherCertificateRequests(teacherId: string): CertificateRequest[] {
  return certificateRequests.filter(r => r.instructorId === teacherId);
}

export function teacherApproveCertificate(
  requestId: string,
  teacherId: string,
  teacherName: string,
  adminId: string
): void {
  const idx = certificateRequests.findIndex(r => r.id === requestId);
  if (idx === -1) throw new Error('Request not found');

  certificateRequests[idx].teacherApproved = true;
  certificateRequests[idx].teacherActionDate = new Date().toISOString();
  certificateRequests[idx].status = computeStatus(certificateRequests[idx]);

  const req = certificateRequests[idx];

  // Notify student
  addNotification({
    type: 'certificate_approved',
    certificateRequestId: requestId,
    fromUserId: teacherId,
    fromUserName: teacherName,
    toUserId: req.studentId,
    toUserRole: 'student',
    message: `✅ Your teacher ${teacherName} has approved your certificate request for "${req.courseName}". ${req.adminApproved ? '🎉 Both approvals received! Admin will upload your certificate soon.' : 'Waiting for admin approval.'}`,
    actionRequired: false,
  });

  // If both approved, notify admin
  if (req.status === 'both_approved') {
    addNotification({
      type: 'certificate_upload_needed',
      certificateRequestId: requestId,
      fromUserId: teacherId,
      fromUserName: teacherName,
      toUserId: adminId,
      toUserRole: 'admin',
      message: `🎯 Both approvals received! ${req.studentName}'s certificate for "${req.courseName}" is ready for upload.`,
      actionRequired: true,
    });
  }
}

export function teacherDenyCertificate(
  requestId: string,
  teacherId: string,
  teacherName: string,
  reason: string
): void {
  const idx = certificateRequests.findIndex(r => r.id === requestId);
  if (idx === -1) throw new Error('Request not found');

  certificateRequests[idx].teacherDenied = true;
  certificateRequests[idx].deniedBy = 'teacher';
  certificateRequests[idx].denyReason = reason;
  certificateRequests[idx].teacherActionDate = new Date().toISOString();
  certificateRequests[idx].status = 'denied';

  const req = certificateRequests[idx];

  addNotification({
    type: 'certificate_denied',
    certificateRequestId: requestId,
    fromUserId: teacherId,
    fromUserName: teacherName,
    toUserId: req.studentId,
    toUserRole: 'student',
    message: `❌ Your certificate request for "${req.courseName}" was denied by ${teacherName}. Reason: ${reason}`,
    actionRequired: false,
  });
}

// ─── Admin APIs ─────────────────────────────────────────
export function getAdminCertificateRequests(): CertificateRequest[] {
  return certificateRequests;
}

export function adminApproveCertificate(requestId: string, adminId: string, adminName: string): void {
  const idx = certificateRequests.findIndex(r => r.id === requestId);
  if (idx === -1) throw new Error('Request not found');

  certificateRequests[idx].adminApproved = true;
  certificateRequests[idx].adminActionDate = new Date().toISOString();
  certificateRequests[idx].status = computeStatus(certificateRequests[idx]);

  const req = certificateRequests[idx];

  addNotification({
    type: 'certificate_approved',
    certificateRequestId: requestId,
    fromUserId: adminId,
    fromUserName: adminName,
    toUserId: req.studentId,
    toUserRole: 'student',
    message: `✅ Admin has approved your certificate request for "${req.courseName}". ${req.teacherApproved ? '🎉 Both approvals received! Your certificate will be uploaded soon.' : 'Waiting for teacher approval.'}`,
    actionRequired: false,
  });

  if (req.status === 'both_approved') {
    addNotification({
      type: 'certificate_upload_needed',
      certificateRequestId: requestId,
      fromUserId: adminId,
      fromUserName: adminName,
      toUserId: adminId,
      toUserRole: 'admin',
      message: `🎯 Both approvals received! ${req.studentName}'s certificate for "${req.courseName}" is ready. Please upload the PDF now.`,
      actionRequired: true,
    });
  }
}

export function adminDenyCertificate(
  requestId: string,
  adminId: string,
  adminName: string,
  reason: string
): void {
  const idx = certificateRequests.findIndex(r => r.id === requestId);
  if (idx === -1) throw new Error('Request not found');

  certificateRequests[idx].adminDenied = true;
  certificateRequests[idx].deniedBy = 'admin';
  certificateRequests[idx].denyReason = reason;
  certificateRequests[idx].adminActionDate = new Date().toISOString();
  certificateRequests[idx].status = 'denied';

  const req = certificateRequests[idx];

  addNotification({
    type: 'certificate_denied',
    certificateRequestId: requestId,
    fromUserId: adminId,
    fromUserName: adminName,
    toUserId: req.studentId,
    toUserRole: 'student',
    message: `❌ Your certificate request for "${req.courseName}" was denied. Reason: ${reason}`,
    actionRequired: false,
  });
}

export function adminUploadCertificatePdf(
  requestId: string,
  adminId: string,
  adminName: string,
  pdfBase64: string,
  pdfFileName: string
): void {
  const idx = certificateRequests.findIndex(r => r.id === requestId);
  if (idx === -1) throw new Error('Request not found');
  if (certificateRequests[idx].status !== 'both_approved') {
    throw new Error('Both approvals required before uploading. Current status: ' + certificateRequests[idx].status);
  }

  certificateRequests[idx].pdfUrl = pdfBase64;
  certificateRequests[idx].pdfFileName = pdfFileName;
  certificateRequests[idx].uploadDate = new Date().toISOString();
  certificateRequests[idx].issueDate = new Date().toISOString();
  certificateRequests[idx].status = 'uploaded';

  const req = certificateRequests[idx];

  addNotification({
    type: 'certificate_ready',
    certificateRequestId: requestId,
    fromUserId: adminId,
    fromUserName: adminName,
    toUserId: req.studentId,
    toUserRole: 'student',
    message: `🎉 Your certificate for "${req.courseName}" is ready! You can now download and preview it in your certificates section.`,
    actionRequired: false,
  });
}

// ─── Notification APIs ──────────────────────────────────
export function getCertificateNotifications(userId: string): CertificateNotification[] {
  return certificateNotifications.filter(n => n.toUserId === userId);
}

export function markCertNotificationRead(notifId: string): void {
  const idx = certificateNotifications.findIndex(n => n.id === notifId);
  if (idx !== -1) {
    certificateNotifications[idx].read = true;
  }
}

export function getUnreadCertNotificationCount(userId: string): number {
  return certificateNotifications.filter(
    n => n.toUserId === userId && !n.read && n.actionRequired
  ).length;
}

// ✅ Reset for testing
export function resetCertificateData(): void {
  certificateRequests = [];
  certificateNotifications = [];
}