import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Video, 
  BarChart3, 
  UserCheck, 
  UserX, 
  LogIn, 
  LogOut,
  X,
  Filter,
  Repeat
} from 'lucide-react';
import CalendarView from '../../components/calendar/CalendarView';
import EventModal from '../../components/calendar/EventModal';
import RecurringEventDialog from '../../components/calendar/RecurringEventDialog';
import ClassSummaryModal from '../../components/calendar/ClassSummaryModal';
import CourseFilter from '../../components/calendar/CourseFilter';
import { useCalendar } from '../../hooks/useCalendar';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import type { CalendarEvent, EventFormData, RecurringEditType } from '../../types/calendar.types';
import type { ClassSummary } from '../../types/attendance.types';
import { isEventLive } from '../../utils/eventHelpers';
import { formatTime12hr } from '../../utils/dateHelpers';

const TeacherSchedule: React.FC = () => {
  const {  } = useAuth();
  const { showToast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<ClassSummary | null>(null);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<CalendarEvent | null>(null);

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
  const { classSummaries, studentActivities } = useData();

  // Find currently live event
  const liveEvent = events.find(e => isEventLive(e));
  
  // Get online students for live event
  const getOnlineStudents = (eventId: string) => {
    const joined = studentActivities.filter(a => a.eventId === eventId && a.action === 'joined');
    const left = studentActivities.filter(a => a.eventId === eventId && a.action === 'left');
    return joined.filter(j => !left.some(l => l.studentId === j.studentId && l.timestamp > j.timestamp));
  };

  const onlineStudents = liveEvent ? getOnlineStudents(liveEvent.id) : [];

  // Get attendance details for an event
  const getAttendanceDetails = (eventId: string) => {
    const activities = studentActivities.filter(a => a.eventId === eventId);
    const studentMap = new Map<string, {
      studentId: string;
      studentName: string;
      joinTime: string | null;
      leaveTime: string | null;
      status: 'present' | 'absent';
      duration: number;
    }>();

    activities.forEach(activity => {
      const existing = studentMap.get(activity.studentId) || {
        studentId: activity.studentId,
        studentName: activity.studentName,
        joinTime: null,
        leaveTime: null,
        status: 'absent' as const,
        duration: 0
      };

      if (activity.action === 'joined') {
        existing.joinTime = activity.timestamp;
        existing.status = 'present';
      } else if (activity.action === 'left') {
        existing.leaveTime = activity.timestamp;
        if (existing.joinTime) {
          existing.duration = Math.round(
            (new Date(activity.timestamp).getTime() - new Date(existing.joinTime).getTime()) / 60000
          );
        }
      }

      studentMap.set(activity.studentId, existing);
    });

    return Array.from(studentMap.values());
  };

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

  // Teacher's class summaries
  const teacherSummaries = classSummaries.filter(s => 
    events.some(e => e.id === s.eventId)
  );

  // Filter events by course
  const filteredEvents = selectedCourseId 
    ? events.filter(e => e.courseId === selectedCourseId)
    : events;

  // Get attendance for selected event
  const attendanceDetails = selectedEventForAttendance 
    ? getAttendanceDetails(selectedEventForAttendance.id)
    : [];

  const presentCount = attendanceDetails.filter(s => s.status === 'present').length;
  const absentCount = attendanceDetails.filter(s => s.status === 'absent').length;

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
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-sm text-gray-500">Manage your classes and tests</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {filteredEvents.filter(e => e.type === 'class').length}
              </p>
              <p className="text-xs text-gray-500">Classes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredEvents.filter(e => e.type === 'test').length}
              </p>
              <p className="text-xs text-gray-500">Tests</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${liveEvent ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Video className={`w-5 h-5 ${liveEvent ? 'text-green-600' : 'text-gray-700'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{liveEvent ? 1 : 0}</p>
              <p className="text-xs text-gray-500">Live Now</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{onlineStudents.length}</p>
              <p className="text-xs text-gray-500">Students Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Class Alert */}
      {liveEvent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-green-800">Live Now: {liveEvent.title}</h3>
                <p className="text-sm text-green-700">
                  {liveEvent.courseName} • {formatTime12hr(liveEvent.startTime)} - {formatTime12hr(liveEvent.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedEventForAttendance(liveEvent)}
                className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition flex items-center gap-2 text-sm font-medium"
              >
                <Users className="w-4 h-4" />
                View Attendance
              </button>
              <a
                href={liveEvent.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                Join Class
              </a>
            </div>
          </div>
        </div>
      )}

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Attendance */}
          {liveEvent && onlineStudents.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gray-700" />
                Currently Online ({onlineStudents.length})
              </h3>
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {onlineStudents.map(student => (
                  <div key={student.studentId} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-medium text-gray-700">{student.studentName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class Reports */}
          {teacherSummaries.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                Class Reports
              </h3>
              <div className="space-y-2">
                {teacherSummaries.slice(0, 5).map(summary => (
                  <div
                    key={summary.id}
                    onClick={() => setSelectedSummary(summary)}
                    className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <p className="font-medium text-sm text-gray-900">{summary.courseName}</p>
                    <div className="flex items-center gap-4 mt-1">
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Detail Modal */}
      {selectedEventForAttendance && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEventForAttendance(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Attendance Details</h2>
                  <p className="text-sm text-gray-500">{selectedEventForAttendance.title}</p>
                </div>
                <button
                  onClick={() => setSelectedEventForAttendance(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Stats */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{attendanceDetails.length}</p>
                    <p className="text-xs text-gray-500">Total Students</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
                    <p className="text-xs text-gray-500">Absent</p>
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div className="p-6 max-h-100 overflow-y-auto">
                {attendanceDetails.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                        <th className="pb-3">Student</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Join Time</th>
                        <th className="pb-3">Leave Time</th>
                        <th className="pb-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceDetails.map(student => (
                        <tr key={student.studentId}>
                          <td className="py-3">
                            <span className="font-medium text-gray-900">{student.studentName}</span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              student.status === 'present' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {student.joinTime ? (
                              <span className="flex items-center gap-1">
                                <LogIn className="w-3 h-3" />
                                {new Date(student.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {student.leaveTime ? (
                              <span className="flex items-center gap-1">
                                <LogOut className="w-3 h-3" />
                                {new Date(student.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {student.duration > 0 ? `${student.duration} min` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance data available
                  </div>
                )}
              </div>
            </div>
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

      {/* Summary Modal */}
      {selectedSummary && (
        <ClassSummaryModal
          summary={selectedSummary}
          onClose={() => setSelectedSummary(null)}
        />
      )}
    </div>
  );
};

export default TeacherSchedule;