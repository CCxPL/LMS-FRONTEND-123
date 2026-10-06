// src/types/batch.types.ts
export interface Batch {
  id: string;
  name: string;
  courseId: string;
  description?: string;
  studentCount: number;
  startDate: string;
  status: 'active' | 'completed' | 'upcoming';
  color: string;
  students: BatchStudent[];
}

export interface BatchStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
}