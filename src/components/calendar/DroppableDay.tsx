import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { format } from 'date-fns';
import type { CalendarEvent } from '../../types/calendar.types';

interface DroppableDayProps {
  date: Date;
  onDrop: (event: CalendarEvent, newDate: string) => void;
  isCurrentMonth: boolean;
  isToday: boolean;
  children: React.ReactNode;
}

const DroppableDay: React.FC<DroppableDayProps> = ({
  date,
  onDrop,
  isCurrentMonth,
  isToday,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'EVENT',
    drop: (item: { event: CalendarEvent }) => {
      const newDate = format(date, 'yyyy-MM-dd');
      if (item.event.date !== newDate) {
        onDrop(item.event, newDate);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [date, onDrop]);

  // Connect drop ref
  useEffect(() => {
    if (ref.current) {
      drop(ref.current);
    }
  }, [drop]);

  return (
    <div
      ref={ref}
      className={`
        min-h-25 p-2 border rounded-lg transition-colors
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${isToday ? 'border-black border-2' : 'border-gray-200'}
        ${isOver && canDrop ? 'bg-blue-50 border-blue-400' : ''}
        ${canDrop ? 'hover:bg-gray-50' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default DroppableDay;