import { useState } from "react";
import { Calendar } from '@/components/ui/calendar';
import DashboardCard from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  location?: string;
  description?: string;
}

interface CalendarCardProps {
  title?: string;
  events: CalendarEvent[];
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date | undefined) => void;
  animate?: boolean;
  animationDelay?: number;
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  title = 'Calendar',
  events,
  className,
  onEventClick,
  onDateSelect,
  animate = true,
  animationDelay = 0,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = format(event.date, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Get events for the selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedDateEvents = selectedDateStr ? eventsByDate[selectedDateStr] || [] : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const getEventTypeStyles = (type: CalendarEvent['type'] = 'default') => {
    const styles = {
      default: 'bg-primary text-primary-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      info: 'bg-info text-info-foreground',
      error: 'bg-destructive text-destructive-foreground',
    };

    return styles[type];
  };

  // Function to render the calendar day with event indicators
  const renderCalendarDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateStr] || [];

    if (dayEvents.length === 0) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
    );
  };

  return (
    <DashboardCard
      title={title}
      icon={<CalendarIcon className="h-5 w-5" />}
      className={className}
      animate={animate}
      animationDelay={animationDelay}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            components={{
              DayContent: (props: { date: Date }) => (
                <div className="relative h-full w-full p-0">
                  <div className="h-full w-full flex items-center justify-center">
                    {props.date.getDate()}
                  </div>
                  {renderCalendarDay(props.date)}
                </div>
              ),
            }}
          />
        </div>
        <div>
          <h3 className="font-medium mb-2">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
          </h3>
          <ScrollArea className="h-[220px]">
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events scheduled for this day</p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onEventClick && onEventClick(event)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className={getEventTypeStyles(event.type)}>
                        {event.time || format(event.date, 'h:mm a')}
                      </Badge>
                    </div>
                    {event.location && (
                      <p className="text-xs text-muted-foreground">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </DashboardCard>
  );
};

export default CalendarCard;
