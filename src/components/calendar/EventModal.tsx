import React, { useState } from 'react';
import { X, Trash2, Clock, Link, FileText, Calendar, BookOpen } from 'lucide-react';
import type { EventFormData, CalendarEvent } from '../../types/calendar.types';
import { mockCourses } from '../../mockData/courses';
import { useAuth } from '../../hooks/useAuth';

interface EventModalProps {
  event?: CalendarEvent;
  date?: string;
  onClose: () => void;
  onSave: (formData: EventFormData) => void;
  onDelete?: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ 
  event, 
  date, 
  onClose, 
  onSave,
  onDelete 
}) => {
  const { user } = useAuth();

  // Get available courses
  const getAvailableCourses = () => {
    if (!user) return [];
    if (user.role === 'super-admin' || user.role === 'admin') return mockCourses;
    if (user.role === 'teacher') {
      return mockCourses.filter(c => 
        user.teachingCourseIds?.includes(c.id) || c.teacherId === user.id
      );
    }
    return [];
  };

  const availableCourses = getAvailableCourses();

  // Parse 24hr time to 12hr
  const parse24To12 = (time24?: string) => {
    if (!time24) return { time: '09:00', period: 'AM' as 'AM' | 'PM' };
    
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    
    return {
      time: `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      period: period as 'AM' | 'PM'
    };
  };

  const startTime = parse24To12(event?.startTime);
  const endTime = parse24To12(event?.endTime);

  // Form State
  const [formData, setFormData] = useState({
    title: event?.title || '',
    type: event?.type || 'class' as 'class' | 'test',
    courseId: event?.courseId || '',
    meetingLink: event?.meetingLink || '',
    date: event?.date || date || '',
    startTime: startTime.time,
    startPeriod: startTime.period,
    endTime: endTime.time,
    endPeriod: endTime.period,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Convert 12hr to 24hr
  const to24Hour = (time: string, period: 'AM' | 'PM'): string => {
    const [hourStr, minute] = time.split(':');
    let h = parseInt(hourStr);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Please enter event title');
      return;
    }
    if (!formData.courseId) {
      alert('Please select a course');
      return;
    }
    if (!formData.meetingLink.trim()) {
      alert('Please enter meeting link');
      return;
    }
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    const startTime24 = to24Hour(formData.startTime, formData.startPeriod);
    const endTime24 = to24Hour(formData.endTime, formData.endPeriod);

    // Check end time is after start time
    const start = new Date(`2000-01-01T${startTime24}`);
    const end = new Date(`2000-01-01T${endTime24}`);
    
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    const eventData: EventFormData = {
      title: formData.title,
      type: formData.type,
      courseId: formData.courseId,
      meetingLink: formData.meetingLink,
      date: formData.date,
      startTime: startTime24,
      endTime: endTime24,
    };

    onSave(eventData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Event Type Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Event Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'class' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === 'class'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BookOpen className={`w-6 h-6 mx-auto mb-2 ${
                    formData.type === 'class' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    formData.type === 'class' ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    Class
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'test' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === 'test'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-6 h-6 mx-auto mb-2 ${
                    formData.type === 'test' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    formData.type === 'test' ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    Test
                  </p>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to React"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition"
                required
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white transition"
                required
              >
                <option value="">Choose a course...</option>
                {availableCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Time Range - Updated with --:-- format */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9:]/g, '');
                        // Auto-add colon after 2 digits
                        if (value.length === 2 && !value.includes(':')) {
                          value = value + ':';
                        }
                        // Limit to 5 characters (HH:MM)
                        if (value.length <= 5) {
                          setFormData({ ...formData, startTime: value });
                        }
                      }}
                      placeholder="--:--"
                      maxLength={5}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition text-center font-mono text-lg"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startPeriod: 'AM' })}
                      className={`flex-1 py-2 rounded-lg font-semibold transition ${
                        formData.startPeriod === 'AM'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startPeriod: 'PM' })}
                      className={`flex-1 py-2 rounded-lg font-semibold transition ${
                        formData.startPeriod === 'PM'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9:]/g, '');
                        // Auto-add colon after 2 digits
                        if (value.length === 2 && !value.includes(':')) {
                          value = value + ':';
                        }
                        // Limit to 5 characters (HH:MM)
                        if (value.length <= 5) {
                          setFormData({ ...formData, endTime: value });
                        }
                      }}
                      placeholder="--:--"
                      maxLength={5}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition text-center font-mono text-lg"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, endPeriod: 'AM' })}
                      className={`flex-1 py-2 rounded-lg font-semibold transition ${
                        formData.endPeriod === 'AM'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, endPeriod: 'PM' })}
                      className={`flex-1 py-2 rounded-lg font-semibold transition ${
                        formData.endPeriod === 'PM'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium mb-3">
                  ⚠️ Delete this event permanently?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              {event && onDelete && !showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                >
                  {event ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;