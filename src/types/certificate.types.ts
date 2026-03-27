export type CertificateRequestStatus =
  | 'pending'
  | 'teacher_approved'
  | 'admin_approved'
  | 'both_approved'
  | 'uploaded'
  | 'denied';

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  grade: string;
  score: number;
  requestDate: string;
  status: CertificateRequestStatus;
  teacherApproved: boolean;
  adminApproved: boolean;
  teacherDenied: boolean;
  adminDenied: boolean;
  teacherActionDate?: string;
  adminActionDate?: string;
  deniedBy?: string;
  denyReason?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  uploadDate?: string;
  issueDate?: string;
}

export interface CertificateNotification {
  id: string;
  type:
    | 'certificate_request'
    | 'certificate_approved'
    | 'certificate_denied'
    | 'certificate_ready'
    | 'certificate_upload_needed';
  certificateRequestId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserRole: 'student' | 'teacher' | 'admin';
  message: string;
  read: boolean;
  createdAt: string;
  actionRequired: boolean;
}