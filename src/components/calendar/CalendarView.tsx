import React, { useState, useEffect } from 'react';
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
import type { CalendarEvent, EventFormData, RecurringEditType } from '../../types/calendar.types';
import DraggableEvent from './DraggableEvent';
import DroppableDay from './DroppableDay';
import EventModal from './EventModal';
import { filterEventsByDate } from '../../utils/eventHelpers';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/useAuth';

interface CalendarViewProps {
  events: CalendarEvent[];
  onCreateEvent?: (formData: EventFormData) => Promise<boolean> | void;
  onEditEvent?: (event: CalendarEvent) => void;
  onRescheduleEvent?: (eventId: string, newDate: string) => void;
  leaveDays?: string[];
  
  // ✅ FIXED: Add eventId parameter
  onRecurringEdit?: (formData: EventFormData, editType: RecurringEditType, eventId: string) => Promise<boolean> | void;
  onRecurringDelete?: (editType: RecurringEditType, eventId: string) => Promise<boolean> | void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onCreateEvent,
  onEditEvent,
  onRescheduleEvent,
  leaveDays = [],
  onRecurringEdit,
  onRecurringDelete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const { showToast } = useToast();
  const { canCreateEvent, canEditEvent } = usePermissions();

  useEffect(() => {
   
  }, [leaveDays]);

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

  const isLeaveDay = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const result = leaveDays.includes(dateStr);
    if (result) {
      
    }
    return result;
  };

  // ============================================
  // ✅ FIXED: handleSaveEvent (NON-RECURRING)
  // ============================================
  const handleSaveEvent = async (formData: EventFormData) => {
   
    
    // DON'T USE THIS FOR RECURRING EVENTS
    if (editingEvent && onEditEvent && !editingEvent.isRecurring) {
      
      onEditEvent({ ...editingEvent, ...formData });
      showToast('Event updated successfully', 'success');
      setShowEventModal(false);
      setEditingEvent(null);
    } else if (onCreateEvent) {
  
      await onCreateEvent(formData);
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  // ============================================
  // ✅ FIXED: Pass eventId to parent
  // ============================================
  const handleRecurringEdit = async (formData: EventFormData, editType: RecurringEditType) => {


    if (editingEvent && onRecurringEdit) {
      // ✅ Pass the editing event's ID
      await onRecurringEdit(formData, editType, editingEvent.id);
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  // ============================================
  // ✅ FIXED: Pass eventId to parent
  // ============================================
  const handleRecurringDeleteEvent = async (editType: RecurringEditType) => {
    

    if (editingEvent && onRecurringDelete) {
      // ✅ Pass the editing event's ID
      await onRecurringDelete(editType, editingEvent.id);
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  // ============================================
  // Regular Delete (Non-Recurring)
  // ============================================
  const handleDeleteEvent = () => {
    if (editingEvent && onEditEvent) {
      // Non-recurring delete will be handled by parent
      showToast('Event deleted successfully', 'success');
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-900 min-w-50 text-center">
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

        <div className="p-4">
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

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              const hasLeave = isLeaveDay(day);

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
                    className={`min-h-22.5 cursor-pointer relative p-2 ${
                      canCreateEvent() ? 'hover:bg-gray-50' : ''
                    } ${
                      hasLeave ? 'bg-red-100 border-2 border-red-400 rounded-lg shadow-sm' : ''
                    }`}
                    style={hasLeave ? { backgroundColor: '#fee2e2', borderColor: '#f87171' } : {}}
                  >
                    {hasLeave && (
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                    )}

                    <div className={`text-sm font-semibold mb-1 ${
                      isToday 
                        ? 'w-7 h-7 flex items-center justify-center bg-black text-white rounded-full' 
                        : isCurrentMonth 
                          ? hasLeave ? 'text-red-700 font-bold' : 'text-gray-900'
                          : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
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

        {showEventModal && (
          <EventModal
            event={editingEvent || undefined}
            date={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
            onClose={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}
            onSave={handleSaveEvent}
            onDelete={editingEvent && !editingEvent.isRecurring ? handleDeleteEvent : undefined}
            onRecurringEdit={editingEvent?.isRecurring ? handleRecurringEdit : undefined}
            onRecurringDelete={editingEvent?.isRecurring ? handleRecurringDeleteEvent : undefined}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default CalendarView;