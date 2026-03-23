// src/services/batchService.ts
import type { Batch } from '../types/batch.types';

const BATCHES_KEY = 'lms_batches';

const defaultBatches: Batch[] = [
  {
    id: 'batch-1',
    name: 'Morning Batch - Jan 2025',
    courseId: '1',
    description: 'Mon-Fri, 9 AM - 11 AM',
    studentCount: 35,
    startDate: '2025-01-06',
    status: 'active',
    color: 'blue',
    students: [
      { id: 's1', name: 'Aakash Verma', email: 'aakash@example.com', progress: 75 },
      { id: 's2', name: 'Priya Patel', email: 'priya@example.com', progress: 60 },
    ],
  },
  {
    id: 'batch-2',
    name: 'Evening Batch - Jan 2025',
    courseId: '1',
    description: 'Mon-Fri, 6 PM - 8 PM',
    studentCount: 28,
    startDate: '2025-01-06',
    status: 'active',
    color: 'purple',
    students: [
      { id: 's3', name: 'Neha Sharma', email: 'neha@example.com', progress: 90 },
      { id: 's4', name: 'Amit Joshi', email: 'amit@example.com', progress: 30 },
    ],
  },
  {
    id: 'batch-3',
    name: 'Weekend Batch',
    courseId: '1',
    description: 'Sat-Sun, 10 AM - 1 PM',
    studentCount: 42,
    startDate: '2025-02-01',
    status: 'active',
    color: 'green',
    students: [
      { id: 's5', name: 'Sneha Reddy', email: 'sneha@example.com', progress: 55 },
    ],
  },
  {
    id: 'batch-4',
    name: 'Fast Track Batch',
    courseId: '1',
    description: 'Intensive Daily 4hrs',
    studentCount: 15,
    startDate: '2025-03-01',
    status: 'upcoming',
    color: 'orange',
    students: [],
  },
  {
    id: 'batch-5',
    name: 'Python Morning',
    courseId: '2',
    description: 'Mon-Wed-Fri, 8 AM',
    studentCount: 25,
    startDate: '2025-01-10',
    status: 'active',
    color: 'emerald',
    students: [
      { id: 's6', name: 'Ankit Gupta', email: 'ankit@example.com', progress: 40 },
    ],
  },
];

export const batchService = {
  getBatchesByCourse(courseId: string): Batch[] {
    const stored = localStorage.getItem(BATCHES_KEY);
    const batches: Batch[] = stored ? JSON.parse(stored) : defaultBatches;
    if (!stored) localStorage.setItem(BATCHES_KEY, JSON.stringify(defaultBatches));
    return batches.filter(b => b.courseId === courseId);
  },

  getAllBatches(): Batch[] {
    const stored = localStorage.getItem(BATCHES_KEY);
    if (!stored) {
      localStorage.setItem(BATCHES_KEY, JSON.stringify(defaultBatches));
      return defaultBatches;
    }
    return JSON.parse(stored);
  },

  createBatch(batch: Batch): void {
    const batches = this.getAllBatches();
    batches.push(batch);
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  },

  deleteBatch(batchId: string): void {
    const batches = this.getAllBatches().filter(b => b.id !== batchId);
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  },
};