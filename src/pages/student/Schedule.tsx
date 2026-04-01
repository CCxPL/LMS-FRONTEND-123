// src/pages/student/StudentSchedule.tsx (COMPLETE FILE)
import React, { useState } from 'react';
import { Calendar, Video, Clock, Filter, Umbrella, CheckCircle } from 'lucide-react';
import CalendarView from '../../components/calendar/CalendarView';
import JoinClassButton from '../../components/calendar/JoinClassButton';
import CourseFilter from '../../components/calendar/CourseFilter';
import { useCalendar } from '../../hooks/useCalendar';
import { isEventLive, isEventUpcoming } from '../../utils/eventHelpers';
import { formatTime12hr } from '../../utils/dateHelpers';
import { useToast } from '../../context/ToastContext';

interface LeaveRequest {
  id: string;
  start: string;
  end: string;
  reason: string;
  status: string;
  days: string[];
}

const StudentSchedule: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const { events, loading } = useCalendar();
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const todayDateObj = new Date();
  const today = todayDateObj.toISOString().split('T')[0];

  const getValidLeaveDays = (startStr: string, endStr: string): string[] => {
    if (!startStr || !endStr) return [];
    const days: string[] = [];
    let currentDate = new Date(startStr);
    const endDateObj = new Date(endStr);

    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
        days.push(currentDate.toISOString().split('T')[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const actualLeaveDays = getValidLeaveDays(leaveStart, leaveEnd).length;

  const handleRequestLeave = () => {
    if (!leaveStart || !leaveEnd || !leaveReason.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (new Date(leaveStart) > new Date(leaveEnd)) {
      showToast('End date cannot be earlier than start date', 'error');
      return;
    }

    const validDays = getValidLeaveDays(leaveStart, leaveEnd);
    if (validDays.length === 0) {
      showToast('The selected date range only contains weekends (Saturday/Sunday).', 'warning');
      return;
    }

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      start: leaveStart,
      end: leaveEnd,
      reason: leaveReason,
      status: 'Approved', 
      days: validDays
    };

    setLeaves([...leaves, newLeave]);
    showToast('✓ Leave applied! Calendar updated with red highlights.', 'success');
    
    setIsLeaveModalOpen(false);
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
  };

  const filteredEvents = selectedCourseId 
    ? events.filter(e => e.courseId === selectedCourseId)
    : events;

  const todaysEvents = filteredEvents.filter(e => e.date === today);
  const liveEvents = filteredEvents.filter(e => isEventLive(e));
  const upcomingEvents = filteredEvents.filter(e => isEventUpcoming(e) && !isEventLive(e));

  const getNextWeekEvents = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate > now && eventDate <= nextWeek;
    }).slice(0, 5);
  };
  const weekEvents = getNextWeekEvents();

  // ✅ Extract all leave days from all leave requests
  const allLeaveDays = leaves.flatMap(leave => leave.days);



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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-sm text-gray-500">View your upcoming classes and leaves</p>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todaysEvents.length}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${liveEvents.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Video className={`w-5 h-5 ${liveEvents.length > 0 ? 'text-green-600' : 'text-gray-700'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{liveEvents.length}</p>
              <p className="text-xs text-gray-500">Live Now</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              <p className="text-xs text-gray-500">Starting Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg border border-red-100">
              <Umbrella className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{leaves.length}</p>
              <p className="text-xs text-gray-500">Approved Leaves</p>
            </div>
          </div>
        </div>
      </div>

      {liveEvents.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Classes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveEvents.map((event: any) => (
              <div key={event.id} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.courseName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime12hr(event.startTime)} - {formatTime12hr(event.endTime)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    event.type === 'class' ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {event.type.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3">
                  <JoinClassButton event={event} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* ✅ PASSING leaveDays PROP */}
            <CalendarView 
              events={filteredEvents}
              leaveDays={allLeaveDays}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Today's Schedule
            </h3>
            {todaysEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todaysEvents.map((event: any) => (
                  <div key={event.id} className={`p-3 rounded-lg border-l-4 ${event.type === 'class' ? 'border-gray-900 bg-gray-50' : 'border-gray-400 bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{formatTime12hr(event.startTime)} - {formatTime12hr(event.endTime)}</p>
                      </div>
                    </div>
                    {isEventLive(event) && <div className="mt-2"><JoinClassButton event={event} /></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-700" />
              Upcoming This Week
            </h3>
            {weekEvents.length === 0 ? (
              <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">No upcoming events this week</p>
            ) : (
              <div className="space-y-3">
                {weekEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white ${event.type === 'class' ? 'bg-gray-900' : 'bg-gray-500'}`}>
                      <span className="text-xs opacity-80 uppercase font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="font-bold leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime12hr(event.startTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-red-500" /> Leave Management
              </h3>
              <button onClick={() => setIsLeaveModalOpen(true)} className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                + Request Leave
              </button>
            </div>

            {leaves.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">You haven't requested any leaves yet.</p>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <div key={leave.id} className="p-3 rounded-lg border border-red-100 bg-red-50 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{leave.reason}</p>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leave.start).toLocaleDateString('en-GB')} - {new Date(leave.end).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 font-bold rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {leave.status}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-2 pl-2 font-medium">({leave.days.length} working days excluded weekends)</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-red-500" /> Apply For Leave
              </h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-full">
                <span className="text-lg leading-none font-bold">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Start Date *</label>
                  <input 
                    type="date" 
                    min={today} 
                    value={leaveStart} 
                    onChange={(e) => setLeaveStart(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">End Date *</label>
                  <input 
                    type="date" 
                    min={leaveStart || today} 
                    value={leaveEnd} 
                    onChange={(e) => setLeaveEnd(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50" 
                  />
                </div>
              </div>

              {leaveStart && leaveEnd && new Date(leaveStart) <= new Date(leaveEnd) && (
                 <div className={`p-3 rounded-lg border flex items-start gap-2 text-xs font-medium ${actualLeaveDays > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                   <Calendar className="w-4 h-4 shrink-0" />
                   {actualLeaveDays > 0 ? `${actualLeaveDays} Working Day(s) Selected (Saturdays & Sundays excluded automatically).` : 'Invalid Range! Selected dates only contain weekends.'}
                 </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Reason For Leave *</label>
                <textarea 
                  value={leaveReason} 
                  onChange={(e) => setLeaveReason(e.target.value)} 
                  placeholder="E.g., Medical issues, Family function..." 
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm resize-none h-28 bg-gray-50" 
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
              <button onClick={handleRequestLeave} className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-bold text-sm">
                Submit Request
              </button>
              <button onClick={() => setIsLeaveModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-800 py-2.5 rounded-lg font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSchedule;