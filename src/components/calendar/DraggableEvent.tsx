import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import type { CalendarEvent } from '../../types/calendar.types';
import { formatTime12hr } from '../../utils/dateHelpers';

interface DraggableEventProps {
  event: CalendarEvent;
  onClick?: (e?: React.MouseEvent) => void;
  canDrag?: boolean;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({
  event,
  onClick,
  canDrag = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EVENT',
    item: { event },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [event, canDrag]);

  // Connect drag ref
  useEffect(() => {
    if (canDrag && ref.current) {
      drag(ref.current);
    }
  }, [canDrag, drag]);

  const bgColor = event.type === 'class' ? 'bg-blue-500' : 'bg-red-500';

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        ${bgColor} text-white text-xs px-2 py-1 rounded truncate
        ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:opacity-90 transition-opacity
      `}
      title={`${event.title} (${formatTime12hr(event.startTime)})`}
    >
      {event.title}
    </div> 
  );
};

export default DraggableEvent;