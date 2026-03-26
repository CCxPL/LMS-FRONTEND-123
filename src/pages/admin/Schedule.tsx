import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  BarChart3,
  Clock,
  Filter,
  UserCheck,
  UserX,
  Repeat
} from 'lucide-react';
import CalendarView from '../../components/calendar/CalendarView';
import EventModal from '../../components/calendar/EventModal';
import RecurringEventDialog from '../../components/calendar/RecurringEventDialog';
import TeacherLateAlert from '../../components/calendar/TeacherLateAlert';
import ClassSummaryModal from '../../components/calendar/ClassSummaryModal';
import CourseFilter from '../../components/calendar/CourseFilter';
import { useCalendar } from '../../hooks/useCalendar';
import { useLateDetection } from '../../hooks/useLateDetection';
import { useNotifications } from '../../hooks/useNotifications';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import type { CalendarEvent, EventFormData, RecurringEditType } from '../../types/calendar.types';
import type { Notification } from '../../types/notification.types';
import type { ClassSummary } from '../../types/attendance.types';

const AdminSchedule: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lateAlerts, setLateAlerts] = useState<CalendarEvent[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<ClassSummary | null>(null);

  // ============================================
  // ✅ Event Modal & Recurring Dialog States
  // ============================================
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringAction, setRecurringAction] = useState<'EDIT' | 'DELETE'>('EDIT');

  const {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRecurringEvent,
    deleteRecurringEvent,

  } = useCalendar();

  const { addNotification } = useNotifications();
  const { classSummaries } = useData();
  const { showToast } = useToast();

  // Late detection - 5 minutes threshold
  useLateDetection(events, (notification: Notification) => {
    const event = events.find(e => e.id === notification.eventId);
    if (event) {
      setLateAlerts(prev => {
        if (prev.some(e => e.id === event.id)) return prev;
        return [...prev, event];
      });
      showToast(`Teacher ${event.teacherName} is late for ${event.title}`, 'warning');
    }
    addNotification(notification);
  });

  // ============================================
  // ✅ EVENT HANDLERS - With Recurring Support
  // ============================================

  const handleCreateEvent = async (formData: EventFormData): Promise<boolean> => {
    try {
      const success = await createEvent(formData);
      if (success) {
        showToast(
          formData.isRecurring
            ? 'Recurring events created successfully'
            : 'Event created successfully',
          'success'
        );
      }
      return success;
    } catch (error) {
      showToast('Failed to create event', 'error');
      return false;
    }
  };

  // const handleDateClick = (date: Date) => {
  //   const dateStr = date.toISOString().split('T')[0];
  //   setSelectedDate(dateStr);
  //   setEditingEvent(null);
  //   setIsEventModalOpen(true);
  // };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);

    if (event.isRecurring) {
      setRecurringAction('EDIT');
      setRecurringDialogOpen(true);
    } else {
      setIsEventModalOpen(true);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    setEditingEvent(event);

    if (event.isRecurring) {
      setRecurringAction('DELETE');
      setRecurringDialogOpen(true);
    } else {
      deleteEvent(eventId);
      showToast('Event deleted successfully', 'success');
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate('');
    }
  };

  const handleRecurringDialogConfirm = async (editType: RecurringEditType) => {
    if (!editingEvent) return;

    try {
      if (recurringAction === 'DELETE') {
        await deleteRecurringEvent(editingEvent.id, editType);
        showToast(
          editType === 'THIS_EVENT'
            ? 'Event deleted successfully'
            : 'Events deleted successfully',
          'success'
        );
        setIsEventModalOpen(false);
      } else {
        setIsEventModalOpen(true);
      }
    } catch (error) {
      showToast('Operation failed', 'error');
    }

    setRecurringDialogOpen(false);
  };

  const handleSaveEvent = async (formData: EventFormData): Promise<boolean> => {
    if (!editingEvent) {
      return handleCreateEvent(formData);
    }

    try {
      if (editingEvent.isRecurring && recurringAction === 'EDIT') {
        await updateRecurringEvent(editingEvent.id, formData, 'THIS_EVENT');
      } else {
        await updateEvent(editingEvent.id, formData);
      }

      showToast('Event updated successfully', 'success');
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate('');
      return true;
    } catch (error) {
      showToast('Failed to update event', 'error');
      return false;
    }
  };

  const handleRescheduleEvent = async (eventId: string, newDate: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.isRecurring) {
      setEditingEvent(event);
      setRecurringAction('EDIT');
      setRecurringDialogOpen(true);
    } else {
      await updateEvent(eventId, { date: newDate });
      showToast('Event rescheduled successfully', 'success');
    }
  };

  const dismissLateAlert = (eventId: string) => {
    setLateAlerts(prev => prev.filter(e => e.id !== eventId));
  };

  const filteredEvents = selectedCourseId
    ? events.filter(e => e.courseId === selectedCourseId)
    : events;

  const todayEvents = filteredEvents.filter(
    e => e.date === new Date().toISOString().split('T')[0]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-sm text-gray-500">Manage classes and tests • Admin Access</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Filter by Course:</span>
        </div>
        <CourseFilter
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
          showAllOption={true}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
              <p className="text-xs text-gray-500">Total Events</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${lateAlerts.length > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${lateAlerts.length > 0 ? 'text-yellow-600' : 'text-gray-700'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lateAlerts.length}</p>
              <p className="text-xs text-gray-500">Late Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{classSummaries.length}</p>
              <p className="text-xs text-gray-500">Class Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-6">
        <span className="text-sm font-medium text-gray-700">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-gray-600">Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-400" />
          <span className="text-sm text-gray-600">Test</span>
        </div>
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Recurring</span>
        </div>
      </div>

      {/* Late Alerts */}
      {lateAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Late Alerts ({lateAlerts.length})</h3>
          </div>
          <div className="space-y-2">
            {lateAlerts.map(event => (
              <TeacherLateAlert
                key={event.id}
                event={event}
                onDismiss={() => dismissLateAlert(event.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <CalendarView
          events={filteredEvents}
          onCreateEvent={async (formData) => {
            const success = await handleCreateEvent(formData);
            return success;
          }}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onRescheduleEvent={handleRescheduleEvent}
        />
      </div>

      {/* Class Reports */}
      {classSummaries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Class Reports</h2>
          </div>
          <div className="space-y-3">
            {classSummaries.slice(0, 5).map(summary => {
              const attendanceRate = Math.round(
                (summary.studentsAttended / summary.totalStudentsEnrolled) * 100
              );
              return (
                <div
                  key={summary.id}
                  onClick={() => setSelectedSummary(summary)}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{summary.courseName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {summary.studentsAttended} present
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <UserX className="w-3 h-3" />
                          {summary.totalStudentsEnrolled - summary.studentsAttended} absent
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${attendanceRate >= 80
                        ? 'bg-gray-100 text-gray-700'
                        : attendanceRate >= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                      {attendanceRate}%
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(summary.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Modal - ✅ FIXED */}
      {isEventModalOpen && (
        <EventModal
          event={editingEvent || undefined}
          date={selectedDate || new Date().toISOString().split('T')[0]}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
            setSelectedDate('');
          }}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        />
      )}

      {/* ✅ Recurring Event Dialog */}
      {editingEvent && (
        <RecurringEventDialog
          isOpen={recurringDialogOpen}
          event={editingEvent}
          actionType={recurringAction}
          onConfirm={handleRecurringDialogConfirm}
          onCancel={() => {
            setRecurringDialogOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      {selectedSummary && (
        <ClassSummaryModal
          summary={selectedSummary}
          onClose={() => setSelectedSummary(null)}
        />
      )}
    </div>
  );
};

export default AdminSchedule;