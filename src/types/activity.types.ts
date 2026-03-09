export type ActivityType = 
  | 'student_joined'
  | 'student_left'
  | 'teacher_joined'
  | 'teacher_left'
  | 'class_started'
  | 'class_ended'
  | 'role_changed'
  | 'user_created'
  | 'user_deleted'
  | 'course_assigned'
  | 'course_removed';

export interface Activity {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  targetName?: string;
  targetRole?: string;
  eventId?: string;
  courseId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ActivityFilter {
  type?: ActivityType[];
  actorId?: string;
  targetId?: string;
  eventId?: string;
  courseId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}