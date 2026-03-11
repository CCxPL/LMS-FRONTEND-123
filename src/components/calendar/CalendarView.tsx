import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { CalendarEvent, EventFormData } from '../../types/calendar.types';
import DraggableEvent from './DraggableEvent';
import DroppableDay from './DroppableDay';
import EventModal from './EventModal';
import { filterEventsByDate } from '../../utils/eventHelpers';
import { useToast } from '../../context/ToastContext';
import { useAuth, usePermissions } from '../../hooks/useAuth';

interface CalendarViewProps {
  events: CalendarEvent[];
  onCreateEvent?: (formData: EventFormData) => Promise<boolean> | void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onRescheduleEvent?: (eventId: string, newDate: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onRescheduleEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const { showToast } = useToast();
  const {  } = useAuth();
  const { canCreateEvent, canEditEvent } = usePermissions();

  // Calculate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    if (!canCreateEvent()) return;
    
    setSelectedDate(date);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (canEditEvent(event.teacherId)) {
      setEditingEvent(event);
      setSelectedDate(new Date(event.date));
      setShowEventModal(true);
    }
  };

  const handleEventDrop = (event: CalendarEvent, newDate: string) => {
    if (!canEditEvent(event.teacherId)) {
      showToast('You do not have permission to reschedule this event', 'error');
      return;
    }
    
    if (onRescheduleEvent) {
      onRescheduleEvent(event.id, newDate);
      showToast(`Event rescheduled to ${format(new Date(newDate), 'PPP')}`, 'success');
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filterEventsByDate(events, dateStr);
  };

  const handleSaveEvent = async (formData: EventFormData) => {
    if (editingEvent && onEditEvent) {
      onEditEvent({ ...editingEvent, ...formData });
      showToast('Event updated successfully', 'success');
    } else if (onCreateEvent) {
      await onCreateEvent(formData);
      showToast('Event created successfully', 'success');
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent && onDeleteEvent) {
      onDeleteEvent(editingEvent.id);
      showToast('Event deleted successfully', 'success');
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-900 min-w-45 text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleToday}
                className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Today
              </button>
            </div>

            {/* Add Event Button */}
            {canCreateEvent() && onCreateEvent && (
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingEvent(null);
                  setShowEventModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <DroppableDay
                  key={day.toString()}
                  date={day}
                  onDrop={handleEventDrop}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                >
                  <div
                    onClick={() => handleDateClick(day)}
                    className={`min-h-22.5 cursor-pointer ${
                      canCreateEvent() ? 'hover:bg-gray-50' : ''
                    }`}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday 
                        ? 'w-7 h-7 flex items-center justify-center bg-black text-white rounded-full' 
                        : isCurrentMonth 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div 
                          key={event.id} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          <DraggableEvent
                            event={event}
                            canDrag={canEditEvent(event.teacherId)}
                          />
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </DroppableDay>
              );
            })}
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <EventModal
            event={editingEvent || undefined}
            date={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
            onClose={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}
            onSave={handleSaveEvent}
            onDelete={editingEvent ? handleDeleteEvent : undefined}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default CalendarView;