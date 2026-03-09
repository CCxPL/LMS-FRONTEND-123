import React, { useState } from 'react';
import { Calendar, Video, Clock, BookOpen, Filter } from 'lucide-react';
import CalendarView from '../../components/calendar/CalendarView';
import JoinClassButton from '../../components/calendar/JoinClassButton';
import CourseFilter from '../../components/calendar/CourseFilter';
import { useCalendar } from '../../hooks/useCalendar';
import { isEventLive, isEventUpcoming } from '../../utils/eventHelpers';
import { formatTime12hr } from '../../utils/dateHelpers';

const StudentSchedule: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const { events, loading } = useCalendar();

  // Get today's events
  const today = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(e => e.date === today);
  
  // Live and upcoming events
  const liveEvents = events.filter(e => isEventLive(e));
  const upcomingEvents = events.filter(e => isEventUpcoming(e) && !isEventLive(e));

  // Upcoming this week
  const getNextWeekEvents = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate > now && eventDate <= nextWeek;
    }).slice(0, 5);
  };

  const weekEvents = getNextWeekEvents();

  // Filter events by course
  const filteredEvents = selectedCourseId 
    ? events.filter(e => e.courseId === selectedCourseId)
    : events;

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
            <p className="text-sm text-gray-500">View your upcoming classes and tests</p>
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
            <div className="p-2 bg-gray-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
              <p className="text-xs text-gray-500">Total Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Classes Alert */}
      {liveEvents.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Classes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg p-4 border border-green-200">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Student can only view */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <CalendarView events={filteredEvents} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Today's Schedule
            </h3>
            {todaysEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todaysEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      event.type === 'class' 
                        ? 'border-gray-900 bg-gray-50' 
                        : 'border-gray-400 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime12hr(event.startTime)} - {formatTime12hr(event.endTime)}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                        event.type === 'class' ? 'bg-gray-200 text-gray-700' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    {isEventLive(event) && (
                      <div className="mt-2">
                        <JoinClassButton event={event} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming This Week */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-700" />
              Upcoming This Week
            </h3>
            {weekEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events this week</p>
            ) : (
              <div className="space-y-3">
                {weekEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      event.type === 'class' ? 'bg-gray-900' : 'bg-gray-500'
                    }`}>
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })} • {formatTime12hr(event.startTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;