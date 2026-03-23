// src/types/leave.types.ts
export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  start: string;
  end: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  days: string[]; // Working days only (excluding weekends)
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface LeaveFormData {
  start: string;
  end: string;
  reason: string;
}